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
	import Point = weavejs.geom.Point;
	import Rectangle = weavejs.geom.Rectangle;
	
	import ProjConstants = org.openscales.proj4as.ProjConstants;
	
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObjectWithBusyStatus = weavejs.api.core.ILinkableObjectWithBusyStatus;
	import IProjectionManager = weavejs.api.data.IProjectionManager;
	import IProjector = weavejs.api.data.IProjector;
	import IWMSService = weavejs.api.services.IWMSService;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import Bounds2D = weavejs.geom.Bounds2D;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import ZoomBounds = weavejs.geom.ZoomBounds;
	import CustomWMS = weavejs.services.wms.CustomWMS;
	import ModestMapsWMS = weavejs.services.wms.ModestMapsWMS;
	import OnEarthProvider = weavejs.services.wms.OnEarthProvider;
	import WMSProviders = weavejs.services.wms.WMSProviders;
	import WMSTile = weavejs.services.wms.WMSTile;
	import DrawUtils = weavejs.util.DrawUtils;
	import ZoomUtils = weavejs.geom.ZoomUtils;
	import Graphics = PIXI.Graphics;
	import Matrix = PIXI.Matrix;

	export class WMSPlotter extends AbstractPlotter implements ILinkableObjectWithBusyStatus, IDisposableObject, IObjectWithDescription
	{
		// TODO: move the image reprojection code elsewhere
		
		public debug:boolean = false;
		
		public constructor()
		{
			//setting default WMS Map to Blue Marble
			this.setProvider(WMSProviders.OPEN_STREET_MAP);
			this.addSpatialDependencies(this.service, this.srs, this.gridSpacing);
		}
		
		public getDescription():string
		{
			var src:string = this.sourceSRS;
			var dest:string = this.getDestinationSRS();
			if (dest && src != dest)
				return Weave.lang('{0} ({1} -> {2})', this.providerName, src || '?', dest);
			return Weave.lang('{0} ({1})', this.providerName, src);
		}
		
		public get sourceSRS():string
		{
			var srv:IWMSService = this._service;
			return srv ? srv.getProjectionSRS() : null;
		}

		// the service and its parameters
		private get _service():IWMSService
		{
			return this.service.internalObject as IWMSService;
		}
		
		public get providerName():string
		{
			if (this._service instanceof ModestMapsWMS)
				return (this._service as ModestMapsWMS).providerName.value;
			
			if (this._service instanceof OnEarthProvider)
				return WMSProviders.NASA;
			
			if (this._service instanceof CustomWMS)
				return WMSProviders.CUSTOM_MAP;
			
			return null;
		}
		
		public service:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(IWMSService));
		
		public preferLowerQuality:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public srs:LinkableString = Weave.linkableChild(this, LinkableString); // needed for linking MapTool settings
		public styles:LinkableString = Weave.linkableChild(this, LinkableString, this.setStyle); // needed for changing seasons
		public displayMissingImage:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
		
		// reusable objects
		private _tempMatrix:Matrix = new Matrix();
		private _tempDataBounds:Bounds2D = new Bounds2D();
		private _tempScreenBounds:Bounds2D = new Bounds2D();
		private _tempBackgroundDataBounds:Bounds2D = new Bounds2D();
		private _clipRectangle:Rectangle = new Rectangle();
		
		// used to show a missing image
		/*
		[Embed(source="/weave/resources/images/missing.png")]
		private static _missingImageClass:Class;
		private static _missingImage:Bitmap = Bitmap(new WMSPlotter._missingImageClass());
		private static _missingImageColorTransform:ColorTransform = new ColorTransform(1, 1, 1, 0.25);
		*/
		
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
			if (this.projManager.projectionExists(this.srs.value))
				return this.srs.value;
			return this._service.getProjectionSRS();
		}
		
		// reusable objects in getShape()
		private vertices:number[] = [];
		private indices:int[] = [];
		private uvtData:number[] = [];
		private getShape(tile:WMSTile):ProjectedShape
		{
			// check if this tile has a cached shape
			var cachedValue:ProjectedShape = this._tileSRSToShapeCache.get(tile, this.getDestinationSRS());
			if (cachedValue)
				return cachedValue;
			
			// we need to create the cached shape
			var reprojectedDataBounds:Bounds2D = new Bounds2D();
			this.vertices.length = 0;
			this.indices.length = 0;
			this.uvtData.length = 0;
						
			// get projector for optimized reprojection
			var serviceSRS:string = this._service.getProjectionSRS();
			var projector:IProjector = this.projManager.getProjector(serviceSRS, this.srs.value);
			
			// Make lower-left corner of image 0,0 normalized coordinates by making this height negative.
			// To eliminate the seams between images, adjust grid bounds so edge
			// coordinates 0 and 1 will get projected to slightly outside tile.bounds.
			var overlap:number = 0; // in pixels
			this._normalizedGridBounds.setCenteredRectangle(
				.5,
				.5,
				(tile.imageWidth - overlap) / (tile.imageWidth),
				- (tile.imageHeight - overlap) / (tile.imageHeight)
			);

			var fences:int = Math.max(tile.imageWidth, tile.imageHeight) / this.gridSpacing.value; // number of spaces in the grid x or y direction
			var fencePosts:int = fences + 1; // number of vertices in the grid
			for (var iy:int = 0; iy < fencePosts; ++iy)
			{
				for (var ix:int = 0; ix < fencePosts; ++ix)
				{
					var xNorm:number = ix / fences;
					var yNorm:number = iy / fences;

					// percent bounds of where we are in the image space
					this._tempReprojPoint.x = xNorm;
					this._tempReprojPoint.y = yNorm;
					
					// project normalized grid coords to tile data coords
					this._normalizedGridBounds.projectPointTo(this._tempReprojPoint, tile.bounds);
					
					// reproject the point before pushing it as a vertex
					this._allowedTileReprojBounds.constrainPoint(this._tempReprojPoint);
					projector.reproject(this._tempReprojPoint);

					reprojectedDataBounds.includePoint(this._tempReprojPoint);
					this.vertices.push(this._tempReprojPoint.x, this._tempReprojPoint.y);

					// Flash lines up UVT coordinate values 0 and 1 to the center of the edge pixels of an image,
					// meaning half a pixel will be lost on all edges.  This code adjusts the normalized values so
					// the edge pixels are not cut in half by converting our definition of normalized coordinates
					// into flash player's definition.
					var offset:number = 0.5 + overlap;
					this.uvtData.push(
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
					this.indices.push(a,b,c);
					this.indices.push(c,b,d);
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
			
			if (this.debug)
			{
				newShape.graphics.lineStyle(1, Math.random() * 0xFFFFFF, 0.5, false, LineScaleMode.NONE);
				//newShape.graphics.lineStyle(1, 0, 1, true, LineScaleMode.NONE);
			}
			
			newShape.graphics.beginBitmapFill(tile.bitmapData, null, false, true); // it's important to disable the repeat option
			newShape.graphics.drawTriangles(this.vertices, this.indices, this.uvtData, TriangleCulling.NEGATIVE);
			newShape.graphics.endFill();
			
			// save the shape and bounds into the token object and put in cache
			var projShape:ProjectedShape = new ProjectedShape();
			projShape.shape = newShape;
			reprojectedDataBounds.makeSizePositive();
			projShape.bounds = reprojectedDataBounds;

			this._tileSRSToShapeCache.set(tile, this.getDestinationSRS(), projShape);

			return projShape;
		}
		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			// if there is no service to use, we can't draw anything
			if (!this._service)
				return;

			var serviceSRS:string = this._service.getProjectionSRS();			
			var mapProjExists:boolean = this.projManager.projectionExists(this.srs.value);
			var areProjectionsDifferent:boolean = serviceSRS != this.srs.value;
			if (!areProjectionsDifferent || !mapProjExists)
			{
				this.drawUnProjectedTiles(dataBounds, screenBounds, destination);
				return;
			}
			
			//// THERE IS A PROJECTION
			
			this.getBackgroundDataBounds(this._tempBackgroundDataBounds);

			this._tempDataBounds.copyFrom(dataBounds);
			this._tempScreenBounds.copyFrom(screenBounds);

			// before we do anything, we must get the dataBounds in the same coordinates as the service
			if (areProjectionsDifferent && mapProjExists) 
			{
				// make sure _tempDataBounds is within the valid range
				this._tempBackgroundDataBounds.constrainBounds(this._tempDataBounds, false);
				this._tempDataBounds.centeredResize(this._tempDataBounds.getWidth() - ProjConstants.EPSLN, this._tempDataBounds.getHeight() - ProjConstants.EPSLN);
				
				// calculate screen bounds that corresponds to _tempDataBounds
				this._tempScreenBounds.copyFrom(this._tempDataBounds);
				dataBounds.projectCoordsTo(this._tempScreenBounds, screenBounds);
			
				// transform the bounds--this hurts performance!
				this.projManager.transformBounds(this.srs.value, serviceSRS, this._tempDataBounds);
			}

			// expand the data bounds so some surrounding tiles are downloaded to improve panning
			var allTiles:WMSTile[] = this._service.requestImages(this._tempDataBounds, this._tempScreenBounds, this.preferLowerQuality.value);
			
			dataBounds.transformMatrix(screenBounds, this._tempMatrix, true);

			// draw each tile's reprojected shape
			for (var i:int = 0; i < allTiles.length; i++)
			{
				var tile:WMSTile = allTiles[i];
				if (!tile.bitmapData)
				{
					if (!this.displayMissingImage.value)
						continue;
					tile.bitmapData = WMSPlotter._missingImage.bitmapData;
				}

				// projShape.bounds coordinates are reprojected data coords of the tile
				var projShape:ProjectedShape = this.getShape(tile);
				if (!projShape.bounds.overlaps(dataBounds))
					continue; // don't draw off-screen bitmaps
				
				var colorTransform:ColorTransform = (tile.bitmapData == WMSPlotter._missingImage.bitmapData ? WMSPlotter._missingImageColorTransform : null);
				destination.draw(projShape.shape, this._tempMatrix, colorTransform, null, null, this.preferLowerQuality.value && !colorTransform);				
				
				if (this.debug)
					this.debugTileBounds(projShape.bounds, dataBounds, screenBounds, destination, tile.request.url, false);
			}
			this.drawCreditText(destination);
		}

		/**
		 * This function will draw tiles which do not need to be reprojected.
		 */
		private drawUnProjectedTiles(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if (!this._service)
				return;

			var allTiles:WMSTile[] = this._service.requestImages(dataBounds, screenBounds, this.preferLowerQuality.value);
				
			for (var i:int = 0; i < allTiles.length; i++)
			{
				var tile:WMSTile = allTiles[i];
				// above we requested some tiles outside the dataBounds... we don't want to draw them
				if (!tile.bounds.overlaps(dataBounds, false))
					continue;
				
				// if there is no bitmap data, decide whether to continue or display missing image
				if (!tile.bitmapData)
				{
					if (!this.displayMissingImage.value)
						continue;
					
					tile.bitmapData = WMSPlotter._missingImage.bitmapData;
				}
				
				var imageBounds:Bounds2D = tile.bounds;
				var imageBitmap:BitmapData = tile.bitmapData;
				
				// get screen coords from image data coords
				this._tempBounds.copyFrom(imageBounds); // data
				dataBounds.projectCoordsTo(this._tempBounds, screenBounds); // data to screen
				this._tempBounds.makeSizePositive(); // positive screen direction

				// when scaling, we need to use the ceiling of the values to cover the seam lines
				this._tempMatrix.identity();
				this._tempMatrix.scale(
					Math.ceil(this._tempBounds.getWidth()) / imageBitmap.width,
					Math.ceil(this._tempBounds.getHeight()) / imageBitmap.height
				);
				this._tempMatrix.translate(
					Math.round(this._tempBounds.getXMin()),
					Math.round(this._tempBounds.getYMin())
				);

				// calculate clip rectangle for nasa service because tiles go outside the lat/long bounds
				this._service.getAllowedBounds(this._tempBounds); // data
				dataBounds.projectCoordsTo(this._tempBounds, screenBounds); // data to screen
				this._tempBounds.getRectangle(this._clipRectangle); // get screen rect
				this._clipRectangle.x = Math.floor(this._clipRectangle.x);
				this._clipRectangle.y = Math.floor(this._clipRectangle.y);
				this._clipRectangle.width = Math.floor(this._clipRectangle.width - 0.5);
				this._clipRectangle.height = Math.floor(this._clipRectangle.height - 0.5);
				
				var colorTransform:ColorTransform = (imageBitmap == WMSPlotter._missingImage.bitmapData ? WMSPlotter._missingImageColorTransform : null);
				destination.draw(imageBitmap, this._tempMatrix, colorTransform, null, this._clipRectangle, this.preferLowerQuality.value && !colorTransform);				
				
				if (this.debug)
					this.debugTileBounds(imageBounds, dataBounds, screenBounds, destination, tile.request.url, true);
			}
			this.drawCreditText(destination);
		}
		
		private bt:BitmapText = new BitmapText();
		private ct:ColorTransform = new ColorTransform();
		private rect:Rectangle = new Rectangle();
		private tempBounds:Bounds2D = new Bounds2D();
		private debugTileBounds(tileBounds:Bounds2D, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics, url:string, drawRect:boolean):void
		{
			this._tempScreenBounds.copyFrom(tileBounds);
			dataBounds.projectCoordsTo(this._tempScreenBounds, screenBounds);
			
			if (drawRect)
			{
				this._tempScreenBounds.getRectangle(this.rect);
				graphics.lineStyle(1, Math.random() * 0xFFFFFF);
				graphics.drawRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
			}
			
			screenBounds.constrainBounds(this._tempScreenBounds, false);
			this.bt.setBounds(this._tempScreenBounds, true);
			this.bt.text = url;
			this.bt.draw(graphics);
		}
		
		public creditInfoTextColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x000000));
		public creditInfoBackgroundColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0xFFFFFF));
		public creditInfoAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0.5, isFinite));
		
		private drawCreditText(destination:Graphics):void
		{
			var _providerCredit:string = this._service.getCreditInfo();
			if (_providerCredit)
			{
				var textColor:number = this.creditInfoTextColor.value;
				if (!isFinite(textColor))
					return;
				
				this.bt.textFormat.color = textColor;
				this.bt.textFormat.font = Weave.properties.visTextFormat.font.value;
				this.bt.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_LEFT;
				this.bt.verticalAlign = BitmapText.VERTICAL_ALIGN_BOTTOM;
				this.bt.x = 0;
				this.bt.y = destination.height;
				this.bt.text = _providerCredit;
				
				var backgroundColor:number = this.creditInfoBackgroundColor.value;
				if (isFinite(backgroundColor))
				{
					this.bt.getUnrotatedBounds(this.tempBounds);
					this.tempBounds.getRectangle(this.rect);
					tempShape.graphics.clear();
					DrawUtils.clearLineStyle(tempShape.graphics);
					tempShape.graphics.beginFill(backgroundColor, this.creditInfoAlpha.value);
					tempShape.graphics.drawRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
					tempShape.graphics.endFill();
					destination.draw(tempShape);
				}
				
				this.ct.alphaMultiplier = this.creditInfoAlpha.value;
				this.bt.draw(destination, null, this.ct);
			}
		}

		/**
		 * Set the provider for the plotter.
		 */
		public setProvider(provider:string):void
		{
			if (!this.verifyServiceName(provider))
				return;
			
			if (provider == WMSProviders.NASA)
			{
				this.service.requestLocalObject(OnEarthProvider,false);
			}
			else if (provider == WMSProviders.CUSTOM_MAP)
			{
				this.service.requestLocalObject(CustomWMS,false);
			}
			else
			{
				this.service.requestLocalObject(ModestMapsWMS,false);
				(this._service as ModestMapsWMS).providerName.value = provider;
			}
			
			// determine maximum bounds for reprojecting images
			this._allowedTileReprojBounds.copyFrom(this._latLonBounds);
			this.projManager.transformBounds("EPSG:4326", this._service.getProjectionSRS(), this._allowedTileReprojBounds);
			this.spatialCallbacks.triggerCallbacks();
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.reset();
			if (this._service)
			{
				// determine bounds of plotter
				this._service.getAllowedBounds(output);
				
				var serviceSRS:string = this._service.getProjectionSRS();
				if (serviceSRS != this.srs.value
					&& this.projManager.projectionExists(this.srs.value)
					&& this.projManager.projectionExists(serviceSRS))
				{
					this.projManager.transformBounds(this._service.getProjectionSRS(), this.srs.value, output);
				}
			}
		}
		
		public dispose():void
		{
			if (this._service)
				this._service.cancelPendingRequests(); // cancel everything to prevent any callbacks from running
			WeaveAPI.SessionManager.disposeObject(this._service);
		}

		/**
		 * This function will set the style of the image requests for NASA WMS.
		 */
		public setStyle():void
		{
			var nasaService:OnEarthProvider = this._service as OnEarthProvider;
			var style:string = this.styles.value;
			
			if (!nasaService)
				return;
			
			nasaService.changeStyleToMonth(style);
		}
		
		private verifyServiceName(s:string):boolean
		{
			if (!s)
				return false;
			
			return WMSProviders.providers.indexOf(s) >= 0;
		}
		
		public isBusy():boolean
		{
			return false;
		}
		
		public adjustZoomBounds(zoomBounds:ZoomBounds):void
		{
			if (!this._service)
				return;
			
			var minScreenSize:int = Math.max(this._service.getImageWidth(), this._service.getImageHeight());
			zoomBounds.getDataBounds(this._tempDataBounds);
			zoomBounds.getScreenBounds(this._tempScreenBounds);
			this.getBackgroundDataBounds(this._tempBackgroundDataBounds);
			
			var inputZoomLevel:number = ZoomUtils.getZoomLevel(this._tempDataBounds, this._tempScreenBounds, this._tempBackgroundDataBounds, minScreenSize);
			var inputScale:number = ZoomUtils.getScaleFromZoomLevel(this._tempBackgroundDataBounds, minScreenSize, inputZoomLevel);
			
			var outputZoomLevel:number = Math.round(inputZoomLevel);
			var outputScale:number = ZoomUtils.getScaleFromZoomLevel(this._tempBackgroundDataBounds, minScreenSize, outputZoomLevel);
			
			ZoomUtils.zoomDataBoundsByRelativeScreenScale(this._tempDataBounds, this._tempScreenBounds, this._tempScreenBounds.getXCenter(), this._tempScreenBounds.getYCenter(), outputScale / inputScale, false);
			zoomBounds.setDataBounds(this._tempDataBounds);
		}
		
		//[Deprecated(replacement="service")] public set serviceName(value:string):void { setProvider(value); }
	}

	class ProjectedShape
	{
		public shape:Shape;
		public bounds:Bounds2D;
		public imageWidth:int;
		public imageHeight:int;
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, WMSPlotter, "WMS images");
}

