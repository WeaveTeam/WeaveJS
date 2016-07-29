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
	
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;

	export class ThermometerPlotter extends MeterPlotter implements ISelectableAttributes
	{
		public getSelectableAttributeNames()
		{
			return ["Meter"];
		}
		public getSelectableAttributes()
		{
			return [this.meterColumn];
		}
		
		// reusable point objects
		private bottom:Point = new Point();
		private top:Point = new Point();
		
		//the radius of the thermometer bulb (circle at bottom) in pixels
		private bulbRadius:number = 30;
		
		//the thickness of the thermometer red center line
		private centerLineThickness:number = 20;
		
		//the thickness of the thermometer background center line
		private backgroundCenterLineThickness:number = 30;
		
		//the color to use for background elements
		private backgroundCenterLineColor:uint = 0x777777;
		
		//the x offset (in pixels) used when drawing all shapes (so axis line is fully visible) 
		private xOffset:number = this.backgroundCenterLineThickness/2+1;
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			//compute the meter value by averaging all record values
			var meterValue:number = 0;
			var n:number = task.recordKeys.length;
			
			for (var i = 0; i < n; i++)//TODO handle missing values
				meterValue += this.meterColumn.getValueFromKey(task.recordKeys[i] as IQualifiedKey, Number);
			meterValue /= n;
					
			if (isFinite(meterValue))
			{
				//clear the graphics
				var graphics:Graphics = task.buffer;

				//project bottom point
				this.bottom.x = this.bottom.y = 0;
				task.dataBounds.projectPointTo(this.bottom, task.screenBounds);
				this.bottom.x += this.xOffset;
				
				//project top point (data value)
				this.top.x = 0;
				this.top.y = meterValue;
				task.dataBounds.projectPointTo(this.top, task.screenBounds);
				this.top.x += this.xOffset;
				
				//draw the center line (from zero to data value)
				graphics.lineStyle(this.centerLineThickness, 0xff0000/*, 1.0, false, "normal", CapsStyle.NONE, null, 3*/);
				graphics.moveTo(this.bottom.x, this.bottom.y+this.bulbRadius);
				graphics.lineTo(this.top.x, this.top.y);
			}
			return 1;
		}
		
		/**
		 * This function draws the background graphics for this plotter, if applicable.
		 * An example background would be the origin lines of an axis.
		 * @param dataBounds The data coordinates that correspond to the given screenBounds.
		 * @param screenBounds The coordinates on the given sprite that correspond to the given dataBounds.
		 * @param destination The sprite to draw the graphics onto.
		 */
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			//project bottom point
			this.bottom.x = this.bottom.y = 0;
			dataBounds.projectPointTo(this.bottom, screenBounds);
			this.bottom.x += this.xOffset;
			
			//project data max top point
			this.top.x = 0;
			this.top.y = this.meterColumnStats.getMax();
			dataBounds.projectPointTo(this.top, screenBounds);
			this.top.x += this.xOffset;
			
			//draw the background line (from zero to data max)
			graphics.lineStyle(this.backgroundCenterLineThickness,this.backgroundCenterLineColor);
			graphics.moveTo(this.bottom.x, this.bottom.y+this.bulbRadius);
			graphics.lineTo(this.top.x, this.top.y);
				
			//draw background circle
			graphics.lineStyle(5,this.backgroundCenterLineColor);
			graphics.beginFill(0xFF0000);
			graphics.drawCircle(this.bottom.x,this.bottom.y+this.bulbRadius,this.bulbRadius);
			graphics.endFill();
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @param output An Bounds2D object to store the result in.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(0, 0, 1, this.meterColumnStats.getMax());
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output).setBounds(0, 0, 1, this.meterColumnStats.getMax());
		}
	}
}



