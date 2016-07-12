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
		import setSessionState = weavejs.api.setSessionState;
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
		import LinkableTextFormat = weavejs.util.LinkableTextFormat;
		import SolidFillStyle = weavejs.geom.SolidFillStyle;
		import SolidLineStyle = weavejs.geom.SolidLineStyle;
		
		/**
		 * This plotter displays a histogram with optional colors.
		 */
		public class HistogramPlotter extends AbstractPlotter implements ISelectableAttributes
		{
			public var debug:Boolean = false;
			
			public function HistogramPlotter()
			{
				clipDrawing = true;
				
				aggregateStats = WeaveAPI.StatisticsCache.getColumnStatistics(columnToAggregate);
				
				// don't lock the ColorColumn, so linking to global ColorColumn is possible
				var _colorColumn:ColorColumn = fillStyle.color.internalDynamicColumn.requestLocalObject(ColorColumn, false);
				_colorColumn.ramp.setSessionState([0x808080]);

				var _binnedColumn:BinnedColumn = _colorColumn.internalDynamicColumn.requestLocalObject(BinnedColumn, true);
				
				// the data inside the binned column needs to be filtered by the subset
				var filteredColumn:FilteredColumn = _binnedColumn.internalDynamicColumn.requestLocalObject(FilteredColumn, true);
				
				Weave.linkState(filteredKeySet.keyFilter, filteredColumn.filter);
				
				// make the colors spatial properties because the binned column is inside
				Weave.getCallbacks(fillStyle.color.internalDynamicColumn).addGroupedCallback(this, this.setBinnedColumn, true);

				setSingleKeySource(fillStyle.color.internalDynamicColumn); // use record keys, not bin keys!
				
				this.addSpatialDependencies(this.aggregateStats, fillStyle.color.internalDynamicColumn, this.binnedColumn, this.columnToAggregate, this.aggregationMethod, this.horizontalMode);
			}
			
			public function getSelectableAttributeNames():Array
			{
				return ["Grouping values", "Height values (Optional)"];
			}
			public function getSelectableAttributes():Array
			{
				return [fillStyle.color, columnToAggregate];
			}
			
			public const binnedColumn:BinnedColumn = Weave.linkableChild(this, BinnedColumn, setColorColumn, true);
			private function setColorColumn():void
			{
				var colorBinCol:BinnedColumn = internalColorColumn ? internalColorColumn.getInternalColumn() as BinnedColumn : null;
				if (!colorBinCol)
					return;
				
				if (colorBinCol.binningDefinition.internalObject)
					copySessionState(binnedColumn, colorBinCol);
				else
					copySessionState(binnedColumn.internalDynamicColumn, colorBinCol.internalDynamicColumn);
			}
			private function setBinnedColumn():void
			{
				var colorBinCol:BinnedColumn = internalColorColumn ? internalColorColumn.getInternalColumn() as BinnedColumn : null;
				if (!colorBinCol)
					return;
				
				if (colorBinCol.binningDefinition.internalObject)
					copySessionState(colorBinCol, binnedColumn);
				else
					copySessionState(colorBinCol.internalDynamicColumn, binnedColumn.internalDynamicColumn);
			}
			
			/**
			 * This column object may change and it may be null, depending on the session state.
			 * This function is provided for convenience.
			 */
			public function get internalColorColumn():ColorColumn
			{
				return fillStyle.color.getInternalColumn() as ColorColumn;
			}
			public const lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
			public const fillStyle:SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
			public const drawPartialBins:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
			public const columnToAggregate:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
			public const aggregationMethod:LinkableString = Weave.linkableChild(this, new LinkableString(AG_COUNT, verifyAggregationMethod));
			public const horizontalMode:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
			
			public const showValueLabels:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
			public const valueLabelHorizontalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_LEFT));
			public const valueLabelVerticalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.VERTICAL_ALIGN_MIDDLE));
			public const valueLabelRelativeAngle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
			public const valueLabelColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
			public const valueLabelMaxWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(200, verifyLabelMaxWidth));
			private function verifyLabelMaxWidth(value:Number):Boolean { return value > 0; }
			private const _bitmapText:BitmapText = new BitmapText();		
			
			private static function verifyAggregationMethod(value:String):Boolean { return ENUM_AGGREGATION_METHODS.indexOf(value) >= 0; }
			public static const ENUM_AGGREGATION_METHODS:Array = [AG_COUNT, AG_SUM, AG_MEAN];
			public static const AG_COUNT:String = 'count';
			public static const AG_SUM:String = 'sum';
			public static const AG_MEAN:String = 'mean';
			
			private var aggregateStats:IColumnStatistics;

			private function getAggregateValue(keys:Array):Number
			{
				var agCol:IAttributeColumn = columnToAggregate.getInternalColumn();
				if (!agCol)
					return 0;
				
				var count:int = 0;
				var sum:Number = 0;
				for each (var key:IQualifiedKey in keys)
				{
					var value:Number = agCol.getValueFromKey(key, Number);
					if (isFinite(value))
					{
						sum += value;
						count++;
					}
				}
				if (aggregationMethod.value == AG_MEAN)
					return sum /= count; // convert sum to mean
				if (aggregationMethod.value == AG_COUNT)
					return count; // use count of finite values
				
				// AG_SUM
				return sum;
			}

			/**
			 * This function returns the collective bounds of all the bins.
			 */
			override public function getBackgroundDataBounds(output:Bounds2D):void
			{
				output.reset();
				
				if (horizontalMode.value)
					output.setYRange(-0.5, Math.max(1, binnedColumn.numberOfBins) - 0.5);
				else
					output.setXRange(-0.5, Math.max(1, binnedColumn.numberOfBins) - 0.5);
			}
			
			/**
			 * This gets the data bounds of the histogram bin that a record key falls into.
			 */
			override public function getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Array):void
			{
				var binIndex:Number = binnedColumn.getValueFromKey(recordKey, Number);
				if (isNaN(binIndex))
				{
					initBoundsArray(output, 0);
					return;
				}
				
				var keysInBin:Array = binnedColumn.getKeysFromBinIndex(binIndex) || [];
				var agCol:IAttributeColumn = columnToAggregate.getInternalColumn();
				var binHeight:Number = agCol ? getAggregateValue(keysInBin) : keysInBin.length;
				
				if (horizontalMode.value)
					initBoundsArray(output).setBounds(0, binIndex - 0.5, binHeight, binIndex + 0.5);
				else
					initBoundsArray(output).setBounds(binIndex - 0.5, 0, binIndex + 0.5, binHeight);
				
				var bounds:Bounds2D = output[0];
				if (debug)
					debugTrace(recordKey.localName, bounds.getWidth(), bounds.getHeight())
			}
			
			/**
			 * This draws the histogram bins that a list of record keys fall into.
			 */
			override public function drawPlotAsyncIteration(task:IPlotTask):Number
			{
				var i:int;
				
				// convert record keys to bin keys
				// save a mapping of each bin key found to a value of true
				var binName:String;
				var _tempBinKeyToSingleRecordKeyMap:Object = new Object();
				for (i = 0; i < task.recordKeys.length; i++)
				{
					binName = binnedColumn.getValueFromKey(task.recordKeys[i], String);
					var array:Array = _tempBinKeyToSingleRecordKeyMap[binName] as Array
					if (!array)
						array = _tempBinKeyToSingleRecordKeyMap[binName] = [];
					array.push(task.recordKeys[i]);
				}

				var binNames:Array = [];
				for (binName in _tempBinKeyToSingleRecordKeyMap)
					binNames.push(binName);
				var allBinNames:Array = binnedColumn.binningDefinition.getBinNames();
				
				LinkableTextFormat.defaultTextFormat.copyTo(_bitmapText.textFormat);

				// draw the bins
				// BEGIN template code for defining a drawPlot() function.
				//---------------------------------------------------------
				
				var key:IQualifiedKey;
				var agCol:IAttributeColumn = columnToAggregate.getInternalColumn();
				var graphics:Graphics = tempShape.graphics;
				for (i = 0; i < binNames.length; i++)
				{
					binName = binNames[i];
					var keys:Array = _tempBinKeyToSingleRecordKeyMap[binName] as Array;
					if (!drawPartialBins.value)
						keys = binnedColumn.getKeysFromBinName(binName);
					
					var binIndex:int = allBinNames.indexOf(binName);
					var binHeight:Number = agCol ? getAggregateValue(keys) : keys.length;
					
					// bars are centered at their binIndex values and have width=1
					if (horizontalMode.value)
					{
						tempBounds.setXRange(0, binHeight);
						tempBounds.setCenteredYRange(binIndex, 1);
					}
					else
					{
						tempBounds.setYRange(0, binHeight);
						tempBounds.setCenteredXRange(binIndex, 1);
					}
					task.dataBounds.projectCoordsTo(tempBounds, task.screenBounds);
		
					// draw rectangle for bin
					graphics.clear();
					lineStyle.beginLineStyle(null, graphics);
					var fillStyleParams:Array = fillStyle.getBeginFillParams(keys[0]);
					if (fillStyleParams)
					{
						var colorBinCol:BinnedColumn = internalColorColumn ? internalColorColumn.getInternalColumn() as BinnedColumn : null;
						if (colorBinCol && !colorBinCol.binningDefinition.internalObject)
							fillStyleParams[0] = internalColorColumn.getColorFromDataValue(binIndex);
						if (isFinite(fillStyleParams[0]))
							graphics.beginFill.apply(graphics, fillStyleParams);
					}
					graphics.drawRect(tempBounds.getXMin(), tempBounds.getYMin(), tempBounds.getWidth(), tempBounds.getHeight());
					graphics.endFill();
					// flush the tempShape "buffer" onto the destination BitmapData.
					task.buffer.draw(tempShape);
					
					// draw value label
					if (showValueLabels.value)
					{
						if (agCol)
							_bitmapText.text = ColumnUtils.deriveStringFromNumber(agCol, binHeight);
						else
							_bitmapText.text = StandardLib.formatNumber(binHeight);
						if (horizontalMode.value)
						{
							_bitmapText.x = tempBounds.getXMax();
							_bitmapText.y = tempBounds.getYCenter();
							_bitmapText.angle = 0;
						}
						else
						{
							_bitmapText.x = tempBounds.getXCenter();
							_bitmapText.y = tempBounds.getYMax();
							_bitmapText.angle = 270;
						}
						
						_bitmapText.maxWidth = valueLabelMaxWidth.value;
						_bitmapText.verticalAlign = valueLabelVerticalAlign.value;
						_bitmapText.horizontalAlign = valueLabelHorizontalAlign.value;
						
						if (isFinite(valueLabelRelativeAngle.value))
							_bitmapText.angle += valueLabelRelativeAngle.value;
						
						_bitmapText.textFormat.color = valueLabelColor.value;
						
						TextGlyphPlotter.drawInvisibleHalo(_bitmapText, task);
						_bitmapText.draw(task.buffer);
					}
				}
				
				return 1;
			}
			
			private const tempBounds:Bounds2D = new Bounds2D(); // reusable temporary object

			//------------------------
			// backwards compatibility
			[Deprecated(replacement="fillStyle.color.internalDynamicColumn")] public function set dynamicColorColumn(value:Object):void
			{
				Weave.setState(fillStyle.color.internalDynamicColumn, value);
			}
			[Deprecated(replacement="columnToAggregate")] public function set sumColumn(value:Object):void
			{
				Weave.setState(columnToAggregate, value);
				if (columnToAggregate.getInternalColumn())
					aggregationMethod.value = AG_SUM;
			}
		}
	}
