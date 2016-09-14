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

namespace weavejs.data.key
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	import IKeySet = weavejs.api.data.IKeySet;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	
	/**
	 * This key set is the union of several other key sets.  It has no session state.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.KeySetUnion", interfaces: [IKeySet, IDisposableObject]})
	export class KeySetUnion implements IKeySet, IDisposableObject
	{
		public static debug:Boolean = false;
		
		/**
		 * @param keyInclusionLogic A function that accepts an IQualifiedKey and returns true or false.
		 */		
		constructor(keyInclusionLogic:(key:IQualifiedKey)=>boolean = null)
		{
			this._keyInclusionLogic = keyInclusionLogic;
			
			if (KeySetUnion.debug)
				Weave.getCallbacks(this).addImmediateCallback(this, this._firstCallback);
		}
		
		private _firstCallback():void { DebugUtils.debugTrace(this,'trigger', this.keys.length,'keys'); }
		
		/**
		 * This will be used to determine whether or not to include a key.
		 */		
		private _keyInclusionLogic:(key:IQualifiedKey)=>boolean = null;
		
		/**
		 * This will add an IKeySet as a dependency and include its keys in the union.
		 * @param keySet
		 */
		public addKeySetDependency(keySet:IKeySet):void
		{
			if (this._keySets.indexOf(keySet) < 0)
			{
				this._keySets.push(keySet);
				Weave.getCallbacks(keySet).addDisposeCallback(this, this.asyncStart);
				Weave.getCallbacks(keySet).addImmediateCallback(this, this.asyncStart, true);
			}
		}
		
		/**
		 * This is a list of the IQualifiedKey objects that define the key set.
		 */
		public get keys():IQualifiedKey[]
		{
			return this._allKeys;
		}

		/**
		 * @param key A IQualifiedKey object to check.
		 * @return true if the given key is included in the set.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			return this.map_key.get(key) === true;
		}
		
		private _keySets:IKeySet[] = []; // Array of IKeySet
		private _allKeys:IQualifiedKey[] = []; // Array of IQualifiedKey
		private map_key = new WeakMap<IQualifiedKey, boolean>(); // IQualifiedKey -> Boolean
		
		/**
		 * Use this to check asynchronous task busy status.  This is kept separate because if we report busy status we need to
		 * trigger callbacks when an asynchronous task completes, but we don't want to trigger KeySetUnion callbacks when nothing
		 * changes as a result of completing the asynchronous task.
		 */
		public /* readonly */ busyStatus:ICallbackCollection = Weave.disposableChild(this, CallbackCollection); // separate owner for the async task to avoid affecting our busy status
		
		private _asyncKeys:IQualifiedKey[] // keys from current key set
		private _asyncKeySetIndex:int; // index of current key set
		private _asyncKeyIndex:int; // index of current key
		private _prevCompareCounter:int; // keeps track of how many new keys are found in the old keys list
		private _async_map_key:WeakMap<IQualifiedKey, boolean>; // for comparing to new keys lookup
		private _asyncAllKeys:IQualifiedKey[]; // new allKeys array in progress
		
		private asyncStart():void
		{
			// remove disposed key sets
			for (var i:int = this._keySets.length; i--;)
				if (Weave.wasDisposed(this._keySets[i]))
					this._keySets.splice(i, 1);
			
			// restart async task
			this._prevCompareCounter = 0;
			this._asyncAllKeys = [];
			this._async_map_key = new WeakMap<IQualifiedKey, boolean>();
			this._asyncKeys = null;
			this._asyncKeySetIndex = 0;
			this._asyncKeyIndex = 0;
			// high priority because all visualizations depend on key sets
			WeaveAPI.Scheduler.startTask(this.busyStatus, (stopTime:number) => this.asyncIterate(stopTime), WeaveAPI.TASK_PRIORITY_HIGH, () => this.asyncComplete(), Weave.lang("Computing the union of {0} key sets", this._keySets.length));
		}
		
		private asyncIterate(stopTime:int):number
		{
			for (; this._asyncKeySetIndex < this._keySets.length; this._asyncKeySetIndex++)
			{
				if (this._asyncKeys == null)
				{
					this._asyncKeys = this._keySets[this._asyncKeySetIndex].keys;
					this._asyncKeyIndex = 0;
				}
				
				for (; this._asyncKeys && this._asyncKeyIndex < this._asyncKeys.length; this._asyncKeyIndex++)
				{
					if (Date.now() > stopTime)
						return (this._asyncKeySetIndex + this._asyncKeyIndex / this._asyncKeys.length) / this._keySets.length;
					
					var key:IQualifiedKey = this._asyncKeys[this._asyncKeyIndex];
					if (!this._async_map_key.has(key)) // if we haven't seen this key yet
					{
						var includeKey:boolean = (this._keyInclusionLogic == null) ? true : this._keyInclusionLogic(key);
						this._async_map_key.set(key, includeKey);
						
						if (includeKey)
						{
							this._asyncAllKeys.push(key);
							
							// keep track of how many keys we saw both previously and currently
							if (this.map_key.get(key) === true)
								this._prevCompareCounter++;
						}
					}
				}

				this._asyncKeys = null;
			}
			return 1; // avoids division by zero
		}
		
		private asyncComplete():void
		{
			// detect change
			if (this._allKeys.length != this._asyncAllKeys.length || this._allKeys.length != this._prevCompareCounter)
			{
				this._allKeys = this._asyncAllKeys;
				this.map_key = this._async_map_key;
				Weave.getCallbacks(this).triggerCallbacks();
			}
			
			this.busyStatus.triggerCallbacks();
		}
		
		public dispose():void
		{
			this._keySets = null;
			this._allKeys = null;
			this.map_key = null;
			this._async_map_key = null;
		}
	}
}
