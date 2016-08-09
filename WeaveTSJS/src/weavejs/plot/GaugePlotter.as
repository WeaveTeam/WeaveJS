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
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import StandardLib = weavejs.util.StandardLib;
	import DynamicBinningDefinition = weavejs.data.bin.DynamicBinningDefinition;
	import SimpleBinningDefinition = weavejs.data.bin.SimpleBinningDefinition;
	import ColorRamp = weavejs.util.ColorRamp;
	import PlotUtils = weavejs.util.PlotUtils;
	import RadialAxis = weavejs.util.RadialAxis;

	/**
	 * This is the plotter for the semi-circular Gauge tool.
	 */
	export class GaugePlotter extends MeterPlotter implements ISelectableAttributes
	{
		
		//the radius of the Gauge (from 0 to 1)
		//TODO make this part of the session state
		private outerRadius:number = 0.8;
		
		//the radius of the Gauge (from 0 to 1)
		//TODO make this part of the session state
		private innerRadius:number = 0.3;
		
		//the radius at which the tick mark labels are drawn
		//TODO make this part of the session state
		private tickMarkLabelsRadius:number = this.outerRadius+0.08;

		//the angle offset determining the size of the gauge wedge.
		//Range is 0 to PI/2. 0 means full semicircle, PI/2 means 1 pixel wide vertical wedge.
		//TODO make this part of the session state
		private theta:number = Math.PI/4;
		
		//the thickness and color of the outer line
		//TODO make this part of the session state
		private outlineThickness:number = 2;
		private outlineColor:number = 0x000000;
		
		//the thickness and color of the outer line
		//TODO make this part of the session state
		private needleThickness:number = 2;
		private needleColor:number = 0x000000;
		
		//wrapper for a SimpleBinningDefinition, which creates equally spaced bins
		public binningDefinition:DynamicBinningDefinition = Weave.linkableChild(this, new DynamicBinningDefinition(true));
		
		//the approximate desired number of tick marks
		//TODO make this part of the session state
		public numberOfTickMarks:number = 10;
		
		//the color ramp mapping bins to colors
		public colorRamp:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Traffic Light")));
		
		// reusable point objects
		private p1:Point = new Point();
		private p2:Point = new Point();
		
		// the radial axis of the gauge
		private axis:RadialAxis = new RadialAxis();
		
		/**
		 * Creates a new gauge plotter with default settings
		 */
		public constructor()
		{
			//initializes the binning definition which defines a number of evenly spaced bins
			this.binningDefinition.requestLocalObject(SimpleBinningDefinition, false);
			(this.binningDefinition.internalObject as SimpleBinningDefinition).numberOfBins.value = 3;
			
			this.meterColumn.addImmediateCallback(this, this.updateAxis);
			this.binningDefinition.generateBinClassifiersForColumn(this.meterColumn);
			Weave.linkableChild(this, this.binningDefinition.asyncResultCallbacks);
		}
		
		public getSelectableAttributeNames()
		{
			return ["Gauge Column"];
		}
		public getSelectableAttributes()
		{
			return [this.meterColumn]
		}
		
		/**
		 * Updates the internal axis representation with the latest min, max, and 
		 * numberOfTickMarks. This should be called whenever any one of those changes.
		 */ 
		private updateAxis():void
		{
			var max:number = this.meterColumnStats.getMax();
			var min:number = this.meterColumnStats.getMin();
			this.axis.setParams(min,max,this.numberOfTickMarks);
		}
		
		private getMeterValue(recordKeys:IQualifiedKey[]):number
		{
			var n:number = recordKeys.length;
			if (n == 1)
				return this.meterColumn.getValueFromKey(recordKeys[i], Number);
			else
			{
				//compute the meter value by averaging record values
				var meterValueSum:number = 0;
				for (var i:int = 0; i < n; i++)//TODO handle missing values
					meterValueSum += this.meterColumn.getValueFromKey(recordKeys[i], Number);
				return meterValueSum / n;
			}
		}
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (task.recordKeys.length > 0)
			{
				//project center point
				this.p1.x = this.p1.y = 0;
				task.dataBounds.projectPointTo(this.p1, task.screenBounds);
				
				//project tip point (angle driven by data value)
				var meterValue:number = this.getMeterValue(task.recordKeys);
				var meterValueMax:number = this.meterColumnStats.getMax();
				var meterValueMin:number = this.meterColumnStats.getMin();
				var norm:number = StandardLib.normalize(meterValue, meterValueMin, meterValueMax);
	
				//compute the angle and project to screen coordinates
				var angle:number = this.theta+(1-norm)*(Math.PI-2*this.theta)
				this.p2.x = Math.cos(angle)*this.outerRadius;
				this.p2.y = Math.sin(angle)*this.outerRadius;
				task.dataBounds.projectPointTo(this.p2, task.screenBounds);
				
				//draw the needle line (from center to tip)
				var g:Graphics = tempShape.graphics;
				g.clear();
				g.lineStyle(this.needleThickness,this.needleColor,1.0);
				g.moveTo(this.p1.x, this.p1.y+this.outerRadius);
				g.lineTo(this.p2.x, this.p2.y);
				//flush the graphics buffer
				task.buffer.draw(tempShape);
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
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			//clear the graphics
			var g:Graphics = tempShape.graphics;
			g.clear();
			
			//fill the colored sectors
			this.fillSectors(dataBounds, screenBounds, g);
			
			//draw the meter outline
			this.drawMeterOutline(dataBounds, screenBounds, g);

			//TODO incorporate the bin names, use as labels
			//call getNames(),getObjects() on bins
			
			this.axis.draw(this.outerRadius,this.theta,this.tickMarkLabelsRadius,dataBounds, screenBounds,g,destination);
			
			//flush the graphics buffer
			destination.draw(tempShape);
		}
		
		private fillSectors(dataBounds:Bounds2D, screenBounds:Bounds2D,g:Graphics):void
		{
			var binNames:Array = this.binningDefinition.getBinNames();
			var numSectors:number = binNames.length;
			var sectorSize:number = (Math.PI-2*this.theta)/numSectors;
			for (var i:number = 0;i<numSectors;i++){
				var color:uint = this.colorRamp.getColorFromNorm(i/(numSectors-1));
				PlotUtils.fillSector(this.innerRadius,this.outerRadius,this.theta+i*sectorSize,this.theta+(i+1)*sectorSize,color,dataBounds, screenBounds, g);
			}
		}
		
		private drawMeterOutline(dataBounds:Bounds2D, screenBounds:Bounds2D,g:Graphics):void
		{
			g.lineStyle(this.outlineThickness,this.outlineColor,1.0);
			var minAngle:number = this.theta;
			var maxAngle:number = Math.PI-this.theta;
			PlotUtils.drawArc(this.outerRadius,minAngle,maxAngle,dataBounds, screenBounds, g);
			PlotUtils.drawArc(this.innerRadius,minAngle,maxAngle,dataBounds, screenBounds, g);
			PlotUtils.drawRadialLine(this.innerRadius,this.outerRadius,minAngle,dataBounds, screenBounds, g);
			PlotUtils.drawRadialLine(this.innerRadius,this.outerRadius,maxAngle,dataBounds, screenBounds, g);
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the background.
		 * @param outputDataBounds A Bounds2D object to store the result in.
		 * @return A Bounds2D object specifying the background data bounds.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			//TODO move these hard coded bounds to sessioned variables and make UI for editing them
			output.setBounds(-1, -.3, 1, 1);
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output);
			output[0].setBounds(-1, -.3, 1, 1);
		}
	}
}



