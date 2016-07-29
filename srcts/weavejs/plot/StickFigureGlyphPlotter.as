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
	
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import DrawUtils = weavejs.util.DrawUtils;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	
	export class StickFigureGlyphPlotter extends AbstractGlyphPlotter implements ISelectableAttributes
	{
		public StickFigureGlyphPlotter()
		{
		}
		
		public getSelectableAttributeNames()
		{
			return ["X", "Y", "Theta 1", "Theta 2", "Theta 3", "Theta 4"];
		}
		public getSelectableAttributes()
		{
			return [this.dataX, this.dataY, this.theta1, this.theta2, this.theta3, this.theta4];
		}

		/**
		 * This is the angle at which each line will be drawn from the vertical axis.
		 */
		public theta1:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public theta2:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public theta3:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public theta4:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		
		private theta1stats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.theta1));
		private theta2stats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.theta2));
		private theta3stats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.theta3));
		private theta4stats:IColumnStatistics = Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.theta4));
		/**
		 * This is the limb length.
		 */
		public limbLength:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(10));
		/**
		 * This is the line style used to draw the outline of the rectangle.
		 */
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		public curvature:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));

		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, buffer:Graphics):void
		{
			// project data coordinates to screen coordinates and draw graphics
			var theta1:number = Math.PI*this.theta1stats.getNorm(recordKey);
			var theta2:number = Math.PI*this.theta2stats.getNorm(recordKey);
			var theta3:number = Math.PI*this.theta3stats.getNorm(recordKey);
			var theta4:number = Math.PI*this.theta4stats.getNorm(recordKey);
			var limbLength:number = this.limbLength.getValueFromKey(recordKey, Number);
			StickFigureGlyphPlotter.tempPoint.x = this.dataX.getValueFromKey(recordKey, Number);
			StickFigureGlyphPlotter.tempPoint.y = this.dataY.getValueFromKey(recordKey, Number);
			dataBounds.projectPointTo(StickFigureGlyphPlotter.tempPoint, screenBounds);

			// draw graphics
			var graphics:Graphics = tempShape.graphics;
			var x:number = StickFigureGlyphPlotter.tempPoint.x;
			var y:number = StickFigureGlyphPlotter.tempPoint.y;
			var topY:number = y+(limbLength/2);
			var bottomY:number = y-(limbLength/2);
			
			this.lineStyle.beginLineStyle(recordKey, graphics);				

			//trace("graphics.drawCircle(",tempPoint.x, tempPoint.y, radius,");");
			graphics.moveTo(x, y);
			
			//Draw Center Vertical line
			graphics.moveTo(x, topY);
			graphics.lineTo(x, bottomY);
			
			/*//move back to top and draw first limb with top of vertical line as "orgin point"
			if (!isNaN(theta1)){
				graphics.moveTo(x, topY);
				graphics.lineTo(x+(Math.sin(theta1)*limbLength), topY-(Math.cos(theta1)*limbLength));
			}
			//move back to top and draw second limb with top of vertical line as "orgin point"
			if (!isNaN(theta2)){
				graphics.moveTo(x, topY);
				graphics.lineTo(x-(Math.sin(theta2)*limbLength), topY-(Math.cos(theta2)*limbLength));
			}
			//move back to top and draw second limb with bottom of vertical line as "orgin point"
			if (!isNaN(theta3)){
				graphics.moveTo(x, bottomY);
				graphics.lineTo(x-(Math.sin(theta3)*limbLength), bottomY+(Math.cos(theta3)*limbLength)); 
			}
			if (!isNaN(theta4)){
				//move back to top and draw second limb with bottom of vertical line as "orgin point"
				graphics.moveTo(x, bottomY);
				graphics.lineTo(x+(Math.sin(theta4)*limbLength), bottomY+(Math.cos(theta4)*limbLength));
			}*/
			
			//move back to top and draw first limb with top of vertical line as "orgin point"
			if (!isNaN(theta1)){
				DrawUtils.drawCurvedLine(graphics, x, topY, x+(Math.sin(theta1)*limbLength), topY-(Math.cos(theta1)*limbLength), this.curvature.value);
			}
			//move back to top and draw second limb with top of vertical line as "orgin point"
			if (!isNaN(theta2)){
				DrawUtils.drawCurvedLine(graphics, x, topY, x-(Math.sin(theta2)*limbLength), topY-(Math.cos(theta2)*limbLength), this.curvature.value);
			}
			//move back to top and draw second limb with bottom of vertical line as "orgin point"
			if (!isNaN(theta3)){
				DrawUtils.drawCurvedLine(graphics, x, bottomY, x-(Math.sin(theta3)*limbLength), bottomY+(Math.cos(theta3)*limbLength), this.curvature.value);
			}
			//move back to top and draw second limb with bottom of vertical line as "orgin point"
			if (!isNaN(theta4)){
				DrawUtils.drawCurvedLine(graphics, x, bottomY, x+(Math.sin(theta4)*limbLength), bottomY+(Math.cos(theta4)*limbLength), this.curvature.value);
			}
		}
		
		private static tempPoint:Point = new Point(); // reusable object
	}
}

