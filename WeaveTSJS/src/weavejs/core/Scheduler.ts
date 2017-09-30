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

namespace weavejs.core
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IScheduler = weavejs.api.core.IScheduler;
	import DebugTimer = weavejs.util.DebugTimer;
	import DebugUtils = weavejs.util.DebugUtils;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This allows you to add callbacks that will be called when an event occurs on the stage.
	 * 
	 * WARNING: These callbacks will trigger on every mouse and keyboard event that occurs on the stage.
	 *          Developers should not add any callbacks that run computationally expensive code.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.Scheduler", interfaces: [IScheduler]})
	export class Scheduler implements IScheduler, IDisposableObject
	{
		public static debug_fps:boolean = false;
		public static debug_async_time:boolean = false;
		public static debug_async_stack_elapsed:boolean = false;
		public static debug_delayTasks:boolean = false; // set this to true to delay async tasks
		public static debug_callLater:boolean = false;
		public static debug_visibility:boolean = false;
		
		constructor()
		{
			this._frameCallbacks.addImmediateCallback(this, this._requestNextFrame, true);
			this._frameCallbacks.addImmediateCallback(this, this._handleCallLater);
			this.initVisibilityHandler();
		}
		
		public get frameCallbacks():ICallbackCollection
		{
			return this._frameCallbacks;
		}
		
		private /* readonly */ _frameCallbacks:ICallbackCollection = Weave.disposableChild(this, CallbackCollection);
		private _nextAnimationFrame:int;
		
		private _requestNextFrame():void
		{
			this._nextAnimationFrame = requestAnimationFrame(this._frameCallbacks.triggerCallbacks);
		}
		
		public dispose():void
		{
			cancelAnimationFrame(this._nextAnimationFrame);
		}
		
		public averageFrameTime:int = 0;
		private _currentFrameStartTime:int = Date.now(); // this is the result of Date.now() on the last ENTER_FRAME event.
		private _previousFrameElapsedTime:int = 0; // this is the amount of time it took to process the previous frame.
		
		private frameTimes:int[]= [];
		private map_task_stackTrace = new WeakMap<Object, any>(); // used by callLater to remember stack traces
		private map_task_elapsedTime = new WeakMap<Object, int>();
		private map_task_startTime = new WeakMap<Object, int>();
		private _currentTaskStopTime:int = 0; // set on enterFrame, used by _iterateTask
		
		/**
		 * This is an Array of "callLater queues", each being an Array of function invocations to be done later.
		 * The Arrays get populated by callLater().
		 * There are four nested Arrays corresponding to the four priorities (0, 1, 2, 3) defined by static constants in WeaveAPI.
		 */
		private _priorityCallLaterQueues:any[][] = [[], [], [], []];
		private _activePriority:uint = WeaveAPI.TASK_PRIORITY_IMMEDIATE + 1; // task priority that is currently being processed
		private _activePriorityElapsedTime:uint = 0; // elapsed time for active task priority
		private _priorityAllocatedTimes:number[] = [Number.MAX_VALUE, 300, 200, 100]; // An Array of allocated times corresponding to callLater queues.
		private _deactivatedMaxComputationTimePerFrame:uint = 1000;
		
		/**
		 * This gets the maximum milliseconds spent per frame performing asynchronous tasks.
		 */
		public getMaxComputationTimePerFrame():uint
		{
			return this.maxComputationTimePerFrame;
		}

		/**
		 * This sets the maximum milliseconds spent per frame performing asynchronous tasks.
		 * @param The new value.
		 */
		public setMaxComputationTimePerFrame(value:uint):void
		{
			this.maxComputationTimePerFrame = value;
		}
		
		/**
		 * This will get the time allocation for a specific task priority.
		 * @param priority The task priority defined by one of the constants in WeaveAPI.
		 * @return The time allocation for the specified task priority.
		 */
		public getTaskPriorityTimeAllocation(priority:uint):uint
		{
			return /*uint(*/int(this._priorityAllocatedTimes[priority]); // TODO
		}
		
		/**
		 * This will set the time allocation for a specific task priority.
		 * @param priority The task priority defined by one of the constants in WeaveAPI.
		 * @param milliseconds The new time allocation for the specified task priority.
		 */
		public setTaskPriorityTimeAllocation(priority:uint, milliseconds:uint):void
		{
			this._priorityAllocatedTimes[priority] = Math.max(milliseconds, 5);
		}
		
		/**
		 * When the current frame elapsed time reaches this threshold, callLater processing will be done in later frames.
		 */
		public maxComputationTimePerFrame:uint = 100;
		private maxComputationTimePerFrame_noActivity:uint = 250;
		
		public get previousFrameElapsedTime():int
		{
			return this._previousFrameElapsedTime;
		}
		
		public get currentFrameElapsedTime():int
		{
			return Date.now() - this._currentFrameStartTime;
		}
		
		private static _time:int;
		private static _times:string[] = [];
		public static debugTime(str:string):int
		{
			var now:int = Date.now();
			var dur:int = (now - Scheduler._time);
			if (dur > 100)
			{
				Scheduler._times.push(dur + ' ' + str);
			}
			else
			{
				var dots:string = '...';
				var n:int = Scheduler._times.length;
				if (n && Scheduler._times[n - 1] != dots)
					Scheduler._times.push(dots);
			}
			Scheduler._time = now;
			return dur;
		}
		private static resetDebugTime():void
		{
			Scheduler._times.length = 0;
			Scheduler._time = Date.now();
		}
		
		private HIDDEN:string;
		private VISIBILITY_CHANGE:string;
		private deactivated:boolean = true; // true when application is deactivated
		private useDeactivatedFrameRate:boolean = false; // true when deactivated and framerate drop detected
		
		private initVisibilityHandler():void
		{
			// Set the name of the hidden property and the change event for visibility
			if (typeof document.hidden !== "undefined")
			{
				// Opera 12.10 and Firefox 18 and later support 
				this.HIDDEN = "hidden";
				this.VISIBILITY_CHANGE = "visibilitychange";
			}
			else if (typeof (document as any).mozHidden !== "undefined")
			{
				this.HIDDEN = "mozHidden";
				this.VISIBILITY_CHANGE = "mozvisibilitychange";
			}
			else if (typeof document.msHidden !== "undefined")
			{
				this.HIDDEN = "msHidden";
				this.VISIBILITY_CHANGE = "msvisibilitychange";
			}
			else if (typeof (document as any).webkitHidden !== "undefined")
			{
				this.HIDDEN = "webkitHidden";
				this.VISIBILITY_CHANGE = "webkitvisibilitychange";
			}
			
			if (typeof document.addEventListener !== "undefined" && typeof (document as any)[this.HIDDEN] !== "undefined")
				document.addEventListener(this.VISIBILITY_CHANGE, this.handleVisibilityChange, false);
		}
		
		private handleVisibilityChange():void
		{
			if ((document as any)[this.HIDDEN])
				this.deactivated = true;
			else
				this.deactivated = false;
			this.useDeactivatedFrameRate = false;
			
			if (Scheduler.debug_visibility)
				console.log('visibility change; hidden =', this.deactivated);
		}
		
		/**
		 * This function gets called during ENTER_FRAME and RENDER events.
		 */
		private _handleCallLater():void
		{
			// detect deactivated framerate (when app is hidden)
			if (this.deactivated)
			{
				var wasted:int = Date.now() - this._currentFrameStartTime;
				if (Scheduler.debug_fps)
					console.log('wasted', wasted);
				this.useDeactivatedFrameRate = wasted > 100;
			}
			
			var prevStartTime:int = this._currentFrameStartTime;
			this._currentFrameStartTime = Date.now();
			this._previousFrameElapsedTime = this._currentFrameStartTime - prevStartTime;
			
			// sanity check
			if (this.maxComputationTimePerFrame == 0)
				this.maxComputationTimePerFrame = 100;

			var maxComputationTime:uint;
			if (this.useDeactivatedFrameRate)
				maxComputationTime = this._deactivatedMaxComputationTimePerFrame;
//			else if (!userActivity)
//				maxComputationTime = maxComputationTimePerFrame_noActivity;
			else
				maxComputationTime = this.maxComputationTimePerFrame;

			Scheduler.resetDebugTime();
			
			if (Scheduler.debug_fps)
			{
				this.frameTimes.push(this.previousFrameElapsedTime);
				if (StandardLib.sum(...this.frameTimes) >= 1000)
				{
					this.averageFrameTime = StandardLib.mean(...this.frameTimes);
					var fps:number = StandardLib.roundSignificant(1000 / this.averageFrameTime, 2);
					console.log(fps, 'fps; max computation time', maxComputationTime);
					this.frameTimes.length = 0;
				}
			}
			
			if (this._previousFrameElapsedTime > 3000)
				console.log('Previous frame took', this._previousFrameElapsedTime, 'ms');

			// The variables countdown and lastPriority are used to avoid running newly-added tasks immediately.
			// This avoids wasting time on async tasks that do nothing and return early, adding themselves back to the queue.

			var args:any;
			var context:Object;
			var args2:any[]; // this is set to args[2]
			var stackTrace:string;
			var now:int;
			var allStop:int = this._currentFrameStartTime + maxComputationTime;

			this._currentTaskStopTime = allStop; // make sure _iterateTask knows when to stop

			// first run the functions that should be called before anything else.
			var queue:Function[] = this._priorityCallLaterQueues[WeaveAPI.TASK_PRIORITY_IMMEDIATE];
			var countdown:int;
			for (countdown = queue.length; countdown > 0; countdown--)
			{
				if (Scheduler.debug_callLater)
					DebugTimer.begin();
				
				now = Date.now();
				// stop when max computation time is reached for this frame
				if (now > allStop)
				{
					if (Scheduler.debug_callLater)
						DebugTimer.cancel();
					return;
				}
				
				// args: (relevantContext:Object, method:Function, parameters:Array)
				args = queue.shift();
				stackTrace = this.map_task_stackTrace.get(args);
				
//				WeaveAPI.SessionManager.unassignBusyTask(args);
				
				// don't call the function if the relevantContext was disposed.
				context = args[0];
				if (!WeaveAPI.SessionManager.objectWasDisposed(context))
				{
					args2 = args[2] as any[];
					if (args2 != null && args2.length > 0)
						(args[1] as Function).apply(context, args2);
					else
						(args[1] as Function).apply(context);
				}
				
				if (Scheduler.debug_callLater)
					DebugTimer.end(stackTrace);
			}
			
//			console.log('-------');
			
			var minPriority:int = WeaveAPI.TASK_PRIORITY_IMMEDIATE + 1;
			var lastPriority:int = this._activePriority == minPriority ? this._priorityCallLaterQueues.length - 1 : this._activePriority - 1;
			var pStart:int = Date.now();
			var pAlloc:int = int(this._priorityAllocatedTimes[this._activePriority]);
			if (this.useDeactivatedFrameRate)
				pAlloc = pAlloc * this._deactivatedMaxComputationTimePerFrame / this.maxComputationTimePerFrame;
//			else if (!userActivity)
//				pAlloc = pAlloc * maxComputationTimePerFrame_noActivity / maxComputationTimePerFrame;
			var pStop:int = Math.min(allStop, pStart + pAlloc - this._activePriorityElapsedTime); // continue where we left off
			queue = this._priorityCallLaterQueues[this._activePriority];
			countdown = queue.length;
			while (true)
			{
				if (Scheduler.debug_callLater)
					DebugTimer.begin();
				
				now = Date.now();
				if (countdown == 0 || now > pStop)
				{
					// add the time we just spent on this priority
					this._activePriorityElapsedTime += now - pStart;
					
					// if max computation time was reached for this frame or we have visited all priorities, stop now
					if (now > allStop || this._activePriority == lastPriority)
					{
						if (Scheduler.debug_callLater)
							DebugTimer.cancel();
						if (Scheduler.debug_fps)
							console.log('spent', this.currentFrameElapsedTime,'ms');
						return;
					}
					
					// see if there are any entries left in the queues (except for the immediate queue)
					var remaining:int = 0;
					for (var i:int = minPriority; i < this._priorityCallLaterQueues.length; i++)
						remaining += (this._priorityCallLaterQueues[i] as any[]).length;
					// stop if no more entries
					if (remaining == 0)
					{
						if (Scheduler.debug_callLater)
							DebugTimer.cancel();
						break;
					}
					
					// switch to next priority, reset elapsed time
					this._activePriority++;
					this._activePriorityElapsedTime = 0;
					if (this._activePriority == this._priorityCallLaterQueues.length)
						this._activePriority = minPriority;
					pStart = now;
					pAlloc = int(this._priorityAllocatedTimes[this._activePriority]);
					if (this.useDeactivatedFrameRate)
						pAlloc = pAlloc * this._deactivatedMaxComputationTimePerFrame / this.maxComputationTimePerFrame;
//					else if (!userActivity)
//						pAlloc = pAlloc * maxComputationTimePerFrame_noActivity / maxComputationTimePerFrame;
					pStop = Math.min(allStop, pStart + pAlloc);
					queue = this._priorityCallLaterQueues[this._activePriority];
					countdown = queue.length;
					
					// restart loop to check stopping condition
					if (Scheduler.debug_callLater)
						DebugTimer.cancel();
					continue;
				}
				
				countdown--;
				
//				console.log('p',_activePriority,pElapsed,'/',pAlloc);
				this._currentTaskStopTime = pStop; // make sure _iterateTask knows when to stop
				
				// call the next function in the queue
				// args: (relevantContext:Object, method:Function, parameters:Array)
				args = queue.shift();
				stackTrace = this.map_task_stackTrace.get(args); // check this for debugging where the call came from
				
//				WeaveAPI.SessionManager.unassignBusyTask(args);
				
				// don't call the function if the relevantContext was disposed.
				context = args[0];
				if (!WeaveAPI.SessionManager.objectWasDisposed(context))
				{
					// TODO: PROFILING: check how long this function takes to execute.
					// if it takes a long time (> 1000 ms), something's wrong...
					args2 = args[2] as any[];
					if (args2 != null && args2.length > 0)
						(args[1] as Function).apply(context, args2);
					else
						(args[1] as Function).apply(context);
				}
				
				if (Scheduler.debug_callLater)
					DebugTimer.end(stackTrace);
			}
		}
		
		public callLater(relevantContext:Object, method:Function, parameters:any[] = null):void
		{
			this._callLaterPriority(WeaveAPI.TASK_PRIORITY_IMMEDIATE, relevantContext, method, parameters);
		}
		
		private _callLaterPriority(priority:uint, relevantContext:Object, method:Function, parameters:any[] = null):void
		{
			if (method == null)
			{
				console.error('StageUtils.callLater(): received null "method" parameter');
				return;
			}
			
//			WeaveAPI.SessionManager.assignBusyTask(arguments, relevantContext as ILinkableObject);
			
			//console.log("call later @",currentFrameElapsedTime);
			var args:any[] = [relevantContext, method, parameters];
			this._priorityCallLaterQueues[priority].push(args);
			
			if (WeaveAPI.debugAsyncStack)
				this.map_task_stackTrace.set(args, new Error("This is the stack trace from when callLater() was called."));
		}
		
		/**
		 * This will generate an iterative task function that is the combination of a list of tasks to be completed in order.
		 * @param iterativeTasks An Array of iterative task functions.
		 * @return A single iterative task function that invokes the other tasks to completion in order.
		 *         The function will accept a stopTime:int parameter which when set to -1 will
		 *         reset the task counter to zero so the compound task will start from the first task again.
		 * @see #startTask()
		 */
		public static generateCompoundIterativeTask(...iterativeTasks:Function[]):Function
		{
			var iTask:int = 0;
			return function(stopTime:int):number
			{
				if (stopTime < 0) // restart
				{
					iTask = 0;
					return 0;
				}
				if (iTask >= iterativeTasks.length)
					return 1;
				
				var i:int = iTask; // need to detect if iTask changes
				var iterate:Function = iterativeTasks[iTask];
				var progress:number;
				if (iterate.length)
				{
					progress = iterate.call(this, stopTime);
				}
				else
				{
					while (iTask == i && (progress = iterate.call(this)) < 1 && Date.now() < stopTime) { }
				}
				// if iTask changed as a result of iterating, we need to restart
				if (iTask != i)
					return 0;
				
				var totalProgress:number = (iTask + progress) / iterativeTasks.length;
				if (progress == 1)
					iTask++;
				return totalProgress;
			}
		}
		
		private map_task_time = new WeakMap<Function, any>();
		
		private d2d_context_task_token = new Dictionary2D<Object, Function, Object>(true, true, Object);
		
		public startTask(relevantContext:Object, iterativeTask:Function, priority:uint, finalCallback:Function = null, description:string = null):void
		{
			var taskToken:Object = this.d2d_context_task_token.get(relevantContext || window, iterativeTask);
			
			// do nothing if task already active
			if (WeaveAPI.ProgressIndicator.hasTask(taskToken))
				return;
			
			if (Scheduler.debug_async_time)
			{
				if (this.map_task_time.get(iterativeTask))
				{
					var value = this.map_task_time.get(iterativeTask);
					this.map_task_time.delete(iterativeTask);
					console.log('interrupted', Date.now() - this.map_task_time.get(iterativeTask)[0], priority, this.map_task_time.get(iterativeTask)[1], value);
				}
				this.map_task_time.set(iterativeTask, [Date.now(), new Error('Stack trace')]);
			}
			
			if (priority >= this._priorityCallLaterQueues.length)
			{
				console.error("Invalid priority value: " + priority);
				priority = WeaveAPI.TASK_PRIORITY_NORMAL;
			}
			
			if (WeaveAPI.debugAsyncStack)
				this.map_task_stackTrace.set(iterativeTask, [DebugUtils.debugId(iterativeTask), new Error("Stack trace")]);
			if (Scheduler.debug_async_stack_elapsed)
			{
				this.map_task_startTime.set(iterativeTask, Date.now());
				this.map_task_elapsedTime.set(iterativeTask, 0);
			}
			WeaveAPI.ProgressIndicator.addTask(taskToken, Weave.AS(relevantContext, ILinkableObject), description);
			
			var useTimeParameter:boolean = iterativeTask.length > 0;
			
			// Set relevantContext as null for callLater because we always want _iterateTask to be called later.
			// This makes sure that the task is removed when the actual context is disposed.
			this._callLaterPriority(priority, null, this._iterateTask, [relevantContext, iterativeTask, priority, finalCallback, useTimeParameter]);
			//_iterateTask(relevantContext, iterativeTask, priority, finalCallback);
		}
		
		/**
		 * @private
		 */
		private _iterateTask(context:Object, task:Function, priority:int, finalCallback:Function, useTimeParameter:boolean):void
		{
			var taskToken:Object = this.d2d_context_task_token.get(context || window, task);
			
			// remove the task if the context was disposed
			if (WeaveAPI.SessionManager.objectWasDisposed(context))
			{
				if (Scheduler.debug_async_time && this.map_task_time.get(task))
				{
					var value = this.map_task_time.get(task)
					this.map_task_time.delete(task);
					console.log('disposed', Date.now()-this.map_task_time.get(task)[0], priority, this.map_task_time.get(task)[1], value);
				}
				WeaveAPI.ProgressIndicator.removeTask(taskToken);
				return;
			}

			var debug_time:int = WeaveAPI.debugAsyncStack ? Date.now() : -1;
			var stackTrace:string = WeaveAPI.debugAsyncStack ? this.map_task_stackTrace.get(task) : null;
			
			var progress:number = undefined;
			// iterate on the task until _currentTaskStopTime is reached
			var time:int;
			while ((time = Date.now()) <= this._currentTaskStopTime)
			{
				// perform the next iteration of the task
				if (useTimeParameter)
					progress = task.call(context, this._currentTaskStopTime);
				else
					progress = task.call(context);
				
				if (progress === null || isNaN(progress) || progress < 0 || progress > 1)
				{
					console.error("Received unexpected result from iterative task (" + progress + ").  Expecting a number between 0 and 1.  Task cancelled.");
					if (WeaveAPI.debugAsyncStack)
					{
						console.log(stackTrace);
						// this is incorrect behavior, but we can put a breakpoint here
						if (useTimeParameter)
							progress = task.call(context, this._currentTaskStopTime);
						else
							progress = task.call(context);
					}
					progress = 1;
				}
				if (WeaveAPI.debugAsyncStack && this.currentFrameElapsedTime > 3000)
				{
					console.log(Date.now() - time, stackTrace);
					// this is incorrect behavior, but we can put a breakpoint here
					if (useTimeParameter)
						progress = task.call(context, this._currentTaskStopTime);
					else
						progress = task.call(context);
				}
				if (progress == 1)
				{
					if (Scheduler.debug_async_time && this.map_task_time.get(task))
					{
						var value2 = this.map_task_time.get(task);
						this.map_task_time.delete(task);
						console.log('completed', Date.now()-this.map_task_time.get(task)[0], priority, this.map_task_time.get(task)[1], value2);
					}
					// task is done, so remove the task
					WeaveAPI.ProgressIndicator.removeTask(taskToken);
					// run final callback after task completes and is removed
					if (finalCallback != null)
						finalCallback.call(context);
					return;
				}
				
				// If the time parameter is accepted, only call the task once in succession.
				if (useTimeParameter)
					break;
				
				if (Scheduler.debug_delayTasks)
					break;
			}
			if (Scheduler.debug_async_stack_elapsed)
			{
				var start:int = int(this.map_task_startTime.get(task));
				var elapsed:int = int(this.map_task_elapsedTime.get(task)) + (time - debug_time);
				this.map_task_elapsedTime.set(task, elapsed);
				console.log(elapsed,'/',(time-start),'=',StandardLib.roundSignificant(elapsed / (time - start), 2),stackTrace);
			}
			
			// max computation time reached without finishing the task, so update the progress indicator and continue the task later
			if (progress !== undefined)
				WeaveAPI.ProgressIndicator.updateTask(taskToken, progress);
			
			// Set relevantContext as null for callLater because we always want _iterateTask to be called later.
			// This makes sure that the task is removed when the actual context is disposed.
			this._callLaterPriority(priority, null, this._iterateTask, JS.toArray(arguments));
		}
	}

	class WindowFrameHandler
	{
		public WindowFrameHandler(window:Window, scheduler:Scheduler)
		{

		}

		private window:Window;
		private scheduler:Scheduler;
	}
}

