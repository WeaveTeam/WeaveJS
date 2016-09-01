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
	import StandardLib = weavejs.util.StandardLib;
	import IKeySet = weavejs.api.data.IKeySet;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import KeySet = weavejs.data.key.KeySet;
	import PlotTask = weavejs.plot.PlotTask;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import FilteredKeySet = weavejs.data.key.FilteredKeySet;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;
	import Bounds2D = weavejs.geom.Bounds2D;
	
	export class LineChartPlotter extends AbstractPlotter
	{
		public constructor()
		{
			super();
			this.sortedUnfilteredKeys.setColumnKeySources([this.group, this.order, this.dataX, this.dataY]);
			this.setSingleKeySource(this.sortedUnfilteredKeys);
			this.addSpatialDependencies(this.dataX, this.dataY, this.sortedUnfilteredKeys);
		}
		
		public getSelectableAttributeNames()
		{
			return ["X", "Y", "Order", "Group"];
		}
		public getSelectableAttributes()
		{
			return [this.dataX, this.dataY, this.order, this.group];
		}
		
		private sortedUnfilteredKeys:FilteredKeySet = Weave.linkableChild(this, FilteredKeySet);
		
		public dataX:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public dataY:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public group:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
 		public order:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		public useFilteredDataGaps:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if (!Weave.IS(task.asyncState, AsyncState))
				task.asyncState = new AsyncState(this, task, this.sortedUnfilteredKeys);
			return (task.asyncState as AsyncState).iterate();
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var x:number = this.dataX.getValueFromKey(recordKey, Number);
			var y:number = this.dataY.getValueFromKey(recordKey, Number);
			this.initBoundsArray(output).setBounds(x, y, x, y);
		}
	}

	class AsyncState
	{
		public constructor(plotter:LineChartPlotter, task:IPlotTask, unfilteredKeySet:IKeySet)
		{
			this.plotter = plotter;
			this.task = task;
			this.unfilteredKeySet = unfilteredKeySet;
			this.renderer = new AsyncLineRenderer(task.buffer);
			
			if ((task as PlotTask).taskType != PlotTask.TASK_TYPE_SUBSET)
				this.taskKeySet = new Set<IQualifiedKey>();
		}
		
		public renderer:AsyncLineRenderer;
		public plotter:LineChartPlotter;
		public task:IPlotTask;
		public unfilteredKeySet:IKeySet;
		public allKeys:IQualifiedKey[];
		public keyIndex:number;
		public taskKeySet:Set<IQualifiedKey>;
		public group:number;
		
		private static tempPoint:Point = new Point();
		
		public iterate():number
		{
			if (this.task.iteration == 0)
			{
				this.renderer.reset();
				if (this.taskKeySet)
				{
					this.taskKeySet.clear();
					for (let key of this.task.recordKeys)
						this.taskKeySet.add(key);
				}
				this.allKeys = this.plotter.useFilteredDataGaps.value ? this.unfilteredKeySet.keys : this.plotter.filteredKeySet.keys;
				this.keyIndex = 0;
			}
			
			try
			{
				for (; this.keyIndex < this.allKeys.length; this.keyIndex++)
				{
					if (Date.now() > this.task.iterationStopTime)
					{
						return this.keyIndex / this.allKeys.length;
					}
					
					var key:IQualifiedKey = this.allKeys[this.keyIndex];
					
					if (this.taskKeySet ? this.taskKeySet.has(key) : this.plotter.filteredKeySet.containsKey(key))
					{
						AsyncState.tempPoint.x = this.plotter.dataX.getValueFromKey(key, Number);
						AsyncState.tempPoint.y = this.plotter.dataY.getValueFromKey(key, Number);
						
						if (isFinite(AsyncState.tempPoint.x) && isFinite(AsyncState.tempPoint.y))
							this.task.dataBounds.projectPointTo(AsyncState.tempPoint, this.task.screenBounds);
					}
					else
					{
						AsyncState.tempPoint.x = AsyncState.tempPoint.y = NaN;
					}
					
					// if group differs from previous group, use moveTo()
					var newGroup:number = this.plotter.group.getValueFromKey(key, Number);
					if (StandardLib.numericCompare(this.group, newGroup) != 0)
						this.renderer.newLine();
					this.group = newGroup;

					var style = this.plotter.lineStyle.getStyle(key);
					this.renderer.addPoint(AsyncState.tempPoint.x, AsyncState.tempPoint.y, [style.weight, style.color, style.alpha]);
				}
			}
			catch (e)
			{
				console.error(e);
			}
			
			return 1;
		}
	}

	class AsyncLineRenderer
	{
		public constructor(graphics:Graphics)
		{
			this.graphics = graphics;
		}
		
		private graphics:Graphics;
		private prevX:number;
		private prevY:number;
		private continueLine:boolean;
		private prevLineStyle:[number, number, number];
		
		/**
		 * Call this at the beginning of the async task
		 */
		public reset():void
		{
			this.newLine();
		}
		
		/**
		 * Call this before starting a new line
		 */
		public newLine():void
		{
			this.continueLine = false;
		}
		
		/**
		 * Call this for each coordinate in the line, whether the coordinates are defined or not.
		 */
		public addPoint(x:number, y:number, lineStyleParams:[number, number, number]):void
		{
			var isDefined:boolean = isFinite(x) && isFinite(y);
			
			if (isDefined && this.continueLine)
			{
				var midX:number = (this.prevX + x) / 2;
				var midY:number = (this.prevY + y) / 2;
				
				this.graphics.lineStyle.apply(this.graphics, this.prevLineStyle);
				this.graphics.lineTo(midX, midY);
				this.graphics.lineStyle.apply(this.graphics, lineStyleParams);
				this.graphics.lineTo(x, y);
			}
			else
			{
				this.graphics.moveTo(x, y);
			}
			
			this.prevX = x;
			this.prevY = y;
			this.continueLine = isDefined;
			this.prevLineStyle = lineStyleParams;
		}
	}
}
