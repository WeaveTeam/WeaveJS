/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of Weave.
 *
 * The Initial Developer of Weave is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */

namespace weavejs.plot
{
	import Bitmap = flash.display.Bitmap;
	import BitmapData = flash.display.BitmapData;
	import LineScaleMode = flash.display.LineScaleMode;
	import Shape = flash.display.Shape;
	import TriangleCulling = flash.display.TriangleCulling;
	import ColorTransform = flash.geom.ColorTransform;
	import Matrix = flash.geom.Matrix;
	import Point = weavejs.geom.Point;
	import Rectangle = weavejs.geom.Rectangle;
	
	import ProjConstants = org.openscales.proj4as.ProjConstants;
	
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObjectWithBusyStatus = weavejs.api.core.ILinkableObjectWithBusyStatus;
	import IProjectionManager = weavejs.api.data.IProjectionManager;
	import IProjector = weavejs.api.data.IProjector;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IWMSService = weavejs.api.services.IWMSService;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import Bounds2D = weavejs.geom.Bounds2D;
	import Dictionary2D = weavejs.primitives.Dictionary2D;
	import ZoomBounds = weavejs.primitives.ZoomBounds;
	import CustomWMS = weavejs.services.wms.CustomWMS;
	import ModestMapsWMS = weavejs.services.wms.ModestMapsWMS;
	import OnEarthProvider = weavejs.services.wms.OnEarthProvider;
	import WMSProviders = weavejs.services.wms.WMSProviders;
	import WMSTile = weavejs.services.wms.WMSTile;
	import BitmapText = weavejs.util.BitmapText;
	import DrawUtils = weavejs.util.DrawUtils;
	import ZoomUtils = weavejs.util.ZoomUtils;

