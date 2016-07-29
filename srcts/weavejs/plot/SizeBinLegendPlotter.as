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
	
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ITextPlotter = weavejs.api.ui.ITextPlotter;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import BitmapText = weavejs.util.BitmapText;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	export class SizeBinLegendPlotter extends AbstractPlotter implements ITextPlotter
	{
		public constructor()
		{
			this.init();
		}
		private init():void
		{
			this.minScreenRadius.value = 5;
			this.maxScreenRadius.value = 10;
			this.defaultScreenRadius.value = 5;
			
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat);
			this.addSpatialDependencies(this.radiusColumn, this.minScreenRadius, this.maxScreenRadius, this.defaultScreenRadius);
		}
		
		public radiusColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		private radiusColumnStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.radiusColumn));
		public minScreenRadius:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public maxScreenRadius:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		public defaultScreenRadius:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
		
		public colorBySize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public colorNegative:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x800000));
		public colorPositive:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x008000));
		
		public static simpleRadio:string = "simple";
		public static customRadio:string = "custom";
		public numberOfCircles:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10, this.verifyNumberOfCircles));
		public customCircleRadiuses:LinkableString = Weave.linkableChild(this, LinkableString);
		public typeRadio:LinkableString = Weave.linkableChild(this, new LinkableString(SizeBinLegendPlotter.simpleRadio));
		
		private bitmapText:BitmapText = new BitmapText(); // This is used to draw text on bitmaps
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle); // This is the line style used to draw the outline of the shape.
		
		private verifyNumberOfCircles(value:number):boolean
		{
			if (value < 2)
				return false;
			else
				return true;
		}
		
		private XMIN:number = 0;
		private YMIN:number = 0;
		private XMAX:number = 1;
		private YMAX:number = 1;
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.setBounds(this.XMIN, this.YMIN, this.XMAX, this.YMAX);
		}
		
		private tempPoint:Point = new Point(); // Reusable temporary object
		private valueMax:number = 0;
		private valueMin:number = 0; // Variables for min and max values of the radius column
		private circleRadiuses:Array;
		private normalizedCircleRadiuses:Array;
		private yInterval:number;
		private maxCustomRadius:number;
		private xMargin:int = 5;
		private xMin:number;
		private yPosition:number;
		private fillColor:number;
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var i:int;
			var j:int;
			this.valueMax = this.radiusColumnStats.getMax();
			this.valueMin = this.radiusColumnStats.getMin();
			
			if (isNaN(this.valueMin) ||  isNaN(this.valueMax)) return; // ToDo
			
			if (this.typeRadio.value == SizeBinLegendPlotter.simpleRadio)
			{
				this.circleRadiuses = [];
				for (i = 0; i < this.numberOfCircles.value; i++)
					this.circleRadiuses.push(StandardLib.roundSignificant(this.valueMin + i * (this.valueMax - this.valueMin) / (this.numberOfCircles.value - 1), 4));
			}
			else if (this.typeRadio.value == SizeBinLegendPlotter.customRadio)
			{
				this.circleRadiuses = this.customCircleRadiuses.value.split(',');
				// remove bad values
				for (i = this.circleRadiuses.length; i--;)
				{
					var number:number = StandardLib.asNumber(this.circleRadiuses[i]);
					if (!isFinite(number))
						this.circleRadiuses.splice(i, 1);
					else
						this.circleRadiuses[i] = number;
				}
				// sort numerically
				StandardLib.sort(this.circleRadiuses);
			}

			this.normalizedCircleRadiuses = [];
			if (this.colorBySize.value)
			{
				var absMax:number = Math.max(Math.abs(this.valueMin), Math.abs(this.valueMax));
				for (i = 0; i < this.circleRadiuses.length; i++)
					this.normalizedCircleRadiuses.push(StandardLib.scale(Math.abs(this.circleRadiuses[i]), 0, absMax, 0, this.maxScreenRadius.value));
			}
			else
			{
				for (i = 0; i < this.circleRadiuses.length; i++)
				{
					// Remove invalid radius (less than 0)
					if (StandardLib.scale(this.circleRadiuses[i], this.valueMin, this.valueMax, this.minScreenRadius.value, this.maxScreenRadius.value) < 0)
					{
						this.circleRadiuses.splice(i, 1);
						i--;
					}
					else
						this.normalizedCircleRadiuses.push(StandardLib.scale(this.circleRadiuses[i], this.valueMin, this.valueMax, this.minScreenRadius.value, this.maxScreenRadius.value));
				}
			}
			
			if (this.normalizedCircleRadiuses.length != 0)
			{
				this.yInterval = screenBounds.getYCoverage() / this.normalizedCircleRadiuses.length;
				
				// Because of the custom circle radiuses, the real max radius needs to be determined.
				if (this.normalizedCircleRadiuses[0] > this.normalizedCircleRadiuses[this.normalizedCircleRadiuses.length - 1])
					this.maxCustomRadius = this.normalizedCircleRadiuses[0];
				else
					this.maxCustomRadius = this.normalizedCircleRadiuses[this.normalizedCircleRadiuses.length - 1];
			}
			
			// Draw size legend
			this.xMin = screenBounds.getXNumericMin();
			this.yPosition = screenBounds.getYNumericMin() + this.yInterval / 2; // First y position
			this.fillColor = NaN;
			
			for (i = 0; i < this.normalizedCircleRadiuses.length; i++)
			{
				this.tempPoint.y = this.yPosition;
				
				if (this.colorBySize.value)
				{
					// Draw large circle befroe small circle for both negative (top down direction) and positive (bottom up direction)  
					if (this.circleRadiuses[i] < 0)
					{
						this.fillColor = this.colorNegative.value;
					}
					else
					{
						this.fillColor = this.colorPositive.value;
						this.yPosition = screenBounds.getYNumericMax() - this.yInterval / 2; // First y position from bottom
						for (j = this.normalizedCircleRadiuses.length - 1; j >= i; j--)
						{
							this.tempPoint.y = this.yPosition;
							this.drawLegend(destination, j);
							this.yPosition = this.yPosition - this.yInterval;
						}
						break;
					}
				}
				
				this.drawLegend(destination, i);
				this.yPosition = this.yPosition + this.yInterval;
			}
		}
		
		private drawLegend(destination:Graphics, index:int):void
		{
			// draw circle
			tempShape.graphics.clear();
			this.lineStyle.beginLineStyle(null, tempShape.graphics);
			if (isFinite(this.fillColor))
				tempShape.graphics.beginFill(this.fillColor);
			else
				tempShape.graphics.endFill();
			
			tempShape.graphics.drawCircle(this.xMin + this.xMargin + this.maxCustomRadius, this.tempPoint.y, this.normalizedCircleRadiuses[index]);
			
			tempShape.graphics.endFill();
			destination.draw(tempShape);
			
			// set up BitmapText
			LinkableTextFormat.defaultTextFormat.copyTo(this.bitmapText.textFormat);
			this.bitmapText.text = ColumnUtils.deriveStringFromNumber(this.radiusColumn, this.circleRadiuses[index]);
			if (this.bitmapText.text == null)
				this.bitmapText.text = StandardLib.formatNumber(this.circleRadiuses[index]);
			this.bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
			this.bitmapText.x = this.xMin + this.xMargin + this.maxCustomRadius * 2 + this.xMargin;
			this.bitmapText.y = this.tempPoint.y;
			this.bitmapText.draw(destination);
		}
	}
}

