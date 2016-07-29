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
	import PlotTask = weavejs.plot.PlotTask;
	import SolidLineStyle = weavejs.plot.SolidLineStyle;

	export class EquationPlotter extends AbstractPlotter
	{
		public tStep = Weave.linkableChild(this, new LinkableNumber(NaN));
		public tBegin = Weave.linkableChild(this, new LinkableNumber(NaN));
		public tEnd = Weave.linkableChild(this, new LinkableNumber(NaN));
		
		public xEquation = Weave.linkableChild(this, new LinkableFunction('t', true, ['t']));
		public yEquation = Weave.linkableChild(this, new LinkableFunction('t', true, ['t']));
		
		public lineStyle:SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
		
		/*override*/ public drawPlotAsyncIteration(task:IPlotTask):number
		{
			if ((task as PlotTask).taskType != PlotTask.TASK_TYPE_SUBSET)
				return 1;
			
			if (!(task.asyncState instanceof AsyncState))
				task.asyncState = new AsyncState(this, task);
			return (task.asyncState as AsyncState).iterate();
		}
	}

	class AsyncState
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
			var graphics:Graphics = this.shape.graphics;
			if (this.task.iteration == 0)
			{
				this.step = this.plotter.tStep.value;
				this.begin = this.plotter.tBegin.value;
				this.end = this.plotter.tEnd.value;

				// calculate default step values in case parameters are unspecified
				var pixelStep:number = 1; // default number of pixels to advance each iteration
				var xStep:number = pixelStep * this.task.dataBounds.getXCoverage() / this.task.screenBounds.getXCoverage();
				var yStep:number = pixelStep * this.task.dataBounds.getYCoverage() / this.task.screenBounds.getYCoverage();
				if (!isFinite(this.step))
				{
					if (this.plotter.xEquation.getSessionState() == 't')
						this.step = xStep;
					else if (this.plotter.yEquation.getSessionState() == 't')
						this.step = yStep;
					else
						this.step = Math.min(xStep, yStep);
				}
				if (!isFinite(this.begin))
				{
					this.begin = (this.step == yStep ? this.task.dataBounds.getYMin() : this.task.dataBounds.getXMin());
				}
				if (!isFinite(this.end))
				{
					this.end = (this.step == yStep ? this.task.dataBounds.getYMax() : this.task.dataBounds.getXMax());
				}

				// make sure step is going in the right direction.
				if (this.begin < this.end != this.step > 0)
					this.step = -this.step;

				// stop immediately if we know we will never finish.
				if (this.step == 0 || !isFinite(this.step) || !isFinite(this.begin) || !isFinite(this.end))
					return 1;

				this.handlePoint = graphics.moveTo;
				this.t = this.begin;
			}

			try
			{
				graphics.clear();
				graphics.moveTo(this.point.x, this.point.y);
				this.plotter.lineStyle.beginLineStyle(null, graphics);

				var stepEnd:number = this.end + this.step;
				for (; this.t < stepEnd; this.t += this.step)
				{
					if (Date.now() > this.task.iterationStopTime)
					{
						this.task.buffer.draw(this.shape);
						return (this.t - this.begin) / (stepEnd - this.begin);
					}

					if (this.t > this.end)
						this.t = this.end;

					this.point.x = this.plotter.xEquation.apply(null, [this.t]);
					this.point.y = this.plotter.yEquation.apply(null, [this.t]);

					if (isFinite(this.point.x) && isFinite(this.point.y))
						this.task.dataBounds.projectPointTo(this.point, this.task.screenBounds);

					if (isFinite(this.point.x) && isFinite(this.point.y))
					{
						this.handlePoint(this.point.x, this.point.y);
						this.handlePoint = graphics.lineTo;
					}
					else
						this.handlePoint = graphics.moveTo;
				}
			}
			catch (e)
			{
				console.error(e);
			}

			this.task.buffer.draw(this.shape);

			return 1;
		}
	}

	WeaveAPI.ClassRegistry.registerImplementation(IPlotter, EquationPlotter, "Equation");
}