	export class WMSPlotter extends AbstractPlotter implements ILinkableObjectWithBusyStatus, IDisposableObject, IObjectWithDescription
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, WMSPlotter, "WMS images");
		
		// TODO: move the image reprojection code elsewhere
		
		public debug:Boolean = false;
		
		public constructor()
		{
			//setting default WMS Map to Blue Marble
			setProvider(WMSProviders.OPEN_STREET_MAP);
			this.addSpatialDependencies(this.service, this.srs, this.gridSpacing);
		}
		
		public getDescription():string
		{
			var src:string = sourceSRS;
			var dest:string = getDestinationSRS();
			if (dest && src != dest)
				return lang('{0} ({1} -> {2})', providerName, src || '?', dest);
			return lang('{0} ({1})', providerName, src);
		}
		
		public get sourceSRS():string
		{
			var srv:IWMSService = _service;
			return srv ? srv.getProjectionSRS() : null;
		}

		// the service and its parameters
		private get _service():IWMSService
		{
			return service.internalObject as IWMSService;
		}
		
		public get providerName():string
		{
			if (_service is ModestMapsWMS)
				return (_service as ModestMapsWMS).providerName.value;
			
			if (_service is OnEarthProvider)
				return WMSProviders.NASA;
			
			if (_service is CustomWMS)
				return WMSProviders.CUSTOM_MAP;
			
			return null;
		}
		
		public service:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(IWMSService));
		
		public preferLowerQuality:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public srs:LinkableString = Weave.linkableChild(this, LinkableString); // needed for linking MapTool settings
		public styles:LinkableString = Weave.linkableChild(this, LinkableString, setStyle); // needed for changing seasons
		public displayMissingImage:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
		
		// reusable objects
		private _tempMatrix:Matrix = new Matrix();
		private _tempDataBounds:Bounds2D = new Bounds2D();
		private _tempScreenBounds:Bounds2D = new Bounds2D();
		private _tempBackgroundDataBounds:Bounds2D = new Bounds2D();
		private _clipRectangle:Rectangle = new Rectangle();
		
		// used to show a missing image
		[Embed(source="/weave/resources/images/missing.png")]
		private static _missingImageClass:Class;
		private static _missingImage:Bitmap = Bitmap(new _missingImageClass());
		private static _missingImageColorTransform:ColorTransform = new ColorTransform(1, 1, 1, 0.25);
		
		// reprojecting bitmaps 
		public gridSpacing:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(12)); // number of pixels between grid points
		private _tempBounds:Bounds2D = new Bounds2D();
		private _tempImageBounds:Bounds2D = new Bounds2D(); // bounds of the image
		private _latLonBounds:Bounds2D = new Bounds2D(-180 + ProjConstants.EPSLN, -90 + ProjConstants.EPSLN, 180 - ProjConstants.EPSLN, 90 - ProjConstants.EPSLN);
		private _allowedTileReprojBounds:Bounds2D = new Bounds2D(); // allowed bounds for point to point reprojections
		private _normalizedGridBounds:Bounds2D = new Bounds2D();
		private _tempReprojPoint:Point = new Point(); // reusable object for reprojections
		private projManager:IProjectionManager = WeaveAPI.ProjectionManager; // reprojecting tiles
		private _tileSRSToShapeCache:Dictionary2D = new Dictionary2D(true, true); // use WeakReferences to be GC friendly
		
		private getDestinationSRS():string
		{
			if (projManager.projectionExists(srs.value))
				return srs.value;
			return _service.getProjectionSRS();
		}
		
		// reusable objects in getShape()
		private vertices:Vector.<Number> = new Vector.<Number>();
		private indices:Vector.<int> = new Vector.<int>();
		private uvtData:Vector.<Number> = new Vector.<Number>();
		private getShape(tile:WMSTile):ProjectedShape
		{
			// check if this tile has a cached shape
			var cachedValue:ProjectedShape = _tileSRSToShapeCache.get(tile, getDestinationSRS());
			if (cachedValue)
				return cachedValue;
			
			// we need to create the cached shape
			var reprojectedDataBounds:Bounds2D = new Bounds2D();
			vertices.length = 0;
			indices.length = 0;
			uvtData.length = 0;
						
			// get projector for optimized reprojection
			var serviceSRS:string = _service.getProjectionSRS();
			var projector:IProjector = projManager.getProjector(serviceSRS, srs.value);
			
			// Make lower-left corner of image 0,0 normalized coordinates by making this height negative.
			// To eliminate the seams between images, adjust grid bounds so edge
			// coordinates 0 and 1 will get projected to slightly outside tile.bounds.
			var overlap:number = 0; // in pixels
			_normalizedGridBounds.setCenteredRectangle(
				.5,
				.5,
				(tile.imageWidth - overlap) / (tile.imageWidth),
				- (tile.imageHeight - overlap) / (tile.imageHeight)
			);

			var fences:int = Math.max(tile.imageWidth, tile.imageHeight) / gridSpacing.value; // number of spaces in the grid x or y direction
			var fencePosts:int = fences + 1; // number of vertices in the grid
			for (var iy:int = 0; iy < fencePosts; ++iy)
			{
				for (var ix:int = 0; ix < fencePosts; ++ix)
				{
					var xNorm:number = ix / fences;
					var yNorm:number = iy / fences;

					// percent bounds of where we are in the image space
					_tempReprojPoint.x = xNorm;
					_tempReprojPoint.y = yNorm;
					
					// project normalized grid coords to tile data coords
					_normalizedGridBounds.projectPointTo(_tempReprojPoint, tile.bounds);
					
					// reproject the point before pushing it as a vertex
					_allowedTileReprojBounds.constrainPoint(_tempReprojPoint);
					projector.reproject(_tempReprojPoint);

					reprojectedDataBounds.includePoint(_tempReprojPoint);
					vertices.push(_tempReprojPoint.x, _tempReprojPoint.y);

					// Flash lines up UVT coordinate values 0 and 1 to the center of the edge pixels of an image,
					// meaning half a pixel will be lost on all edges.  This code adjusts the normalized values so
					// the edge pixels are not cut in half by converting our definition of normalized coordinates
					// into flash player's definition.
					var offset:number = 0.5 + overlap;
					uvtData.push(
						(xNorm * tile.imageWidth - offset) / (tile.imageWidth - offset * 2),
						(yNorm * tile.imageHeight - offset) / (tile.imageHeight - offset * 2)
					);
					
					if (iy == 0 || ix == 0) 
						continue; 
					
					// save indices for two triangles -- we are currently at fence post D in this diagram:
					// A---B
					// | / |
					// C---D
					var a:int = (iy - 1) * fencePosts + (ix - 1);
					var b:int = (iy - 1) * fencePosts + ix;
					var c:int = iy * fencePosts + (ix - 1);
					var d:int = iy * fencePosts + ix;
					indices.push(a,b,c);
					indices.push(c,b,d);
				}
			}
			
			// draw the triangles and end the fill
			var newShape:Shape = new Shape();
			
			////////////////////////////////////
			// NOTE: if we don't call lineStyle() with thickness=1 prior to calling beginBitmapFill() and drawTriangles(), it does not always render correctly.
			// LineScaleMode.NONE is important for performance.
			//newShape.graphics.lineStyle(1, 0, 0, false, LineScaleMode.NONE); // thickness=1, alpha=0
			DrawUtils.clearLineStyle(newShape.graphics);
			////////////////////////////////////
			
			if (debug)
			{
				newShape.graphics.lineStyle(1, Math.random() * 0xFFFFFF, 0.5, false, LineScaleMode.NONE);
				//newShape.graphics.lineStyle(1, 0, 1, true, LineScaleMode.NONE);
			}
			
			newShape.graphics.beginBitmapFill(tile.bitmapData, null, false, true); // it's important to disable the repeat option
			newShape.graphics.drawTriangles(vertices, indices, uvtData, TriangleCulling.NEGATIVE);
			newShape.graphics.endFill();
			
			// save the shape and bounds into the token object and put in cache
			var projShape:ProjectedShape = new ProjectedShape();
			projShape.shape = newShape;
			reprojectedDataBounds.makeSizePositive();
			projShape.bounds = reprojectedDataBounds;

			_tileSRSToShapeCache.set(tile, getDestinationSRS(), projShape);

			return projShape;
		}
		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			// if there is no service to use, we can't draw anything
			if (!_service)
				return;

			var serviceSRS:string = _service.getProjectionSRS();			
			var mapProjExists:Boolean = projManager.projectionExists(srs.value);
			var areProjectionsDifferent:Boolean = serviceSRS != srs.value;
			if (!areProjectionsDifferent || !mapProjExists)
			{
				drawUnProjectedTiles(dataBounds, screenBounds, destination);
				return;
			}
			
			//// THERE IS A PROJECTION
			
			getBackgroundDataBounds(_tempBackgroundDataBounds);

			_tempDataBounds.copyFrom(dataBounds);
			_tempScreenBounds.copyFrom(screenBounds);

			// before we do anything, we must get the dataBounds in the same coordinates as the service
			if (areProjectionsDifferent && mapProjExists) 
			{
				// make sure _tempDataBounds is within the valid range
				_tempBackgroundDataBounds.constrainBounds(_tempDataBounds, false);
				_tempDataBounds.centeredResize(_tempDataBounds.getWidth() - ProjConstants.EPSLN, _tempDataBounds.getHeight() - ProjConstants.EPSLN);
				
				// calculate screen bounds that corresponds to _tempDataBounds
				_tempScreenBounds.copyFrom(_tempDataBounds);
				dataBounds.projectCoordsTo(_tempScreenBounds, screenBounds);
			
				// transform the bounds--this hurts performance!
				projManager.transformBounds(srs.value, serviceSRS, _tempDataBounds);
			}

			// expand the data bounds so some surrounding tiles are downloaded to improve panning
			var allTiles:Array = _service.requestImages(_tempDataBounds, _tempScreenBounds, preferLowerQuality.value);
			
			dataBounds.transformMatrix(screenBounds, _tempMatrix, true);

			// draw each tile's reprojected shape
			for (var i:int = 0; i < allTiles.length; i++)
			{
				var tile:WMSTile = allTiles[i];
				if (!tile.bitmapData)
				{
					if (!displayMissingImage.value)
						continue;
					tile.bitmapData = _missingImage.bitmapData;
				}

				// projShape.bounds coordinates are reprojected data coords of the tile
				var projShape:ProjectedShape = getShape(tile);
				if (!projShape.bounds.overlaps(dataBounds))
					continue; // don't draw off-screen bitmaps
				
				var colorTransform:ColorTransform = (tile.bitmapData == _missingImage.bitmapData ? _missingImageColorTransform : null);
				destination.draw(projShape.shape, _tempMatrix, colorTransform, null, null, preferLowerQuality.value && !colorTransform);				
				
				if (debug)
					debugTileBounds(projShape.bounds, dataBounds, screenBounds, destination, tile.request.url, false);
			}
			drawCreditText(destination);
		}

		/**
		 * This function will draw tiles which do not need to be reprojected.
		 */
		private drawUnProjectedTiles(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
		{
			if (!_service)
				return;

			var allTiles:Array = _service.requestImages(dataBounds, screenBounds, preferLowerQuality.value);
				
			for (var i:int = 0; i < allTiles.length; i++)
			{
				var tile:WMSTile = allTiles[i];
				// above we requested some tiles outside the dataBounds... we don't want to draw them
				if (!tile.bounds.overlaps(dataBounds, false))
					continue;
				
				// if there is no bitmap data, decide whether to continue or display missing image
				if (!tile.bitmapData)
				{
					if (!displayMissingImage.value)
						continue;
					
					tile.bitmapData = _missingImage.bitmapData;
				}
				
				var imageBounds:Bounds2D = tile.bounds;
				var imageBitmap:BitmapData = tile.bitmapData;
				
				// get screen coords from image data coords
				_tempBounds.copyFrom(imageBounds); // data
				dataBounds.projectCoordsTo(_tempBounds, screenBounds); // data to screen
				_tempBounds.makeSizePositive(); // positive screen direction

				// when scaling, we need to use the ceiling of the values to cover the seam lines
				_tempMatrix.identity();
				_tempMatrix.scale(
					Math.ceil(_tempBounds.getWidth()) / imageBitmap.width,
					Math.ceil(_tempBounds.getHeight()) / imageBitmap.height
				);
				_tempMatrix.translate(
					Math.round(_tempBounds.getXMin()),
					Math.round(_tempBounds.getYMin())
				);

				// calculate clip rectangle for nasa service because tiles go outside the lat/long bounds
				_service.getAllowedBounds(_tempBounds); // data
				dataBounds.projectCoordsTo(_tempBounds, screenBounds); // data to screen
				_tempBounds.getRectangle(_clipRectangle); // get screen rect
				_clipRectangle.x = Math.floor(_clipRectangle.x);
				_clipRectangle.y = Math.floor(_clipRectangle.y);
				_clipRectangle.width = Math.floor(_clipRectangle.width - 0.5);
				_clipRectangle.height = Math.floor(_clipRectangle.height - 0.5);
				
				var colorTransform:ColorTransform = (imageBitmap == _missingImage.bitmapData ? _missingImageColorTransform : null);
				destination.draw(imageBitmap, _tempMatrix, colorTransform, null, _clipRectangle, preferLowerQuality.value && !colorTransform);				
				
				if (debug)
					debugTileBounds(imageBounds, dataBounds, screenBounds, destination, tile.request.url, true);
			}
			drawCreditText(destination);
		}
		
		private bt:BitmapText = new BitmapText();
		private ct:ColorTransform = new ColorTransform();
		private rect:Rectangle = new Rectangle();
		private tempBounds:Bounds2D = new Bounds2D();
		private debugTileBounds(tileBounds:Bounds2D, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData, url:string, drawRect:Boolean):void
		{
			_tempScreenBounds.copyFrom(tileBounds);
			dataBounds.projectCoordsTo(_tempScreenBounds, screenBounds);
			
			if (drawRect)
			{
				_tempScreenBounds.getRectangle(rect);
				tempShape.graphics.clear();
				tempShape.graphics.lineStyle(1, Math.random() * 0xFFFFFF);
				tempShape.graphics.drawRect(rect.x, rect.y, rect.width, rect.height);
				destination.draw(tempShape);
			}
			
			screenBounds.constrainBounds(_tempScreenBounds, false);
			bt.setBounds(_tempScreenBounds, true);
			bt.text = url;
			bt.draw(destination);
		}
		
		public creditInfoTextColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public creditInfoBackgroundColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0xFFFFFF));
		public creditInfoAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0.5, isFinite));
		
		private drawCreditText(destination:BitmapData):void
		{
			var _providerCredit:string = _service.getCreditInfo();
			if (_providerCredit)
			{
				var textColor:number = creditInfoTextColor.value;
				if (!isFinite(textColor))
					return;
				
				bt.textFormat.color = textColor;
				bt.textFormat.font = Weave.properties.visTextFormat.font.value;
				bt.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
				bt.verticalAlign = BitmapText.VERTICAL_ALIGN_BOTTOM;
				bt.x = 0;
				bt.y = destination.height;
				bt.text = _providerCredit;
				
				var backgroundColor:number = creditInfoBackgroundColor.value;
				if (isFinite(backgroundColor))
				{
					bt.getUnrotatedBounds(tempBounds);
					tempBounds.getRectangle(rect);
					tempShape.graphics.clear();
					DrawUtils.clearLineStyle(tempShape.graphics);
					tempShape.graphics.beginFill(backgroundColor, creditInfoAlpha.value);
					tempShape.graphics.drawRect(rect.x, rect.y, rect.width, rect.height);
					tempShape.graphics.endFill();
					destination.draw(tempShape);
				}
				
				ct.alphaMultiplier = creditInfoAlpha.value;
				bt.draw(destination, null, ct);
			}
		}

		/**
		 * Set the provider for the plotter.
		 */
		public setProvider(provider:string):void
		{
			if (!verifyServiceName(provider))
				return;
			
			if (provider == WMSProviders.NASA)
			{
				service.requestLocalObject(OnEarthProvider,false);
			}
			else if (provider == WMSProviders.CUSTOM_MAP)
			{
				service.requestLocalObject(CustomWMS,false);
			}
			else
			{
				service.requestLocalObject(ModestMapsWMS,false);
				(_service as ModestMapsWMS).providerName.value = provider;
			}
			
			// determine maximum bounds for reprojecting images
			_allowedTileReprojBounds.copyFrom(_latLonBounds);
			projManager.transformBounds("EPSG:4326", _service.getProjectionSRS(), _allowedTileReprojBounds);
			spatialCallbacks.triggerCallbacks();
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.reset();
			if (_service)
			{
				// determine bounds of plotter
				_service.getAllowedBounds(output);
				
				var serviceSRS:string = _service.getProjectionSRS();
				if (serviceSRS != srs.value
					&& projManager.projectionExists(srs.value)
					&& projManager.projectionExists(serviceSRS))
				{
					projManager.transformBounds(_service.getProjectionSRS(), srs.value, output);
				}
			}
		}
		
		public dispose():void
		{
			if (_service)
				_service.cancelPendingRequests(); // cancel everything to prevent any callbacks from running
			WeaveAPI.SessionManager.disposeObject(_service);
		}

		/**
		 * This function will set the style of the image requests for NASA WMS.
		 */
		public setStyle():void
		{
			var nasaService:OnEarthProvider = _service as OnEarthProvider;
			var style:string = styles.value;
			
			if (!nasaService)
				return;
			
			nasaService.changeStyleToMonth(style);
		}
		
		private verifyServiceName(s:string):Boolean
		{
			if (!s)
				return false;
			
			return WMSProviders.providers.indexOf(s) >= 0;
		}
		
		public isBusy():Boolean
		{
			return false;
		}
		
		public adjustZoomBounds(zoomBounds:ZoomBounds):void
		{
			if (!_service)
				return;
			
			var minScreenSize:int = Math.max(_service.getImageWidth(), _service.getImageHeight());
			zoomBounds.getDataBounds(_tempDataBounds);
			zoomBounds.getScreenBounds(_tempScreenBounds);
			getBackgroundDataBounds(_tempBackgroundDataBounds);
			
			var inputZoomLevel:number = ZoomUtils.getZoomLevel(_tempDataBounds, _tempScreenBounds, _tempBackgroundDataBounds, minScreenSize);
			var inputScale:number = ZoomUtils.getScaleFromZoomLevel(_tempBackgroundDataBounds, minScreenSize, inputZoomLevel);
			
			var outputZoomLevel:number = Math.round(inputZoomLevel);
			var outputScale:number = ZoomUtils.getScaleFromZoomLevel(_tempBackgroundDataBounds, minScreenSize, outputZoomLevel);
			
			ZoomUtils.zoomDataBoundsByRelativeScreenScale(_tempDataBounds, _tempScreenBounds, _tempScreenBounds.getXCenter(), _tempScreenBounds.getYCenter(), outputScale / inputScale, false);
			zoomBounds.setDataBounds(_tempDataBounds);
		}
		
		//[Deprecated(replacement="service")] public set serviceName(value:string):void { setProvider(value); }
	}
}

import Shape;

import Bounds2D;

// an internal object used for reprojecting shapes
internal class ProjectedShape
{
	public shape:Shape;
	public bounds:Bounds2D;
	public imageWidth:int;
	public imageHeight:int;
}
