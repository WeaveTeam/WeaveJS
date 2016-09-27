/*
	This Source Code Form is subject to the terms of the
	Mozilla Public License, v. 2.0. If a copy of the MPL
	was not distributed with this file, You can obtain
	one at https://mozilla.org/MPL/2.0/.
*/
namespace weavejs.core
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	
	/**
	 * This class manages a list of callback functions.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.core.CallbackCollection", interfaces: [ICallbackCollection, IDisposableObject]})
	export class CallbackCollection implements ICallbackCollection, IDisposableObject
	{
		private _linkableObject:ILinkableObject; // for debugging only... will be set when debug==true
		private _lastTriggerStackTrace:Error; // for debugging only... will be set when debug==true
		private _oldEntries:CallbackEntry[];

		/**
		 * @param preCallback An optional function to call before each immediate callback.
		 *     If specified, the preCallback function will be called immediately before running each
		 *     callback using the parameters passed to _runCallbacksImmediately(). This means if there
		 *     are five callbacks added, preCallback() gets called five times whenever
		 *     _runCallbacksImmediately() is called.  An example usage of this is to make sure a relevant
		 *     variable is set to the appropriate value while each callback is running.  The preCallback
		 *     function will not be called before grouped callbacks.
		 */
		constructor(preCallback:Function = null)
		{
			this._preCallback = preCallback;
		}

		/**
		 * This is a list of CallbackEntry objects in the order they were created.
		 */
		private _callbackEntries:CallbackEntry[] = [];

		/**
		 * This is the function that gets called immediately before every callback.
		 */
		protected _preCallback:()=>void = null;

		/**
		 * This is the number of times delayCallbacks() has been called without a matching call to resumeCallbacks().
		 * While this is greater than zero, effects of triggerCallbacks() will be delayed.
		 */
		private _delayCount:uint = 0;
		
		/**
		 * If this is true, it means triggerCallbacks() has been called while delayed was true.
		 */
		private _runCallbacksIsPending:boolean = false;
		
		/**
		 * This is the default value of triggerCounter.
		 * The default value is 1 to avoid being equal to a newly initialized uint=0.
		 */
		public static /* readonly */ DEFAULT_TRIGGER_COUNT:uint = 1;
		
		/**
		 * This value keeps track of how many times callbacks were triggered, and is returned by the public triggerCounter accessor function.
		 * The value starts at 1 to simplify code that compares the counter to a previous value.
		 * This allows the previous value to be set to zero so change will be detected the first time the counter is compared.
		 * This fixes potential bugs where the base case of zero is not considered.
		 */
		private _triggerCounter:uint = CallbackCollection.DEFAULT_TRIGGER_COUNT;
		
		public addImmediateCallback(relevantContext:Object, callback:() => void, runCallbackNow:boolean = false, alwaysCallLast:boolean = false):void
		{
			if (callback == null)
				return;
			
			// remove the callback if it was previously added
			this.removeCallback(relevantContext, callback);
			
			var entry:CallbackEntry = new CallbackEntry(relevantContext, callback);
			if (alwaysCallLast)
				entry.schedule = 1;
			this._callbackEntries.push(entry);

			// run callback now if requested
			if (runCallbackNow)
			{
				// increase the recursion count while the function is running
				entry.recursionCount++;
				callback.apply(relevantContext || callback['this']);
				entry.recursionCount--;
			}
		}

		public triggerCallbacks():void
		{
			if (WeaveAPI.debugAsyncStack)
				this._lastTriggerStackTrace = new Error(CallbackCollection.STACK_TRACE_TRIGGER);
			if (this._delayCount > 0)
			{
				// we still want to increase the counter even if callbacks are delayed
				this._triggerCounter++;
				this._runCallbacksIsPending = true;
				return;
			}
			this._runCallbacksImmediately();
		}
		
		/**
		 * This flag is used in _runCallbacksImmediately() to detect when a recursive call has completed running all the callbacks.
		 */
		private _runCallbacksCompleted:boolean;
		
		/**
		 * This function runs callbacks immediately, ignoring any delays.
		 * The preCallback function will be called with the specified preCallbackParams arguments.
		 * @param preCallbackParams The arguments to pass to the preCallback function given in the constructor.
		 */		
		protected _runCallbacksImmediately(...preCallbackParams:any[]):void
		{
			// increase counter immediately
			this._triggerCounter++;
			this._runCallbacksIsPending = false;
			
			// This flag is set to false before running the callbacks.  When it becomes true, the loop exits.
			this._runCallbacksCompleted = false;
			
			// first run callbacks with schedule 0, then those with schedule 1
			for (var schedule:int = 0; schedule < 2; schedule++)
			{
				// run the callbacks in the order they were added
				for (var i:int = 0; i < this._callbackEntries.length; i++)
				{
					// If this flag is set to true, it means a recursive call has finished running callbacks.
					// If _preCallback is specified, we don't want to exit the loop because that cause a loss of information.
					if (this._runCallbacksCompleted && this._preCallback == null)
						break;
					
					var entry:CallbackEntry = this._callbackEntries[i];
					// if we haven't reached the matching schedule yet, skip this callback
					if (entry.schedule != schedule)
						continue;
					// Remove the entry if the context was disposed by SessionManager.
					var shouldRemoveEntry:Boolean;
					if (entry.callback == null)
						shouldRemoveEntry = true;
					else if (Weave.IS(entry.context, CallbackCollection)) // special case
						shouldRemoveEntry = (entry.context as CallbackCollection)._wasDisposed;
					else
						shouldRemoveEntry = WeaveAPI.SessionManager.objectWasDisposed(entry.context);
					if (shouldRemoveEntry)
					{
						Weave.dispose(entry);
						// remove the empty callback reference from the list
						var removed:CallbackEntry[] = this._callbackEntries.splice(i--, 1); // decrease i because remaining entries have shifted
						if (WeaveAPI.debugAsyncStack)
							this._oldEntries = this._oldEntries ? this._oldEntries.concat(removed) : removed;
						continue;
					}
					// if _preCallback is specified, we don't want to limit recursion because that would cause a loss of information.
					if (entry.recursionCount == 0 || this._preCallback != null)
					{
						entry.recursionCount++; // increase count to signal that we are currently running this callback.
						
						if (this._preCallback != null)
							this._preCallback.apply(this, preCallbackParams);
						
						entry.callback.apply(entry.context || entry.callback['this']);
						
						entry.recursionCount--; // decrease count because the callback finished.
					}
				}
			}

			// This flag is now set to true in case this function was called recursively.  This causes the outer call to exit its loop.
			this._runCallbacksCompleted = true;
		}
		
		public removeCallback(relevantContext:Object, callback:()=>void):void
		{
			// if the callback was added as a grouped callback, we need to remove the trigger function
			GroupedCallbackEntry.removeGroupedCallback(this, relevantContext, callback);
			
			// find the matching CallbackEntry, if any
			for (var outerLoop:int = 0; outerLoop < 2; outerLoop++)
			{
				var entries:CallbackEntry[] = outerLoop == 0 ? this._callbackEntries : this._disposeCallbackEntries;
				for (var index:int = 0; index < entries.length; index++)
				{
					var entry:CallbackEntry = entries[index];
					if (entry.callback === callback && entry.context === relevantContext)
					{
						// Remove the callback by setting the function pointer to null.
						// This is done instead of removing the entry because we may be looping over the _callbackEntries Array right now.
						Weave.dispose(entry);
					}
				}
			}
		}
		
		public get triggerCounter():uint
		{
			return this._triggerCounter;
		}
		
		public get callbacksAreDelayed():boolean
		{
			return this._delayCount > 0
		}
		
		public delayCallbacks():void
		{
			this._delayCount++;
		}

		public resumeCallbacks():void
		{
			if (this._delayCount > 0)
				this._delayCount--;

			if (this._delayCount == 0)
			{
				if (this._runCallbacksIsPending)
					this.triggerCallbacks();
				if (this._wasDisposed)
					this.runDisposeCallbacks();
			}
		}
		
		public addDisposeCallback(relevantContext:Object, callback:()=>void, allowDelay:boolean = false):void
		{
			// don't do anything if the dispose callback was already added
			for (var entry of this._disposeCallbackEntries || [])
				if (entry.callback === callback && entry.context === relevantContext)
					return;
			
			entry = new CallbackEntry(relevantContext, callback);
			if (allowDelay)
				entry.schedule = 1;
			this._disposeCallbackEntries.push(entry);
		}
		
		/**
		 * A list of CallbackEntry objects for when dispose() is called.
		 */		
		private _disposeCallbackEntries:CallbackEntry[] = [];

		public dispose():void
		{
			// remove all callbacks
			if (WeaveAPI.debugAsyncStack)
				this._oldEntries = this._oldEntries ? this._oldEntries.concat(this._callbackEntries) : this._callbackEntries.concat();
			for (var entry of this._callbackEntries || [])
				Weave.dispose(entry);
			this._callbackEntries.length = 0;
			this._wasDisposed = true;
			this.runDisposeCallbacks();
		}
		
		private runDisposeCallbacks():void
		{
			// run & remove dispose callbacks
			for (var entry of this._disposeCallbackEntries || [])
			{
				if (entry.schedule > 0 && this._delayCount > 0)
					continue;
				
				if (entry.callback != null && !WeaveAPI.SessionManager.objectWasDisposed(entry.context))
				{
					entry.callback.apply(entry.context || entry.callback['this']);
					Weave.dispose(entry);
				}
			}
		}
		
		/**
		 * This value is used internally to remember if dispose() was called.
		 */		
		private _wasDisposed:boolean = false;
		
		/**
		 * This flag becomes true after dispose() is called.
		 */		
		public get wasDisposed():boolean
		{
			return this._wasDisposed;
		}

		public addGroupedCallback(relevantContext:Object, groupedCallback:()=>void, triggerCallbackNow:boolean = false, delayWhileBusy:boolean = true):void
		{
			GroupedCallbackEntry.addGroupedCallback(this, relevantContext, groupedCallback, triggerCallbackNow, delayWhileBusy);
		}
		
		public static /* readonly */ STACK_TRACE_TRIGGER:string  = "This is the stack trace from when the callbacks were last triggered.";
	}
}
