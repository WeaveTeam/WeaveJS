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
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import SolidFillStyle = weavejs.geom.SolidFillStyle;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;

	/**
	 * This plotter plots rectangles using xMin,yMin,xMax,yMax values.
	 * There is a set of data coordinates and a set of screen offset coordinates.
	 */
	export class RectanglePlotter extends AbstractPlotter implements ISelectableAttributes
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, RectanglePlotter, "Rectangles");
		
		public constructor()
		{
			// initialize default line & fill styles
			fill.color.internalDynamicColumn.globalName = WeaveProperties.DEFAULT_COLOR_COLUMN;
			
			setColumnKeySources(
				[xData, yData, widthData, heightData, xMinScreenOffset, yMinScreenOffset, xMaxScreenOffset, yMaxScreenOffset],
				[1, 1, -1, -1]
			);
			this.addSpatialDependencies(this.xData, this.yData, this.widthData, this.heightData, this.centerX, this.centerY);
		}
		
		public getSelectableAttributeNames():Array
		{
			return ['Fill Color', 'X', 'Y', 'Width', 'Height', 'xMin Screen Offset', 'yMin Screen Offset', 'xMax Screen Offset', 'yMax Screen Offset'];
		}
		
		public getSelectableAttributes():Array
		{
			return [fill.color, xData, yData, widthData, heightData, xMinScreenOffset, yMinScreenOffset, xMaxScreenOffset, yMaxScreenOffset];
		}
		
		// spatial properties
		/**
		 * This is the minimum X data value associated with the rectangle.
		 */
		public xData:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn());
		/**
		 * This is the minimum Y data value associated with the rectangle.
		 */
		public yData:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn());
		/**
		 * This is the maximum X data value associated with the rectangle.
		 */
		public widthData:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is the maximum Y data value associated with the rectangle.
		 */
		public heightData:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		
		/**
		 * If this is true, the rectangle will be centered on xData coordinates.
		 */
		public centerX:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		/**
		 * If this is true, the rectangle will be centered on yData coordinates.
		 */
		public centerY:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

		// visual properties
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public xMinScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public yMinScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public xMaxScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is an offset in screen coordinates when projecting the data rectangle onto the screen.
		 */
		public yMaxScreenOffset:AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(0));
		/**
		 * This is the line style used to draw the outline of the rectangle.
		 */
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		/**
		 * This is the fill style used to fill the rectangle.
		 */
		public fill:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
		/**
		 * If this is true, ellipses will be drawn instead of rectangles.
		 */
		public drawEllipse:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));

		protected function getCoordFromRecordKey(recordKey:IQualifiedKey, trueXfalseY:Boolean):number
		{
			var dataCol:IAttributeColumn = trueXfalseY ? xData : yData;
			if (dataCol.getMetadata(ColumnMetadata.DATA_TYPE) == DataType.GEOMETRY)
			{
				var geoms:Array = dataCol.getValueFromKey(recordKey, Array) as Array;
				var geom:GeneralizedGeometry;
				if (geoms && geoms.length)
					geom = geoms[0] as GeneralizedGeometry;
				if (geom)
					return trueXfalseY ? geom.bounds.getXCenter() : geom.bounds.getYCenter();
			}
			return dataCol.getValueFromKey(recordKey, Number);
		}
		
		/**
		 * This function returns a Bounds2D object set to the data bounds associated with the given record key.
		 * @param key The key of a data record.
		 * @param outputDataBounds An Array of Bounds2D objects to store the result in.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			getBounds(recordKey, initBoundsArray(output));
		}
		
		private getBounds(recordKey:IQualifiedKey, output:Bounds2D):void
		{
			var x:number = getCoordFromRecordKey(recordKey, true);
			var y:number = getCoordFromRecordKey(recordKey, false);
			var width:number = widthData.getValueFromKey(recordKey, Number);
			var height:number = heightData.getValueFromKey(recordKey, Number);
			
			if (centerX.value)
				output.setCenteredXRange(x, width);
			else
				output.setXRange(x, x + width);
			
			if (centerY.value)
				output.setCenteredYRange(y, height);
			else
				output.setYRange(y, y + height);
		}

		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected function addRecordGraphicsToTempShape(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, tempShape:Shape):void
		{
			var graphics:Graphics = tempShape.graphics;

			// project data coordinates to screen coordinates and draw graphics onto tempShape
			getBounds(recordKey, tempBounds);
			
			// project x,y data coordinates to screen coordinates
			tempBounds.getMinPoint(tempPoint);
			dataBounds.projectPointTo(tempPoint, screenBounds);
			// add screen offsets
			tempPoint.x += xMinScreenOffset.getValueFromKey(recordKey, Number);
			tempPoint.y += yMinScreenOffset.getValueFromKey(recordKey, Number);
			// save x,y screen coordinates
			tempBounds.setMinPoint(tempPoint);
			
			// project x+w,y+h data coordinates to screen coordinates
			tempBounds.getMaxPoint(tempPoint);
			dataBounds.projectPointTo(tempPoint, screenBounds);
			// add screen offsets
			tempPoint.x += xMaxScreenOffset.getValueFromKey(recordKey, Number);
			tempPoint.y += yMaxScreenOffset.getValueFromKey(recordKey, Number);
			// save x+w,y+h screen coordinates
			tempBounds.setMaxPoint(tempPoint);
			
			// draw graphics
			tempBounds.makeSizePositive();
			line.beginLineStyle(recordKey, graphics);
			fill.beginFillStyle(recordKey, graphics);
			if (drawEllipse.value)
				graphics.drawEllipse(tempBounds.getXMin(), tempBounds.getYMin(), tempBounds.getWidth(), tempBounds.getHeight());
			else
				graphics.drawRect(tempBounds.getXMin(), tempBounds.getYMin(), tempBounds.getWidth(), tempBounds.getHeight());
			graphics.endFill();
		}
		
		private static tempBounds:Bounds2D = new Bounds2D(); // reusable object
		private static tempPoint:Point = new Point(); // reusable object
		
		/*[Deprecated(replacement="line")] public set lineStyle(value:Object):void
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
		[Deprecated(replacement="fill")] public set fillStyle(value:Object):void
		{
			try
			{
				Weave.setState(fill, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e:Error)
			{
				JS.error(e);
			}
		}*/
	}
}
