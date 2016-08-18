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
	import Rectangle = weavejs.geom.Rectangle;

	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import ITextPlotter = weavejs.api.ui.ITextPlotter;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import Bounds2D = weavejs.geom.Bounds2D;

	import BitmapText = weavejs.util.BitmapText;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LegendUtils = weavejs.util.LegendUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;

	/**
	 * This plotter displays a legend for a ColorColumn.  If the ColorColumn contains a BinnedColumn, a list of bins
	 * with their corresponding colors will be displayed.  If not a continuous color scale will be displayed.  By
	 * default this plotter links to the static color column, but it can be linked to another by changing or removing
	 * the dynamicColorColumn.staticName value.
	 */
	export class ColorBinLegendPlotter extends AbstractPlotter implements ITextPlotter, ISelectableAttributes
	{
		public constructor()
		{
			super();
			this.dynamicColorColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];

			this.setSingleKeySource(this.dynamicColorColumn);
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			this.addSpatialDependencies(this.dynamicColorColumn, this.maxColumns, this.reverseOrder, this.itemLabelFunction);
		}
		
		public getSelectableAttributeNames()
		{
			return ["Color data"];
		}
		public getSelectableAttributes()
		{
			return [this.dynamicColorColumn];
		}
		
		/**
		 * This plotter is specifically implemented for visualizing a ColorColumn.
		 * This DynamicColumn only allows internal columns of type ColorColumn.
		 */
		public dynamicColorColumn:DynamicColumn = Weave.linkableChild(this, new DynamicColumn(ColorColumn), this.createHashMaps);
		
		/**
		 * This accessor function provides convenient access to the internal ColorColumn, which may be null.
		 * The public session state is defined by dynamicColorColumn.
		 */
		public getInternalColorColumn():ColorColumn
		{
			return Weave.AS(this.dynamicColorColumn.getInternalColumn(), ColorColumn);
		}
		
		/**
		 * This is the type of shape to be drawn for each legend item.
		 */		
		public shapeType:LinkableString = Weave.linkableChild(this, new LinkableString(ColorBinLegendPlotter.SHAPE_TYPE_CIRCLE, this.verifyShapeType));
		public static SHAPE_TYPE_CIRCLE:string = 'circle';
		public static SHAPE_TYPE_SQUARE:string = 'square';
		public static SHAPE_TYPE_LINE:string = 'line';
		public static ENUM_SHAPE_TYPE = [ColorBinLegendPlotter.SHAPE_TYPE_CIRCLE, ColorBinLegendPlotter.SHAPE_TYPE_SQUARE, ColorBinLegendPlotter.SHAPE_TYPE_LINE];
		private verifyShapeType(value:string):boolean { return ColorBinLegendPlotter.ENUM_SHAPE_TYPE.indexOf(value) >= 0; }
		
		/**
		 * This is the radius of the circle, in screen coordinates.
		 */
		public shapeSize:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(25));
		/**
		 * This is the line style used to draw the outline of the shape.
		 */
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		/**
		 * This is the maximum number of items to draw in a single row.
		 * @default 1 
		 */		
		public maxColumns:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(1), this.createHashMaps);
		
		/**
		 * This is an option to reverse the item order.
		 */
		public reverseOrder:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false), this.createHashMaps);
		
		/**
		 * This is the compiled function to apply to the item labels.
		 */		
		public itemLabelFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, ['number', 'string']), this.createHashMaps);
		
		// TODO This should go somewhere else...
		/**
		 * This is the compiled function to apply to the title of the tool.
		 */		
		public legendTitleFunction:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('column.getMetadata("title")', true, ['string', 'column']));
		
		private statsWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		
		private _binToBounds:Bounds2D[] = [];
		private _binToString:string[] = [];
		public numBins:int = 0;
		private createHashMaps():void
		{
			this._binToString = [];
			this._binToBounds = [];
			
			var keys = this.filteredKeySet.keys;
			var internalColorColumn:ColorColumn = this.getInternalColorColumn();
			if (!internalColorColumn)
				return;
			
			var binnedColumn:BinnedColumn = Weave.AS(internalColorColumn.getInternalColumn(), BinnedColumn);
			if (binnedColumn == null)
			{
				this.numBins = 0;
				return;
			}
			
			this.numBins = binnedColumn.numberOfBins;
			var maxCols:int = this.maxColumns.value;
			if (maxCols <= 0)
				maxCols = 1;
			if (maxCols > this.numBins)
				maxCols = this.numBins;
			var blankBins:int = this.numBins % maxCols;
			var fakeNumBins:int = (blankBins > 0) ? maxCols - blankBins : 0; // invisible bins which should be put in the lower right 
			var maxNumBins:int = this.numBins + fakeNumBins;
			for (var iBin:int = 0; iBin < this.numBins; ++iBin)
			{
				// get the adjusted position and transpose inside the row
				var adjustedIBin:int = (this.reverseOrder.value) ? (fakeNumBins + iBin) : (maxNumBins - 1 - iBin);
				var row:int = adjustedIBin / maxCols;
				var col:int = adjustedIBin % maxCols;
				var b:Bounds2D = new Bounds2D();
				
				this.getBackgroundDataBounds(this.tempBounds);
				LegendUtils.getBoundsFromItemID(this.tempBounds, adjustedIBin, b, maxNumBins, maxCols, true);
				
				this._binToBounds[iBin] = b;
				var binString:string = binnedColumn.deriveStringFromNumber(iBin);
				try
				{
					this._binToString[iBin] = this.itemLabelFunction.apply(null, [iBin, binString]);
				}
				catch (e)
				{
					this._binToString[iBin] = binString;
				}
			}
		}
		
		private _drawBackground:boolean = false; // this is used to check if we should draw the bins with no records.
		/*override*/ public drawBackground(dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			// draw the bins that have no records in them in the background
			this._drawBackground = true;
			this.drawAll(this.filteredKeySet.keys, dataBounds, screenBounds, destination);
			this._drawBackground = false;
		}

		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			this.drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var internalColorColumn:ColorColumn = this.getInternalColorColumn();
			if (internalColorColumn == null)
				return; // draw nothing
			var binnedColumn:BinnedColumn = Weave.AS(internalColorColumn.getInternalColumn(), BinnedColumn);
			if (binnedColumn && binnedColumn.numberOfBins)
				this.drawBinnedPlot(recordKeys, dataBounds, screenBounds, destination);
			else
				this.drawContinuousPlot(recordKeys, dataBounds, screenBounds, destination);
		}
			
		protected drawContinuousPlot(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			if (!this._drawBackground)
				return;
			
			var _shapeSize:number = this.shapeSize.value;
			var colorColumn:ColorColumn = this.getInternalColorColumn();
			var dataColumn:DynamicColumn = colorColumn.internalDynamicColumn;
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(dataColumn);
			this.statsWatcher.target = stats;
			
			this.tempBounds.copyFrom(screenBounds);
			this.tempBounds.makeSizePositive();
			this.tempBounds.setXMax(_shapeSize + this.labelGap);
			
			colorColumn.ramp.draw(destination, 0, this.reverseOrder.value ? -1 : 1, this.tempBounds);
			this.lineStyle.beginLineStyle(null, destination);
			destination.drawRect(this.tempBounds.getXNumericMin(), this.tempBounds.getYNumericMin(), this.tempBounds.getXCoverage() - 1, this.tempBounds.getYCoverage() - 1);
			
			var minLabel:string = ColumnUtils.deriveStringFromNumber(dataColumn, colorColumn.getDataMin());
			LegendUtils.renderLegendItemText(destination, minLabel, screenBounds, _shapeSize + this.labelGap, null, this.reverseOrder.value ? BitmapText.VERTICAL_ALIGN_BOTTOM : BitmapText.VERTICAL_ALIGN_TOP);
			
			if (colorColumn.rampCenterAtZero.value)
			{
				var midLabel:string = ColumnUtils.deriveStringFromNumber(dataColumn, 0);
				LegendUtils.renderLegendItemText(destination, midLabel, screenBounds, _shapeSize + this.labelGap, null, BitmapText.VERTICAL_ALIGN_MIDDLE);
			}
			
			var maxLabel:string = ColumnUtils.deriveStringFromNumber(dataColumn, colorColumn.getDataMax());
			LegendUtils.renderLegendItemText(destination, maxLabel, screenBounds, _shapeSize + this.labelGap, null, this.reverseOrder.value ? BitmapText.VERTICAL_ALIGN_TOP : BitmapText.VERTICAL_ALIGN_BOTTOM);
		}
		
		protected drawBinnedPlot(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, destination:Graphics):void
		{
			var colorColumn:ColorColumn = this.getInternalColorColumn();
			var binnedColumn:BinnedColumn = Weave.AS(colorColumn.getInternalColumn(), BinnedColumn);
			
			this.lineStyle.beginLineStyle(null, destination);
			
			// convert record keys to bin keys
			// save a mapping of each bin key found to a value of true
			var binIndexSet:Set<number> = new Set();
			for (var i:int = 0; i < recordKeys.length; i++)
				binIndexSet.add(binnedColumn.getValueFromKey(recordKeys[i], Number));
			
			var _shapeSize:number = this.shapeSize.value;
			if (this.shapeType.value != ColorBinLegendPlotter.SHAPE_TYPE_LINE)
				_shapeSize = Math.max(1, Math.min(_shapeSize, screenBounds.getYCoverage() / this.numBins));
			var xShapeOffset:number = _shapeSize / 2; 
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(colorColumn.internalDynamicColumn);
			this.statsWatcher.target = stats;
			var binCount:int = binnedColumn.numberOfBins;
			for (var iBin:int = 0; iBin < binCount; ++iBin)
			{
				// we only render empty bins when _drawBackground is true
				if (binIndexSet.has(iBin) ? this._drawBackground : !this._drawBackground)
					continue;
				
				this.tempBounds.copyFrom(this._binToBounds[iBin]);
				dataBounds.projectCoordsTo(this.tempBounds, screenBounds);
				
				// draw almost invisible rectangle for probe filter
				this.tempBounds.getRectangle(this.tempRectangle);
				destination.fillRect(this.tempRectangle, 0x02808080);
				
				// draw the text
				LegendUtils.renderLegendItemText(destination, this._binToString[iBin], this.tempBounds, _shapeSize + this.labelGap);
				
				// draw circle
				var iColorIndex:int = this.reverseOrder.value ? (binCount - 1 - iBin) : iBin;
				var color:number = colorColumn.getColorFromDataValue(iBin);
				var xMin:number = this.tempBounds.getXNumericMin(); 
				var yMin:number = this.tempBounds.getYNumericMin();
				var xMax:number = this.tempBounds.getXNumericMax(); 
				var yMax:number = this.tempBounds.getYNumericMax();
				if (isFinite(color))
					destination.beginFill(color, 1.0);
				switch (this.shapeType.value)
				{
					case ColorBinLegendPlotter.SHAPE_TYPE_CIRCLE:
						destination.drawCircle(xMin + xShapeOffset, (yMin + yMax) / 2, _shapeSize / 2);
						break;
					case ColorBinLegendPlotter.SHAPE_TYPE_SQUARE:
						destination.drawRect(
							xMin + xShapeOffset - _shapeSize / 2,
							(yMin + yMax - _shapeSize) / 2,
							_shapeSize,
							_shapeSize
						);
						break;
					case ColorBinLegendPlotter.SHAPE_TYPE_LINE:
						if (!isFinite(color))
							break;
						destination.endFill();
						destination.lineStyle(this.lineShapeThickness, color, 1);
						destination.moveTo(xMin + xShapeOffset - _shapeSize / 2, (yMin + yMax) / 2);
						destination.lineTo(xMin + xShapeOffset + _shapeSize / 2, (yMin + yMax) / 2);
						break;
				}
				destination.endFill();
			}
		}
		
		public labelGap:number = 5;
		public lineShapeThickness:number = 4;
		
		// reusable temporary objects
		private tempPoint:Point = new Point();
		private tempBounds:Bounds2D = new Bounds2D();
		private tempRectangle:Rectangle = new Rectangle();
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output);
			var internalColorColumn:ColorColumn = this.getInternalColorColumn();
			if (!internalColorColumn)
				return;
			
			var binnedColumn:BinnedColumn = Weave.AS(internalColorColumn.getInternalColumn(), BinnedColumn);
			if (binnedColumn)
			{
				var index:number = binnedColumn.getValueFromKey(recordKey, Number);
				var b:Bounds2D = this._binToBounds[index];
				if (b)
					output[0].copyFrom(b);
			}
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			return output.setBounds(0, 1, 1, 0);
		}
		
		// backwards compatibility
		//[Deprecated(replacement="reverseOrder")] public set ascendingOrder(value:boolean):void { reverseOrder.value = !value; }
	}
}

