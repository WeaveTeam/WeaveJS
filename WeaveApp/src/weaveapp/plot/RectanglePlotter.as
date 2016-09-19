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
	
	import DynamicState = weavejs.api.core.DynamicState;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataTypes = weavejs.api.data.DataTypes;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	/**
	 * This plotter plots rectangles using xMin,yMin,xMax,yMax values.
	 * There is a set of data coordinates and a set of screen offset coordinates.
	 */
	export class RectanglePlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			// initialize default line & fill styles
			this.fill.color.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];

			this.setColumnKeySources(
				[this.xData, this.yData, this.widthData, this.heightData, this.xMinScreenOffset, this.yMinScreenOffset, this.xMaxScreenOffset, this.yMaxScreenOffset],
				[1, 1, -1, -1]
			);
			this.addSpatialDependencies(this.xData, this.yData, this.widthData, this.heightData, this.centerX, this.centerY);
		}
		
		public getSelectableAttributeNames()
		{
			return ['Fill Color', 'X', 'Y', 'Width', 'Height', 'xMin Screen Offset', 'yMin Screen Offset', 'xMax Screen Offset', 'yMax Screen Offset'];
		}
		
		public getSelectableAttributes()
		{
			return [this.fill.color, this.xData, this.yData, this.widthData, this.heightData, this.xMinScreenOffset, this.yMinScreenOffset, this.xMaxScreenOffset, this.yMaxScreenOffset];
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

		protected getCoordFromRecordKey(recordKey:IQualifiedKey, trueXfalseY:boolean):number
		{
			var dataCol:IAttributeColumn = trueXfalseY ? this.xData : this.yData;
			if (dataCol.getMetadata(ColumnMetadata.DATA_TYPE) == DataTypes.GEOMETRY)
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
			this.getBounds(recordKey, this.initBoundsArray(output));
		}
		
		private getBounds(recordKey:IQualifiedKey, output:Bounds2D):void
		{
			var x:number = this.getCoordFromRecordKey(recordKey, true);
			var y:number = this.getCoordFromRecordKey(recordKey, false);
			var width:number = this.widthData.getValueFromKey(recordKey, Number);
			var height:number = this.heightData.getValueFromKey(recordKey, Number);
			
			if (this.centerX.value)
				output.setCenteredXRange(x, width);
			else
				output.setXRange(x, x + width);
			
			if (this.centerY.value)
				output.setCenteredYRange(y, height);
			else
				output.setYRange(y, y + height);
		}

		/**
		 * This function may be defined by a class that extends AbstractPlotter to use the basic template code in AbstractPlotter.drawPlot().
		 */
		/*override*/ protected addRecordGraphics(recordKey:IQualifiedKey, dataBounds:Bounds2D, screenBounds:Bounds2D, buffer:Graphics):void
		{
			var graphics:Graphics = tempShape.graphics;

			// project data coordinates to screen coordinates and draw graphics onto tempShape
			this.getBounds(recordKey, RectanglePlotter.tempBounds);
			
			// project x,y data coordinates to screen coordinates
			RectanglePlotter.tempBounds.getMinPoint(RectanglePlotter.tempPoint);
			dataBounds.projectPointTo(RectanglePlotter.tempPoint, screenBounds);
			// add screen offsets
			RectanglePlotter.tempPoint.x += this.xMinScreenOffset.getValueFromKey(recordKey, Number);
			RectanglePlotter.tempPoint.y += this.yMinScreenOffset.getValueFromKey(recordKey, Number);
			// save x,y screen coordinates
			RectanglePlotter.tempBounds.setMinPoint(RectanglePlotter.tempPoint);
			
			// project x+w,y+h data coordinates to screen coordinates
			RectanglePlotter.tempBounds.getMaxPoint(RectanglePlotter.tempPoint);
			dataBounds.projectPointTo(RectanglePlotter.tempPoint, screenBounds);
			// add screen offsets
			RectanglePlotter.tempPoint.x += this.xMaxScreenOffset.getValueFromKey(recordKey, Number);
			RectanglePlotter.tempPoint.y += this.yMaxScreenOffset.getValueFromKey(recordKey, Number);
			// save x+w,y+h screen coordinates
			RectanglePlotter.tempBounds.setMaxPoint(RectanglePlotter.tempPoint);
			
			// draw graphics
			RectanglePlotter.tempBounds.makeSizePositive();
			this.line.beginLineStyle(recordKey, graphics);
			this.fill.beginFillStyle(recordKey, graphics);
			if (this.drawEllipse.value)
				graphics.drawEllipse(RectanglePlotter.tempBounds.getXMin(), RectanglePlotter.tempBounds.getYMin(), RectanglePlotter.tempBounds.getWidth(), RectanglePlotter.tempBounds.getHeight());
			else
				graphics.drawRect(RectanglePlotter.tempBounds.getXMin(), RectanglePlotter.tempBounds.getYMin(), RectanglePlotter.tempBounds.getWidth(), RectanglePlotter.tempBounds.getHeight());
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
			catch (e)
			{
				console.error(e);
			}
		}
		[Deprecated(replacement="fill")] public set fillStyle(value:Object):void
		{
			try
			{
				Weave.setState(fill, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e)
			{
				console.error(e);
			}
		}*/
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, RectanglePlotter, "Rectangles");
}

