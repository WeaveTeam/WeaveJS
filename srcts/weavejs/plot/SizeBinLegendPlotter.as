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
		import LinkableTextFormat = weavejs.util.LinkableTextFormat;
		import SolidLineStyle = weavejs.geom.SolidLineStyle;
		
		public class SizeBinLegendPlotter extends AbstractPlotter implements ITextPlotter
		{
			public function SizeBinLegendPlotter()
			{
				init() = weavejs.geom.SolidLineStyle;
		
		/**
		 * 
		 * @author yluo
		 */
		public class SizeBinLegendPlotter extends AbstractPlotter implements ITextPlotter
		{
			public function SizeBinLegendPlotter()
			{
				init();
			}
			private function init():void
			{
				minScreenRadius.value = 5;
				maxScreenRadius.value = 10;
				defaultScreenRadius.value = 5;
				
				Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat);
				this.addSpatialDependencies(this.radiusColumn, this.minScreenRadius, this.maxScreenRadius, this.defaultScreenRadius);
			}
			
			public const radiusColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
			private const radiusColumnStats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(radiusColumn));
			public const minScreenRadius:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
			public const maxScreenRadius:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
			public const defaultScreenRadius:LinkableNumber = Weave.linkableChild(this, LinkableNumber);
			
			public const colorBySize:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
			public const colorNegative:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x800000));
			public const colorPositive:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0x008000));
			
			public static const simpleRadio:String = "simple";
			public static const customRadio:String = "custom";
			public const numberOfCircles:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(10, verifyNumberOfCircles));
			public const customCircleRadiuses:LinkableString = Weave.linkableChild(this, LinkableString);
			public const typeRadio:LinkableString = Weave.linkableChild(this, new LinkableString(simpleRadio));
			
			private const bitmapText:BitmapText = new BitmapText(); // This is used to draw text on bitmaps
			public const lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle); // This is the line style used to draw the outline of the shape.
			
			private function verifyNumberOfCircles(value:Number):Boolean {
				if (value < 2)
					return false;
				else
					return true;
			}
			
			private var XMIN:Number = 0, YMIN:Number = 0, XMAX:Number = 1, YMAX:Number = 1;		
			override public function getBackgroundDataBounds(output:Bounds2D):void
			{
				output.setBounds(XMIN, YMIN, XMAX, YMAX);
			}
			
			private const tempPoint:Point = new Point(); // Reusable temporary object
			private var valueMax:Number = 0, valueMin:Number = 0; // Variables for min and max values of the radius column
			private var circleRadiuses:Array;
			private var normalizedCircleRadiuses:Array;
			private var yInterval:Number;
			private var maxCustomRadius:Number;
			private var xMargin:int = 5;
			private var xMin:Number;
			private var yPosition:Number;
			private var fillColor:Number;
			override public function drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
			{
				var i:int;
				var j:int;
				valueMax = radiusColumnStats.getMax();
				valueMin = radiusColumnStats.getMin();
				
				if (isNaN(valueMin) ||  isNaN(valueMax)) return; // ToDo
				
				if (typeRadio.value == simpleRadio)
				{
					circleRadiuses = new Array();
					for (i = 0; i < numberOfCircles.value; i++)
						circleRadiuses.push(StandardLib.roundSignificant(valueMin + i * (valueMax - valueMin) / (numberOfCircles.value - 1), 4));
				}
				else if (typeRadio.value == customRadio)
				{
					circleRadiuses = customCircleRadiuses.value.split(',');
					// remove bad values
					for (i = circleRadiuses.length; i--;)
					{
						var number:Number = StandardLib.asNumber(circleRadiuses[i]);
						if (!isFinite(number))
							circleRadiuses.splice(i, 1);
						else
							circleRadiuses[i] = number;
					}
					// sort numerically
					StandardLib.sort(circleRadiuses);
				}

				normalizedCircleRadiuses = new Array();
				if (colorBySize.value)
				{
					var absMax:Number = Math.max(Math.abs(valueMin), Math.abs(valueMax));
					for (i = 0; i < circleRadiuses.length; i++)
						normalizedCircleRadiuses.push(StandardLib.scale(Math.abs(circleRadiuses[i]), 0, absMax, 0, maxScreenRadius.value));
				}
				else
				{
					for (i = 0; i < circleRadiuses.length; i++)
					{
						// Remove invalid radius (less than 0)
						if (StandardLib.scale(circleRadiuses[i], valueMin, valueMax, minScreenRadius.value, maxScreenRadius.value) < 0)
						{
							circleRadiuses.splice(i, 1);
							i--;
						}
						else
							normalizedCircleRadiuses.push(StandardLib.scale(circleRadiuses[i], valueMin, valueMax, minScreenRadius.value, maxScreenRadius.value));
					}
				}
				
				if (normalizedCircleRadiuses.length != 0)
				{
					yInterval = screenBounds.getYCoverage() / normalizedCircleRadiuses.length;
					
					// Because of the custom circle radiuses, the real max radius needs to be determined.
					if (normalizedCircleRadiuses[0] > normalizedCircleRadiuses[normalizedCircleRadiuses.length - 1])
						maxCustomRadius = normalizedCircleRadiuses[0];
					else
						maxCustomRadius = normalizedCircleRadiuses[normalizedCircleRadiuses.length - 1];
				}
				
				// Draw size legend
				xMin = screenBounds.getXNumericMin();
				yPosition = screenBounds.getYNumericMin() + yInterval / 2; // First y position
				fillColor = NaN;
				
				for (i = 0; i < normalizedCircleRadiuses.length; i++)
				{
					tempPoint.y = yPosition;
					
					if (colorBySize.value)
					{
						// Draw large circle befroe small circle for both negative (top down direction) and positive (bottom up direction)  
						if (circleRadiuses[i] < 0)
						{
							fillColor = colorNegative.value;
						}
						else
						{
							fillColor = colorPositive.value;
							yPosition = screenBounds.getYNumericMax() - yInterval / 2; // First y position from bottom
							for (j = normalizedCircleRadiuses.length - 1; j >= i; j--)
							{
								tempPoint.y = yPosition;
								drawLegend(destination, j);
								yPosition = yPosition - yInterval;
							}
							break;
						}
					}
					
					drawLegend(destination, i);
					yPosition = yPosition + yInterval;
				}
			}
			
			private function drawLegend(destination:BitmapData, index:int):void
			{
				// draw circle
				tempShape.graphics.clear();
				lineStyle.beginLineStyle(null, tempShape.graphics);
				if (isFinite(fillColor))
					tempShape.graphics.beginFill(fillColor);
				else
					tempShape.graphics.endFill();
				
				tempShape.graphics.drawCircle(xMin + xMargin + maxCustomRadius, tempPoint.y, normalizedCircleRadiuses[index]);
				
				tempShape.graphics.endFill();
				destination.draw(tempShape);
				
				// set up BitmapText
				LinkableTextFormat.defaultTextFormat.copyTo(bitmapText.textFormat);
				bitmapText.text = ColumnUtils.deriveStringFromNumber(radiusColumn, circleRadiuses[index]);
				if (bitmapText.text == null)
					bitmapText.text = StandardLib.formatNumber(circleRadiuses[index]);
				bitmapText.verticalAlign = BitmapText.VERTICAL_ALIGN_MIDDLE;
				bitmapText.x = xMin + xMargin + maxCustomRadius * 2 + xMargin;
				bitmapText.y = tempPoint.y;
				bitmapText.draw(destination);
			}
		}
	}
