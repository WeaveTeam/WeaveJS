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

namespace weavejs.data
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnStatistics = weavejs.api.data.IColumnStatistics;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import QKeyManager = weavejs.data.key.QKeyManager;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;

	@Weave.classInfo({id: "weavejs.data.ColumnStatistics", interfaces: [IColumnStatistics]})
	export class ColumnStatistics implements IColumnStatistics
	{
		constructor(column:IAttributeColumn)
		{
			this.column = column;
			column.addImmediateCallback(this, () => Weave.getCallbacks(this).triggerCallbacks(), false, true);
		}
		
		public getNorm(key:IQualifiedKey):number
		{
			var min:number= this.validateCache(this.getMin, NaN);
			var max:number = this.validateCache(this.getMax, NaN);
			var map_numericData:Map<IQualifiedKey, number> = this.validateCache(this.hack_getNumericData, null);
			var value:number = map_numericData ? map_numericData.get(key) : NaN;
			return (value - min) / (max - min);
		}
		
		public getMin():number
		{
			return this.validateCache(this.getMin, NaN);
		}
		
		public getMax():number
		{
			return this.validateCache(this.getMax, NaN);
		}
		
		public getCount():number
		{
			return this.validateCache(this.getCount, 0);
		}
		
		public getSum():number
		{
			return this.validateCache(this.getSum, 0);
		}
		
		public getSquareSum():number
		{
			return this.validateCache(this.getSquareSum, 0);
		}
		
		public getMean():number
		{
			return this.validateCache(this.getMean, NaN);
		}
		
		public getVariance():number
		{
			return this.validateCache(this.getVariance, NaN);
		}
		
		public getStandardDeviation():number
		{
			return this.validateCache(this.getStandardDeviation, NaN);
		}
		
		public getMedian():number
		{
			return this.validateCache(this.getMedian, NaN);
		}
		
		public getSortIndex():Map<IQualifiedKey, number>
		{
			return this.validateCache(this.getSortIndex, null);
		}
		
		public hack_getNumericData():Map<IQualifiedKey, number>
		{
			return this.validateCache(this.hack_getNumericData, null);
		}
		
		/**
		 * Gets a Dictionary that maps a IQualifiedKey to a running total numeric value, based on the order of the keys in the column.
		 */
		public getRunningTotals():Map<IQualifiedKey, number>
		{
			return this.validateCache(this.getRunningTotals, null);
		}
		
		/**********************************************************************/
		
		/**
		 * This maps a stats function of this object to a cached value for the function.
		 * Example: map_method_result.get(getMin) is a cached value for the getMin function.
		 */
		private map_method_result:WeakMap<Function, number|WeakMap<IQualifiedKey, number>> = new WeakMap<Function, number>();
		
		private column:IAttributeColumn;
		public prevTriggerCounter:uint = 0;
		private busy:boolean = false;
		
		/**
		 * This function will validate the cached statistical values for the given column.
		 * @param statsFunction The function we are interested in calling.
		 * @return The cached result for the statsFunction.
		 */
		private validateCache(statsFunction:Function, defaultValue:any):any
		{
			// the cache becomes invalid when the trigger counter has changed
			if (this.prevTriggerCounter != this.column.triggerCounter)
			{
				// statistics are undefined while column is busy
				this.busy = WeaveAPI.SessionManager.linkableObjectIsBusy(column);
				
				// once we have determined the column is not busy, begin the async task to calculate stats
				if (!this.busy)
					this.asyncStart();
			}
			
			var result:any = this.map_method_result.get(statsFunction);
			return result === undefined ? defaultValue : result;
		}
		
		private i:int;
		private keys:IQualifiedKey[];
		
		private min:number;
		private max:number;
		private count:number;
		private sum:number;
		private squareSum:number;
		private mean:number;
		private variance:number;
		private standardDeviation:number;
		
		//TODO - make runningTotals use sorted order instead of original key order
		private map_key_runningTotal:WeakMap<IQualifiedKey, number>;
		
		private outKeys:IQualifiedKey[];
		private outNumbers:number[];
		private map_key_sortIndex:WeakMap<IQualifiedKey, int>; // IQualifiedKey -> int
		private hack_map_key_number:WeakMap<IQualifiedKey, number>; // IQualifiedKey -> Number
		private median:number;
		
		private asyncStart():void
		{
			// remember the trigger counter from when we begin calculating
			this.prevTriggerCounter = this.column.triggerCounter;
			this.i = 0;
			this.keys = this.column.keys;
			this.min = Infinity; // so first value < min
			this.max = -Infinity; // so first value > max
			this.count = 0;
			this.sum = 0;
			this.squareSum = 0;
			this.mean = NaN;
			this.variance = NaN;
			this.standardDeviation = NaN;

			this.outKeys = new Array(this.keys.length);
			this.outNumbers = new Array(this.keys.length);
			this.map_key_sortIndex = new WeakMap<IQualifiedKey, int>();
			this.hack_map_key_number = new WeakMap<IQualifiedKey, number>();
			this.median = NaN;
			
			this.map_key_runningTotal = new WeakMap<IQualifiedKey, number>();
			
			// high priority because preparing data is often a prerequisite for other things
			WeaveAPI.Scheduler.startTask(this, (stopTime:number) => this.iterate(stopTime), WeaveAPI.TASK_PRIORITY_HIGH, () => this.asyncComplete(), Weave.lang("Calculating statistics for {0} values", this.keys.length));
		}
		
		private iterate(stopTime:int):number
		{
			// when the column is found to be busy or modified since last time, stop immediately
			if (this.busy || this.prevTriggerCounter != this.column.triggerCounter)
			{
				// make sure trigger counter is reset because cache is now invalid
				this.prevTriggerCounter = 0;
				return 1;
			}
			
			for (; this.i < this.keys.length; ++this.i)
			{
				if (Date.now() > stopTime)
					return this.i / this.keys.length;
				
				// iterate on this key
				var key:IQualifiedKey = this.keys[this.i];
				var value:number = this.column.getValueFromKey(key, Number);
				// skip keys that do not have an associated numeric value in the column.
				if (isFinite(value))
				{
					this.sum += value;
					this.squareSum += value * value;
					
					if (value < this.min)
						this.min = value;
					if (value > this.max)
						this.max = value;
					
					//TODO - make runningTotals use sorted order instead of original key order
					this.map_key_runningTotal.set(key, this.sum);
					
					this.hack_map_key_number.set(key, value);
					this.outKeys[this.count] = key;
					this.outNumbers[this.count] = value;
					++this.count;
				}
			}
			return 1;
		}
		
		private asyncComplete():void
		{
			if (this.busy)
			{
				Weave.getCallbacks(this).triggerCallbacks();
				return;
			}
			
			if (this.count == 0)
				this.min = this.max = NaN;
			this.mean = this.sum / this.count;
			this.variance = this.squareSum / this.count - this.mean * this.mean;
			this.standardDeviation = Math.sqrt(this.variance);
			
			this.outKeys.length = this.count;
			this.outNumbers.length = this.count;
			var qkm:QKeyManager = WeaveAPI.QKeyManager;
			var outIndices:int[] = StandardLib.sortOn(this.outKeys, [this.outNumbers, qkm.map_qkey_keyType, qkm.map_qkey_localName], null, false, true);
			this.median = this.outNumbers[outIndices[int(this.count / 2)]];
			this.i = this.count;
			while (--this.i >= 0)
				this.map_key_sortIndex.set(this.outKeys[outIndices[this.i]], this.i);
			
			// BEGIN code to get custom min,max
			var tempNumber:number;
			try {
				tempNumber = StandardLib.asNumber(this.column.getMetadata(ColumnMetadata.MIN));
				if (isFinite(tempNumber))
					this.min = tempNumber;
			} catch (e) { }
			try {
				tempNumber = StandardLib.asNumber(this.column.getMetadata(ColumnMetadata.MAX));
				if (isFinite(tempNumber))
					this.max = tempNumber;
			} catch (e) { }
			// END code to get custom min,max
			
			// save the statistics for this column in the cache
			this.map_method_result.set(this.getMin, this.min);
			this.map_method_result.set(this.getMax, this.max);
			this.map_method_result.set(this.getCount, this.count);
			this.map_method_result.set(this.getSum, this.sum);
			this.map_method_result.set(this.getSquareSum, this.squareSum);
			this.map_method_result.set(this.getMean, this.mean);
			this.map_method_result.set(this.getVariance, this.variance);
			this.map_method_result.set(this.getStandardDeviation, this.standardDeviation);
			this.map_method_result.set(this.getMedian, this.median);
			this.map_method_result.set(this.getSortIndex, this.map_key_sortIndex);
			this.map_method_result.set(this.hack_getNumericData, this.hack_map_key_number);
			this.map_method_result.set(this.getRunningTotals, this.map_key_runningTotal);
			
			// trigger callbacks when we are done
			Weave.getCallbacks(this).triggerCallbacks();
		}
	}
}
