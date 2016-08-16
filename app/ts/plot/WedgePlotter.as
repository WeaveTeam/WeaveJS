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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import DrawUtils = weavejs.util.DrawUtils;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	
	export class WedgePlotter extends AbstractPlotter
	{
		public constructor()
		{
			super();
			this.setColumnKeySources([this.beginRadians]);
			this.addSpatialDependencies(this.beginRadians, this.spanRadians);
		}
		
		public beginRadians:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public spanRadians:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fill:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);

		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, buffer:Graphics):void
		{
			// project data coordinates to screen coordinates and draw graphics
			var _beginRadians:number = this.beginRadians.getValueFromKey(recordKey, Number);
			var _spanRadians:number = this.spanRadians.getValueFromKey(recordKey, Number);

			var graphics:Graphics = tempShape.graphics;
			// begin line & fill
			this.line.beginLineStyle(recordKey, graphics);				
			this.fill.beginFillStyle(recordKey, graphics);
			// move to center point
			WedgePlotter.drawProjectedWedge(graphics, dataBounds, screenBounds, _beginRadians, _spanRadians);
			// end fill
			graphics.endFill();
		}
		private static tempBounds:Bounds2D = new Bounds2D();
		private static tempPoint:Point = new Point(); // reusable object, output of projectPoints()
		
		/**
		 * The data bounds for a glyph has width and height equal to zero.
		 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
		 * @param key The key of a data record.
		 * @param output An Array of Bounds2D objects to store the result in.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var _beginRadians:number = this.beginRadians.getValueFromKey(recordKey, Number);
			var _pieWidthRadians:number = this.spanRadians.getValueFromKey(recordKey, Number);
			WedgePlotter.getWedgeBounds(this.initBoundsArray(output), _beginRadians, _pieWidthRadians);
		}
		
		// gets data bounds for a wedge
		public static getWedgeBounds(outputDataBounds:Bounds2D, beginRadians:number, spanRadians:number, xDataCenter:number = 0, yDataCenter:number = 0, dataRadius:number = 1):void
		{
			///////////////////
			//TODO: change this to include begin & end arc points, then any arc points at intervals of pi/2 radians between begin & end arc points
			///////////////////
			
			outputDataBounds.reset();
			
			outputDataBounds.includeCoords(xDataCenter, yDataCenter);
			
			// This is the number of points on the arc used to generate the bounding box of a wedge.
			var numAnchors:number = 25;
			var differentialRadians:number = spanRadians/numAnchors;
			for (var counter:number = 0; counter <= numAnchors; ++counter)
			{
				var x:number = xDataCenter + dataRadius * Math.cos(beginRadians + counter * differentialRadians);
				var y:number = yDataCenter + dataRadius * Math.sin(beginRadians + counter * differentialRadians);
				
				outputDataBounds.includeCoords(x, y);
			}
		}

		// projects data coordinates to screen coordinates and draws wedge
		public static drawProjectedWedge(destination:Graphics, dataBounds:Bounds2D, screenBounds:Bounds2D, beginRadians:number, spanRadians:number, xDataCenter:number = 0, yDataCenter:number = 0, dataOuterRadius:number = 1, dataInnerRadius:number = 0):void
		{
			WedgePlotter.tempPoint.x = xDataCenter;
			WedgePlotter.tempPoint.y = yDataCenter;
			dataBounds.projectPointTo(WedgePlotter.tempPoint, screenBounds);
			var xScreenCenter:number = WedgePlotter.tempPoint.x;
			var yScreenCenter:number = WedgePlotter.tempPoint.y;
			// convert x,y distance from data coordinates to screen coordinates to get screen radius
			var xScreenRadius:number = dataOuterRadius * screenBounds.getWidth() / dataBounds.getWidth();
			var yScreenRadius:number = dataOuterRadius * screenBounds.getHeight() / dataBounds.getHeight();
			
			// move to beginning of outer arc, draw outer arc and output start coordinates to tempPoint
			DrawUtils.arcTo(destination, false, xScreenCenter, yScreenCenter, beginRadians, beginRadians + spanRadians, xScreenRadius, yScreenRadius, WedgePlotter.tempPoint);
			if (dataInnerRadius == 0)
			{
				// continue line to center
				destination.lineTo(xScreenCenter, yScreenCenter);
			}
			else
			{
				// continue line to inner arc, draw inner arc
				xScreenRadius = dataInnerRadius * screenBounds.getWidth() / dataBounds.getWidth();
				yScreenRadius = dataInnerRadius * screenBounds.getHeight() / dataBounds.getHeight();
				DrawUtils.arcTo(destination, true, xScreenCenter, yScreenCenter, beginRadians + spanRadians, beginRadians, xScreenRadius, yScreenRadius);
			}
			// continue line back to start of outer arc
			destination.lineTo(WedgePlotter.tempPoint.x, WedgePlotter.tempPoint.y);
		}
		
		/*[Deprecated(replacement="line")] public set lineStyle(value:Object):void
		{
			try
			{
				Weave.setState(line, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e)
			{
				console.error(e);
			}
		}
		[Deprecated(replacement="fill")] public set fillStyle(value:Object):void
		{
			try
			{
				Weave.setState(fill, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e)
			{
				console.error(e);
			}
		}*/
	}
}

