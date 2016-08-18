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
	
	import copySessionState = weavejs.api.copySessionState;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import Bounds2D = weavejs.geom.Bounds2D;
	import BitmapText = weavejs.util.BitmapText;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidFillStyle = weavejs.plot.SolidFillStyle;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	/**
	 * This plotter displays a histogram with optional colors.
	 */
	export class HistogramPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public debug:boolean = false;
		
		public constructor()
		{
			clipDrawing = true;
			
			this.aggregateStats = WeaveAPI.StatisticsCache.getColumnStatistics(this.columnToAggregate);
			
			// don't lock the ColorColumn, so linking to global ColorColumn is possible
			var _colorColumn:ColorColumn = this.fillStyle.color.internalDynamicColumn.requestLocalObject(ColorColumn, false);
			_colorColumn.ramp.setSessionState([0x808080]);

			var _binnedColumn:BinnedColumn = _colorColumn.internalDynamicColumn.requestLocalObject(BinnedColumn, true);
			
			// the data inside the binned column needs to be filtered by the subset
			var filteredColumn:FilteredColumn = _binnedColumn.internalDynamicColumn.requestLocalObject(FilteredColumn, true);
			
			Weave.linkState(this.filteredKeySet.keyFilter, filteredColumn.filter);
			
			// make the colors spatial properties because the binned column is inside
			Weave.getCallbacks(this.fillStyle.color.internalDynamicColumn).addGroupedCallback(this, this.setBinnedColumn, true);

			this.setSingleKeySource(this.fillStyle.color.internalDynamicColumn); // use record keys, not bin keys!
			
			this.addSpatialDependencies(this.aggregateStats, this.fillStyle.color.internalDynamicColumn, this.binnedColumn, this.columnToAggregate, this.aggregationMethod, this.horizontalMode);
		}
		
		public getSelectableAttributeNames()
		{
			return ["Grouping values", "Height values (Optional)"];
		}
		public getSelectableAttributes()
		{
			return [this.fillStyle.color, this.columnToAggregate];
		}
		
		public binnedColumn:BinnedColumn = Weave.linkableChild(this, BinnedColumn, this.setColorColumn, true);
		private setColorColumn():void
		{
			var colorBinCol:BinnedColumn = this.internalColorColumn ? Weave.AS(this.internalColorColumn.getInternalColumn(), BinnedColumn) : null;
			if (!colorBinCol)
				return;
			
			if (colorBinCol.binningDefinition.internalObject)
				copySessionState(this.binnedColumn, colorBinCol);
			else
				copySessionState(this.binnedColumn.internalDynamicColumn, colorBinCol.internalDynamicColumn);
		}
		private setBinnedColumn():void
		{
			var colorBinCol:BinnedColumn = this.internalColorColumn ? Weave.AS(this.internalColorColumn.getInternalColumn(), BinnedColumn) : null;
			if (!colorBinCol)
				return;
			
			if (colorBinCol.binningDefinition.internalObject)
				copySessionState(colorBinCol, this.binnedColumn);
			else
				copySessionState(colorBinCol.internalDynamicColumn, this.binnedColumn.internalDynamicColumn);
		}
		
		/**
		 * This column object may change and it may be null, depending on the session state.
		 * This function is provided for convenience.
		 */
		public get internalColorColumn():ColorColumn
		{
			return Weave.AS(this.fillStyle.color.getInternalColumn(), ColorColumn);
		}
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public fillStyle:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
		public drawPartialBins:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public columnToAggregate:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public aggregationMethod:LinkableString = Weave.linkableChild(this, new LinkableString(HistogramPlotter.AG_COUNT, HistogramPlotter.verifyAggregationMethod));
		public horizontalMode:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public showValueLabels:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public valueLabelHorizontalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_LEFT));
		public valueLabelVerticalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.VERTICAL_ALIGN_MIDDLE));
		public valueLabelRelativeAngle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		public valueLabelColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public valueLabelMaxWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(200, this.verifyLabelMaxWidth));
		private verifyLabelMaxWidth(value:number):boolean { return value > 0; }
		private _bitmapText:BitmapText = new BitmapText();		
		
		private static verifyAggregationMethod(value:string):boolean { return HistogramPlotter.ENUM_AGGREGATION_METHODS.indexOf(value) >= 0; }
		public static ENUM_AGGREGATION_METHODS:Array = [HistogramPlotter.AG_COUNT, HistogramPlotter.AG_SUM, HistogramPlotter.AG_MEAN];
		public static AG_COUNT:string = 'count';
		public static AG_SUM:string = 'sum';
		public static AG_MEAN:string = 'mean';
		
		private aggregateStats:IColumnStatistics;

		private getAggregateValue(keys:IQualifiedKey[]):number
		{
			var agCol:IAttributeColumn = this.columnToAggregate.getInternalColumn();
			if (!agCol)
				return 0;
			
			var count:int = 0;
			var sum:number = 0;
			for (var key:IQualifiedKey of keys || [])
			{
				var value:number = agCol.getValueFromKey(key, Number);
				if (isFinite(value))
				{
					sum += value;
					count++;
				}
			}
			if (this.aggregationMethod.value == HistogramPlotter.AG_MEAN)
				return sum /= count; // convert sum to mean
			if (this.aggregationMethod.value == HistogramPlotter.AG_COUNT)
				return count; // use count of finite values
			
			// AG_SUM
			return sum;
		}

		/**
		 * This function returns the collective bounds of all the bins.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			output.reset();
			
			if (this.horizontalMode.value)
				output.setYRange(-0.5, Math.max(1, this.binnedColumn.numberOfBins) - 0.5);
			else
				output.setXRange(-0.5, Math.max(1, this.binnedColumn.numberOfBins) - 0.5);
		}
		
		/**
		 * This gets the data bounds of the histogram bin that a record key falls into.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var binIndex:number = this.binnedColumn.getValueFromKey(recordKey, Number);
			if (isNaN(binIndex))
			{
				this.initBoundsArray(output, 0);
				return;
			}
			
			var keysInBin:Array = this.binnedColumn.getKeysFromBinIndex(binIndex) || [];
			var agCol:IAttributeColumn = this.columnToAggregate.getInternalColumn();
			var binHeight:number = agCol ? this.getAggregateValue(keysInBin) : keysInBin.length;
			
			if (this.horizontalMode.value)
				this.initBoundsArray(output).setBounds(0, binIndex - 0.5, binHeight, binIndex + 0.5);
			else
				this.initBoundsArray(output).setBounds(binIndex - 0.5, 0, binIndex + 0.5, binHeight);
			
			var bounds:Bounds2D = output[0];
			if (this.debug)
				debugTrace(recordKey.localName, bounds.getWidth(), bounds.getHeight())
		}
		
		/**
		 * This draws the histogram bins that a list of record keys fall into.
		 */
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			var i:int;
			
			// convert record keys to bin keys
			// save a mapping of each bin key found to a value of true
			var binName:string;
			var _tempBinKeyToSingleRecordKeyMap:{[binName:string]:IQualifiedKey[]} = {};
			for (i = 0; i < task.recordKeys.length; i++)
			{
				binName = this.binnedColumn.getValueFromKey(task.recordKeys[i], String);
				var array:IQualifiedKey[] = _tempBinKeyToSingleRecordKeyMap[binName];
				if (!array)
					array = _tempBinKeyToSingleRecordKeyMap[binName] = [];
				array.push(task.recordKeys[i]);
			}

			var binNames:Array = [];
			for (binName in _tempBinKeyToSingleRecordKeyMap)
				binNames.push(binName);
			var allBinNames:Array = this.binnedColumn.binningDefinition.getBinNames();
			
			LinkableTextFormat.defaultTextFormat.copyTo(this._bitmapText.textFormat);

			// draw the bins
			// BEGIN template code for defining a drawPlot() function.
			//---------------------------------------------------------
			
			var key:IQualifiedKey;
			var agCol:IAttributeColumn = this.columnToAggregate.getInternalColumn();
			var graphics:Graphics = tempShape.graphics;
			for (i = 0; i < binNames.length; i++)
			{
				binName = binNames[i];
				var keys:Array = _tempBinKeyToSingleRecordKeyMap[binName] as Array;
				if (!this.drawPartialBins.value)
					keys = this.binnedColumn.getKeysFromBinName(binName);
				
				var binIndex:int = allBinNames.indexOf(binName);
				var binHeight:number = agCol ? this.getAggregateValue(keys) : keys.length;
				
				// bars are centered at their binIndex values and have width=1
				if (this.horizontalMode.value)
				{
					this.tempBounds.setXRange(0, binHeight);
					this.tempBounds.setCenteredYRange(binIndex, 1);
				}
				else
				{
					this.tempBounds.setYRange(0, binHeight);
					this.tempBounds.setCenteredXRange(binIndex, 1);
				}
				task.dataBounds.projectCoordsTo(this.tempBounds, task.screenBounds);
	
				// draw rectangle for bin
				graphics.clear();
				this.lineStyle.beginLineStyle(null, graphics);
				var fillStyleParams:Array = this.fillStyle.getBeginFillParams(keys[0]);
				if (fillStyleParams)
				{
					var colorBinCol:BinnedColumn = this.internalColorColumn ? Weave.AS(this.internalColorColumn.getInternalColumn(), BinnedColumn) : null;
					if (colorBinCol && !colorBinCol.binningDefinition.internalObject)
						fillStyleParams[0] = this.internalColorColumn.getColorFromDataValue(binIndex);
					if (isFinite(fillStyleParams[0]))
						graphics.beginFill.apply(graphics, fillStyleParams);
				}
				graphics.drawRect(this.tempBounds.getXMin(), this.tempBounds.getYMin(), this.tempBounds.getWidth(), this.tempBounds.getHeight());
				graphics.endFill();
				// flush the tempShape "buffer" onto the destination BitmapData.
				task.buffer.draw(tempShape);
				
				// draw value label
				if (this.showValueLabels.value)
				{
					if (agCol)
						this._bitmapText.text = ColumnUtils.deriveStringFromNumber(agCol, binHeight);
					else
						this._bitmapText.text = StandardLib.formatNumber(binHeight);
					if (this.horizontalMode.value)
					{
						this._bitmapText.x = this.tempBounds.getXMax();
						this._bitmapText.y = this.tempBounds.getYCenter();
						this._bitmapText.angle = 0;
					}
					else
					{
						this._bitmapText.x = this.tempBounds.getXCenter();
						this._bitmapText.y = this.tempBounds.getYMax();
						this._bitmapText.angle = 270;
					}
					
					this._bitmapText.maxWidth = this.valueLabelMaxWidth.value;
					this._bitmapText.verticalAlign = this.valueLabelVerticalAlign.value;
					this._bitmapText.horizontalAlign = this.valueLabelHorizontalAlign.value;
					
					if (isFinite(this.valueLabelRelativeAngle.value))
						this._bitmapText.angle += this.valueLabelRelativeAngle.value;
					
					this._bitmapText.textFormat.color = this.valueLabelColor.value;
					
					TextGlyphPlotter.drawInvisibleHalo(this._bitmapText, task);
					this._bitmapText.draw(task.buffer);
				}
			}
			
			return 1;
		}
		
		private tempBounds:Bounds2D = new Bounds2D(); // reusable temporary object

		//------------------------
		// backwards compatibility
		/*[Deprecated(replacement="fillStyle.color.internalDynamicColumn")] public set dynamicColorColumn(value:Object):void
		{
			Weave.setState(fillStyle.color.internalDynamicColumn, value);
		}
		[Deprecated(replacement="columnToAggregate")] public set sumColumn(value:Object):void
		{
			Weave.setState(columnToAggregate, value);
			if (columnToAggregate.getInternalColumn())
				aggregationMethod.value = AG_SUM;
		}*/
	}
}

