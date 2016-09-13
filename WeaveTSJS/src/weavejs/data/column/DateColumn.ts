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
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import DateFormat = weavejs.api.data.DateFormat;
	import IBaseColumn = weavejs.api.data.IBaseColumn;
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import DateUtils = weavejs.util.DateUtils;
	import StandardLib = weavejs.util.StandardLib;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import JS = weavejs.util.JS;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	/**
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.DateColumn", interfaces: [IAttributeColumn, IPrimitiveColumn, IBaseColumn, ICallbackCollection]})
	export class DateColumn extends AbstractAttributeColumn implements IPrimitiveColumn, IBaseColumn
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super(metadata);
		}
		
		private _uniqueKeys:IQualifiedKey[] = new Array();
		private map_key_data = new Map<IQualifiedKey, any>();
		
		// temp variables for async task
		private _i:int;
		private _keys:IQualifiedKey[];
		private _dates:(Date|number|string)[];
		private _reportedError:boolean;
		
		// variables that do not get reset after async task
		private _stringToNumberFunction:(value:string)=>number = null;
		private _numberToStringFunction:(value:number)=>string = null;
		private _dateFormat:string = null;
		private _dateDisplayFormat:string = null;
		private _durationMode:boolean = false;
		private _fakeData:boolean = false;
		
		/* override */ public getMetadata(propertyName:string):string
		{
			if (propertyName == ColumnMetadata.DATA_TYPE)
				return DataType.DATE;
			if (propertyName == ColumnMetadata.DATE_FORMAT)
				return this._dateFormat || super.getMetadata(propertyName);
			return super.getMetadata(propertyName);
		}

		/* override */ public get keys():IQualifiedKey[]
		{
			return this._uniqueKeys;
		}

		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			return this.map_key_data.has(key);
		}
		
		public setRecords(qkeys:IQualifiedKey[], dates:any[]):void
		{
			if (this.keys.length > dates.length)
			{
				console.error("Array lengths differ");
				return;
			}
			
			this._fakeData = !!this.getMetadata("fakeData");
			
			// read dateFormat metadata
			this._dateFormat = this.getMetadata(ColumnMetadata.DATE_FORMAT);
			if (!this._dateFormat)
			{
				var possibleFormats:string[] = DateColumn.detectDateFormats(dates);
				StandardLib.sortOn(possibleFormats, 'length');
				this._dateFormat = possibleFormats.pop();
			}
			
			this._dateFormat = DateFormat.convertDateFormat_c_to_moment(this._dateFormat);

			// read dateDisplayFormat metadata
			this._dateDisplayFormat = this.getMetadata(ColumnMetadata.DATE_DISPLAY_FORMAT);

			if (this._dateDisplayFormat)
			{
				this._dateDisplayFormat = DateFormat.convertDateFormat_c_to_moment(this._dateDisplayFormat);
			}
			
			// compile the number format function from the metadata
			this._stringToNumberFunction = null;
			var numberFormat:string = this.getMetadata(ColumnMetadata.NUMBER);
			if (numberFormat)
			{
				try
				{
					this._stringToNumberFunction = JS.compile(numberFormat, [ColumnMetadata.STRING]) as (value:string)=>number;
				}
				catch (e)
				{
					console.error(e);
				}
			}
			
			// compile the string format function from the metadata
			this._numberToStringFunction = null;
			var stringFormat:string = this.getMetadata(ColumnMetadata.STRING);
			if (stringFormat)
			{
				try
				{
					this._numberToStringFunction = JS.compile(stringFormat, [ColumnMetadata.NUMBER]) as (value:number)=>string;
				}
				catch (e)
				{
					console.error(e);
				}
			}
			
			this._i = 0;
			this._keys = qkeys;
			this._dates = dates;
			this.map_key_data = new Map<IQualifiedKey, any>();
			this._uniqueKeys.length = 0;
			this._reportedError = false;
			
			/*if (!_dateFormat && _keys.length)
			{
				_reportedError = true;
				JS.error(lang('No common date format could be determined from the column values. Attribute Column: {0}', Compiler.stringify(_metadata)));
			}*/
			
			// high priority because not much can be done without data
			WeaveAPI.Scheduler.startTask(this, (stopTime:int) => this._asyncIterate(stopTime), WeaveAPI.TASK_PRIORITY_HIGH, ()=> this._asyncComplete());
		}
		
		private errorHandler(e:Error):void
		{
			return; // do nothing
		}
		
		private _asyncComplete():void
		{
			this._keys = null;
			this._dates = null;
			
			this.triggerCallbacks();
		}
		
		private parseDate(string:string|number):Date
		{
			return DateUtils.parse(string, this._dateFormat);
		}
		
		private static /* readonly */ SECOND:number = 1000;
		private static /* readonly */ MINUTE:number = 60 * 1000;
		private static /* readonly */ HOUR:number = 60 * 60 * 1000;
		
		/* When formatting date, default to input format if no display format specified. */
		private formatDate(value:Date):string
		{
			if (this._durationMode)
				return DateUtils.formatDuration(value);
			return DateUtils.format(value, this._dateDisplayFormat || this._dateFormat);
		}
		
		private _asyncIterate(stopTime:int):Number
		{
			for (; this._i < this._keys.length; this._i++)
			{
				if (Date.now() > stopTime)
					return this._i / this._keys.length;
				
				// get values for this iteration
				var key:IQualifiedKey = this._keys[this._i];
				var input:Date|number|string = this._dates[this._i];
				var value:Date|number|string;
				var fakeTime:number = this._fakeData ? StandardLib.asNumber(input) : NaN;
				if (Weave.IS(input, Date))
				{
					value = input;
				}
				else if (this._fakeData && isFinite(fakeTime))
				{
					var d:Date = new Date();
					var oneDay:number = 24 * 60 * 60 * 1000;
					d.setTime(d.getTime() - d.getTime() % oneDay + fakeTime * oneDay);
					value = d;
				}
				else if (this._stringToNumberFunction != null)
				{
					var number:number = this._stringToNumberFunction(input as string);
					if (this._numberToStringFunction != null)
					{
						input = this._numberToStringFunction(number);
						if (!input)
							continue;
						value = this.parseDate(input as string);
					}
					else
					{
						if (!isFinite(number))
							continue;
						value = number;
					}
				}
				else
				{
					try
					{
						if (!input)
							continue;
						value = this.parseDate(input as string);
						if (Weave.IS(value, Date) && isNaN(Weave.AS(value, Date).getTime()))
							value = Number(input);
					}
					catch (e)
					{
						if (!this._reportedError)
						{
							this._reportedError = true;
							var err:string = StandardLib.substitute(
								'Warning: Unable to parse this value as a date: "{0}"'
								+ ' (only the first error for this column is reported).',
								input
							);
							console.error(err, 'Attribute column:', this._metadata, e);
						}
						continue;
					}
				}
				
				// keep track of unique keys
				if (!this.map_key_data.has(key))
				{
					this._durationMode = Weave.IS(value, Number);
					this._uniqueKeys.push(key);
					// save key-to-data mapping
					this.map_key_data.set(key, value);
				}
				else if (!this._reportedError)
				{
					this._reportedError = true;
					var fmt:string = 'Warning: Key column values are not unique.  Record dropped due to duplicate key ({0}) (only reported for first duplicate).  Attribute column:';
					console.log(StandardLib.substitute(fmt, key.localName), this._metadata);
				}
			}
			return 1;
		}

		public deriveStringFromNumber(number:number|Date):string
		{
			if (this._numberToStringFunction != null)
				return this._numberToStringFunction(number as number);
			
			return this.formatDate(number as Date);
		}
		
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			var number:number;
			var string:string;
			var value:any;
			
			if (dataType == Number)
			{
				number = Number(this.map_key_data.get(key));
				return number;
			}
			
			if (dataType == String)
			{
				if (this._numberToStringFunction != null)
				{
					number = Number(this.map_key_data.get(key));
					return this._numberToStringFunction(number);
				}
				
				value = this.map_key_data.get(key);
				
				if (value === undefined)
					return '';
				
				if (this._dateDisplayFormat || this._dateFormat)
					string = this.formatDate(value);
				else
					string = value.toString();
				
				return string;
			}
			
			value = this.map_key_data.get(key);
			
			if (!dataType || dataType == Array)
				return value != null ? [value] : null;
			
			if (dataType)
				return Weave.AS(value, dataType);
			
			return value;
		}

		public static detectDateFormats(dates:(string|number)[]):string[]
		{
			var convertedFormats:string[] = DateFormat.FOR_AUTO_DETECT.map(DateFormat.convertDateFormat_c_to_moment);
			return DateUtils.detectFormats(dates, convertedFormats);
		}
	}
}
