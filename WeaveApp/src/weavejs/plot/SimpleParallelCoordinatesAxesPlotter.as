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
	
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import Bounds2D = weavejs.geom.Bounds2D;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import BitmapText = weavejs.util.BitmapText;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	
	export class SimpleParallelCoordinatesAxesPlotter extends AbstractPlotter
	{
		public mainPlotter:LinkableDynamicObject = Weave.linkableChild(this, new LinkableDynamicObject(SimpleParallelCoordinatesPlotter));
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		private textFormat:LinkableTextFormat = Weave.linkableChild(this, Weave.properties.visTextFormat);
		
		private bitmapText:BitmapText = new BitmapText();
		private static minPoint:Point = new Point();
		private static maxPoint:Point = new Point();
		private static bitmapBounds:Bounds2D = new Bounds2D();
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			var plotter:SimpleParallelCoordinatesPlotter = this.mainPlotter.target as SimpleParallelCoordinatesPlotter;
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
		
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var graphics:Graphics = tempShape.graphics;
			var plotter:SimpleParallelCoordinatesPlotter = this.mainPlotter.target as SimpleParallelCoordinatesPlotter;
			if (!plotter)
				return;
			var columns = plotter.columns.getObjects(IAttributeColumn);
			var normalize:boolean = plotter.normalize.value;
			
			// set up bitmapBounds so the direction matches that of screenBounds
			if (screenBounds.getXDirection() > 0)
				SimpleParallelCoordinatesAxesPlotter.bitmapBounds.setXRange(0, destination.width);
			else
				SimpleParallelCoordinatesAxesPlotter.bitmapBounds.setXRange(destination.width, 0);
			if (screenBounds.getYDirection() > 0)
				SimpleParallelCoordinatesAxesPlotter.bitmapBounds.setYRange(0, destination.height);
			else
				SimpleParallelCoordinatesAxesPlotter.bitmapBounds.setYRange(destination.height, 0);

			graphics.clear();
			this.lineStyle.beginLineStyle(null, graphics);
			this.textFormat.copyTo(this.bitmapText.textFormat);
			var maxMarginHeight:number = Math.abs(SimpleParallelCoordinatesAxesPlotter.bitmapBounds.getYMax() - screenBounds.getYMax());
			var minMarginHeight:number = Math.abs(SimpleParallelCoordinatesAxesPlotter.bitmapBounds.getYMin() - screenBounds.getYMin());
			this.bitmapText.maxWidth = SimpleParallelCoordinatesAxesPlotter.bitmapBounds.getXCoverage() / columns.length;
			this.bitmapText.horizontalAlign = BitmapText.HORIZONTAL_ALIGN_CENTER;
			
			for (var i = 0; i < columns.length; i++)
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
				SimpleParallelCoordinatesAxesPlotter.minPoint.x = i;
				SimpleParallelCoordinatesAxesPlotter.minPoint.y = dataBounds.getYMin();
				dataBounds.projectPointTo(SimpleParallelCoordinatesAxesPlotter.minPoint, screenBounds);
				SimpleParallelCoordinatesAxesPlotter.maxPoint.x = i;
				SimpleParallelCoordinatesAxesPlotter.maxPoint.y = dataBounds.getYMax();
				dataBounds.projectPointTo(SimpleParallelCoordinatesAxesPlotter.maxPoint, screenBounds);
				
				// draw vertical axis line
				graphics.moveTo(SimpleParallelCoordinatesAxesPlotter.minPoint.x, SimpleParallelCoordinatesAxesPlotter.minPoint.y);
				graphics.lineTo(SimpleParallelCoordinatesAxesPlotter.maxPoint.x, SimpleParallelCoordinatesAxesPlotter.maxPoint.y);
				
				// draw axis min value
				this.bitmapText.text = ColumnUtils.deriveStringFromNumber(column, dataMin);
				this.bitmapText.x = SimpleParallelCoordinatesAxesPlotter.minPoint.x;
				this.bitmapText.y = SimpleParallelCoordinatesAxesPlotter.minPoint.y;
				this.bitmapText.verticalAlign = screenBounds.getYDirection() > 0 ? BitmapText.VERTICAL_ALIGN_BOTTOM : BitmapText.VERTICAL_ALIGN_TOP;
				this.bitmapText.maxHeight = minMarginHeight / 2;
				this.bitmapText.draw(destination);
				
				// draw axis max value
				this.bitmapText.text = ColumnUtils.deriveStringFromNumber(column, dataMax);
				this.bitmapText.x = SimpleParallelCoordinatesAxesPlotter.maxPoint.x;
				this.bitmapText.y = SimpleParallelCoordinatesAxesPlotter.maxPoint.y;
				this.bitmapText.verticalAlign = screenBounds.getYDirection() > 0 ? BitmapText.VERTICAL_ALIGN_TOP : BitmapText.VERTICAL_ALIGN_BOTTOM;
				this.bitmapText.maxHeight = maxMarginHeight;
				this.bitmapText.draw(destination);
				
				// draw axis title in min margin
				this.bitmapText.text = ColumnUtils.getTitle(column);
				this.bitmapText.x = SimpleParallelCoordinatesAxesPlotter.minPoint.x;
				this.bitmapText.y = SimpleParallelCoordinatesAxesPlotter.bitmapBounds.getYMin(); // align to bottom of bitmap
				this.bitmapText.verticalAlign = SimpleParallelCoordinatesAxesPlotter.bitmapBounds.getYDirection() > 0 ? BitmapText.VERTICAL_ALIGN_TOP : BitmapText.VERTICAL_ALIGN_BOTTOM;
				this.bitmapText.maxHeight = minMarginHeight / 2;
				this.bitmapText.draw(destination);
			}
			
			destination.draw(tempShape);
		}
		
		//[Deprecated(replacement="mainPlotter")] public set plotterPath(path:Array):void { mainPlotter.targetPath = path; }
	}
}

