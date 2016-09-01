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
	import Bounds2D = weavejs.geom.Bounds2D;
	
	export class ProbeLinePlotter extends AbstractPlotter
	{
		public constructor()
		{
		}
		
		private drawLine:boolean = false;
		private yAxis:Point = new Point();//reusable object
		private plot:Point = new Point(); // reusable object
		private xAxis:Point = new Point(); // reusable object
		private yToPlot:boolean ;
		private xToPlot:boolean ;
		
		public clearCoordinates():void
		{
			this.drawLine = false;
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		public setCoordinates(x_yAxis:number, y_yAxis:number, xPlot:number, yPlot:number, x_xAxis:number, y_xAxis:number, yToPlotBool:boolean, xToPlotBool:boolean):void
		{
			this.yAxis.x = x_yAxis;
			this.yAxis.y = y_yAxis;
			plot.x = xPlot;
			plot.y = yPlot;
			this.xAxis.x = x_xAxis;
			this.xAxis.y = y_xAxis;
			this.drawLine = true;
			this.yToPlot = yToPlotBool ;
			this.xToPlot = xToPlotBool ;
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if (this.drawLine)
			{
				var graphics:Graphics = tempShape.graphics;
				graphics.clear();
				
				//HORIZONTAL PROBE LINE
				
				graphics.beginFill(0xff0000);
				graphics.lineStyle(1,0xff0000);
				dataBounds.projectPointTo(plot, screenBounds);
				if (this.yToPlot)
				{
					dataBounds.projectPointTo(this.yAxis, screenBounds);
					
					// Start at X axis
					graphics.moveTo(this.yAxis.x, this.yAxis.y);
					
					graphics.drawCircle(this.yAxis.x, this.yAxis.y,2);
					graphics.moveTo(this.yAxis.x, this.yAxis.y);
					
					// Finish line at point
					graphics.lineTo(plot.x, plot.y);
					
					//trace(coordinate, screenBounds, dataBounds);
				}
				graphics.drawCircle(plot.x,plot.y,2);
				
				if ( this.xToPlot)
				{
					graphics.moveTo(plot.x, plot.y);
					dataBounds.projectPointTo(this.xAxis, screenBounds);
					
					graphics.lineTo(this.xAxis.x, this.xAxis.y);
					graphics.drawCircle(this.xAxis.x, this.xAxis.y, 2);
				}
				
				graphics.endFill();
				destination.draw(tempShape); 
			}
		}
	}
}
