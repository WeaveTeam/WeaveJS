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
	import Graphics = PIXI.Graphics;
	import LineScaleMode = flash.display.LineScaleMode;
	import Matrix = flash.geom.Matrix;
	import Point = weavejs.geom.Point;
	import Dictionary = flash.utils.Dictionary;
	import getTimer = flash.utils.getTimer;
	
	import DynamicState = weavejs.api.core.DynamicState;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import IPlotterWithGeometries = weavejs.api.ui.IPlotterWithGeometries;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import Compiler = weavejs.compiler.Compiler;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ImageColumn = weavejs.data.column.ImageColumn;
	import ReprojectedGeometryColumn = weavejs.data.column.ReprojectedGeometryColumn;
	import StreamedGeometryColumn = weavejs.data.column.StreamedGeometryColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeometryType = weavejs.geom.GeometryType;
	import CachedBitmap = weavejs.util.CachedBitmap;
	import ExtendedFillStyle = weavejs.geom.ExtendedFillStyle;
	import ExtendedLineStyle = weavejs.geom.ExtendedLineStyle;
	
	/**
	 * GeometryPlotter
	 */
	export class GeometryPlotter extends AbstractPlotter implements IPlotterWithGeometries, ISelectableAttributes, IObjectWithDescription
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, GeometryPlotter, "Geometries");
		
		public constructor()
		{
			// initialize default line & fill styles
			line.scaleMode.defaultValue.setSessionState(LineScaleMode.NONE);
			fill.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			line.color.defaultValue.value = 0x000000;

			Weave.linkState(StreamedGeometryColumn.geometryMinimumScreenArea, pixellation);

			updateKeySources();
			
			// not every change to the geometries changes the keys
			geometryColumn.removeCallback(_filteredKeySet.triggerCallbacks);
			geometryColumn.boundingBoxCallbacks.addImmediateCallback(this, _filteredKeySet.triggerCallbacks);
			
			geometryColumn.boundingBoxCallbacks.addImmediateCallback(this, spatialCallbacks.triggerCallbacks); // bounding box should trigger spatial
			this.addSpatialDependencies(_filteredKeySet.keyFilter); // subset should trigger spatial callbacks
		}
		
		public getDescription():string
		{
			return geometryColumn.getDescription();
		}
		
		public getSelectableAttributeNames():Array
		{
			return ['Color', 'Geometry'];
		}
		public getSelectableAttributes():Array
		{
			return [fill.color, geometryColumn];
		}
		
		public symbolPlotters:ILinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IPlotter));

		/**
		 * This is the reprojected geometry column to draw.
		 */
		public geometryColumn:ReprojectedGeometryColumn = Weave.linkableChild(this, ReprojectedGeometryColumn);
		
		/**
		 * Determines the Z order of geometries
		 */
		public zOrderColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public zOrderAscending:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true), updateKeySources);
		
		private updateKeySources():void
		{
			setColumnKeySources([geometryColumn, zOrderColumn], [0, zOrderAscending.value ? 1 : -1]);
		}
		
		/**
		 *  This is the default URL path for images, when using images in place of points.
		 */
		public pointDataImageColumn:ImageColumn = Weave.linkableChild(this, ImageColumn);
		public useFixedImageSize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		[Embed(source="/weave/resources/images/missing.png")]
		private static _missingImageClass:Class;
		private static _missingImage:BitmapData = Bitmap(new _missingImageClass()).bitmapData;
		
		/**
		 * This is the line style used to draw the lines of the geometries.
		 */
		public line:ExtendedLineStyle = Weave.linkableChild(this, ExtendedLineStyle);
		/**
		 * This is the fill style used to fill the geometries.
		 */
		public fill:ExtendedFillStyle = Weave.linkableChild(this, ExtendedFillStyle);

		/**
		 * This is the size of the points drawn when the geometry represents point data.
		 **/
		public iconSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10, validateIconSize));
		private validateIconSize(value:number):boolean { return 0.2 <= value && value <= 1024; };

		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var geoms:Array = null;
			var column:IAttributeColumn = geometryColumn; 
			var notGeoms:boolean = false;
			
			// the column value may contain a single geom or an array of geoms
			var value:* = column.getValueFromKey(recordKey, Array);
			if (value is Array)
			{
				geoms = value; // array of geoms
				//Need to ensure that it is an array of geoms
				for( var j:int = 0; j < geoms.length; j++)
					if( !(geoms[j] is GeneralizedGeometry) )
					{
						notGeoms = true;
						break;
					}
			}
			else if (value is GeneralizedGeometry)
				geoms = [value as GeneralizedGeometry]; // single geom -- create array

			var i:int = 0;
			if( !notGeoms )
				if (geoms != null)
					for each (var geom:GeneralizedGeometry in geoms)
						output[i++] = geom.bounds;
			output.length = i;
		}
		
		public getGeometriesFromRecordKey(recordKey:IQualifiedKey, minImportance:number = 0, bounds:Bounds2D = null):Array
		{
			var value:* = geometryColumn.getValueFromKey(recordKey, Array);
			var geoms:Array = null;
			var notGeoms:boolean = false;
			
			if (value is Array)
			{
				geoms = value;
				//Need to ensure that it is an array of geoms
				for( var j:int = 0; j < geoms.length; j++)
					if( !(geoms[j] is GeneralizedGeometry) )
					{
						notGeoms = true;
						break;
					}
			}
			else if (value is GeneralizedGeometry)
				geoms = [ value as GeneralizedGeometry ];
			
			var results:Array = [];
			if( !notGeoms )
				if (geoms != null)
					for each (var geom:GeneralizedGeometry in geoms)
						results.push(geom);
			
			return results;
		}
		
		public getBackgroundGeometries():Array
		{
			return [];
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @param outputDataBounds A Bounds2D object to store the result in.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			// try to find an internal StreamedGeometryColumn
			var column:IAttributeColumn = geometryColumn;
			while (!(column is StreamedGeometryColumn) && column is IColumnWrapper)
				column = (column as IColumnWrapper).getInternalColumn();
			
			// if the internal geometry column is a streamed column, request the required detail
			var streamedColumn:StreamedGeometryColumn = column as StreamedGeometryColumn;
			if (streamedColumn)
				output.copyFrom(streamedColumn.collectiveBounds);
			else
				output.reset(); // undefined
		}
		
		public debugSimplify:boolean = false;
		private _debugSimplifyDataBounds:Bounds2D;
		private _debugSimplifyScreenBounds:Bounds2D;

		/**
		 * This function calculates the importance of a pixel.
		 */
		protected function getDataAreaPerPixel(dataBounds:Bounds2D, screenBounds:Bounds2D):number
		{
			// get minimum importance value required to display the shape at this zoom level
//			var dw:number = dataBounds.getWidth();
//			var dh:number = dataBounds.getHeight();
//			var sw:number = screenBounds.getWidth();
//			var sh:number = screenBounds.getHeight();
//			return Math.min((dw*dw)/(sw*sw), (dh*dh)/(sh*sh));
			return dataBounds.getArea() / screenBounds.getArea();
		}
		
		/**
		 * A memoized version of _getCircleBitmap().
		 */
		private getCircleBitmap:Function = Compiler.memoize(_getCircleBitmap);
		/**
		 * Use getCircleBitmap() instead.
		 * @param radius iconSize.value / 2
		 */
		private _getCircleBitmap(lineParams:Array, fillParamsExt:Array, radius:number):CachedBitmap
		{
			var graphics:Graphics = tempShape.graphics;
			graphics.clear();
			
			fill.beginFillExt(graphics, fillParamsExt);
			graphics.lineStyle.apply(graphics, lineParams);
			graphics.drawCircle(0, 0, radius);
			graphics.endFill();
			var cb:CachedBitmap = new CachedBitmap(tempShape);
			
			graphics.clear(); // clear tempShape now so these graphics don't get used anywhere else by mistake
			
			return cb;
		}
		
		public debug:boolean = false;
		public debugGridSkip:boolean = false;
		private keepTrack:boolean = false;
		public totalVertices:int = 0;
		
		public pixellation:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		
		private _destinationToPlotTaskMap:Dictionary = new Dictionary(true);
		
		private _singleGeom:Array = []; // reusable array for holding one item
		
		private RECORD_INDEX:string = 'recordIndex';
		private MIN_IMPORTANCE:string = 'minImportance';
		private D_PROGRESS:string = 'd_progress';
		private D_ASYNCSTATE:string = 'd_asyncState';
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			var simplifyDataBounds:Bounds2D = task.dataBounds;
			var simplifyScreenBounds:Bounds2D = task.screenBounds;
			if (debugSimplify)
			{
				if (!_debugSimplifyDataBounds)
				{
					_debugSimplifyDataBounds = new Bounds2D();
					_debugSimplifyDataBounds.copyFrom(task.dataBounds);
					_debugSimplifyScreenBounds = new Bounds2D();
					_debugSimplifyScreenBounds.copyFrom(task.screenBounds);
				}
				simplifyDataBounds = _debugSimplifyDataBounds;
				simplifyScreenBounds = _debugSimplifyScreenBounds;
			}
			
			keepTrack = debug && (task['taskType'] == 0);
			if (task.iteration == 0)
			{
				if (!debugSimplify)
					_debugSimplifyDataBounds = _debugSimplifyScreenBounds = null;
				
				if (keepTrack)
					totalVertices = 0;
				task.asyncState[RECORD_INDEX] = 0;
				task.asyncState[MIN_IMPORTANCE] = getDataAreaPerPixel(simplifyDataBounds, simplifyScreenBounds) * pixellation.value;
				task.asyncState[D_PROGRESS] = new Dictionary(true);
				task.asyncState[D_ASYNCSTATE] = new Dictionary(true);
			}
			
			if (debugGridSkip)
				simplifyDataBounds = null;

			var drawImages:boolean = pointDataImageColumn.getInternalColumn() != null;
			var recordIndex:number = task.asyncState[RECORD_INDEX];
			var minImportance:number = task.asyncState[MIN_IMPORTANCE];
			var d_progress:Dictionary = task.asyncState[D_PROGRESS];
			var d_asyncState:Dictionary = task.asyncState[D_ASYNCSTATE];
			var progress:number = 1; // set to 1 in case loop is not entered
			while (recordIndex < task.recordKeys.length)
			{
				var recordKey:IQualifiedKey = task.recordKeys[recordIndex] as IQualifiedKey;
				var geoms:Array = null;
				var value:* = geometryColumn.getValueFromKey(recordKey, Array);
				if (value is Array)
					geoms = value;
				else if (value is GeneralizedGeometry)
				{
					geoms = _singleGeom;
					_singleGeom[0] = value;
				}
				
				for (var pass:int = 0; pass < 2; pass++)
				{
					if (pass == 1 && !drawImages)
						break;
					
					if (geoms && geoms.length > 0)
					{
						var graphics:Graphics = tempShape.graphics;
						var styleSet:boolean = false;
						
						// draw the geom
						for (var i:int = 0; i < geoms.length; i++)
						{
							var geom:GeneralizedGeometry = geoms[i] as GeneralizedGeometry;
							if (geom)
							{
								// skip shapes that are considered unimportant at this zoom level
								if (geom.geomType == GeometryType.POLYGON && geom.bounds.getArea() < minImportance)
									continue;
								if (pass == 0)
								{
									if (!styleSet)
									{
										graphics.clear();
										fill.beginFillStyle(recordKey, graphics);
										line.beginLineStyle(recordKey, graphics);
										styleSet = true;
									}
									drawMultiPartShape(recordKey, geom, geom.getSimplifiedGeometry(minImportance, simplifyDataBounds), task.dataBounds, task.screenBounds, graphics, task.buffer);
								}
								else
								{
									drawImage(recordKey, geom.bounds.getXCenter(), geom.bounds.getYCenter(), task.dataBounds, task.screenBounds, graphics, task.buffer);
								}
							}
						}
						if (pass == 0 && styleSet)
						{
							graphics.endFill();
							task.buffer.draw(tempShape);
						}
					}
				}
				
				// this progress value will be less than 1
				progress = recordIndex / task.recordKeys.length;
				task.asyncState[RECORD_INDEX] = ++recordIndex;
				
				if (keepTrack)
					continue;
				
				// avoid doing too little or too much work per iteration 
				if (getTimer() > task.iterationStopTime)
					break; // not done yet
			}
			
			if (keepTrack)
				trace('totalVertices',totalVertices);
			
			// hack for symbol plotters
			var symbolPlottersArray:Array = symbolPlotters.getObjects();
			var ourAsyncState:Object = task.asyncState;
			for each (var plotter:IPlotter in symbolPlottersArray)
			{
				if (task.iteration == 0)
				{
					d_asyncState[plotter] = {};
					d_progress[plotter] = 0;
				}
				if (d_progress[plotter] != 1)
				{
					task.asyncState = d_asyncState[plotter];
					d_progress[plotter] = plotter.drawPlotAsyncIteration(task);
				}
				progress += d_progress[plotter];
			}
			task.asyncState = ourAsyncState;
			
			return progress / (1 + symbolPlottersArray.length);
		}
		
		private static tempPoint:Point = new Point(); // reusable object
		private static tempMatrix:Matrix = new Matrix(); // reusable object

		/**
		 * This function draws a list of GeneralizedGeometry objects
		 * @param geomParts A 2-dimensional Array or Vector of objects, each having x and y properties.
		 */
		private drawMultiPartShape(key:IQualifiedKey, geom:GeneralizedGeometry, geomParts:Object, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics, bitmapData:BitmapData):void
		{
			var geomType:string = geom.geomType;
			for (var i:int = 0; i < geomParts.length; i++)
				drawShape(key, geomParts[i], geomType, dataBounds, screenBounds, graphics, bitmapData);
		}
		/**
		 * This function draws a single geometry.
		 * @param points An Array or Vector of objects, each having x and y properties.
		 */
		private drawShape(key:IQualifiedKey, points:Object, geomType:string, dataBounds:Bounds2D, screenBounds:Bounds2D, outputGraphics:Graphics, outputBitmapData:BitmapData):void
		{
			if (points.length == 0)
				return;

			var currentNode:Object;

			if (geomType == GeometryType.POINT)
			{
				for each (currentNode in points)
				{
					tempPoint.x = currentNode.x;
					tempPoint.y = currentNode.y;
					dataBounds.projectPointTo(tempPoint, screenBounds);
					// round coordinates for faster & more consistent rendering
					tempPoint.x = Math.round(tempPoint.x);
					tempPoint.y = Math.round(tempPoint.y);
					var cachedBitmap:CachedBitmap = getCircleBitmap(line.getLineStyleParams(key), fill.getBeginFillParamsExt(key), iconSize.value / 2);
					cachedBitmap.drawTo(outputBitmapData, tempPoint.x, tempPoint.y);
				}
				return;
			}

			// prevent moveTo/lineTo from drawing a filled polygon if the shape type is line
			if (geomType == GeometryType.LINE)
				outputGraphics.endFill();

			var numPoints:int = points.length;
			var firstX:number, firstY:number;
			for (var vIndex:int = 0; vIndex < numPoints; vIndex++)
			{
				currentNode = points[vIndex];
				tempPoint.x = currentNode.x;
				tempPoint.y = currentNode.y;
				dataBounds.projectPointTo(tempPoint, screenBounds);
				var x:number = tempPoint.x,
					y:number = tempPoint.y;
				
				if (debug)
				{
					if (keepTrack)
						totalVertices++;
					x=int(x),y=int(y);
					outputGraphics.moveTo(x-1,y);
					outputGraphics.lineTo(x+1,y);
					outputGraphics.moveTo(x,y-1);
					outputGraphics.lineTo(x,y+1);
					outputGraphics.moveTo(x, y);
					continue;
				}
				
				if (vIndex == 0)
				{
					firstX = x;
					firstY = y;
					outputGraphics.moveTo(x, y);
					continue;
				}
				outputGraphics.lineTo(x, y);
			}
			
			if (!debug)
				if (geomType == GeometryType.POLYGON)
					outputGraphics.lineTo(firstX, firstY);
		}
		
		private drawImage(key:IQualifiedKey, dataX:number, dataY:number, dataBounds:Bounds2D, screenBounds:Bounds2D, outputGraphics:Graphics, outputBitmapData:BitmapData):void
		{
			tempPoint.x = dataX;
			tempPoint.y = dataY;
			dataBounds.projectPointTo(tempPoint, screenBounds);
			// round coordinates for faster & more consistent rendering
			tempPoint.x = Math.round(tempPoint.x);
			tempPoint.y = Math.round(tempPoint.y);
			
			var bitmapData:BitmapData = pointDataImageColumn.getValueFromKey(key, BitmapData) || _missingImage;
			var w:number = bitmapData.width;
			var h:number = bitmapData.height;
			tempMatrix.identity();
			if (useFixedImageSize.value)
			{
				var maxSize:number = Math.max(w, h);
				var scale:number = iconSize.value / maxSize;
				tempMatrix.scale(scale, scale);
				tempMatrix.translate(Math.round(Math.abs(maxSize - w) / 2), Math.round(Math.abs(maxSize - h) / 2));
				w = h = iconSize.value;
			}
			tempMatrix.translate(Math.round(tempPoint.x - w / 2), Math.round(tempPoint.y - h / 2));
			outputBitmapData.draw(bitmapData, tempMatrix, null, null, null, true);
		}

		// backwards compatibility 0.9.6
		/*[Deprecated(replacement="line")] public set lineStyle(value:Object):void
		{
			try {
				Weave.setState(line, value[0][DynamicState.SESSION_STATE]);
			} catch (e:Error) { }
		}
		[Deprecated(replacement="fill")] public set fillStyle(value:Object):void
		{
			try {
				Weave.setState(fill, value[0][DynamicState.SESSION_STATE]);
			} catch (e:Error) { }
		}
		[Deprecated(replacement="geometryColumn")] public set geometry(value:Object):void
		{
			Weave.setState(geometryColumn.internalDynamicColumn, value);
		}
		// backwards compatibility May 2012
		[Deprecated(replacement="iconSize")] public set pointShapeSize(value:number):void { iconSize.value = value * 2; }*/
	}
}
