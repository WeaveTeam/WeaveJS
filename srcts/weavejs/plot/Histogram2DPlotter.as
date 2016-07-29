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
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import WeaveProperties = weavejs.app.WeaveProperties;

	/**
	 * This plotter displays a 2D histogram with optional colors.
	 */
	export class Histogram2DPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		public constructor()
		{
			super();
			this.colorColumn.targetPath = [WeaveProperties.DEFAULT_COLOR_COLUMN];

			this.setColumnKeySources([this.xColumn, this.yColumn]);
			this.addSpatialDependencies(this.xBinnedColumn, this.yBinnedColumn);
		}
		
		public getSelectableAttributeNames()
		{
			var array = ["X", "Y"];
			if (this.showAverageColorData.value)
				array.push("Color");
			return array;
		}
		public getSelectableAttributes()
		{
			var array = [this.xColumn, this.yColumn];
			if (this.showAverageColorData.value)
				array.push(this.colorColumn);
			return array;
		}
		
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public binColors:ColorRamp = Weave.linkableChild(this, new ColorRamp("0xFFFFFF,0x000000"));
		
		public xBinnedColumn:BinnedColumn = Weave.linkableChild(this, BinnedColumn);
		public yBinnedColumn:BinnedColumn = Weave.linkableChild(this, BinnedColumn);
		private xDataStats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(this.xBinnedColumn.internalDynamicColumn);
		private yDataStats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(this.yBinnedColumn.internalDynamicColumn);

		public showAverageColorData:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		public colorColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);

		public get xColumn():DynamicColumn { return this.xBinnedColumn.internalDynamicColumn; }
		public get yColumn():DynamicColumn { return this.yBinnedColumn.internalDynamicColumn; }
		
		private keyToCellMap:WeakMap<IQualifiedKey, string> = new WeakMap();
		private xBinWidth:number;
		private yBinWidth:number;
		private maxBinSize:int;
		
		private tempPoint:Point = new Point();
		private tempBounds:Bounds2D = new Bounds2D();

		private validate():void
		{
			if (Weave.detectChange(this.validate, this.filteredKeySet, this.xBinnedColumn, this.yBinnedColumn, this.xDataStats, this.yDataStats))
			{
				var cellSizes:Map<string, number> = new Map();
				this.keyToCellMap = new WeakMap();
				this.maxBinSize = 0;
				
				for (var key of this._filteredKeySet.keys)
				{
					var xCell:int = this.xBinnedColumn.getValueFromKey(key, Number);
					var yCell:int = this.yBinnedColumn.getValueFromKey(key, Number);
					var cell:string = xCell + "," + yCell;
					
					this.keyToCellMap.set(key, cell);
					
					var size:int = (cellSizes.get(cell) | 0) + 1;
					cellSizes.set(cell, size);
					this.maxBinSize = Math.max(this.maxBinSize, size);
				}
				
				this.xBinWidth = (this.xDataStats.getMax() - this.xDataStats.getMin()) / this.xBinnedColumn.numberOfBins;
				this.yBinWidth = (this.yDataStats.getMax() - this.yDataStats.getMin()) / this.yBinnedColumn.numberOfBins;
			}
		}
		
		/**
		 * This draws the 2D histogram bins that a list of record keys fall into.
		 */
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			this.drawAll(task.recordKeys, task.dataBounds, task.screenBounds, task.buffer);
			return 1;
		}
		private drawAll(recordKeys:IQualifiedKey[], dataBounds:Bounds2D, screenBounds:Bounds2D, graphics:Graphics):void
		{
			this.validate();
			if (isNaN(this.xBinWidth) || isNaN(this.yBinWidth))
				return;
			
			var colorCol:ColorColumn = Weave.AS(this.colorColumn.getInternalColumn(), ColorColumn);
			var binCol:BinnedColumn = colorCol ? Weave.AS(colorCol.getInternalColumn(), BinnedColumn) : null;
			var dataCol:IAttributeColumn = binCol ? binCol.internalDynamicColumn : null;
			var ramp:ColorRamp = this.showAverageColorData.value && colorCol ? colorCol.ramp : this.binColors;
			
			// get a list of unique cells so each cell is only drawn once.
			var cells:{[cell:string]:IQualifiedKey[]} = {};
			var cell:string;
			var keys:IQualifiedKey[];
			for (var key of recordKeys)
			{
				cell = this.keyToCellMap.get(key);
				keys = cells[cell];
				if (!keys)
					cells[cell] = keys = [];
				keys.push(key);
			}
			
			// draw the cells
			for (cell in cells)
			{
				var cellIds = cell.split(",");
				var xKeyID:int = (+cellIds[0] | 0);
				var yKeyID:int = (+cellIds[1] | 0);
				
				keys = cells[cell];
				
				this.tempPoint.x = xKeyID - 0.5;
				this.tempPoint.y = yKeyID - 0.5;
				dataBounds.projectPointTo(this.tempPoint, screenBounds);
				this.tempBounds.setMinPoint(this.tempPoint);
				this.tempPoint.x = xKeyID + 0.5;
				this.tempPoint.y = yKeyID + 0.5;
				dataBounds.projectPointTo(this.tempPoint, screenBounds);
				this.tempBounds.setMaxPoint(this.tempPoint);
				
				// draw rectangle for bin
				this.lineStyle.beginLineStyle(null, graphics);
				
				var norm:number = keys.length / this.maxBinSize;
				
				if (this.showAverageColorData.value)
				{
					var sum:number = 0;
					for (key of keys)
						sum += dataCol.getValueFromKey(key, Number);
					var dataValue:number = sum / keys.length;
					//norm = StandardLib.normalize(dataValue, dataMin, dataMax);
					norm = binCol.getBinIndexFromDataValue(dataValue) / (binCol.numberOfBins - 1);
				}
				
				var color:number = ramp.getColorFromNorm(norm);
				if (isFinite(color))
					graphics.beginFill(color, 1);
				else
					graphics.endFill();
				
				graphics.drawRect(this.tempBounds.getXMin(), this.tempBounds.getYMin(), this.tempBounds.getWidth(), this.tempBounds.getHeight());
				graphics.endFill();
			}
		}
		
		/**
		 * This function returns the collective bounds of all the bins.
		 */
		/*override*/ public getBackgroundDataBounds(output:Bounds2D):void
		{
			if (this.xBinnedColumn.getInternalColumn() != null && this.yBinnedColumn.getInternalColumn() != null)
				output.setBounds(-0.5, -0.5, this.xBinnedColumn.numberOfBins - 0.5, this.yBinnedColumn.numberOfBins -0.5);
			else
				output.reset();
		}
		
		/**
		 * This gets the data bounds of the histogram bin that a record key falls into.
		 */
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			this.initBoundsArray(output);
			if (this.xBinnedColumn.getInternalColumn() == null || this.yBinnedColumn.getInternalColumn() == null)
				return;
			
			this.validate();
			
			var shapeKey:string = this.keyToCellMap.get(recordKey);
			
			if (shapeKey == null)
				return;
			
			var temp = shapeKey.split(",");
			
			var xKey:int = +temp[0] | 0;
			var yKey:int = +temp[1] | 0;
			
			var xMin:number = xKey - 0.5; 
			var yMin:number = yKey - 0.5;
			var xMax:number = xKey + 0.5; 
			var yMax:number = yKey + 0.5;
			
			(output[0] as Bounds2D).setBounds(xMin,yMin,xMax,yMax);
		}
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, Histogram2DPlotter, "Histogram 2D");
}

