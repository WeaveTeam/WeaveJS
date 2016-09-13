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
	import Dictionary2D = weavejs.util.Dictionary2D;
	import StandardLib = weavejs.util.StandardLib;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import JS = weavejs.util.JS;
	/**
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.NumberColumn", interfaces: [IPrimitiveColumn, IBaseColumn, ICallbackCollection, IAttributeColumn]})
	export class NumberColumn extends AbstractAttributeColumn implements IPrimitiveColumn, IBaseColumn
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super(metadata);
			
			this.dataTask = new ColumnDataTask(this, isFinite, () => this.asyncComplete());
			this.dataCache = new Dictionary2D<GenericClass, IQualifiedKey, any>();
		}
		
		/* override */ public getMetadata(propertyName:string):string
		{
			if (propertyName == ColumnMetadata.DATA_TYPE)
				return DataType.NUMBER;
			return super.getMetadata(propertyName);
		}

		public setRecords(keys:IQualifiedKey[], numericData:any[]):void
		{
			this.dataTask.begin(keys, numericData);

			this.numberToStringFunction = null;
			// compile the string format function from the metadata
			var stringFormat:string = this.getMetadata(ColumnMetadata.STRING);
			if (stringFormat)
			{
				try
				{
					this.numberToStringFunction = JS.compile(stringFormat, [ColumnMetadata.NUMBER, 'array'], (e:Error)=>this.errorHandler(e)) as (value:number)=>string;
				}
				catch (e)
				{
					this.errorHandler(e);
				}
			}
		}
		
		private asyncComplete():void
		{
			// cache needs to be cleared after async task completes because some values may have been cached while the task was busy
			this.dataCache.map.clear();
			this.triggerCallbacks();
		}
		
		private errorHandler(e:Error):void
		{
			var str:string = Weave.IS(e, Error) ? e.message : String(e);
			str = StandardLib.substitute("Error in script for attribute column {0}:\n{1}", Weave.stringify(this._metadata), str);
			if (this._lastError != str)
			{
				this._lastError = str;
				console.error(e);
			}
		}
		
		private _lastError:string;
		
		private numberToStringFunction:(number:number, otherNumbers:number[])=>string = null;
		
		/**
		 * Get a string value for a given number.
		 */
		public deriveStringFromNumber(number:number):string
		{
			if (this.numberToStringFunction != null)
				return StandardLib.asString(this.numberToStringFunction(number, [number]));
			return StandardLib.formatNumber(number);
		}
		
		/* override */ protected generateValue(key:IQualifiedKey, dataType:GenericClass):any
		{
			var array:any[] = this.dataTask.map_key_arrayData.get(key);
			
			if (dataType === Number)
				return NumberColumn.aggregate(array, this._metadata ? this._metadata[ColumnMetadata.AGGREGATION] : null);
			
			if (dataType === String)
			{
				var number:number = this.getValueFromKey(key, Number);
				if (this.numberToStringFunction != null)
				{
					return StandardLib.asString(this.numberToStringFunction(number, array));
				}
				if (isNaN(number) && array && array.length > 1)
				{
					var aggregation:string = (this._metadata && Weave.AS(this._metadata[ColumnMetadata.AGGREGATION], String)) as string || Aggregation.DEFAULT;
					if (aggregation == Aggregation.SAME)
						return Weave.lang(Aggregation.AMBIGUOUS_DATA);
				}
				return StandardLib.formatNumber(number);
			}
			
			if (dataType === IQualifiedKey)
				return WeaveAPI.QKeyManager.getQKey(DataType.NUMBER, this.getValueFromKey(key, Number));
			
			return null;
		}

		/**
		 * Aggregates an Array of Numbers into a single Number.
		 * @param numbers An Array of Numbers.
		 * @param aggregation One of the constants in weave.api.data.Aggregation.
		 * @return An aggregated Number.
		 * @see weave.api.data.Aggregation
		 */		
		public static aggregate(numbers:number[], aggregation:string):number
		{
			if (!numbers)
				return NaN;
			
			if (!aggregation)
				aggregation = Aggregation.DEFAULT;
			
			switch (aggregation)
			{
				case Aggregation.SAME:
					var first = numbers[0];
					for (var value of numbers || [])
						if (value != first)
							return NaN;
					return first;
				case Aggregation.FIRST:
					return numbers[0];
				case Aggregation.LAST:
					return numbers[numbers.length - 1];
				case Aggregation.COUNT:
					return numbers.length;
				case Aggregation.MEAN:
					return StandardLib.mean(numbers);
				case Aggregation.SUM:
					return StandardLib.sum(numbers);
				case Aggregation.MIN:
					return Math.min.apply(null, numbers);
				case Aggregation.MAX:
					return Math.max.apply(null, numbers);
				default:
					return NaN;
			}
		}
	}
}
