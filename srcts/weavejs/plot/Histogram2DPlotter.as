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
		import Dictionary = flash.utils.Dictionary;
		
		import IAttributeColumn = weavejs.api.data.IAttributeColumn;
		import IColumnStatistics = weavejs.api.data.IColumnStatistics;
		import IQualifiedKey = weavejs.api.data.IQualifiedKey;
		import Bounds2D = weavejs.geom.Bounds2D;
		import IPlotTask = weavejs.api.ui.IPlotTask;
		import IPlotter = weavejs.api.ui.IPlotter;
		import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
		import LinkableBoolean = weavejs.core.LinkableBoolean;
		import BinnedColumn = weavejs.data.column.BinnedColumn;
		import ColorColumn = weavejs.data.column.ColorColumn;
		import DynamicColumn = weavejs.data.column.DynamicColumn;
		import Bounds2D = weavejs.geom.Bounds2D;
		import ColorRamp = weavejs.util.ColorRamp;
		import SolidLineStyle = weavejs.geom.SolidLineStyle;
		
		/**
		 * This plotter displays a 2D histogram with optional colors.
		 */
		public class Histogram2DPlotter extends AbstractPlotter implements ISelectableAttributes
		{
			WeaveAPI.ClassRegistry.registerImplementation(IPlotter, Histogram2DPlotter, "Histogram 2D");
			
			public function Histogram2DPlotter()
			{
				colorColumn.globalName = Weave.DEFAULT_COLOR_COLUMN;

				setColumnKeySources([xColumn, yColumn]);
				this.addSpatialDependencies(this.xBinnedColumn, this.yBinnedColumn);
			}
			
			public function getSelectableAttributeNames():Array
			{
				var array:Array = ["X", "Y"];
				if (showAverageColorData.value)
					array.push("Color");
				return array;
			}
			public function getSelectableAttributes():Array
			{
				var array:Array = [xColumn, yColumn];
				if (showAverageColorData.value)
					array.push(colorColumn);
				return array;
			}
			
			public const lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
			public const binColors:ColorRamp = Weave.linkableChild(this, new ColorRamp("0xFFFFFF,0x000000"));
			
			public const xBinnedColumn:BinnedColumn = Weave.linkableChild(this, BinnedColumn);
			public const yBinnedColumn:BinnedColumn = Weave.linkableChild(this, BinnedColumn);
			private const xDataStats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(xBinnedColumn.internalDynamicColumn);
			private const yDataStats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(yBinnedColumn.internalDynamicColumn);

			public const showAverageColorData:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
			
			public const colorColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);

			public function get xColumn():DynamicColumn { return xBinnedColumn.internalDynamicColumn; }
			public function get yColumn():DynamicColumn { return yBinnedColumn.internalDynamicColumn; }
			
			private var keyToCellMap:Dictionary = new Dictionary(true);
			private var xBinWidth:Number;
			private var yBinWidth:Number;
			private var maxBinSize:int;
			
			private const tempPoint:Point = new Point();
			private const tempBounds:Bounds2D = new Bounds2D();

			private function validate():void
			{
				if (Weave.detectChange(validate, filteredKeySet, xBinnedColumn, yBinnedColumn, xDataStats, yDataStats))
				{
					var cellSizes:Object = {};
					keyToCellMap = new Dictionary(true);
					maxBinSize = 0;
					
					for each (var key:IQualifiedKey in _filteredKeySet.keys)
					{
						var xCell:int = xBinnedColumn.getValueFromKey(key, Number);
						var yCell:int = yBinnedColumn.getValueFromKey(key, Number);
						var cell:String = xCell + "," + yCell;
						
						keyToCellMap[key] = cell;
						
						var size:int = int(cellSizes[cell]) + 1;
						cellSizes[cell] = size;
						maxBinSize = Math.max(maxBinSize, size);
					}
					
					xBinWidth = (xDataStats.getMax() - xDataStats.getMin()) / xBinnedColumn.numberOfBins;
					yBinWidth = (yDataStats.getMax() - yDataStats.getMin()) / yBinnedColumn.numberOfBins;
				}
			}
			
			/**
			 * This draws the 2D histogram bins that a list of record keys fall into.
			 */
			override public function drawPlotAsyncIteration(task:IPlotTask):Number
			{
				drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
				return 1;
			}
			private function drawAll(recordKeys:Array, dataBounds:Bounds2D, screenBounds:Bounds2D, destination:BitmapData):void
			{
				validate();
				if (isNaN(xBinWidth) || isNaN(yBinWidth))
					return;
				
				var colorCol:ColorColumn = colorColumn.getInternalColumn() as ColorColumn;
				var binCol:BinnedColumn = colorCol ? colorCol.getInternalColumn() as BinnedColumn : null;
				var dataCol:IAttributeColumn = binCol ? binCol.internalDynamicColumn : null;
				var ramp:ColorRamp = showAverageColorData.value && colorCol ? colorCol.ramp : this.binColors;
				
				var graphics:Graphics = tempShape.graphics;
				graphics.clear();
				
				// get a list of unique cells so each cell is only drawn once.
				var cells:Object = {};
				var cell:String;
				var keys:Array;
				for each (var key:IQualifiedKey in recordKeys)
				{
					cell = keyToCellMap[key];
					keys = cells[cell];
					if (!keys)
						cells[cell] = keys = [];
					keys.push(key);
				}
				
				// draw the cells
				for (cell in cells)
				{
					var cellIds:Array = cell.split(",");
					var xKeyID:int = int(cellIds[0]);
					var yKeyID:int = int(cellIds[1]);
					
					keys = cells[cell] as Array;
					
					tempPoint.x = xKeyID - 0.5;
					tempPoint.y = yKeyID - 0.5;
					dataBounds.projectPointTo(tempPoint, screenBounds);
					tempBounds.setMinPoint(tempPoint);
					tempPoint.x = xKeyID + 0.5;
					tempPoint.y = yKeyID + 0.5;
					dataBounds.projectPointTo(tempPoint, screenBounds);
					tempBounds.setMaxPoint(tempPoint);
					
					// draw rectangle for bin
					lineStyle.beginLineStyle(null, graphics);
					
					var norm:Number = keys.length / maxBinSize;
					
					if (showAverageColorData.value)
					{
						var sum:Number = 0;
						for each (key in keys)
							sum += dataCol.getValueFromKey(key, Number);
						var dataValue:Number = sum / keys.length;
						//norm = StandardLib.normalize(dataValue, dataMin, dataMax);
						norm = binCol.getBinIndexFromDataValue(dataValue) / (binCol.numberOfBins - 1);
					}
					
					var color:Number = ramp.getColorFromNorm(norm);
					if (isFinite(color))
						graphics.beginFill(color, 1);
					else
						graphics.endFill();
					
					graphics.drawRect(tempBounds.getXMin(), tempBounds.getYMin(), tempBounds.getWidth(), tempBounds.getHeight());
					graphics.endFill();
				}
				destination.draw(tempShape);
			}
			
			/**
			 * This function returns the collective bounds of all the bins.
			 */
			override public function getBackgroundDataBounds(output:Bounds2D):void
			{
				if (xBinnedColumn.getInternalColumn() != null && yBinnedColumn.getInternalColumn() != null)
					output.setBounds(-0.5, -0.5, xBinnedColumn.numberOfBins - 0.5, yBinnedColumn.numberOfBins -0.5);
				else
					output.reset();
			}
			
			/**
			 * This gets the data bounds of the histogram bin that a record key falls into.
			 */
			override public function getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Array):void
			{
				initBoundsArray(output);
				if (xBinnedColumn.getInternalColumn() == null || yBinnedColumn.getInternalColumn() == null)
					return;
				
				validate();
				
				var shapeKey:String = keyToCellMap[recordKey];
				
				if (shapeKey == null)
					return;
				
				var temp:Array = shapeKey.split(",");
				
				var xKey:int = temp[0];
				var yKey:int = temp[1];
				
				var xMin:Number = xKey - 0.5; 
				var yMin:Number = yKey - 0.5;
				var xMax:Number = xKey + 0.5; 
				var yMax:Number = yKey + 0.5;
				
				(output[0] as Bounds2D).setBounds(xMin,yMin,xMax,yMax);
			}
			
		}
	}
