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
	import Dictionary2D = weavejs.util.Dictionary2D;

	/**
	 * @private
	 */
	@Weave.classInfo({id: "weavejs.core.GroupedCallbackEntry"})
	export class GroupedCallbackEntry extends CallbackEntry
	{
		public static addGroupedCallback(callbackCollection:ICallbackCollection, relevantContext:Object, groupedCallback:() => void, triggerCallbackNow:boolean, delayWhileBusy:boolean):void
		{
			if (!relevantContext)
				relevantContext = GroupedCallbackEntry.CONTEXT_PLACEHOLDER;
			
			// make sure the actual function is not already added as a callback.
			callbackCollection.removeCallback(relevantContext, groupedCallback);
			
			// get (or create) the shared entry for the groupedCallback
			var entry:GroupedCallbackEntry = GroupedCallbackEntry.d2d_context_callback_entry.get(relevantContext, groupedCallback);
			if (!entry)
			{
				entry = new GroupedCallbackEntry(relevantContext, groupedCallback);
				GroupedCallbackEntry.d2d_context_callback_entry.set(relevantContext, groupedCallback, entry);
			}
			
			// add this callbackCollection to the list of targets
			entry.targets.push(callbackCollection);
			
			// once delayWhileBusy is set to true, don't set it to false
			if (delayWhileBusy)
				entry.delayWhileBusy = true;
			
			// add the trigger function as a callback
			callbackCollection.addImmediateCallback(relevantContext, entry.trigger, triggerCallbackNow);
		}
		
		public static removeGroupedCallback(callbackCollection:ICallbackCollection, relevantContext:Object, groupedCallback:() => void):void
		{
			if (!relevantContext)
				relevantContext = GroupedCallbackEntry.CONTEXT_PLACEHOLDER;
			
			var entry:GroupedCallbackEntry = GroupedCallbackEntry.d2d_context_callback_entry.get(relevantContext, groupedCallback);
			if (entry)
			{
				// remove the trigger function as a callback
				callbackCollection.removeCallback(relevantContext, entry.trigger);
				
				// remove the callbackCollection from the list of targets
				var index:int = entry.targets.indexOf(callbackCollection);
				if (index >= 0)
				{
					entry.targets.splice(index, 1);
					if (entry.targets.length == 0)
					{
						// when there are no more targets, remove the entry
						GroupedCallbackEntry.d2d_context_callback_entry.remove(relevantContext, groupedCallback);
					}
				}
			}
		}
		
		/**
		 * This function gets called once per frame and allows grouped callbacks to run.
		 */
		private static _handleGroupedCallbacks():void
		{
			var i:int;
			var entry:GroupedCallbackEntry;
		
			// Handle grouped callbacks in the order they were triggered,
			// anticipating that more may be added to the end of the list in the process.
			for (i = 0; i < GroupedCallbackEntry._triggeredEntries.length; i++)
			{
				entry = GroupedCallbackEntry._triggeredEntries[i];
				entry.handleGroupedCallback();
			}
			
			// reset triggered entries for next frame
			for (entry of GroupedCallbackEntry._triggeredEntries || [])
				entry.handled = entry.triggered = entry.triggeredAgain = false;
			GroupedCallbackEntry._triggeredEntries.length = 0;
		}
		
		/**
		 * Used as a placeholder for a missing context because null cannot be used as a WeakMap key.
		 */
		private static CONTEXT_PLACEHOLDER:Object = {};
		
		/**
		 * This gets set to true when the static _handleGroupedCallbacks() callback has been added as a frame listener.
		 */
		private static _initialized:boolean = false;
		
		/**
		 * This maps a groupedCallback function to its corresponding GroupedCallbackEntry.
		 */
		private static /* readonly */ d2d_context_callback_entry = new Dictionary2D<Object, Callback, GroupedCallbackEntry>(true, true);
		
		/**
		 * This is a list of GroupedCallbackEntry objects in the order they were triggered.
		 */		
		private static /* readonly */ _triggeredEntries:GroupedCallbackEntry[] = [];
		
		/**
		 * Constructor
		 */
		constructor(context:Object, groupedCallback:() => void)
		{
			// context will be an array of contexts
			super(context, groupedCallback);
			
			if (!GroupedCallbackEntry._initialized)
			{
				GroupedCallbackEntry._initialized = true;
				WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(null, GroupedCallbackEntry._handleGroupedCallbacks);
			}
		}
		
		/**
		 * If true, the callback was handled this frame.
		 */
		public handled:boolean = false;
				
		/**
		 * If true, the callback was triggered this frame.
		 */
		public triggered:boolean = false;
		
		/**
		 * If true, the callback was triggered again from another grouped callback.
		 */
		public triggeredAgain:boolean = false;
		
		/**
		 * Specifies whether to delay the callback while the contexts are busy.
		 */
		public delayWhileBusy:boolean = false;
		
		/**
		 * An Array of ICallbackCollections to which the callback was added.
		 */
		public targets:ICallbackCollection[] = [];
		
		/**
		 * Marks the entry to be handled later (unless already triggered this frame).
		 * This also takes care of preventing recursion.
		 */
		public trigger():void
		{
			if (!this.triggered)
			{
				// not previously triggered
				GroupedCallbackEntry._triggeredEntries.push(this);
				this.triggered = true;
			}
			else if (this.handled && !this.triggeredAgain)
			{
				// triggered again after being handled
				GroupedCallbackEntry._triggeredEntries.push(this);
				this.triggeredAgain = true;
			}
		}
		
		/**
		 * Checks the context and targets before calling groupedCallback
		 */
		public handleGroupedCallback():void
		{
			if (!this.callback)
			{
				Weave.dispose(this);
				return;
			}
			
			for (var i:int = 0; i < this.targets.length; i++)
			{
				var target:ICallbackCollection = this.targets[i];
				if (WeaveAPI.SessionManager.objectWasDisposed(target))
					this.targets.splice(i--, 1);
				else if (this.delayWhileBusy && WeaveAPI.SessionManager.linkableObjectIsBusy(target))
					return;
			}
			
			// if there are no more relevant contexts for this callback, don't run it.
			if (this.targets.length == 0)
			{
				this.dispose();
				GroupedCallbackEntry.d2d_context_callback_entry.remove(this.context, this.callback);
				return;
			}
			
			// avoid immediate recursion
			if (this.recursionCount == 0)
			{
				this.recursionCount++;
				
				this.callback.apply(this.context === GroupedCallbackEntry.CONTEXT_PLACEHOLDER ? (this.callback as any)['this'] : this.context);
				this.handled = true;
				
				this.recursionCount--;
			}
		}
		
		public dispose():void
		{
			for (var target of this.targets || [])
				GroupedCallbackEntry.removeGroupedCallback(target, this.context, this.callback);
			super.dispose();
		}
	}
}
