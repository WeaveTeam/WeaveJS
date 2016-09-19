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

namespace weavejs.data.column
{
	import WeaveAPI = weavejs.WeaveAPI;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import StandardLib = weavejs.util.StandardLib;

	export class ColumnDataTask
	{
		constructor(parentColumn:IAttributeColumn, dataFilter:(value:any)=>boolean = null, callback:()=>void = null)
		{
			if (callback == null)
				callback = parentColumn.triggerCallbacks;
			
			this.parentColumn = parentColumn;
			this.dataFilter = dataFilter;
			this.callback = callback;
		}
		
		/**
		 * Asynchronous output.
		 * recordKey:IQualifiedKey -&gt; Array&lt;Number&gt;
		 */
		public uniqueKeys:IQualifiedKey[] = [];
		
		/**
		 * Asynchronous output.
		 */
		public map_key_arrayData = new Map<IQualifiedKey, any[]>();
		
		/**
		 * @param inputKeys An Array of IQualifiedKey objects.
		 * @param inputData An Array of data values corresponding to the inputKeys.
		 */
		public begin(inputKeys:IQualifiedKey[], inputData:any[]):void
		{
			if (inputKeys.length != inputData.length)
				throw new Error(StandardLib.substitute("Arrays are of different length ({0} != {1})", inputKeys.length, inputData.length));
			
			// this.dataFilter = this.dataFilter;
			this.keys = inputKeys;
			this.data = inputData;
			this.i = 0;
			this.n = this.keys.length;
			this.uniqueKeys = [];
			this.map_key_arrayData = new Map<IQualifiedKey, any[]>();
			
			// high priority because not much can be done without data
			WeaveAPI.Scheduler.startTask(this.parentColumn, this.iterate, WeaveAPI.TASK_PRIORITY_HIGH, this.callback, Weave.lang("Processing {0} records", this.n));
		}
		
		private parentColumn:IAttributeColumn;
		private dataFilter:(value:any)=>boolean;
		private callback:()=>void;
		private keys:IQualifiedKey[];
		private data:any[];
		private i:int;
		private n:int;
		
		private iterate=(stopTime:int):number=>
		{
			for (; this.i < this.n; this.i++)
			{
				if (Date.now() > stopTime)
					return this.i / this.n;
				
				var value:any = this.data[this.i];
				if (this.dataFilter != null && !this.dataFilter(value))
					continue;
				
				var key:IQualifiedKey = this.keys[this.i];
				var array:any[] = this.map_key_arrayData.get(key);
				if (!array)
				{
					this.uniqueKeys.push(key);
					this.map_key_arrayData.set(key, array = [value]);
				}
				else
				{
					array.push(value);
				}
			}
			return 1;
		}
	}
}
