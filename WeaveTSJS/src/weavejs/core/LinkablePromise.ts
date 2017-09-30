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
	import WeavePromise = weavejs.util.WeavePromise;
	
	/**
	 * Use this class to build dependency trees involving asynchronous calls.
	 * When the callbacks of a LinkablePromise are triggered, a function will be invoked.
	 * If the function returns an AsyncToken, LinkablePromise's callbacks will be triggered again when a ResultEvent or FaultEvent is received from the AsyncToken.
	 * Dependency trees can be built using newLinkableChild() and registerLinkableChild().
	 * 
	 * @see weave.api.core.ISessionManager#newLinkableChild()
	 * @see weave.api.core.ISessionManager#registerLinkableChild()
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.LinkablePromise"})
	export class LinkablePromise implements ILinkableObject, IDisposableObject
	{
		/**
		 * Creates a LinkablePromise from an iterative task function.
		 * @param initialize A function that should be called prior to starting the iterativeTask.
		 * @param iterativeTask A function which is designed to be called repeatedly across multiple frames until it returns a value of 1.
		 * @param priority The task priority, which should be one of the static constants in WeaveAPI.
		 * @param description A description of the task as a String, or a function to call which returns a descriptive string.
		 * Such a function has the signature function():String.
		 * @see weave.api.core.IStageUtils#startTask()
		 */
		public static fromIterativeTask(initialize:()=>void, iterativeTask:Function, priority:uint, description:any = null, validateNow:boolean = false):LinkablePromise
		{
			var linkablePromise:LinkablePromise;
			var asyncStart:Function = function():Object {
				if (initialize != null)
					initialize();
				return new Promise(function(resolve:Function, reject:Function):void {
					WeaveAPI.Scheduler.startTask(linkablePromise, iterativeTask, priority, resolve);
				});
			};
			return linkablePromise = new LinkablePromise(asyncStart, description, validateNow);
		}
		
		/**
		 * @param task A function to invoke, which must take zero parameters and may return an AsyncToken.
		 * @param description A description of the task as a String, or a function to call which returns a descriptive string.
		 * Such a function has the signature function():String.
		 */
		constructor(task:Function, description:string|Function = null, validateNow:boolean = false)
		{
			this._task = task;
			this._description = description;
			this._callbackCollection = Weave.getCallbacks(this);
			this._callbackCollection.addImmediateCallback(this, this._immediateCallback);
			this._callbackCollection.addGroupedCallback(this, this._groupedCallback, validateNow, false);
			if (validateNow)
			{
				this._lazy = false;
				this._immediateCallback();
			}
		}
		
		private _task:Function;
		private _description:string|Function; /* Function or String */
		
		private _callbackCollection:ICallbackCollection;
		private _lazy:boolean = true;
		private _invalidated:boolean = true;
		private _jsPromise:Promise<any>;
		private _selfTriggeredCount:uint = 0;
		private _result:Object;
		private _error:Error;
		
		/**
		 * The result of calling the invoke function.
		 * When this value is accessed, validate() will be called.
		 */
		public get result():Object
		{
			this.validate();
			return this._result;
		}
		
		/**
		 * The error that occurred calling the invoke function.
		 * When this value is accessed, validate() will be called.
		 */
		public get error():Error
		{
			this.validate();
			return this._error;
		}
		
		/**
		 * If this LinkablePromise is set to lazy mode, this will switch it to non-lazy mode and automatically invoke the async task when necessary.
		 */
		public validate():void
		{
			if (!this._lazy)
				return;
			
			this._lazy = false;
			
			if (this._invalidated)
				this._callbackCollection.triggerCallbacks();
		}
		
		private _immediateCallback():void
		{
			// stop if self-triggered
			if (this._callbackCollection.triggerCounter == this._selfTriggeredCount)
				return;
			
			// reset variables
			this._invalidated = true;
			this._jsPromise = null;
			this._result = null;
			this._error = null;
			
			// we are no longer waiting for the async task
			WeaveAPI.ProgressIndicator.removeTask(this._groupedCallback);
			
			// stop if lazy
			if (this._lazy)
				return;
			
			// stop if still busy because we don't want to invoke the task if an external dependency is not ready
			if (WeaveAPI.SessionManager.linkableObjectIsBusy(this))
			{
				// make sure _groupedCallback() will not invoke the task.
				// this is ok to do since callbacks will be triggered again when the dependencies are no longer busy.
				this._invalidated = false;
				return;
			}
			
			
			var _tmp_description:string = null;
			if (Weave.IS(this._description, Function))
				_tmp_description = (this._description as Function)();
			else
				_tmp_description = this._description as string;

			// mark as busy starting now because we plan to start the task inside _groupedCallback()
			WeaveAPI.ProgressIndicator.addTask(this._groupedCallback, this, _tmp_description);
		}
		
		private _groupedCallback():void
		{
			try
			{
				if (this._lazy || !this._invalidated)
					return;
				
				// _invalidated is true prior to invoking the task
				var invokeResult:any = this._task.apply(null);
				
				// if _invalidated has been set to false, it means _immediateCallback() was triggered from the task and it's telling us we should stop now.
				if (!this._invalidated)
					return;
				
				// set _invalidated to false now since we invoked the task
				this._invalidated = false;
				
				this._jsPromise = WeavePromise.asPromise(invokeResult);
				if (this._jsPromise)
				{
					this._jsPromise.then(this._handleResult.bind(this, this._jsPromise), this._handleFault.bind(this, this._jsPromise));
				}
				else
				{
					this._result = invokeResult;
					WeaveAPI.Scheduler.callLater(this, this._handleResult);
				}
			}
			catch (invokeError)
			{
				this._invalidated = false;
				this._jsPromise = null;
				this._error = invokeError;
				WeaveAPI.Scheduler.callLater(this, this._handleFault);
			}
		}
		
		private _handleResult(jsPromise:Promise<any> = null, result:any = undefined):void
		{
			// stop if asyncToken is no longer relevant
			if (this._invalidated || this._jsPromise != jsPromise)
				return;
			
			// no longer busy
			WeaveAPI.ProgressIndicator.removeTask(this._groupedCallback);
			
			// if there is a promise, save the result
			if (jsPromise)
				this._result = result;
			
			this._selfTriggeredCount = this._callbackCollection.triggerCounter + 1;
			this._callbackCollection.triggerCallbacks();
		}
		
		private _handleFault(jsPromise:Promise<any> = null, error:Error = undefined):void
		{
			// stop if asyncToken is no longer relevant
			if (this._invalidated || this._jsPromise != jsPromise)
				return;
			
			// no longer busy
			WeaveAPI.ProgressIndicator.removeTask(this._groupedCallback);
			
			// if there is a promise, save the error
			if (jsPromise)
				this._error = error;
			
			this._selfTriggeredCount = this._callbackCollection.triggerCounter + 1;
			this._callbackCollection.triggerCallbacks();
		}
		
		/**
		 * Registers dependencies of the LinkablePromise.
		 */
		public depend(dependency:ILinkableObject, ...otherDependencies:ILinkableObject[]):LinkablePromise
		{
			otherDependencies.unshift(dependency);
			for (dependency of otherDependencies || [])
				Weave.linkableChild(this, dependency);
			return this;
		}
		
		public dispose():void
		{
			WeaveAPI.ProgressIndicator.removeTask(this._groupedCallback);
			this._lazy = true;
			this._invalidated = true;
			this._jsPromise = null;
			this._result = null;
			this._error = null;
		}
	}
}
