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
	
	import DynamicState = weavejs.api.core.DynamicState;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import Bounds2D = weavejs.geom.Bounds2D;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import StandardLib = weavejs.util.StandardLib;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import SortedIndexColumn = weavejs.data.column.SortedIndexColumn;
	import CategoryBinningDefinition = weavejs.data.bin.CategoryBinningDefinition;
	import SortedKeySet = weavejs.data.key.SortedKeySet;
	import ColorRamp = weavejs.util.ColorRamp;
	import Range = weavejs.geom.Range;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DrawUtils = weavejs.util.DrawUtils;
	import LinkableTextFormat = weavejs.plot.LinkableTextFormat;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;

	export class CompoundBarChartPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			super();

			this.colorColumn.internalDynamicColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];

			// get the keys from the sort column
			this.setColumnKeySources([this.sortColumn]);
			
			// Link the subset key filter to the filter of the private _filteredSortColumn.
			// This is so the records will be filtered before they are sorted in the _sortColumn.
			Weave.linkState(this._filteredKeySet.keyFilter, this._filteredSortColumn.filter);
			
			this.heightColumns.addGroupedCallback(this, this.heightColumnsGroupCallback);
			Weave.linkableChild(this, this.sortColumn);
			Weave.linkableChild(this, LinkableTextFormat.defaultTextFormat); // redraw when text format changes
			
			this._binnedSortColumn.binningDefinition.requestLocalObject(CategoryBinningDefinition, true); // creates one bin per unique value in the sort column
			
			this.heightColumns.childListCallbacks.addImmediateCallback(this, this.handleColumnsListChange);
			// color is a spatial property because it is used for sorting
			this.addSpatialDependencies(
				this.sortColumn,
				this.colorColumn.internalDynamicColumn, // color is used for sorting
				this.groupBySortColumn,
				this._binnedSortColumn,
				this.stackedMissingDataGap,
				this.colorIndicatesDirection,
				this.heightColumns,
				this.positiveErrorColumns,
				this.negativeErrorColumns,
				this.horizontalMode,
				this.zoomToSubset,
				this.zoomToSubsetBars,
				this.groupingMode
			);
		}
		private handleColumnsListChange():void
		{
			// When a new column is created, register the stats to trigger callbacks and affect busy status.
			// This will be cleaned up automatically when the column is disposed.
			var newColumn:IAttributeColumn = Weave.AS(this.heightColumns.childListCallbacks.lastObjectAdded, IAttributeColumn);
			if (newColumn)
				this.addSpatialDependencies(WeaveAPI.StatisticsCache.getColumnStatistics(newColumn));
		}
		
		
		public getSelectableAttributeNames()
		{
			return [
				"Color",
				"Label",
				"Sort",
				"Height",
				"Positive Error",
				"Negative Error"
			];
		}
		public getSelectableAttributes()
		{
			return [
				this.colorColumn,
				this.labelColumn,
				this.sortColumn,
				this.heightColumns,
				this.positiveErrorColumns,
				this.negativeErrorColumns
			];
		}
		
		/**
		 * This is the line style used to draw the outline of the rectangle.
		 */
		public line:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		public groupBySortColumn:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false)); // when this is true, we use _binnedSortColumn
		private _binnedSortColumn:BinnedColumn = Weave.linkableChild(this, BinnedColumn); // only used when groupBySortColumn is true
		private _sortedIndexColumn:SortedIndexColumn = this._binnedSortColumn.internalDynamicColumn.requestLocalObject(SortedIndexColumn, true); // this sorts the records
		private _filteredSortColumn:FilteredColumn = this._sortedIndexColumn.requestLocalObject(FilteredColumn, true); // filters before sorting
		public get sortColumn():DynamicColumn { return this._filteredSortColumn.internalDynamicColumn; }
		public colorColumn:AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
		public labelColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public stackedMissingDataGap:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public colorIndicatesDirection:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		private _colorColumnStatsWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		private _sortedKeysByBinIndex:Map<number, IQualifiedKey[]> = new Map;
		private _sortCopyByColor:Function;
		
		public sortAxisLabelFunction(value:number):string
		{
			if (this.groupBySortColumn.value)
				return this._binnedSortColumn.deriveStringFromNumber(value);
			
			// get the sorted keys
			var sortedKeys = this._sortedIndexColumn.keys;
			var sortedKeyIndex:int = Math.round(value);
			if (sortedKeyIndex != value || sortedKeyIndex < 0 || sortedKeyIndex > sortedKeys.length - 1)
				return '';
			
			// if the labelColumn doesn't have any data, use default label
			if (this.labelColumn.getInternalColumn() == null)
				return null;
			
			// otherwise return the value from the labelColumn
			return this.labelColumn.getValueFromKey(sortedKeys[sortedKeyIndex], String);
		}
		
		public chartColors:ColorRamp = Weave.linkableChild(this, new ColorRamp(ColorRamp.getColorRampByName("Paired"))); // bars get their color from here

		public showValueLabels:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public valueLabelDataCoordinate:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		public valueLabelHorizontalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_LEFT));
		public valueLabelVerticalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.VERTICAL_ALIGN_MIDDLE));
		public valueLabelRelativeAngle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		public valueLabelColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public valueLabelMaxWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(200, this.verifyLabelMaxWidth));
		public recordValueLabelColoring:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public showLabels:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public labelFormatter:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('string', true, ['string', 'column']));
		public labelDataCoordinate:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		public labelHorizontalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.HORIZONTAL_ALIGN_RIGHT));
		public labelVerticalAlign:LinkableString = Weave.linkableChild(this, new LinkableString(BitmapText.VERTICAL_ALIGN_MIDDLE));
		public labelRelativeAngle:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		public labelColor:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public labelMaxWidth:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(200, this.verifyLabelMaxWidth));
		public recordLabelColoring:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public heightColumns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		public positiveErrorColumns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		public negativeErrorColumns:LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		public errorIsRelative:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public horizontalMode:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public zoomToSubset:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public zoomToSubsetBars:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public barSpacing:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(0));
		public groupingMode:LinkableString = Weave.linkableChild(this, new LinkableString(CompoundBarChartPlotter.STACK, this.verifyGroupingMode));
		public static GROUP:string = 'group';
		public static STACK:string = 'stack';
		public static PERCENT_STACK:string = 'percentStack';
		private verifyGroupingMode(mode:string):boolean
		{
			return [CompoundBarChartPlotter.GROUP, CompoundBarChartPlotter.STACK, CompoundBarChartPlotter.PERCENT_STACK].indexOf(mode) >= 0;
		}
		private verifyLabelMaxWidth(value:number):boolean
		{
			return value > 0;
		}
		
		private heightColumnsGroupCallback():void
		{
			if (!this.sortColumn.getInternalColumn())
			{
				var columns = this.heightColumns.getObjects(IAttributeColumn);
				if (columns.length)
					this.sortColumn.requestLocalObjectCopy(columns[0]);
			}
		}
		
		// this is a way to get the number of keys (bars or groups of bars) shown
		public get maxTickMarks():int
		{
			if (this.groupBySortColumn.value)
				return this._binnedSortColumn.numberOfBins;
			return this._filteredKeySet.keys.length;
		}
		
		private sortBins():void
		{
			if (!this.groupBySortColumn.value)
				return;
			var colorChanged:boolean = Weave.detectChange(this.sortBins, this.colorColumn, this._colorColumnStatsWatcher);
			var binsChanged:boolean = Weave.detectChange(this.sortBins, this._binnedSortColumn);
			
			if (colorChanged)
			{
				// find internal color column, then use its internal column
				var column:IAttributeColumn = this.colorColumn;
				while (column)
				{
					if (Weave.IS(column, ColorColumn))
					{
						column = (column as ColorColumn).internalDynamicColumn;
						break;
					}
					if (Weave.IS(column, IColumnWrapper))
						column = (column as IColumnWrapper).getInternalColumn();
				}
				this._colorColumnStatsWatcher.target = column ? WeaveAPI.StatisticsCache.getColumnStatistics(column) : null;
				this._sortCopyByColor = SortedKeySet.generateSortCopyFunction([column]);
			}
			
			if (colorChanged || binsChanged)
			{
				this._sortedKeysByBinIndex.clear();
				for (var i:int = 0; i < this._binnedSortColumn.numberOfBins; i++)
					this._sortedKeysByBinIndex.set(i, this._sortCopyByColor(this._binnedSortColumn.getKeysFromBinIndex(i)));
			}
		}
				
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (!Weave.IS(task.asyncState, Function))
			{
				// these variables are used to save state between function calls
				var _barSpacing:number;
				var _heightColumns:IAttributeColumn[];
				var _posErrCols:IAttributeColumn[];
				var _negErrCols:IAttributeColumn[];
				var _errorIsRelative:boolean;
				var _groupingMode:string;
				var _horizontalMode:boolean;
				var _groupBySortColumn:boolean;
				var reverseOrder:boolean;
				var showErrorBars:boolean;
				var clipRectangle:Rectangle = new Rectangle();
				var graphics:Graphics = task.buffer;
				var count:int;
				var numHeightColumns:int;
				var shouldDrawValueLabel:boolean;
				var shouldDrawLabel:boolean;
				
				task.asyncState = ():number =>
				{
					if (task.iteration == 0)
					{
						// save local copies of these values to speed up calculations
						_barSpacing = this.barSpacing.value;
						_heightColumns = this.heightColumns.getObjects();
						_posErrCols = this.positiveErrorColumns.getObjects();
						_negErrCols = this.negativeErrorColumns.getObjects();
						_errorIsRelative = this.errorIsRelative.value;
						_groupingMode = this.getActualGroupingMode();
						_horizontalMode = this.horizontalMode.value;
						_groupBySortColumn = this.groupBySortColumn.value;
						reverseOrder = _groupingMode == CompoundBarChartPlotter.GROUP && _horizontalMode;
						if (reverseOrder)
						{
							_heightColumns.reverse();
							_posErrCols.reverse();
							_negErrCols.reverse();
						}
						this.sortBins(); // make sure group-by-sort will work properly
						
						showErrorBars = _groupingMode == CompoundBarChartPlotter.GROUP || _heightColumns.length == 1;
						
						LinkableTextFormat.defaultTextFormat.copyTo(this._bitmapText.textFormat);
						
						// BEGIN template code for defining a drawPlot() function.
						//---------------------------------------------------------
						task.screenBounds.getRectangle(clipRectangle, true);
						clipRectangle.width++; // avoid clipping lines
						clipRectangle.height++; // avoid clipping lines
						count = 0;
						numHeightColumns = _heightColumns.length;
						shouldDrawValueLabel = this.showValueLabels.value;
						shouldDrawLabel = this.showLabels.value && (numHeightColumns >= 1) && (!!this.labelColumn.getInternalColumn() || _groupingMode == CompoundBarChartPlotter.GROUP);
					}
					
					if (task.iteration < task.recordKeys.length)
					{
						var recordKey:IQualifiedKey = task.recordKeys[task.iteration];
						
						//-------------------------------
						// BEGIN code to draw one record
						//-------------------------------
						graphics.clear();
						
						// y coordinates depend on height columns
						var yMin:number = 0; // start first bar at zero
						var yMax:number = 0;
						var yNegativeMin:number = 0;
						var yNegativeMax:number = 0;
						
						// x coordinates depend on sorted index
						var sortedIndex:number;
						if (_groupBySortColumn)
							sortedIndex = this._binnedSortColumn.getValueFromKey(recordKey, Number);
						else
							sortedIndex = this._sortedIndexColumn.getValueFromKey(recordKey, Number);
						
						var spacing:number = StandardLib.constrain(_barSpacing, 0, 1) / 2; // max distance between bar groups is 0.5 in data coordinates
						var xMin:number = sortedIndex - (0.5 - spacing / 2);
						var xMax:number = sortedIndex + (0.5 - spacing / 2);
						
						var recordWidth:number = xMax - xMin;
						var barWidth:number = _groupingMode == CompoundBarChartPlotter.GROUP ? recordWidth / numHeightColumns : recordWidth;
						if (_groupBySortColumn)
						{
							var keysInBin:IQualifiedKey[] = this._sortedKeysByBinIndex.get(sortedIndex);
							if (keysInBin)
							{
								var index:int = keysInBin.indexOf(recordKey);
								recordWidth /= keysInBin.length;
								barWidth /= keysInBin.length;
								xMin += index * recordWidth;
								xMax = xMin + recordWidth;
							}
						}
						
						var totalHeight:number = 0;
						for (var hCount:int = 0; hCount < _heightColumns.length; hCount++)
						{
							var column:IAttributeColumn = _heightColumns[hCount];
							var h:number = column.getValueFromKey(recordKey, Number);
							
							if (isNaN(h))
								continue;
							
							if (this.colorIndicatesDirection.value)
								h = Math.abs(h);
							
							totalHeight = totalHeight + h;
						}
						
						// loop over height columns, incrementing y coordinates
						for (var i:int = 0; i < _heightColumns.length; i++)
						{
							//------------------------------------
							// BEGIN code to draw one bar segment
							//------------------------------------
							var heightColumn:IAttributeColumn = _heightColumns[i] as IAttributeColumn;
							// add this height to the current bar
							var height:number = heightColumn.getValueFromKey(recordKey, Number);
							var heightMissing:boolean = isNaN(height);
							if (heightMissing)
							{
								// if height is missing, use mean value unless we're in 100% stacked mode
								if (this.stackedMissingDataGap.value && _groupingMode != CompoundBarChartPlotter.PERCENT_STACK)
									height = WeaveAPI.StatisticsCache.getColumnStatistics(heightColumn).getMean();
							}
							if (isNaN(height)) // check again because getMean may return NaN
								height = 0;
							
							var color:number;
							if (this.colorIndicatesDirection.value)
							{
								color = this.chartColors.getColorFromNorm(height < 0 ? 0 : 1)
								height = Math.abs(height);
							}
							else if (_heightColumns.length == 1)
							{
								color = this.colorColumn.getValueFromKey(recordKey, Number);
							}
							else
							{
								var colorNorm:number = i / (_heightColumns.length - 1);
								if (reverseOrder)
									colorNorm = 1 - colorNorm;
								color = this.chartColors.getColorFromNorm(colorNorm);
							}
							
							if (height >= 0)
							{
								//normalizing to 100% stack
								if (_groupingMode == CompoundBarChartPlotter.PERCENT_STACK && totalHeight)
									yMax = yMin + (100 / totalHeight * height);
								else
									yMax = yMin + height;
							}
							else
							{
								if (_groupingMode == CompoundBarChartPlotter.PERCENT_STACK && totalHeight)
									yNegativeMax = yNegativeMin + (100 / totalHeight * height);
								else
									yNegativeMax = yNegativeMin + height;
							}
							
							if (!heightMissing)
							{
								// draw graphics
								
								var barStart:number = xMin;
								if (_groupingMode == CompoundBarChartPlotter.GROUP)
									barStart += i / numHeightColumns * recordWidth;
								var barEnd:number = barStart + barWidth;
								
								if (height >= 0)
								{
									// project data coordinates to screen coordinates
									if (_horizontalMode)
									{
										this.tempPoint.x = yMin; // swapped
										this.tempPoint.y = barStart;
									}
									else
									{
										this.tempPoint.x = barStart;
										this.tempPoint.y = yMin;
									}
								}
								else
								{
									if (_horizontalMode)
									{
										this.tempPoint.x = yNegativeMax; // swapped
										this.tempPoint.y = barStart;
									}
									else
									{
										this.tempPoint.x = barStart;
										this.tempPoint.y = yNegativeMax;
									}
								}
								this.tempBounds.setMinPoint(this.tempPoint);
								
								if (height >= 0)
								{
									if (_horizontalMode)
									{
										this.tempPoint.x = yMax; // swapped
										this.tempPoint.y = barEnd;
									}
									else
									{
										this.tempPoint.x = barEnd;
										this.tempPoint.y = yMax;
									}
								}
								else
								{
									if (_horizontalMode)
									{
										this.tempPoint.x = yNegativeMin; // swapped
										this.tempPoint.y = barEnd;
									}
									else
									{
										this.tempPoint.x = barEnd;
										this.tempPoint.y = yNegativeMin;
									}
								}
								this.tempBounds.setMaxPoint(this.tempPoint);
								
								task.dataBounds.projectCoordsTo(this.tempBounds, task.screenBounds);
								
								//////////////////////////
								// BEGIN draw graphics
								//////////////////////////

								if (isFinite(color))
									graphics.beginFill(color, 1);
								this.line.beginLineStyle(recordKey, graphics);
								if (this.tempBounds.getHeight() == 0)
									DrawUtils.clearLineStyle(graphics);
								
								graphics.drawRect(this.tempBounds.getXMin(), this.tempBounds.getYMin(), this.tempBounds.getWidth(), this.tempBounds.getHeight());
								
								graphics.endFill();
								
								if (showErrorBars)
								{
									//------------------------------------
									// BEGIN code to draw one error bar
									//------------------------------------
									var positiveError:IAttributeColumn = _posErrCols.length > i ? _posErrCols[i] : null;
									var negativeError:IAttributeColumn = _negErrCols.length > i ? _negErrCols[i] : null;
									var errorPlusVal:number = positiveError ? positiveError.getValueFromKey(recordKey, Number) : NaN;
									var errorMinusVal:number = negativeError ? negativeError.getValueFromKey(recordKey, Number) : NaN;
									if (isFinite(errorPlusVal) && isFinite(errorMinusVal))
									{
										var center:number = (barStart + barEnd) / 2;
										var width:number = barEnd - barStart; 
										var left:number = center - width / 4;
										var right:number = center + width / 4;
										var top:number;
										var bottom:number;
										if (!_errorIsRelative)
										{
											top = errorPlusVal;
											bottom = errorMinusVal;
										}
										else if (height >= 0)
										{
											top = yMax + errorPlusVal;
											bottom = yMax - errorMinusVal;
										}
										else
										{
											top = yNegativeMax + errorPlusVal;
											bottom = yNegativeMax - errorMinusVal;
										}
										if (top != bottom)
										{
											var coords:number[] = []; // each pair of 4 numbers represents a line segment to draw
											if (!_horizontalMode)
											{
												coords.push(left, top, right, top);
												coords.push(center, top, center, bottom);
												coords.push(left, bottom, right, bottom);
											}
											else
											{
												coords.push(top, left, top, right);
												coords.push(top, center, bottom, center);
												coords.push(bottom, left, bottom, right);
											}
											
											// BEGIN DRAW
											this.line.beginLineStyle(recordKey, graphics);
											for (var iCoord:int = 0; iCoord < coords.length; iCoord += 2) // loop over x,y coordinate pairs
											{
												this.tempPoint.x = coords[iCoord];
												this.tempPoint.y = coords[iCoord + 1];
												task.dataBounds.projectPointTo(this.tempPoint, task.screenBounds);
												if (iCoord % 4 == 0) // every other pair
													graphics.moveTo(this.tempPoint.x, this.tempPoint.y);
												else
													graphics.lineTo(this.tempPoint.x, this.tempPoint.y);
											}
											// END DRAW
										}
									}
									//------------------------------------
									// END code to draw one error bar
									//------------------------------------
								}

								//////////////////////////
								// END draw graphics
								//////////////////////////
							}
							//------------------------------------
							// END code to draw one bar segment
							//------------------------------------
							
							//------------------------------------
							// BEGIN code to draw one bar value label (directly to BitmapData) 
							//------------------------------------
							if (shouldDrawValueLabel && !heightMissing)
							{
								this._bitmapText.text = heightColumn.getValueFromKey(recordKey, String);
								
								var valueLabelPos:number = this.valueLabelDataCoordinate.value;
								if (!isFinite(valueLabelPos))
									valueLabelPos = (height >= 0) ? yMax : yNegativeMax;
								
								// For stack and percent stack bar charts, draw value label in the middle of each segment
								if (_heightColumns.length > 1 && _groupingMode != CompoundBarChartPlotter.GROUP)
								{
									if (height >= 0)
										valueLabelPos = (yMin + yMax) / 2;
									else
										valueLabelPos = (yNegativeMin + yNegativeMax) / 2;
								}
								
								if (!_horizontalMode)
								{
									this.tempPoint.x = (barStart + barEnd) / 2;
									this.tempPoint.y = valueLabelPos;
									this._bitmapText.angle = 270;
								}
								else
								{
									this.tempPoint.x = valueLabelPos;
									this.tempPoint.y = (barStart + barEnd) / 2;
									this._bitmapText.angle = 0;
								}
								
								task.dataBounds.projectPointTo(this.tempPoint, task.screenBounds);
								this._bitmapText.x = this.tempPoint.x;
								this._bitmapText.y = this.tempPoint.y;
								this._bitmapText.maxWidth = this.valueLabelMaxWidth.value;
								this._bitmapText.verticalAlign = this.valueLabelVerticalAlign.value;
								this._bitmapText.horizontalAlign = this.valueLabelHorizontalAlign.value;
														
								if (isFinite(this.valueLabelRelativeAngle.value))
									this._bitmapText.angle += this.valueLabelRelativeAngle.value;
								
								if (this.recordValueLabelColoring.value)
									this._bitmapText.textFormat.color = color;
								else
									this._bitmapText.textFormat.color = this.valueLabelColor.value;
								
								TextGlyphPlotter.drawInvisibleHalo(this._bitmapText, task);
								this._bitmapText.draw(task.buffer);
							}
							//------------------------------------
							// END code to draw one bar value label (directly to BitmapData)
							//------------------------------------
							
							//------------------------------------
							// BEGIN code to draw one label using labelColumn (or column title if grouped)
							//------------------------------------
							// avoid drawing duplicate overlapping labels
							if (shouldDrawLabel && !heightMissing && (i == 0 || _groupingMode == CompoundBarChartPlotter.GROUP))
							{
								if (_groupingMode == CompoundBarChartPlotter.GROUP)
									this._bitmapText.text = ColumnUtils.getTitle(heightColumn);
								else
									this._bitmapText.text = this.labelColumn.getValueFromKey(recordKey, String);
								
								try
								{
									this._bitmapText.text = this.labelFormatter.apply(null, [this._bitmapText.text, heightColumn]);
								}
								catch (e)
								{
									this._bitmapText.text = '';
								}
		
								var labelPos:number = this.labelDataCoordinate.value;
								if (_horizontalMode)
								{
									if (isNaN(labelPos))
										labelPos = task.dataBounds.getXMin();

									this.tempPoint.x = labelPos;
									this.tempPoint.y = (barStart + barEnd) / 2;
									this._bitmapText.angle = 0;
								}
								else
								{
									if (isNaN(labelPos))
										labelPos = task.dataBounds.getYMin();
									this.tempPoint.x = (barStart + barEnd) / 2;
									this.tempPoint.y = labelPos;
									this._bitmapText.angle = 270;
								}
								
								task.dataBounds.projectPointTo(this.tempPoint, task.screenBounds);
								this._bitmapText.x = this.tempPoint.x;
								this._bitmapText.y = this.tempPoint.y;
								this._bitmapText.maxWidth = this.labelMaxWidth.value;
								if (isFinite(this.labelRelativeAngle.value))
									this._bitmapText.angle += this.labelRelativeAngle.value;
								this._bitmapText.verticalAlign = this.labelVerticalAlign.value;
								this._bitmapText.horizontalAlign = this.labelHorizontalAlign.value;
								
								if (this.recordLabelColoring.value)
									this._bitmapText.textFormat.color = color;
								else
									this._bitmapText.textFormat.color = this.labelColor.value;
								
								TextGlyphPlotter.drawInvisibleHalo(this._bitmapText, task);
								this._bitmapText.draw(task.buffer);
							}
							//------------------------------------
							// END code to draw one label using labelColumn
							//------------------------------------
		
							// update min values for next loop iteration
							if (_groupingMode != CompoundBarChartPlotter.GROUP)
							{
								// the next bar starts on top of this bar
								if (height >= 0)
									yMin = yMax;
								else
									yNegativeMin = yNegativeMax;
							}
						}
						//-----------------------------
						// END code to draw one record
						//-----------------------------
						return task.iteration / task.recordKeys.length;
					}
					
					return 1; // avoids divide-by-zero when there are no record keys
				}; // end task function
			} // end if
			
			return (task.asyncState as Function).apply(this, arguments);
		}
		
		private _bitmapText:BitmapText = new BitmapText();		
		
		/**
		 * This function takes into account whether or not there is only a single height column specified.
		 * @return The actual grouping mode, which may differ from the session state of the groupingMode variable.
		 */
		public getActualGroupingMode():string
		{
			return this.heightColumns.getNames().length == 1 ? CompoundBarChartPlotter.STACK : this.groupingMode.value;
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var bounds:Bounds2D = this.initBoundsArray(output);
			var _groupingMode:string = this.getActualGroupingMode();
			var _groupBySortColumn:boolean = this.groupBySortColumn.value;
			var _heightColumns:IAttributeColumn[] = this.heightColumns.getObjects();
			var _posErrCols:IAttributeColumn[] = this.positiveErrorColumns.getObjects();
			var _negErrCols:IAttributeColumn[] = this.negativeErrorColumns.getObjects();
			_posErrCols.length = _heightColumns.length;
			_negErrCols.length = _heightColumns.length;
			var showErrorBars:boolean = _groupingMode == CompoundBarChartPlotter.GROUP || _heightColumns.length == 1;
			this.sortBins(); // make sure group-by-sort will work properly
			
			// bar position depends on sorted index
			var sortedIndex:number;
			if (_groupBySortColumn)
				sortedIndex = this._binnedSortColumn.getValueFromKey(recordKey, Number);
			else
				sortedIndex = this._sortedIndexColumn.getValueFromKey(recordKey, Number);
			//var spacing:number = StandardLib.constrain(barSpacing.value, 0, 1) / 2; // max distance between bar groups is 0.5 in data coordinates
			var spacing:number = 0;
			var minPos:number = sortedIndex - 0.5 + spacing / 2;
			var maxPos:number = sortedIndex + 0.5 - spacing / 2;
			var recordWidth:number = maxPos - minPos;
			// if grouping by sort column with more than one height column, don't attempt to separate the bounds for each record.
			if (_groupBySortColumn)
			{
				// separate the bounds for each record when grouping by sort column
				var keysInBin = this._sortedKeysByBinIndex.get(sortedIndex); // already sorted
				if (keysInBin)
				{
					var index:int = keysInBin.indexOf(recordKey);
					recordWidth /= keysInBin.length;
					minPos = minPos + index * recordWidth;
					maxPos = minPos + recordWidth;
				}
			}
			// this bar is between minPos and maxPos in the x or y range
			if (this.horizontalMode.value)
				bounds.setYRange(minPos, maxPos);
			else
				bounds.setXRange(minPos, maxPos);
			
			this.tempRange.setRange(0, 0); // bar starts at zero
			
			
			var allMissing:boolean = true;
			for (var i:int = 0; i < _heightColumns.length; i++)
			{
				var column:IAttributeColumn = _heightColumns[i];
				var height:number = column.getValueFromKey(recordKey, Number);
				if (this.colorIndicatesDirection.value)
					height = Math.abs(height);
				if (isFinite(height))
				{
					// not all missing
					allMissing = false;
				}
				else if (_heightColumns.length > 1 && this.stackedMissingDataGap.value)
				{
					// use mean value for missing data gap
					height = WeaveAPI.StatisticsCache.getColumnStatistics(column).getMean();
					if (this.colorIndicatesDirection.value)
						height = Math.abs(height);
				}

				var positiveError:IAttributeColumn = _posErrCols[i];
				var negativeError:IAttributeColumn = _negErrCols[i];
				if (showErrorBars && positiveError && negativeError)
				{
					var errorPlus:number = positiveError.getValueFromKey(recordKey, Number);
					var errorMinus:number = -negativeError.getValueFromKey(recordKey, Number);
					if (height > 0 && errorPlus > 0)
						height += errorPlus;
					if (height < 0 && errorMinus < 0)
						height += errorMinus;
				}
				if (_groupingMode == CompoundBarChartPlotter.GROUP)
				{
					this.tempRange.includeInRange(height);
				}
				else
				{
					if (height > 0)
						this.tempRange.end += height;
					if (height < 0)
						this.tempRange.begin += height;
				}
			}
			
			// if max value is zero, flip direction so negative bars go downward
			if (this.tempRange.end == 0)
				this.tempRange.setRange(this.tempRange.end, this.tempRange.begin);
			
			if (allMissing)
				this.tempRange.setRange(NaN, NaN);
			
			if (allMissing && this.zoomToSubsetBars.value)
			{
				bounds.reset();
			}
			else
			{
				if (_groupingMode == CompoundBarChartPlotter.PERCENT_STACK)
				{
					this.tempRange.begin = 0;
					this.tempRange.end = 100;
				}
				
				if (this.horizontalMode.value) // x range
					bounds.setXRange(this.tempRange.begin, this.tempRange.end);
				else // y range
					bounds.setYRange(this.tempRange.begin, this.tempRange.end);
			}
		}
		
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			if (this.zoomToSubset.value)
			{
				output.reset();
			}
			else
			{
				this.tempRange.setRange(0, 0);
				var _heightColumns:IAttributeColumn[] = this.heightColumns.getObjects();
				var _posErrCols:IAttributeColumn[] = this.positiveErrorColumns.getObjects();
				var _negErrCols:IAttributeColumn[] = this.negativeErrorColumns.getObjects();
				_posErrCols.length = _heightColumns.length;
				_negErrCols.length = _heightColumns.length;
				var _groupingMode:string = this.getActualGroupingMode();
				var showErrorBars:boolean = _groupingMode == CompoundBarChartPlotter.GROUP || _heightColumns.length == 1;
				for (var i:int = 0; i < _heightColumns.length; i++)
				{
					var column:IAttributeColumn = _heightColumns[i];
					if (_groupingMode == CompoundBarChartPlotter.PERCENT_STACK)
					{
						this.tempRange.begin = 0;
						this.tempRange.end = 100;
					}
					else
					{
						var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
						var max:number = stats.getMax();
						var min:number = stats.getMin();
						if (this.colorIndicatesDirection.value)
						{
							// Note: does not consider all possibilities with error bars
							min = max = Math.max(Math.abs(min), Math.abs(max));
						}
						var positiveError:IAttributeColumn = _posErrCols[i];
						var negativeError:IAttributeColumn = _negErrCols[i];
						if (showErrorBars && positiveError && negativeError)
						{
							var errorMax:number = WeaveAPI.StatisticsCache.getColumnStatistics(positiveError).getMax();
							var errorMin:number = -WeaveAPI.StatisticsCache.getColumnStatistics(negativeError).getMax();
							if (max > 0 && errorMax > 0)
								max += errorMax;
							if (min < 0 && errorMin < 0)
								min += errorMin;
						}
						
						if (_groupingMode == CompoundBarChartPlotter.GROUP)
						{
							this.tempRange.includeInRange(min);
							this.tempRange.includeInRange(max);
						}
						else
						{
							if (max > 0)
								this.tempRange.end += max;
							if (min < 0)
								this.tempRange.begin += min;
						}
					}
				}
				
				if (this.horizontalMode.value) // x range
					output.setBounds(this.tempRange.begin, NaN, this.tempRange.end, NaN);
				else // y range
					output.setBounds(NaN, this.tempRange.begin, NaN, this.tempRange.end);
			}
		}
		
		
		
		
		private tempRange:Range = new Range(); // reusable temporary object
		private tempPoint:Point = new Point(); // reusable temporary object
		private tempBounds:Bounds2D = new Bounds2D(); // reusable temporary object
		
		// backwards compatibility
		/*[Deprecated(replacement='groupingMode')] public set groupMode(value:boolean):void { groupingMode.value = value ? GROUP : STACK; }
		[Deprecated(replacement="positiveErrorColumns")] public set positiveError(dynamicState:Object):void
		{
			dynamicState.objectName = positiveErrorColumns.generateUniqueName(dynamicState.className);
			positiveErrorColumns.setSessionState([dynamicState], false);
		}
		[Deprecated(replacement="negativeErrorColumns")] public set negativeError(dynamicState:Object):void
		{
			dynamicState.objectName = negativeErrorColumns.generateUniqueName(dynamicState.className);
			negativeErrorColumns.setSessionState([dynamicState], false);
		}
		[Deprecated(replacement="line")] public set lineStyle(value:Object):void
		{
			try
			{
				Weave.setState(line, value[0][DynamicState.SESSION_STATE]);
			}
			catch (e)
			{
				console.error(e);
			}
		}*/
	}
}

