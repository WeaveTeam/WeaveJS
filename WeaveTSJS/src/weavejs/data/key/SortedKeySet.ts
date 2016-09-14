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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IKeySet = weavejs.api.data.IKeySet;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This provides the keys from an existing IKeySet in a sorted order.
	 * Callbacks will trigger when the sorted result changes.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.key.SortedKeySet", interfaces: [IKeySet]})
	export class SortedKeySet implements IKeySet
	{
		/**
		 * @param keySet An IKeySet to sort.
		 * @param sortCopyFunction A function that accepts an Array of IQualifiedKeys and returns a new, sorted copy.
		 * @param dependencies A list of ILinkableObjects that affect the result of the compare function.
		 *                     If any IAttributeColumns are provided, the corresponding IColumnStatistics will also
		 *                     be added as dependencies.
		 */		
		constructor(keySet:IKeySet, sortCopyFunction:(keys:IQualifiedKey[])=>IQualifiedKey[]= null, dependencies:ILinkableObject[] = null)
		{
			this._keySet = keySet;
			this._sortCopyFunction = Weave.AS(sortCopyFunction, Function) as (keys:IQualifiedKey[])=>IQualifiedKey[] || QKeyManager.keySortCopy;
			
			for (var object of dependencies || [])
			{
				Weave.linkableChild(this._dependencies, object);
				if (Weave.IS(object, IAttributeColumn))
				{
					var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(Weave.AS(object, IAttributeColumn));
					Weave.linkableChild(this._dependencies, stats);
				}
			}
			Weave.linkableChild(this._dependencies, this._keySet);
		}
		
		private _triggerCounter:uint = 0;
		private _dependencies:ICallbackCollection = Weave.linkableChild(this, CallbackCollection);
		private _keySet:IKeySet;
		private _sortCopyFunction:(keys:IQualifiedKey[])=>IQualifiedKey[] = QKeyManager.keySortCopy;
		private _sortedKeys:IQualifiedKey[] = [];
		
		public containsKey(key:IQualifiedKey):boolean
		{
			return this._keySet.containsKey(key);
		}
		
		/**
		 * This is the list of keys from the IKeySet, sorted.
		 */
		public get keys():IQualifiedKey[]
		{
			if (this._triggerCounter != this._dependencies.triggerCounter)
				this._validate();
			return this._sortedKeys;
		}
		
		private _validate():void
		{
			this._triggerCounter = this._dependencies.triggerCounter;
			if (Weave.isBusy(this))
				return;
			
			WeaveAPI.Scheduler.startTask(this, () => this._asyncTask(), WeaveAPI.TASK_PRIORITY_NORMAL, () => this._asyncComplete());
		}
		
		private static EMPTY_ARRAY:any[] = [];
		
		private _asyncTask():number
		{
			// first try sorting an empty array to trigger any column statistics requests
			this._sortCopyFunction(SortedKeySet.EMPTY_ARRAY);
			
			// stop if any async tasks were started
			if (Weave.isBusy(this._dependencies))
				return 1;
			
			// sort the keys
			this._sortedKeys = this._sortCopyFunction(this._keySet.keys);
			
			return 1;
		}
		
		private _asyncComplete():void
		{
			if (Weave.isBusy(this._dependencies) || this._triggerCounter != this._dependencies.triggerCounter)
				return;
			
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/**
		 * Generates a function like <code>function(keys:Array):Array</code> that returns a sorted copy of an Array of keys.
		 * Note that the resulting sort function depends on WeaveAPI.StatisticsManager, so the sort function should be called
		 * again when statistics change for any of the columns you provide.
		 * @param columns An Array of IAttributeColumns or Functions mapping IQualifiedKeys to Numbers.
		 * @param sortDirections Sort directions (-1, 0, 1)
		 * @return A function that returns a sorted copy of an Array of keys.
		 */
		public static generateSortCopyFunction(columns:Array<IAttributeColumn|((key:IQualifiedKey)=>number)>, sortDirections:number[] = null):(keys:IQualifiedKey[])=>IQualifiedKey[]
		{
			return function(keys:IQualifiedKey[]):IQualifiedKey[]
			{
				var params:Array<IAttributeColumn>|Map<IQualifiedKey, number|string>= [];
				var directions:int[] = [];
				var lastDirection:int = 1;
				for (var i:int = 0; i < columns.length; i++)
				{
					var param:IAttributeColumn|((key:IQualifiedKey)=>number)|Map<IQualifiedKey, number|string> = columns[i] as IAttributeColumn;
					if (Weave.wasDisposed(param))
						continue;
					if (Weave.IS(param, IAttributeColumn))
					{
						var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(Weave.AS(param, IAttributeColumn));
						param = stats.hack_getNumericData() ;
					}
					if (!param || Weave.IS(param, IKeySet))
						continue;
					if (sortDirections && !sortDirections[i])
						continue;
					lastDirection = sortDirections ? sortDirections[i] : 1;
					(params as any[]).push(param);
					directions.push(lastDirection);
				}
				var qkm:QKeyManager = WeaveAPI.QKeyManager as QKeyManager;
				(params as any[]).push(qkm.map_qkey_keyType, qkm.map_qkey_localName);
				directions.push(lastDirection, lastDirection);
				
				//var t:int = getTimer();
				var result:IQualifiedKey[] = StandardLib.sortOn(keys, params, directions, false);
				//trace('sorted',keys.length,'keys in',getTimer()-t,'ms',DebugUtils.getCompactStackTrace(new Error()));
				return result;
			};
		}
	}
}