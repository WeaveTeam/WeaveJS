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
	import Aggregation = weavejs.api.data.Aggregation;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IBaseColumn = weavejs.api.data.IBaseColumn;
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import AsyncSort = weavejs.util.AsyncSort;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	
	/**
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.StringColumn", interfaces: [IPrimitiveColumn, IBaseColumn, IAttributeColumn, ICallbackCollection]})
	export class StringColumn extends AbstractAttributeColumn implements IPrimitiveColumn, IBaseColumn
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super(metadata);
			
			this.dataTask = new ColumnDataTask(this, (value:string) => this.filterStringValue(value), () => this.handleDataTaskComplete());
			this.dataCache = new Dictionary2D<GenericClass, IQualifiedKey, any>();
			Weave.getCallbacks(this._asyncSort).addImmediateCallback(this, this.handleSortComplete);
		}
		
		/* override */ public getMetadata(propertyName:string):string
		{
			var value:string = super.getMetadata(propertyName);
			if (!value && propertyName == ColumnMetadata.DATA_TYPE)
				return DataType.STRING;
			return value;
		}

		/**
		 * Sorted list of unique string values.
		 */
		private _uniqueStrings:string[] = [];
		
		/**
		 * String -> index in sorted _uniqueStrings
		 */
		private _uniqueStringLookup = new Map<string, int>();

		public setRecords(keys:IQualifiedKey[], stringData:string[]):void
		{
			this.dataTask.begin(keys, stringData);
			this._asyncSort.abort();
			
			this._uniqueStrings.length = 0;
			this._uniqueStringLookup.clear();
			this._stringToNumberFunction = null;
			this._numberToStringFunction = null;
			
			// compile the number format function from the metadata
			var numberFormat:string = this.getMetadata(ColumnMetadata.NUMBER);
			if (numberFormat)
			{
				try
				{
					this._stringToNumberFunction = JS.compile(numberFormat, [ColumnMetadata.STRING, 'array'], (e:Error)=>this.errorHandler(e)) as (value:string)=>number;
				}
				catch (e)
				{
					console.error(e);
				}
			}
			
			// compile the string format function from the metadata
			var stringFormat:string = this.getMetadata(ColumnMetadata.STRING);
			if (stringFormat)
			{
				try
				{
					this._numberToStringFunction = JS.compile(stringFormat, [ColumnMetadata.NUMBER], (e:Error)=>this.errorHandler(e)) as (value:number)=>string;
				}
				catch (e)
				{
					console.error(e);
				}
			}
		}
		
		private errorHandler(e:Error):void
		{
			var str:string = Weave.IS(e, Error) ? e.message : String(e);
			str = StandardLib.substitute("Error in script for AttributeColumn {0}:\n{1}", Weave.stringify(this._metadata), str);
			if (this._lastError != str)
			{
				this._lastError = str;
				console.error(e);
			}
		}
		
		private _lastError:string;
		
		// variables that do not get reset after async task
		private _stringToNumberFunction:(value:string)=>number = null;
		private _numberToStringFunction:(value:number)=>string = null;
		
		private filterStringValue(value:string):boolean
		{
			if (!value)
				return false;
			
			// keep track of unique strings
			if (!this._uniqueStringLookup.has(value))
			{
				this._uniqueStrings.push(value);
				// initialize mapping
				this._uniqueStringLookup.set(value, -1);
			}
			
			return true;
		}
		
		private handleDataTaskComplete():void
		{
			// begin sorting unique strings previously listed
			this._asyncSort.beginSort(this._uniqueStrings, AsyncSort.compareCaseInsensitive);
		}
		
		private _asyncSort:AsyncSort = Weave.disposableChild(this, AsyncSort);
		
		private handleSortComplete():void
		{
			if (!this._asyncSort.result)
				return;
			
			this._i = 0;
			this._numberToString.clear();
			this._stringToNumber.clear();
			// high priority because not much can be done without data
			WeaveAPI.Scheduler.startTask(this, (stopTime:int) => this._iterate(stopTime), WeaveAPI.TASK_PRIORITY_HIGH, () => this.asyncComplete());
		}
		
		private _i:int;
		private _numberToString = new Map<number, string>();
		private _stringToNumber = new Map<string, number>();
		
		private _iterate(stopTime:int):number
		{
			for (; this._i < this._uniqueStrings.length; this._i++)
			{
				if (Date.now() > stopTime)
					return this._i / this._uniqueStrings.length;
				
				var string:string = this._uniqueStrings[this._i];
				this._uniqueStringLookup.set(string, this._i);
				
				if (this._stringToNumberFunction != null)
				{
					var number:number = StandardLib.asNumber(this._stringToNumberFunction(string));
					this._stringToNumber.set(string, number);
					this._numberToString.set(number, string);
				}
			}
			return 1;
		}
		
		private asyncComplete():void
		{
			// cache needs to be cleared after async task completes because some values may have been cached while the task was busy
			this.dataCache.map.clear();
			this.triggerCallbacks();
		}

		// find the closest string value at a given normalized value
		public deriveStringFromNumber(number:number):string
		{
			if (this._metadata && this._metadata[ColumnMetadata.NUMBER])
			{
				if (this._numberToString.has(number))
					return this._numberToString.get(number);
				
				if (this._numberToStringFunction != null)
				{
					var string:string = StandardLib.asString(this._numberToStringFunction(number));
					this._numberToString.set(number, string);
					return string;
				}
			}
			else if (number == int(number) && 0 <= number && number < this._uniqueStrings.length)
			{
				return this._uniqueStrings[int(number)];
			}
			return '';
		}
		
		/* override */ protected generateValue(key:IQualifiedKey, dataType:GenericClass):any
		{
			var array:any[] = this.dataTask.map_key_arrayData.get(key);
			
			if (dataType === String)
				return StringColumn.aggregate(array, this._metadata ? this._metadata[ColumnMetadata.AGGREGATION] : null) || '';
			
			var string:string = this.getValueFromKey(key, String);
			
			if (dataType === Number)
			{
				if (this._stringToNumberFunction != null)
					return Number(this._stringToNumber.get(string));
				
				return Number(this._uniqueStringLookup.get(string));
			}
			
			if (dataType === IQualifiedKey)
			{
				var type:string = this._metadata ? this._metadata[ColumnMetadata.DATA_TYPE] : null;
				if (!type)
					type = DataType.STRING;
				return WeaveAPI.QKeyManager.getQKey(type, string);
			}
			
			return null;
		}
		
		/**
		 * Aggregates an Array of Strings into a single String.
		 * @param strings An Array of Strings.
		 * @param aggregation One of the constants in weave.api.data.Aggregation.
		 * @return An aggregated String.
		 * @see weave.api.data.Aggregation
		 */		
		public static aggregate(strings:string[], aggregation:string):string
		{
			if (!strings)
				return undefined;
			
			if (!aggregation)
				aggregation = Aggregation.DEFAULT;
			
			switch (aggregation)
			{
				default:
				case Aggregation.SAME:
					var first:string = strings[0];
					for (var value of strings || [])
						if (value != first)
							return Weave.lang(Aggregation.AMBIGUOUS_DATA);
					return first;
				
				case Aggregation.FIRST:
					return strings[0];
				
				case Aggregation.LAST:
					return strings[strings.length - 1];
			}
		}
		
		public static getSupportedAggregationModes():string[]
		{
			return [Aggregation.SAME, Aggregation.FIRST, Aggregation.LAST];
		}
	}
}
