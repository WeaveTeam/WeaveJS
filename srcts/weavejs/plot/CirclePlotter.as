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
	import BitmapData = flash.display.BitmapData;
	import Graphics = PIXI.Graphics;
	import Point = weavejs.geom.Point;
	
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import ISimpleGeometry = weavejs.api.data.ISimpleGeometry;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotterWithGeometries = weavejs.api.ui.IPlotterWithGeometries;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import GeometryType = weavejs.geom.GeometryType;
	import SimpleGeometry = weavejs.geom.SimpleGeometry;

	export class CirclePlotter extends AbstractPlotter implements IPlotterWithGeometries
	{
		public constructor()
		{
		}
		
		/**
		 * The x position of the circle. 
		 */		
		public dataX:LinkableNumber = Weave.linkableChild(this, new LinkableNumber());
		
		/**
		 * The y position of the circle. 
		 */		
		public dataY:LinkableNumber = Weave.linkableChild(this, new LinkableNumber());
		
		/**
		 * The radius of the circle. 
		 */		
		public radius:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1));
		
		/*[Deprecated(replacement="lineColor")] public set color(value:Object):void
		{
			Weave.setState(lineColor, value);
		}*/
		
		/**
		 * The color of the circle.
		 * @default 0 
		 */		
		public lineColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, verifyColor));
		/**
		 * The alpha of the circle.
		 * @default 1 
		 */		
		public lineAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1, verifyAlpha));
		/**
		 * The color of the fill inside the circle.
		 * @default 0 
		 */		
		public fillColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, verifyColor));
		/**
		 * The alpha of the fill inside the circle.
		 * @default 0 
		 */		
		public fillAlpha:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0, verifyAlpha));

		/**
		 * The thickness of the edge of the circle. 
		 */		
		public thickness:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(2));
		
		/**
		 * The projection of the map when this circle was created. 
		 */		
		//public projectionSRS:LinkableString = Weave.linkableChild(this, new LinkableString('', WeaveAPI.ProjectionManager.projectionExists));
		
		/**
		 * The number of vertices to use inside the polygon when selecting records. This must be at
		 * least <code>3</code>. <br>
		 * @default <code>25</code>
		 */		
		public polygonVertexCount:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(25, verifyPolygonVertexCount));
		private verifyPolygonVertexCount(value:number):boolean
		{
			return value >= 3; 
		}

		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			_tempDataBounds = dataBounds;
			_tempScreenBounds = screenBounds;
			
			if(isNaN(dataX.value) || isNaN(dataY.value) || isNaN(radius.value))
				return;
			
			var g:Graphics = tempShape.graphics;
			g.clear();
			
			//project center point 
			var centerPoint:Point = new Point(dataX.value, dataY.value);
			_tempDataBounds.projectPointTo(centerPoint, _tempScreenBounds);
			
			//project a point on the circle
			var circumferencePoint:Point = new Point(dataX.value + radius.value, dataY.value);
			_tempDataBounds.projectPointTo(circumferencePoint, _tempScreenBounds);
			
			//calculate projected distance
			var distance:number = Point.distance(centerPoint, circumferencePoint);
			
			//draw circle
			g.lineStyle(thickness.value, lineColor.value, lineAlpha.value);
			g.beginFill(fillColor.value, fillAlpha.value);
			g.drawCircle(centerPoint.x, centerPoint.y, distance);
			
			destination.draw(tempShape);
		}

		public getGeometriesFromRecordKey(recordKey:IQualifiedKey, minImportance:number = 0, bounds:Bounds2D = null):Array
		{
			// no keys in this plotter
			return [];
		}
		
		public getBackgroundGeometries():Array
		{
			_tempArray.length = 0;
			
			var geometryVector:Array = [];
			var simpleGeom:ISimpleGeometry = new SimpleGeometry(GeometryType.POLYGON);
			var numVertices:int = polygonVertexCount.value;
			var radiusValue:number = radius.value;
			var angle:number = 0;
			var dAngle:number = 2 * Math.PI / numVertices;
			for (var i:int = 0; i < numVertices; ++i)
			{
				// get origin-centered X,Y of the point
				var x:number = radiusValue * Math.cos(angle);
				var y:number = radiusValue * Math.sin(angle);
				var p:Point = new Point(x, y);
				
				// offset to the X,Y provided
				p.x += dataX.value;
				p.y += dataY.value;
				
				_tempArray.push(p);
				angle += dAngle;
			}

			(simpleGeom as SimpleGeometry).setVertices(_tempArray);
			geometryVector.push(simpleGeom);
			
			return geometryVector;
		}
		
				
		private verifyColor(value:number):boolean
		{
			return value >= 0;
		}
		
		private verifyAlpha(value:number):boolean
		{
			return value >= 0 && value <= 1;
		}
		// reusable objects
		
		private _tempDataBounds:Bounds2D;
		private _tempScreenBounds:Bounds2D;
		private _tempArray:Array = [];
	}
}