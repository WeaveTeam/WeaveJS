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
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import FilteredKeySet = weavejs.data.key.FilteredKeySet;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	export class LineChartPlotter extends AbstractPlotter implements ISelectableAttributes
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, LineChartPlotter, "Line Chart");
		
		public constructor()
		{
			sortedUnfilteredKeys.setColumnKeySources([group, order, dataX, dataY]);
			setSingleKeySource(sortedUnfilteredKeys);
			this.addSpatialDependencies(this.dataX, this.dataY, this.sortedUnfilteredKeys);
		}
		
		public getSelectableAttributeNames():Array
		{
			return ["X", "Y", "Order", "Group"];
		}
		public getSelectableAttributes():Array
		{
			return [dataX, dataY, order, group];
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
			if (!(task.asyncState is AsyncState))
				task.asyncState = new AsyncState(this, task, sortedUnfilteredKeys);
			return (task.asyncState as AsyncState).iterate();
		}
		
		/*override*/ public getDataBoundsFromRecordKey(recordKey:IQualifiedKey, output:Bounds2D[]):void
		{
			var x:number = dataX.getValueFromKey(recordKey, Number);
			var y:number = dataY.getValueFromKey(recordKey, Number);
			initBoundsArray(output).setBounds(x, y, x, y);
		}
	}
}

import BitmapData = flash.display.BitmapData;
import Graphics = PIXI.Graphics;
import Shape = flash.display.Shape;
import Point = weavejs.geom.Point;
import getTimer = flash.utils.getTimer;

import ObjectUtil = mx.utils.ObjectUtil;

import IKeySet = weavejs.api.data.IKeySet;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IPlotTask = weavejs.api.ui.IPlotTask;
import KeySet = weavejs.data.key.KeySet;
import PlotTask = weavejs.visualization.layers.PlotTask;
import LineChartPlotter = weavejs.visualization.plotters.LineChartPlotter;

internal class AsyncState
{
	public AsyncState(plotter:LineChartPlotter, task:IPlotTask, unfilteredKeySet:IKeySet)
	{
		this.plotter = plotter;
		this.task = task;
		this.unfilteredKeySet = unfilteredKeySet;
		this.renderer = new AsyncLineRenderer();
		
		if ((task as PlotTask).taskType != PlotTask.TASK_TYPE_SUBSET)
			this.taskKeySet = Weave.disposableChild(plotter, KeySet);
	}
	
	public renderer:AsyncLineRenderer;
	public plotter:LineChartPlotter;
	public task:IPlotTask;
	public unfilteredKeySet:IKeySet;
	public allKeys:Array;
	public keyIndex:number;
	public taskKeySet:KeySet;
	public group:number;
	
	private static tempPoint:Point = new Point();
	
	public iterate():number
	{
		if (task.iteration == 0)
		{
			renderer.reset();
			if (taskKeySet)
			{
				taskKeySet.clearKeys();
				taskKeySet.replaceKeys(task.recordKeys);
			}
			allKeys = plotter.useFilteredDataGaps.value ? unfilteredKeySet.keys : plotter.filteredKeySet.keys;
			keyIndex = 0;
		}
		
		try
		{
			for (; keyIndex < allKeys.length; keyIndex++)
			{
				if (getTimer() > task.iterationStopTime)
				{
					renderer.flush(task.buffer);
					return keyIndex / allKeys.length;
				}
				
				var key:IQualifiedKey = allKeys[keyIndex] as IQualifiedKey;
				
				if (taskKeySet ? taskKeySet.containsKey(key) : plotter.filteredKeySet.containsKey(key))
				{
					tempPoint.x = plotter.dataX.getValueFromKey(key, Number);
					tempPoint.y = plotter.dataY.getValueFromKey(key, Number);
					
					if (isFinite(tempPoint.x) && isFinite(tempPoint.y))
						task.dataBounds.projectPointTo(tempPoint, task.screenBounds);
				}
				else
				{
					tempPoint.x = tempPoint.y = NaN;
				}
				
				// if group differs from previous group, use moveTo()
				var newGroup:number = plotter.group.getValueFromKey(key, Number);
				if (ObjectUtil.numericCompare(group, newGroup) != 0)
					renderer.newLine();
				group = newGroup;
				
				renderer.addPoint(tempPoint.x, tempPoint.y, plotter.lineStyle.getLineStyleParams(key));
			}
		}
		catch (e:Error)
		{
			JS.error(e);
		}
		
		renderer.flush(task.buffer);
		return 1;
	}
}

internal class AsyncLineRenderer
{
	public AsyncLineRenderer()
	{
		shape = new Shape();
		graphics = shape.graphics;
	}
	
	private shape:Shape;
	private graphics:Graphics;
	private handlePoint:Function;
	private prevX:number;
	private prevY:number;
	private continueLine:Boolean;
	private prevLineStyle:Array;
	
	/**
	 * Call this at the beginning of the async task
	 */
	public reset():void
	{
		graphics.clear();
		newLine();
	}
	
	/**
	 * Call this before starting a new line
	 */
	public newLine():void
	{
		continueLine = false;
	}
	
	/**
	 * Call this for each coordinate in the line, whether the coordinates are defined or not.
	 */
	public addPoint(x:number, y:number, lineStyleParams:Array):void
	{
		var isDefined:Boolean = isFinite(x) && isFinite(y);
		
		if (isDefined && continueLine)
		{
			var midX:number = (prevX + x) / 2;
			var midY:number = (prevY + y) / 2;
			
			graphics.lineStyle.apply(graphics, prevLineStyle);
			graphics.lineTo(midX, midY);
			graphics.lineStyle.apply(graphics, lineStyleParams);
			graphics.lineTo(x, y);
		}
		else
		{
			graphics.moveTo(x, y);
		}
		
		prevX = x;
		prevY = y;
		continueLine = isDefined;
		prevLineStyle = lineStyleParams;
	}
	
	/**
	 * Call this to flush the graphics to a BitmapData buffer.
	 */
	public flush(buffer:BitmapData):void
	{
		buffer.draw(shape);
		graphics.clear();
		if (continueLine)
			graphics.moveTo(prevX, prevY);
	}
}
