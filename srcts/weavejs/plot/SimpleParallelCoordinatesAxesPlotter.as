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
	
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import Bounds2D = weavejs.geom.Bounds2D;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import Bounds2D = weavejs.geom.Bounds2D;
	import BitmapText = weavejs.util.BitmapText;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LinkableTextFormat = weavejs.util.LinkableTextFormat;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	export class SimpleParallelCoordinatesAxesPlotter extends AbstractPlotter
	{
		public constructor()
		{
		}
		
		public mainPlotter:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(SimpleParallelCoordinatesPlotter));
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		private textFormat:LinkableTextFormat = Weave.linkableChild(this, Weave.properties.visTextFormat);
		
		private bitmapText:BitmapText = new BitmapText();
		private static minPoint:Point = new Point();
		private static maxPoint:Point = new Point();
		private static bitmapBounds:Bounds2D = new Bounds2D();
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			var plotter:SimpleParallelCoordinatesPlotter = mainPlotter.target as SimpleParallelCoordinatesPlotter;
			if (plotter)
			{
				plotter.getBackgroundDataBounds(output)
				output.setXRange(output.getXNumericMin() - 0.5, output.getXNumericMax() + 0.5);
			}
			else
			{
				output.reset();
			}
		}
		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:PIXI.Graphics):void
		{
			var graphics:Graphics = tempShape.graphics;
			var plotter:SimpleParallelCoordinatesPlotter = mainPlotter.target as SimpleParallelCoordinatesPlotter;
			if (!plotter)
				return;
			var columns:Array = plotter.columns.getObjects();
			var normalize:Boolean = plotter.normalize.value;
			
			// set up bitmapBounds so the direction matches that of screenBounds
			if (screenBounds.getXDirection() > 0)
				bitmapBounds.setXRange(0, destination.width);
			else
				bitmapBounds.setXRange(destination.width, 0);
			if (screenBounds.getYDirection() > 0)
				bitmapBounds.setYRange(0, destination.height);
			else
				bitmapBounds.setYRange(destination.height, 0);

			graphics.clear();
			lineStyle.beginLineStyle(null, graphics);
			textFormat.copyTo(bitmapText.textFormat);
			var maxMarginHeight:number = Math.abs(bitmapBounds.getYMax() - screenBounds.getYMax());
			var minMarginHeight:number = Math.abs(bitmapBounds.getYMin() - screenBounds.getYMin());
			bitmapText.maxWidth = bitmapBounds.getXCoverage() / columns.length;
			bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
			
			for (var i:int = 0; i < columns.length; i++)
			{
				var column:IAttributeColumn = columns[i] as IAttributeColumn;
				var dataMin:number = dataBounds.getYMin();
				var dataMax:number = dataBounds.getYMax();
				if (normalize)
				{
					// note: watched plotter already registers stats as child, so change will be detected
					var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
					var statsMin:number = stats.getMin();
					var statsMax:number = stats.getMax();
					dataMin = StandardLib.scale(dataMin, 0, 1, statsMin, statsMax);
					dataMax = StandardLib.scale(dataMax, 0, 1, statsMin, statsMax);
				}
				
				// get coords for axis line
				minPoint.x = i;
				minPoint.y = dataBounds.getYMin();
				dataBounds.projectPointTo(minPoint, screenBounds);
				maxPoint.x = i;
				maxPoint.y = dataBounds.getYMax();
				dataBounds.projectPointTo(maxPoint, screenBounds);
				
				// draw vertical axis line
				graphics.moveTo(minPoint.x, minPoint.y);
				graphics.lineTo(maxPoint.x, maxPoint.y);
				
				// draw axis min value
				bitmapText.text = ColumnUtils.deriveStringFromNumber(column, dataMin);
				bitmapText.x = minPoint.x;
				bitmapText.y = minPoint.y;
				bitmapText.verticalAlign = screenBounds.getYDirection() > 0 ? BitmapText.VERTICAL_ALIGN_BOTTOM : BitmapText.VERTICAL_ALIGN_TOP;
				bitmapText.maxHeight = minMarginHeight / 2;
				bitmapText.draw(destination);
				
				// draw axis max value
				bitmapText.text = ColumnUtils.deriveStringFromNumber(column, dataMax);
				bitmapText.x = maxPoint.x;
				bitmapText.y = maxPoint.y;
				bitmapText.verticalAlign = screenBounds.getYDirection() > 0 ? BitmapText.VERTICAL_ALIGN_TOP : BitmapText.VERTICAL_ALIGN_BOTTOM;
				bitmapText.maxHeight = maxMarginHeight;
				bitmapText.draw(destination);
				
				// draw axis title in min margin
				bitmapText.text = ColumnUtils.getTitle(column);
				bitmapText.x = minPoint.x;
				bitmapText.y = bitmapBounds.getYMin(); // align to bottom of bitmap
				bitmapText.verticalAlign = bitmapBounds.getYDirection() > 0 ? BitmapText.VERTICAL_ALIGN_TOP : BitmapText.VERTICAL_ALIGN_BOTTOM;
				bitmapText.maxHeight = minMarginHeight / 2;
				bitmapText.draw(destination);
			}
			
			destination.draw(tempShape);
		}
		
		//[Deprecated(replacement="mainPlotter")] public set plotterPath(path:Array):void { mainPlotter.targetPath = path; }
	}
}
