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

namespace weavejs.util
{
	import WeaveAPI = weavejs.WeaveAPI;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	
	/**
	 * Use this when you need a Promise chain to depend on ILinkableObjects and resolve multiple times.
	 * 
	 * Adds support for <code>depend(...linkableObjects)</code>
	 */
	@Weave.classInfo({id: "weavejs.util.WeavePromise", interfaces: [IDisposableObject]})
	export class WeavePromise<T> implements IDisposableObject
	{
		// true to conform to Promise spec, false to make Weave work correctly w/ busy status
		public static _callNewHandlersSeparately:boolean = false;
		
		/**
		 * @param relevantContext This parameter may be null.  If the relevantContext object is disposed, the promise will be disabled.
		 * @param resolver A function like function(resolve:Function, reject:Function):void which carries out the promise.
		 *                 If no resolver is given, setResult() or setError() should be called externally.
		 */
		constructor(relevantContext:Object, resolver:( resolve:(value?:T)=>void, reject:(error?:any)=>void ) => void = null)
		{
			if (WeaveAPI.debugAsyncStack)
				this.stackTrace_created = new Error("WeavePromise created");
			
			if (Weave.IS(relevantContext, WeavePromise))
			{
				// this is a child promise
				this.rootPromise = (relevantContext as WeavePromise).rootPromise;
				this.relevantContext = relevantContext = this.rootPromise.relevantContext;
			}
			else
			{
				// this is a new root promise
				this.rootPromise = this;
				// if no context is specified, make sure this promise stops functioning when it is disposed
				this.relevantContext = relevantContext || this;
			}
			
			if (relevantContext)
				Weave.disposableChild(relevantContext, this);
			
			if (resolver != null)
				resolver(this.setResult, this.setError);
		}
		
		private stackTrace_created:Error;
		private stackTrace_resolved:Error;
		
		private rootPromise:WeavePromise;
		protected relevantContext:Object;
		private result:T = undefined;
		private error:Error = undefined;
		private/* readonly */ handlers:WeavePromiseHandler[] = []; // array of Handler objects
		private/* readonly */ dependencies:Array = [];
		
		/**
		 * @return This WeavePromise
		 */
		public setResult(result:WeavePromise<T>|PromiseLike<T>):WeavePromise<T>
		{
			if (Weave.wasDisposed(this.relevantContext))
				return this;
			
			if (WeaveAPI.debugAsyncStack)
				this.stackTrace_resolved = new Error("WeavePromise resolved");
			
			this.result = undefined;
			this.error = undefined;
			
			var wp:WeavePromise<T> = Weave.AS(result, WeavePromise);
			if (wp)
			{
				wp._notify(this);
			}
			else if (WeavePromise.isThenable(result))
			{
				(result as PromiseLike<T>).then(this.setResult, this.setError);
			}
			else
			{
				this.result = result as Object;
				this.callHandlers();
			}
			
			return this;
		}
		
		public static asPromise<T>(obj:PromiseLike<T>):Promise<T>
		{
			var wp:WeavePromise<T> = Weave.AS(obj, WeavePromise);
			if (wp)
				return wp.getPromise();
			return WeavePromise.isThenable(obj) ? obj as Promise<T> : null;
		}
		
		public static isThenable(obj:PromiseLike<T>):boolean
		{
			return obj && typeof (obj as any).then === 'function';
		}
		
		public getResult():T
		{
			return this.result;
		}
		
		/**
		 * @return This WeavePromise
		 */
		public setError(error:Error):WeavePromise<T>
		{
			if (Weave.wasDisposed(this.relevantContext))
				return this;
			
			if (WeaveAPI.debugAsyncStack)
				this.stackTrace_resolved = new Error("WeavePromise resolved");
			
			this.result = undefined;
			this.error = error;
			
			this.callHandlers();
			
			return this;
		}
		
		public getError():Error
		{
			return this.error;
		}
		
		private callHandlers=(newHandlersOnly:boolean = false):void=>
		{
			// stop if depenencies are busy because we will call handlers when they become unbusy
			if (this.dependencies.some(Weave.isBusy))
				return;
			
			// stop if the promise has not been resolved yet
			if (this.result === undefined && this.error === undefined)
				return;
			
			// make sure thrown errors are seen
			if (this.handlers.length == 0 && this.error !== undefined)
				console.error(this.error);
			
			var shouldCallLater:boolean = false;
			
			for (var i:int = 0; i < this.handlers.length; i++)
			{
				var handler:WeavePromiseHandler = this.handlers[i];
				
				if (WeavePromise._callNewHandlersSeparately)
				{
					if (newHandlersOnly != handler.isNew)
					{
						shouldCallLater = handler.isNew;
						continue;
					}
				}
				else
				{
					if (newHandlersOnly && !handler.isNew)
					{
						continue;
					}
				}
				
				if (this.result !== undefined)
					handler.onResult(this.result);
				else if (this.error !== undefined)
					handler.onError(this.error);
			}
			
			if (shouldCallLater)
				WeaveAPI.Scheduler.callLater(this.relevantContext, this.callHandlers, [true]);
		}
		
		public then<U>(onFulfilled:(value:T) => (U|Promise<U>|WeavePromise<U>) = null, onRejected:(error:Error) => (U|Promise<U>|WeavePromise<U>) = null):WeavePromise<U>
		{
			if (Weave.wasDisposed(this.relevantContext))
				return this;
			
			var next:WeavePromise = new WeavePromise(this);
			this.handlers.push(new WeavePromiseHandler(onFulfilled, onRejected, next));
			
			// call new handler(s) if promise has already been resolved
			if (this.result !== undefined || this.error !== undefined)
				WeaveAPI.Scheduler.callLater(this.relevantContext, this.callHandlers, [true]);
			
			return next;
		}
		
		private _notify(next:WeavePromise):void
		{
			if (Weave.wasDisposed(this.relevantContext))
				return;
			
			// avoid adding duplicate handlers
			for (var handler of this.handlers || [])
				if (handler.next === next)
					return;
			
			this.handlers.push(new WeavePromiseHandler(null, null, next));
			
			// resolve next immediately if this promise has been resolved
			if (this.result !== undefined)
				next.setResult(this.result);
			else if (this.error !== undefined)
				next.setError(this.error);
		}
		
		public depend(...linkableObjects:ILinkableObject[]):WeavePromise<T>
		{
			for (var dependency of linkableObjects || [])
			{
				if (this.dependencies.indexOf(dependency) < 0)
					this.dependencies.push(dependency);
				Weave.getCallbacks(dependency).addGroupedCallback(this.relevantContext, this.callHandlers, true);
			}
			return this;
		}
		
		public getPromise():Promise<T>
		{
			var var_resolve:Function, var_reject:Function;
			var promise = new Promise(function(resolve:Function, reject:Function):void {
				var_resolve = resolve;
				var_reject = reject;
			});
			(promise as any)._WeavePromise = this; // for debugging
			this.then(var_resolve, var_reject);
			return promise;
		}
		
		public dispose():void
		{
			Weave.dispose(this);
			this.dependencies.length = 0;
			this.handlers.length = 0;
		}
	}
}
