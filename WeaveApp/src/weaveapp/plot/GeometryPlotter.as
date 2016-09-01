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
	import Graphics = PIXI.Graphics;
	import Point = weavejs.geom.Point;
	import DynamicState = weavejs.api.core.DynamicState;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IObjectWithDescription = weavejs.api.ui.IObjectWithDescription;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import IPlotterWithGeometries = weavejs.api.ui.IPlotterWithGeometries;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import StreamedGeometryColumn = weavejs.data.column.StreamedGeometryColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeometryType = weavejs.geom.GeometryType;
	import WeaveProperties = weavejs.app.WeaveProperties;
	import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
	import BLGNode = weavejs.geom.BLGNode;
	import ExtendedDynamicColumn = weavejs.data.column.ExtendedDynamicColumn;

	declare type ReprojectedGeometryColumn = ExtendedDynamicColumn;

	export class GeometryPlotter extends AbstractPlotter implements IPlotterWithGeometries, ISelectableAttributes, IObjectWithDescription
	{
		public constructor()
		{
			super();
			// initialize default line & fill styles
			this.fill.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];
			this.line.color.defaultValue.state = 0x000000;

			Weave.linkState(StreamedGeometryColumn.geometryMinimumScreenArea, this.pixellation);

			this.updateKeySources();
			
			// not every change to the geometries changes the keys
			this.geometryColumn.removeCallback(this._filteredKeySet.triggerCallbacks);
			this.geometryColumn.boundingBoxCallbacks.addImmediateCallback(this, this._filteredKeySet.triggerCallbacks);
			
			this.geometryColumn.boundingBoxCallbacks.addImmediateCallback(this, this.spatialCallbacks.triggerCallbacks); // bounding box should trigger spatial
			this.addSpatialDependencies(this._filteredKeySet.keyFilter); // subset should trigger spatial callbacks
		}
		
		public getDescription():string
		{
			return this.geometryColumn.getDescription();
		}
		
		public getSelectableAttributeNames()
		{
			return ['Color', 'Geometry'];
		}
		public getSelectableAttributes()
		{
			return [this.fill.color, this.geometryColumn];
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
		public zOrderAscending:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true), this.updateKeySources);
		
		private updateKeySources():void
		{
			this.setColumnKeySources([this.geometryColumn, this.zOrderColumn], [0, this.zOrderAscending.value ? 1 : -1]);
		}
		
		/**
		 *  This is the default URL path for images, when using images in place of points.
		 */
		//public pointDataImageColumn:ImageColumn = Weave.linkableChild(this, ImageColumn);
		public useFixedImageSize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		/**
		 * This is the line style used to draw the lines of the geometries.
		 */
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		/**
		 * This is the fill style used to fill the geometries.
		 */
		public fill:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);

		/**
		 * This is the size of the points drawn when the geometry represents point data.
		 **/
		public iconSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10, this.validateIconSize));
		private validateIconSize(value:number):boolean { return 0.2 <= value && value <= 1024; };

		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var geoms:GeneralizedGeometry[] = null;
			var column:IAttributeColumn = this.geometryColumn; 
			var notGeoms:boolean = false;
			
			var value:GeneralizedGeometry[] = column.getValueFromKey(recordKey, Array);
			if (Array.isArray(value))
			{
				geoms = value; // array of geoms
				//Need to ensure that it is an array of geoms
				for (var j:int = 0; j < geoms.length; j++)
				{
					if (!Weave.IS(geoms[j], GeneralizedGeometry))
					{
						notGeoms = true;
						break;
					}
				}
			}

			var i:int = 0;
			if (!notGeoms)
				if (geoms != null)
					for (var geom of geoms)
						output[i++] = geom.bounds;
			output.length = i;
		}
		
		public getGeometriesFromRecordKey(recordKey:IQualifiedKey, minImportance:number = 0, bounds:Bounds2D = null):(GeneralizedGeometry | ISimpleGeometry)[]
		{
			var value = this.geometryColumn.getValueFromKey(recordKey, Array);
			var geoms:GeneralizedGeometry[] = null;
			var notGeoms:boolean = false;
			
			if (Array.isArray(value))
			{
				geoms = value;
				//Need to ensure that it is an array of geoms
				for ( var j:int = 0; j < geoms.length; j++)
				{
					if (!(geoms[j] instanceof GeneralizedGeometry))
					{
						notGeoms = true;
						break;
					}
				}
			}

			var results:GeneralizedGeometry[] = [];
			if (!notGeoms)
				if (geoms != null)
					for (var geom of geoms)
						results.push(geom);
			
			return results;
		}
		
		public getBackgroundGeometries():ISimpleGeometry[]
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
			var column:IAttributeColumn = this.geometryColumn;
			while (!Weave.IS(column, StreamedGeometryColumn) && Weave.IS(column, IColumnWrapper))
				column = (column as IColumnWrapper).getInternalColumn();
			
			// if the internal geometry column is a streamed column, request the required detail
			var streamedColumn:StreamedGeometryColumn = Weave.AS(column, StreamedGeometryColumn);
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
		protected getDataAreaPerPixel(dataBounds:Bounds2D, screenBounds:Bounds2D):number
		{
			// get minimum importance value required to display the shape at this zoom level
//			var dw:number = dataBounds.getWidth();
//			var dh:number = dataBounds.getHeight();
//			var sw:number = screenBounds.getWidth();
//			var sh:number = screenBounds.getHeight();
//			return Math.min((dw*dw)/(sw*sw), (dh*dh)/(sh*sh));
			return dataBounds.getArea() / screenBounds.getArea();
		}
		
		public debug:boolean = false;
		public debugGridSkip:boolean = false;
		private keepTrack:boolean = false;
		public totalVertices:int = 0;
		
		public pixellation:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		
		private _destinationToPlotTaskMap:WeakMap<Graphics, IPlotTask> = new WeakMap();
		
		private _singleGeom:[GeneralizedGeometry] = [null]; // reusable array for holding one item
		
		private RECORD_INDEX:string = 'recordIndex';
		private MIN_IMPORTANCE:string = 'minImportance';
		private D_PROGRESS:string = 'd_progress';
		private D_ASYNCSTATE:string = 'd_asyncState';
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			var simplifyDataBounds:Bounds2D = task.dataBounds;
			var simplifyScreenBounds:Bounds2D = task.screenBounds;
			if (this.debugSimplify)
			{
				if (!this._debugSimplifyDataBounds)
				{
					this._debugSimplifyDataBounds = new Bounds2D();
					this._debugSimplifyDataBounds.copyFrom(task.dataBounds);
					this._debugSimplifyScreenBounds = new Bounds2D();
					this._debugSimplifyScreenBounds.copyFrom(task.screenBounds);
				}
				simplifyDataBounds = this._debugSimplifyDataBounds;
				simplifyScreenBounds = this._debugSimplifyScreenBounds;
			}
			
			this.keepTrack = this.debug && (task as PlotTask).taskType == 0;
			if (task.iteration == 0)
			{
				if (!this.debugSimplify)
					this._debugSimplifyDataBounds = this._debugSimplifyScreenBounds = null;
				
				if (this.keepTrack)
					this.totalVertices = 0;
				task.asyncState[this.RECORD_INDEX] = 0;
				task.asyncState[this.MIN_IMPORTANCE] = this.getDataAreaPerPixel(simplifyDataBounds, simplifyScreenBounds) * this.pixellation.value;
				task.asyncState[this.D_PROGRESS] = new WeakMap();
				task.asyncState[this.D_ASYNCSTATE] = new WeakMap();
			}
			
			if (this.debugGridSkip)
				simplifyDataBounds = null;

			var drawImages:boolean = this.pointDataImageColumn.getInternalColumn() != null;
			var recordIndex:number = task.asyncState[this.RECORD_INDEX];
			var minImportance:number = task.asyncState[this.MIN_IMPORTANCE];
			var map_plotter_progress:Map<IPlotter, number> = task.asyncState[this.D_PROGRESS];
			var map_plotter_asyncState:Map<IPlotter, Object> = task.asyncState[this.D_ASYNCSTATE];
			var progress:number = 1; // set to 1 in case loop is not entered
			while (recordIndex < task.recordKeys.length)
			{
				var recordKey:IQualifiedKey = task.recordKeys[recordIndex];
				var geoms:GeneralizedGeometry[] = null;
				var value:any = this.geometryColumn.getValueFromKey(recordKey, Array);
				if (Array.isArray(value))
					geoms = value;
				else if (Weave.IS(value, GeneralizedGeometry))
				{
					geoms = this._singleGeom;
					this._singleGeom[0] = value;
				}
				
				for (var pass:int = 0; pass < 2; pass++)
				{
					if (pass == 1 && !drawImages)
						break;
					
					if (geoms && geoms.length > 0)
					{
						var styleSet:boolean = false;
						
						// draw the geom
						for (var i:int = 0; i < geoms.length; i++)
						{
							var geom = geoms[i];
							if (geom)
							{
								// skip shapes that are considered unimportant at this zoom level
								if (geom.geomType == GeometryType.POLYGON && geom.bounds.getArea() < minImportance)
									continue;
								if (pass == 0)
								{
									if (!styleSet)
									{
										this.fill.beginFillStyle(recordKey, task.buffer);
										this.line.beginLineStyle(recordKey, task.buffer);
										styleSet = true;
									}
									this.drawMultiPartShape(recordKey, geom, geom.getSimplifiedGeometry(minImportance, simplifyDataBounds), task.dataBounds, task.screenBounds, task.buffer);
								}
								else
								{
									this.drawImage(recordKey, geom.bounds.getXCenter(), geom.bounds.getYCenter(), task.dataBounds, task.screenBounds, task.buffer);
								}
							}
						}
						if (pass == 0 && styleSet)
						{
							task.buffer.endFill();
						}
					}
				}
				
				// this progress value will be less than 1
				progress = recordIndex / task.recordKeys.length;
				task.asyncState[this.RECORD_INDEX] = ++recordIndex;
				
				if (this.keepTrack)
					continue;
				
				// avoid doing too little or too much work per iteration 
				if (Date.now() > task.iterationStopTime)
					break; // not done yet
			}
			
			if (this.keepTrack)
				console.log('totalVertices',this.totalVertices);
			
			// hack for symbol plotters
			var symbolPlottersArray = this.symbolPlotters.getObjects(IPlotter);
			var ourAsyncState:Object = task.asyncState;
			for (var plotter of symbolPlottersArray)
			{
				if (task.iteration == 0)
				{
					map_plotter_asyncState.set(plotter, {});
					map_plotter_progress.set(plotter, 0);
				}
				if (map_plotter_progress.get(plotter) != 1)
				{
					task.asyncState = map_plotter_asyncState.get(plotter);
					map_plotter_progress.set(plotter, plotter.drawPlotAsyncIteration(task));
				}
				progress += map_plotter_progress.get(plotter);
			}
			task.asyncState = ourAsyncState;
			
			return progress / (1 + symbolPlottersArray.length);
		}
		
		private static tempPoint:Point = new Point(); // reusable object

		/**
		 * This function draws a list of GeneralizedGeometry objects
		 * @param geomParts A 2-dimensional Array or Vector of objects, each having x and y properties.
		 */
		private drawMultiPartShape(key:IQualifiedKey, geom:GeneralizedGeometry, geomParts:BLGNode[][], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			var geomType:string = geom.geomType;
			for (var i:int = 0; i < geomParts.length; i++)
				this.drawShape(key, geomParts[i], geomType, dataBounds, screenBounds, graphics);
		}
		/**
		 * This function draws a single geometry.
		 * @param points An Array or Vector of objects, each having x and y properties.
		 */
		private drawShape(key:IQualifiedKey, points:{x:number, y:number}[], geomType:string, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			if (points.length == 0)
				return;

			if (geomType == GeometryType.POINT)
			{
				for (let currentNode of points)
				{
					GeometryPlotter.tempPoint.x = currentNode.x;
					GeometryPlotter.tempPoint.y = currentNode.y;
					dataBounds.projectPointTo(GeometryPlotter.tempPoint, screenBounds);
					// round coordinates for faster & more consistent rendering
					GeometryPlotter.tempPoint.x = Math.round(GeometryPlotter.tempPoint.x);
					GeometryPlotter.tempPoint.y = Math.round(GeometryPlotter.tempPoint.y);
					this.fill.beginFillStyle(key, graphics);
					this.line.beginLineStyle(key, graphics);
					graphics.drawCircle(GeometryPlotter.tempPoint.x, GeometryPlotter.tempPoint.y, this.iconSize.value / 2);
					graphics.endFill();
				}
				return;
			}

			// prevent moveTo/lineTo from drawing a filled polygon if the shape type is line
			if (geomType == GeometryType.LINE)
				graphics.endFill();

			var numPoints:int = points.length;
			var firstX:number, firstY:number;
			for (var vIndex:int = 0; vIndex < numPoints; vIndex++)
			{
				let currentNode = points[vIndex];
				GeometryPlotter.tempPoint.x = currentNode.x;
				GeometryPlotter.tempPoint.y = currentNode.y;
				dataBounds.projectPointTo(GeometryPlotter.tempPoint, screenBounds);
				var x:number = GeometryPlotter.tempPoint.x,
					y:number = GeometryPlotter.tempPoint.y;
				
				if (this.debug)
				{
					if (this.keepTrack)
						this.totalVertices++;
					x = x|0;
					y = y|0;
					graphics.moveTo(x-1, y);
					graphics.lineTo(x+1, y);
					graphics.moveTo(x, y-1);
					graphics.lineTo(x, y+1);
					graphics.moveTo(x, y);
					continue;
				}
				
				if (vIndex == 0)
				{
					firstX = x;
					firstY = y;
					graphics.moveTo(x, y);
					continue;
				}
				graphics.lineTo(x, y);
			}
			
			if (!this.debug)
				if (geomType == GeometryType.POLYGON)
					graphics.lineTo(firstX, firstY);
		}
		
		private drawImage(key:IQualifiedKey, dataX:number, dataY:number, dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			GeometryPlotter.tempPoint.x = dataX;
			GeometryPlotter.tempPoint.y = dataY;
			dataBounds.projectPointTo(GeometryPlotter.tempPoint, screenBounds);
			// round coordinates for faster & more consistent rendering
			GeometryPlotter.tempPoint.x = Math.round(GeometryPlotter.tempPoint.x);
			GeometryPlotter.tempPoint.y = Math.round(GeometryPlotter.tempPoint.y);

			// temporary solution - draw box
			let p = GeometryPlotter.tempPoint;
			let r = this.iconSize.value / 2;
			this.line.beginLineStyle(key, graphics);
			this.fill.beginFillStyle(key, graphics);
			graphics.drawRect(p.x - r, p.y - r, p.x + r, p.y + r);
			graphics.endFill();

			/*
			var bitmapData:BitmapData = this.pointDataImageColumn.getValueFromKey(key, BitmapData) || GeometryPlotter._missingImage;
			var w:number = bitmapData.width;
			var h:number = bitmapData.height;
			GeometryPlotter.tempMatrix.identity();
			if (this.useFixedImageSize.value)
			{
				var maxSize:number = Math.max(w, h);
				var scale:number = this.iconSize.value / maxSize;
				GeometryPlotter.tempMatrix.scale(scale, scale);
				GeometryPlotter.tempMatrix.translate(Math.round(Math.abs(maxSize - w) / 2), Math.round(Math.abs(maxSize - h) / 2));
				w = h = this.iconSize.value;
			}
			GeometryPlotter.tempMatrix.translate(Math.round(GeometryPlotter.tempPoint.x - w / 2), Math.round(GeometryPlotter.tempPoint.y - h / 2));
			outputBitmapData.draw(bitmapData, GeometryPlotter.tempMatrix, null, null, null, true);
			*/
		}

		// backwards compatibility 0.9.6
		/*[Deprecated(replacement="line")] public set lineStyle(value:Object):void
		{
			try {
				Weave.setState(line, value[0][DynamicState.SESSION_STATE]);
			} catch (e) { }
		}
		[Deprecated(replacement="fill")] public set fillStyle(value:Object):void
		{
			try {
				Weave.setState(fill, value[0][DynamicState.SESSION_STATE]);
			} catch (e) { }
		}
		[Deprecated(replacement="geometryColumn")] public set geometry(value:Object):void
		{
			Weave.setState(geometryColumn.internalDynamicColumn, value);
		}
		// backwards compatibility May 2012
		[Deprecated(replacement="iconSize")] public set pointShapeSize(value:number):void { iconSize.value = value * 2; }*/
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, GeometryPlotter, "Geometries");
}

