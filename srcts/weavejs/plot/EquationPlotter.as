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
	
	import IPlotTask = weavejs.api.ui.IPlotTask;
	import IPlotter = weavejs.api.ui.IPlotter;
	import LinkableFunction = weavejs.core.LinkableFunction;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import PlotTask = weavejs.visualization.layers.PlotTask;
	import SolidLineStyle = weavejs.geom.SolidLineStyle;
	
	export class EquationPlotter extends AbstractPlotter
	{
		WeaveAPI.ClassRegistry.registerImplementation(IPlotter, EquationPlotter, "Equation");
		
		public tStep:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		public tBegin:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		public tEnd:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(NaN));
		
		public xEquation:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('t', true, false, ['t']));
		public yEquation:LinkableFunction = Weave.linkableChild(this, new LinkableFunction('t', true, false, ['t']));
		
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if ((task as PlotTask).taskType != PlotTask.TASK_TYPE_SUBSET)
				return 1;
			
			if (!(task.asyncState is AsyncState))
				task.asyncState = new AsyncState(this, task);
			return (task.asyncState as AsyncState).iterate();
		}
	}
}

import Graphics = PIXI.Graphics;
import Shape = flash.display.Shape;
import Point = weavejs.geom.Point;
import getTimer = flash.utils.getTimer;

import IPlotTask = weavejs.api.ui.IPlotTask;
import EquationPlotter = weavejs.visualization.plotters.EquationPlotter;

internal class AsyncState
{
	public constructor(plotter:EquationPlotter, task:IPlotTask)
	{
		this.plotter = plotter;
		this.task = task;
		this.shape = new Shape();
		this.point = new Point();
	}
	
	public plotter:EquationPlotter;
	public task:IPlotTask;
	public shape:Shape;
	public point:Point;
	public step:number;
	public begin:number;
	public end:number;
	public t:number;
	public handlePoint:Function;
	
	public iterate():number
	{
		var graphics:Graphics = shape.graphics;
		if (task.iteration == 0)
		{
			step = plotter.tStep.value;
			begin = plotter.tBegin.value;
			end = plotter.tEnd.value;
			
			// calculate default step values in case parameters are unspecified
			var pixelStep:number = 1; // default number of pixels to advance each iteration
			var xStep:number = pixelStep * task.dataBounds.getXCoverage() / task.screenBounds.getXCoverage();
			var yStep:number = pixelStep * task.dataBounds.getYCoverage() / task.screenBounds.getYCoverage();
			if (!isFinite(step))
			{
				if (plotter.xEquation.getSessionState() == 't')
					step = xStep;
				else if (plotter.yEquation.getSessionState() == 't')
					step = yStep;
				else
					step = Math.min(xStep, yStep);
			}
			if (!isFinite(begin))
			{
				begin = (step == yStep ? task.dataBounds.getYMin() : task.dataBounds.getXMin());
			}
			if (!isFinite(end))
			{
				end = (step == yStep ? task.dataBounds.getYMax() : task.dataBounds.getXMax());
			}
			
			// make sure step is going in the right direction.
			if (begin < end != step > 0)
				step = -step;
			
			// stop immediately if we know we will never finish.
			if (step == 0 || !isFinite(step) || !isFinite(begin) || !isFinite(end))
				return 1;
			
			handlePoint = graphics.moveTo;
			t = begin;
		}
		
		try
		{
			graphics.clear();
			graphics.moveTo(point.x, point.y);
			plotter.lineStyle.beginLineStyle(null, graphics);
			
			var stepEnd:number = end + step;
			for (; t < stepEnd; t += step)
			{
				if (getTimer() > task.iterationStopTime)
				{
					task.buffer.draw(shape);
					return (t - begin) / (stepEnd - begin);
				}
				
				if (t > end)
					t = end;
				
				point.x = plotter.xEquation.apply(null, [t]);
				point.y = plotter.yEquation.apply(null, [t]);
				
				if (isFinite(point.x) && isFinite(point.y))
					task.dataBounds.projectPointTo(point, task.screenBounds);
				
				if (isFinite(point.x) && isFinite(point.y))
				{
					handlePoint(point.x, point.y);
					handlePoint = graphics.lineTo;
				}
				else
					handlePoint = graphics.moveTo;
			}
		}
		catch (e:Error)
		{
			JS.error(e);
		}
		
		task.buffer.draw(shape);
		
		return 1;
	}
}