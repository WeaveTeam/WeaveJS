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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IDynamicKeyFilter = weavejs.api.data.IDynamicKeyFilter;
	import IFilteredKeySet = weavejs.api.data.IFilteredKeySet;
	import IKeyFilter = weavejs.api.data.IKeyFilter;
	import IKeySet = weavejs.api.data.IKeySet;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IDisposableObject = weavejs.api.core.IDisposableObject;
	
	/**
	 * A FilteredKeySet has a base set of keys and an optional filter.
	 * The resulting set of keys becomes the intersection of the base set with the filter.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.FilteredKeySet", interfaces: [IFilteredKeySet, IKeySet, ICallbackCollection, IDisposableObject]})
	export class FilteredKeySet extends CallbackCollection implements IFilteredKeySet
	{
		public static debug:boolean = false;
		
		constructor()
		{
			super();
			if (FilteredKeySet.debug)
				this.addImmediateCallback(this, this._firstCallback);
		}
		
		private _firstCallback():void { DebugUtils.debugTrace(this,'trigger',this.keys.length,'keys'); }

		/* override */public dispose():void
		{
			super.dispose();
			this.setColumnKeySources(null);
		}
		
		private _baseKeySet:IKeySet = null; // stores the base IKeySet
		// this stores the IKeyFilter
		private _dynamicKeyFilter:DynamicKeyFilter = Weave.linkableChild(this, DynamicKeyFilter);
		private _filteredKeys:IQualifiedKey[] = []; // stores the filtered list of keys
		private map_key= new WeakMap<IQualifiedKey, boolean>();
		private _generatedKeySets:IKeySet[];
		private _setColumnKeySources_arguments:IArguments;
		
		/**
		 * When this is set to true, the inverse of the filter will be used to filter the keys.
		 * This means any keys appearing in the filter will be excluded from this key set.
		 */
		private /* readonly */ inverseFilter:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
		
		/**
		 * This sets up the FilteredKeySet to get its base set of keys from a list of columns and provide them in sorted order.
		 * @param columns An Array of IAttributeColumns to use for comparing IQualifiedKeys.
		 * @param sortDirections Array of sort directions corresponding to the columns and given as integers (1=ascending, -1=descending, 0=none).
		 * @param keySortCopy A function that returns a sorted copy of an Array of keys. If specified, descendingFlags will be ignored and this function will be used instead.
		 * @param keyInclusionLogic Passed to KeySetUnion constructor.
		 * @see weave.data.KeySets.SortedKeySet#generateCompareFunction()
		 */
		public setColumnKeySources(columns:(IKeySet|IAttributeColumn)[], sortDirections:number[] = null, keySortCopy:(keys:IQualifiedKey[])=>IQualifiedKey[] = null, keyInclusionLogic:(key:IQualifiedKey)=>boolean = null):void
		{
			if (StandardLib.compare(this._setColumnKeySources_arguments, arguments) == 0)
				return;
			
			// unlink from the old key set
			if (this._generatedKeySets)
			{
				for (var keySet of this._generatedKeySets || [])
					Weave.dispose(keySet);
				this._generatedKeySets = null;
			}
			else
			{
				this.setSingleKeySource(null);
			}
			
			this._setColumnKeySources_arguments = arguments;
			
			if (columns)
			{
				// KeySetUnion should not trigger callbacks
				var union:KeySetUnion = Weave.disposableChild(this, new KeySetUnion(keyInclusionLogic));
				for (var keySet of columns as IKeySet[])
				{
					union.addKeySetDependency(keySet);
					if (Weave.IS(keySet, IAttributeColumn))
					{
						var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(Weave.AS(keySet, IAttributeColumn));
						Weave.linkableChild(union, stats);
					}
				}
				
				if (FilteredKeySet.debug && keySortCopy == null)
					console.log(DebugUtils.debugId(this), 'sort by [', columns, ']');
				
				var sortCopy = keySortCopy || SortedKeySet.generateSortCopyFunction(columns as IAttributeColumn[], sortDirections) as (keys:IQualifiedKey[])=>IQualifiedKey[];
				// SortedKeySet should trigger callbacks
				var sorted:SortedKeySet = Weave.linkableChild(this, new SortedKeySet(union, sortCopy, columns));
				this._generatedKeySets = [union, sorted];
				
				this._baseKeySet = sorted;
			}
			else
			{
				this._baseKeySet = null;
			}
			
			this.triggerCallbacks();
		}
		
		/**
		 * This function sets the base IKeySet that is being filtered.
		 * @param newBaseKeySet A new IKeySet to use as the base for this FilteredKeySet.
		 */
		public setSingleKeySource(keySet:IKeySet):void
		{
			if (this._generatedKeySets)
				this.setColumnKeySources(null);
			
			if (this._baseKeySet == keySet)
				return;
			
			// unlink from the old key set
			if (this._baseKeySet != null)
				Weave.getCallbacks(this._baseKeySet).removeCallback(this, this.triggerCallbacks);
			
			this._baseKeySet = keySet; // save pointer to new base key set
			
			// link to new key set
			if (this._baseKeySet != null)
				Weave.getCallbacks(this._baseKeySet).addImmediateCallback(this, this.triggerCallbacks, false, true);
			
			this.triggerCallbacks();
		}
		
		/**
		 * @return The interface for setting a filter that is applied to the base key set.
		 */
		public get keyFilter():IDynamicKeyFilter { return this._dynamicKeyFilter; }

		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				this.validateFilteredKeys();
			return this.map_key.has(key);
		}

		/**
		 * @return The keys in this IKeySet.
		 */
		public get keys():IQualifiedKey[]
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				this.validateFilteredKeys();
			return this._filteredKeys;
		}
		
		private _prevTriggerCounter:uint; // used to remember if the _filteredKeys are valid

		/**
		 * @private
		 */
		private validateFilteredKeys():void
		{
			this._prevTriggerCounter = this.triggerCounter; // this prevents the function from being called again before callbacks are triggered again.
			
			this._asyncFilter = this._dynamicKeyFilter.getInternalKeyFilter();
			
			if (this._baseKeySet == null)
			{
				// no keys when base key set is undefined
				this._filteredKeys = [];
				this.map_key = new WeakMap<IQualifiedKey, boolean>();
				return;
			}
			if (!this._asyncFilter)
			{
				// use base key set
				this._filteredKeys = this._baseKeySet.keys;
				this.map_key = new WeakMap<IQualifiedKey, boolean>();
				for (var key of this._filteredKeys || [])
					this.map_key.set(key, true);
				return;
			}
			
			this._i = 0;
			this._asyncInput = this._baseKeySet.keys;
			this._asyncOutput = [];
			this._async_map_key = new WeakMap<IQualifiedKey, boolean>();
			this._asyncInverse = this.inverseFilter.value;
			
			// high priority because all visualizations depend on key sets
			WeaveAPI.Scheduler.startTask(this, this.iterate, WeaveAPI.TASK_PRIORITY_HIGH, this.asyncComplete, Weave.lang('Filtering {0} keys', this._asyncInput.length));
		}
		
		private _i:int;
		private _asyncInverse:boolean;
		private _asyncFilter:IKeyFilter;
		private _asyncInput:IQualifiedKey[];
		private _asyncOutput:IQualifiedKey[];
		private _async_map_key:WeakMap<IQualifiedKey, boolean>;
		
		private iterate(stopTime:int):number
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				return 1;
			
			for (; this._i < this._asyncInput.length; ++this._i)
			{
				if (!this._asyncFilter)
					return 1;
				if (Date.now() > stopTime)
					return this._i / this._asyncInput.length;
				
				var key:IQualifiedKey = this._asyncInput[this._i];
				var contains:boolean = this._asyncFilter.containsKey(key);
				if (contains != this._asyncInverse)
				{
					this._asyncOutput.push(key);
					this._async_map_key.set(key, true);
				}
			}
			
			return 1;
		}
		private asyncComplete():void
		{
			if (this._prevTriggerCounter != this.triggerCounter)
			{
				this.validateFilteredKeys();
				return;
			}
			
			this._prevTriggerCounter++;
			this._filteredKeys = this._asyncOutput;
			this.map_key = this._async_map_key;
			this.triggerCallbacks();
		}
	}
}
