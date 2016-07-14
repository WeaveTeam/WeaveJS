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
	import Shape = flash.display.Shape;
	import Point = weavejs.geom.Point;
	
	import DynamicState = weavejs.api.core.DynamicState;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;

	/**
	 * This plotter plots rectangles using xMin,yMin,xMax,yMax values.
	 * There is a set of data coordinates and a set of screen offset coordinates.
	 */
	public class BoundsPlotter extends AbstractPlotter
	{
		public function BoundsPlotter()
		{
			this.addSpatialDependencies(this.xMinData, this.yMinData, this.xMaxData, this.yMaxData);
			
			fill.color.internalDynamicColumn.globalName = Weave.DEFAULT_COLOR_COLUMN;
			
			setColumnKeySources([xMinData, yMinData, xMaxData, yMaxData]);
		}

		// spatial properties
		/**
		 * This is the minimum X data value associated with the rectangle.
		 */
		public const xMinData:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		/**
		 * This is the minimum Y data value associated with the rectangle.
		 */
		public const yMinData:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		/**
		 * This is the maximum X data value associated with the rectangle.
		 */
		public const xMaxData:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		/**
		 * This is the maximum Y data value associated with the rectangle.
		 */
		public const yMaxData:DynamicColumn = Weave.linkableChild(this, DynamicColumn);

		// visual properties
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public const xMinScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public const yMinScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public const xMaxScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public const yMaxScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is the line style used to draw the outline of the rectangle.
		 */
		public const line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		/**
		 * This is the fill style used to fill the rectangle.
		 */
		public const fill:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);

		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
		 * @param key The key of a data record.
		 * @param output An Array of Bounds2D object to store the result in.
		 */
		override public function getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Array):void
		{
			initBoundsArray(output);
			(output[0] as Bounds2D).setBounds(
				xMinData.getValueFromKey(recordKey, Number),
				yMinData.getValueFromKey(recordKey, Number),
				xMaxData.getValueFromKey(recordKey, Number),
				yMaxData.getValueFromKey(recordKey, Number)
			);
		}

		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		override protected function addRecordGraphicsToTempShape(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, tempShape:Shape):void
		{
			// project data coordinates to screen coordinates and draw graphics
			tempPoint.x = xMinData.getValueFromKey(recordKey, Number);
			tempPoint.y = yMinData.getValueFromKey(recordKey, Number);
			dataBounds.projectPointTo(tempPoint, screenBounds);
			tempPoint.x += xMinScreenOffset.getValueFromKey(recordKey, Number);
			tempPoint.y += yMinScreenOffset.getValueFromKey(recordKey, Number);
			tempBounds.setMinPoint(tempPoint);
			
			tempPoint.x = xMaxData.getValueFromKey(recordKey, Number);
			tempPoint.y = yMaxData.getValueFromKey(recordKey, Number);
			dataBounds.projectPointTo(tempPoint, screenBounds);
			tempPoint.x += xMaxScreenOffset.getValueFromKey(recordKey, Number);
			tempPoint.y += yMaxScreenOffset.getValueFromKey(recordKey, Number);
			tempBounds.setMaxPoint(tempPoint);
				
			// draw graphics
			var graphics:Graphics = tempShape.graphics;

			line.beginLineStyle(recordKey, graphics);
			fill.beginFillStyle(recordKey, graphics);

			//trace(recordKey,tempBounds);
			graphics.drawRect(tempBounds.getXMin(), tempBounds.getYMin(), tempBounds.getWidth(), tempBounds.getHeight());

			graphics.endFill();
		}
		
		private static const tempBounds:Bounds2D = new Bounds2D(); // reusable object
		private static const tempPoint:Point = new Point(); // reusable object
		
		[Deprecated(replacement="line")] public function set lineStyle(value:Object):void
		{
			try
			{
				Weave.setState(line, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e:Error)
			{
				JS.error(e);
			}
		}
		[Deprecated(replacement="fill")] public function set fillStyle(value:Object):void
		{
			try
			{
				Weave.setState(fill, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e:Error)
			{
				JS.error(e);
			}
		}
	}
}
