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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IProgressIndicator = weavejs.api.core.IProgressIndicator;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	import WeavePromise = weavejs.util.WeavePromise;

	export class ProgressIndicator implements IProgressIndicator
	{
		/**
		 * For debugging, returns debugIds for active tasks.
		 */
		public debugTasks():string[]
		{
			var result:string[] = [];
			var tasks:Array = JS.mapKeys(this.map_task_progress);
			for (var task of tasks || [])
				result.push(DebugUtils.debugId(task));
			return result;
		}
		public getDescriptions():Array<[any, number, string]>
		{
			var result:[any, number, string] = [];
			var tasks:Array = JS.mapKeys(this.map_task_progress);
			for (var task of tasks || [])
			{
				var desc:string = this.map_task_description.get(task) || "Unnamed task";
				if (desc)
					result.push([task, this.map_task_progress.get(task), desc]);
			}
			return result;
		}
		
		public getTaskCount():int
		{
			return this._taskCount;
		}

		public addTask(taskToken:Object|PromiseLike, busyObject:ILinkableObject = null, description:string = null):void
		{
			var cc:ICallbackCollection = Weave.getCallbacks(this);
			cc.delayCallbacks();
			
			var isNewTask:boolean = !this.map_task_progress.has(taskToken);
			
			this.map_task_description.set(taskToken, description);
			
			// add task before WeaveAPI.SessionManager.assignBusyTask()
			this.updateTask(taskToken, NaN); // NaN is used as a special case when adding the task
			
			if (isNewTask && WeavePromise.isThenable(taskToken))
			{
				var remove:Function = this.removeTask.bind(this, taskToken);
				(taskToken as PromiseLike).then(remove, remove);
			}
			
			if (busyObject)
				WeaveAPI.SessionManager.assignBusyTask(taskToken, busyObject);
			
			cc.resumeCallbacks();
		}
		
		public hasTask(taskToken:Object):boolean
		{
			return this.map_task_progress.has(taskToken);
		}
		
		public updateTask(taskToken:Object, progress:number):void
		{
			// if this token isn't in the Dictionary yet, increase count
			if (!this.map_task_progress.has(taskToken))
			{
				// expecting NaN from addTask()
				if (!isNaN(progress))
					throw new Error("updateTask() called, but task was not previously added with addTask()");
				if (WeaveAPI.debugAsyncStack)
					this.map_task_stackTrace.set(taskToken, new Error("Stack trace"));
				
				// increase count when new task is added
				this._taskCount++;
				this._maxTaskCount++;
			}
			
			if (this.map_task_progress.get(taskToken) !== progress)
			{
				this.map_task_progress.set(taskToken, progress);
				Weave.getCallbacks(this).triggerCallbacks();
			}
		}
		
		public removeTask(taskToken:Object):void
		{
			// if the token isn't in the dictionary, do nothing
			if (!this.map_task_progress.has(taskToken))
				return;

			var stackTrace:Error = this.map_task_stackTrace.get(taskToken); // check this when debugging
			
			this.map_task_progress.delete(taskToken);
			this.map_task_description.delete(taskToken);
			this.map_task_stackTrace.delete(taskToken);
			this._taskCount--;
			// reset max count when count drops to 1
			if (this._taskCount == 1)
				this._maxTaskCount = this._taskCount;
			
			WeaveAPI.SessionManager.unassignBusyTask(taskToken);

			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		public getNormalizedProgress():number
		{
			// add up the percentages
			var sum:number = 0;
			var tasks = JS.mapKeys(this.map_task_progress);
			for (var task of tasks || [])
			{
				var stackTrace:Error = this.map_task_stackTrace.get(task); // check this when debugging
				var progress:number = this.map_task_progress.get(task);
				if (isFinite(progress))
					sum += progress;
			}
			// make any pending requests that no longer exist count as 100% done
			sum += this._maxTaskCount - this._taskCount;
			// divide by the max count to get overall percentage
			if (sum)
				return sum / this._maxTaskCount;
			return this._taskCount ? 0 : 1;
		}

		private _taskCount:int = 0;
		private _maxTaskCount:int = 1;
		private map_task_progress = new Map<Object, number>();
		private map_task_description = new Map<Object, string>();
		private map_task_stackTrace = new Map<Object, Error>();
		
		public test():void
		{
			var tasks = JS.mapKeys(this.map_task_progress);
			for (var task of tasks || [])
			{
				var stackTrace:Error = this.map_task_stackTrace.get(task); // check this when debugging
				var description:string = this.map_task_description.get(task);
				console.log(DebugUtils.debugId(task), description, stackTrace);
			}
		}
	}
}
