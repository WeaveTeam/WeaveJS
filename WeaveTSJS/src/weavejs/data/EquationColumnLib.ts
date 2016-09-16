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
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IKeySet = weavejs.api.data.IKeySet;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This class contains static functions that access values from IAttributeColumn objects.
	 * Many of the functions in this library use the static variable 'currentRecordKey'.
	 * This value should be set before calling a function that uses it.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.EquationColumnLib"})
	export class EquationColumnLib
	{
		public static debug:boolean = false;
		
		/**
		 * This value should be set before calling any of the functions below that get values from IAttributeColumns.
		 */
		public static currentRecordKey:IQualifiedKey = null;

		/**
		 * This function calls column.getValueFromKey(currentRecordKey, IQualifiedKey)
		 * @param column A column, or null if you want the currentRecordKey to be returned.
		 * @return The value at the current record in the column cast as an IQualifiedKey.
		 */
		public static getKey(column:IAttributeColumn = null):IQualifiedKey
		{
			if (column)
				return column.getValueFromKey(EquationColumnLib.currentRecordKey, IQualifiedKey);
			return EquationColumnLib.currentRecordKey;
		}
		
		/**
		 * This function uses currentRecordKey when retrieving a value from a column.
		 * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
		 * @param dataType Either a Class object or a String containing the qualified class name of the desired value type.
		 * @return The value of the object, optionally cast to the requested dataType.
		 */
		public static getValue(object:IAttributeColumn|ILinkableVariable, dataType:GenericClass|string = null):any
		{
			// remember current key
			var key:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				if (Weave.IS(dataType, String))
					dataType = Weave.getDefinition(dataType as string);
				
				var value:any = null; // the value that will be returned
				
				// get the value from the object
				var column:IAttributeColumn = Weave.AS(object, IAttributeColumn);
				if (column != null)
				{
					if (dataType == null)
					{
						var dataTypeMetadata:string = column.getMetadata(ColumnMetadata.DATA_TYPE);
						dataType = DataType.getClass(dataTypeMetadata);
						if (dataType == String && dataTypeMetadata != DataType.STRING)
							dataType = IQualifiedKey;
					}
					value = column.getValueFromKey(key, JS.asClass(dataType));
				}
				else if (Weave.IS(object, ILinkableVariable))
				{
					value = (object as ILinkableVariable).getSessionState();
					// cast the value to the requested type
					if (dataType != null)
						value = EquationColumnLib.cast(value, dataType);
				}
				else if (dataType != null)
				{
					value = EquationColumnLib.cast(value, dataType);
				}
				
				if (EquationColumnLib.debug)
					console.log('getValue',object,key.localName,String(value));
				return value;
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = key;
			}
		}
		/**
		 * This function calls IAttributeColumn.getValueFromKey(key, dataType).
		 * @param column An IAttributeColumn to get a value from.
		 * @param key A key to get the value for.
		 * @return The result of calling column.getValueFromKey(key, dataType).
		 */
		public static getValueFromKey(column:IAttributeColumn, key:IQualifiedKey, dataType:GenericClass = null):any
		{
			// remember current key
			var previousKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				EquationColumnLib.currentRecordKey = key;
				var value:any = EquationColumnLib.getValue(column, dataType);
				if (EquationColumnLib.debug)
					console.log('getValueFromKey',column,key.localName,String(value));
				return value;
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = previousKey;
			}
		}
		
		/**
		 * This function gets a value from a data column, using a filter column and a key column to filter the data
		 * @param keyColumn An IAttributeColumn to get keys from
		 * @param filter column to use to filter data (ex: year)
		 * @param data An IAttributeColumn to get a value from
		 * @param filterValue value in filtercolumn to use to filter data
		 * @param filterDataType Class object of the desired filter value type
		 * @param dataType Class object of the desired value type. If IQualifiedKey, this acts as a reverse lookup for the filter column, returning the key given a filterValue String.
		 * @return the correct filtered value from the data column
		 * @author kmanohar
		 */		
		public static getValueFromFilterColumn(keyColumn:DynamicColumn, filter:IAttributeColumn, data:IAttributeColumn, filterValue:string, dataType:GenericClass = null):any
		{
			var key:IQualifiedKey = EquationColumnLib.getKey();
			var foreignKeyType:string = keyColumn.getMetadata(ColumnMetadata.DATA_TYPE);
			var ignoreKeyType:boolean= !foreignKeyType || foreignKeyType == DataType.STRING;
			var cubekeys:IQualifiedKey[] = EquationColumnLib.getAssociatedKeys(keyColumn, key, ignoreKeyType);
			
			if (cubekeys && cubekeys.length == 1)
			{
				for (var cubekey of cubekeys || [])
				{
					if (filter.getValueFromKey(cubekey, String) == filterValue)
					{
						if (dataType === IQualifiedKey)
							return cubekey;
						var val:any = EquationColumnLib.getValueFromKey(data, cubekey, dataType);
						return val;
					}
				}
			}
			return EquationColumnLib.cast(undefined, dataType);
		}
		
		private static map_reverseKeyLookupTriggerCounter = new WeakMap<IAttributeColumn, number>();
		private static map_reverseKeyLookupCache = new WeakMap<IAttributeColumn, Map<string|IQualifiedKey, IQualifiedKey[]>>();
		
		/**
		 * This function returns a list of IQualifiedKey objects using a reverse lookup of value-key pairs 
		 * @param column An attribute column
		 * @param keyValue The value to look up
		 * @param ignoreKeyType If true, ignores the dataType of the column (the column's foreign keyType) and the keyType of the keyValue
		 * @return An array of record keys with the given value under the given column
		 */
		public static getAssociatedKeys(column:IAttributeColumn, keyValue:IQualifiedKey, ignoreKeyType:Boolean = false):IQualifiedKey[]
		{
			var map_lookup:Map<string|IQualifiedKey, IQualifiedKey[]> = EquationColumnLib.map_reverseKeyLookupCache.get(column);
			if (map_lookup == null || column.triggerCounter != EquationColumnLib.map_reverseKeyLookupTriggerCounter.get(column)) // if cache is invalid, validate it now
			{
				EquationColumnLib.map_reverseKeyLookupTriggerCounter.set(column, column.triggerCounter);
				EquationColumnLib.map_reverseKeyLookupCache.set(column, map_lookup = new Map<string|IQualifiedKey, IQualifiedKey[]>());
				for (var recordKey of column.keys || [])
				{
					var value:IQualifiedKey = column.getValueFromKey(recordKey, IQualifiedKey) as IQualifiedKey;
					if (value == null)
						continue;
					
					if (!map_lookup.has(value))
						map_lookup.set(value, []);
					(map_lookup.get(value)).push(recordKey);
					
					if (!map_lookup.has(value.localName))
						map_lookup.set(value.localName, []);
					(map_lookup.get(value.localName)).push(recordKey);
				}
			}
			return map_lookup.get(ignoreKeyType ? keyValue.localName : keyValue);
		}
		
		/**
		 * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
		 * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
		 * @param key A key to get the Number for.
		 * @return The value of the object, cast to a Number.
		 */
		public static getNumber(object:IAttributeColumn|ILinkableVariable, key:IQualifiedKey = null):number
		{
			// remember current key
			var previousKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				if (key == null)
					key = EquationColumnLib.currentRecordKey;
				
				var result:number;
				var column:IAttributeColumn = Weave.AS(object, IAttributeColumn);
				if (column != null)
				{
					result = (object as IAttributeColumn).getValueFromKey(key, Number);
				}
				else if (Weave.IS(object, ILinkableVariable))
				{
					result = StandardLib.asNumber((object as ILinkableVariable).getSessionState());
				}
				else
					throw new Error('first parameter must be either an IAttributeColumn or an ILinkableVariable');
				
				if (EquationColumnLib.debug)
					console.log('getNumber',column,key.localName,String(result));
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = previousKey;
			}
			return result;
		}
		/**
		 * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
		 * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
		 * @param key A key to get the Number for.
		 * @return The value of the object, cast to a String.
		 */
		public static getString(object:IAttributeColumn|ILinkableVariable, key:IQualifiedKey = null):string
		{
			// remember current key
			var previousKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				if (key == null)
					key = EquationColumnLib.currentRecordKey;
	
				var result:string = '';
				var column:IAttributeColumn = Weave.AS(object, IAttributeColumn);
				if (column != null)
				{
					result = (object as IAttributeColumn).getValueFromKey(key, String);
				}
				else if (Weave.IS(object, ILinkableVariable))
				{
					result = StandardLib.asString((object as ILinkableVariable).getSessionState());
				}
				else
					throw new Error('first parameter must be either an IAttributeColumn or an ILinkableVariable');
	
				if (EquationColumnLib.debug)
					console.log('getString',column,key.localName,String(result));
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = previousKey;
			}
			return result;
		}
		/**
		 * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
		 * @param object An IAttributeColumn or an ILinkableVariable to get a value from.
		 * @param key A key to get the Number for.
		 * @return The value of the object, cast to a Boolean.
		 */
		public static getBoolean(object:IAttributeColumn|ILinkableVariable, key:IQualifiedKey = null):boolean
		{
			// remember current key
			var previousKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				if (key == null)
					key = EquationColumnLib.currentRecordKey;
	
				var result:boolean = false;
				var column:IAttributeColumn = Weave.AS(object, IAttributeColumn);
				if (column != null)
				{
					result = StandardLib.asBoolean(column.getValueFromKey(key, Number));
				}
				else if (Weave.IS(object, ILinkableVariable))
				{
					result = StandardLib.asBoolean((object as ILinkableVariable).getSessionState());
				}
				else
					throw new Error('first parameter must be either an IAttributeColumn or an ILinkableVariable');
	
				if (EquationColumnLib.debug)
					console.log('getBoolean',column,key.localName,String(result));
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = previousKey;
			}
			return result;
		}
		/**
		 * This function uses currentRecordKey when retrieving a value from a column if no key is specified.
		 * @param column A column to get a value from.
		 * @param key A key to get the Number for.
		 * @return The Number corresponding to the given key, normalized to be between 0 and 1.
		 *
		 * @deprecated replacement="WeaveAPI.StatisticsCache.getColumnStatistics(column).getNorm(key)")
		 */
		public static getNorm(column:IAttributeColumn, key:IQualifiedKey = null):number
		{
			// remember current key
			var previousKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				if (key == null)
					key = EquationColumnLib.currentRecordKey;
	
				var result:number = NaN;
				if (column != null)
					result = WeaveAPI.StatisticsCache.getColumnStatistics(column).getNorm(key);
				else
					throw new Error('first parameter must be an IAttributeColumn');
	
				if (EquationColumnLib.debug)
					console.log('getNorm',column,key.localName,String(result));
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = previousKey;
			}
			return result;
		}
		
		/**
		 * This will check a list of IKeySets for an IQualifiedKey.
		 * @param keySets A list of IKeySets (can be IAttributeColumns).
		 * @param key A key to search for.
		 * @return The first IKeySet that contains the key.
		 */
		public static findKeySet(keySets:IKeySet[], key:IQualifiedKey = null):IKeySet
		{
			// remember current key
			var previousKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				if (key == null)
					key = EquationColumnLib.currentRecordKey;
				
				var keySet:IKeySet = null;
				for (var i:int = 0; i < keySets.length; i++)
				{
					keySet = Weave.AS(keySets[i], IKeySet);
					if (keySet && keySet.containsKey(key))
						break;
					else
						keySet = null;
				}
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = previousKey;
			}
			return keySet;
		}

		/**
		 * @deprecated
		 */
		public static getSum(column:IAttributeColumn):number
		{
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getSum();
		}

		/**
		 * @deprecated
		 */
		public static getMean(column:IAttributeColumn):number
		{
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getMean();
		}

		/**
		 * @deprecated
		 */
		public static getVariance(column:IAttributeColumn):number
		{
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getVariance();
		}

		/**
		 * @deprecated
		 */
		public static getStandardDeviation(column:IAttributeColumn):number
		{
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getStandardDeviation();
		}

		/**
		 * @deprecated
		 */
		public static getMin(column:IAttributeColumn):Number
		{
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getMin();
		}

		/**
		 * @deprecated
		 */
		public static getMax(column:IAttributeColumn):number
		{
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getMax();
		}

		/**
		 * @deprecated
		 */
		public static getCount(column:IAttributeColumn):number
		{
			return WeaveAPI.StatisticsCache.getColumnStatistics(column).getCount();
		}

		/**
		 * @deprecated
		 */
		public static getRunningTotal(column:IAttributeColumn, key:IQualifiedKey = null):number
		{
			// remember current key
			var previousKey:IQualifiedKey = EquationColumnLib.currentRecordKey;
			try
			{
				if (key == null)
					key = EquationColumnLib.currentRecordKey;
	
				var result:number = NaN;
				if (column != null)
				{
					var runningTotals:Map<IQualifiedKey, number> = (WeaveAPI.StatisticsCache  as StatisticsCache).getRunningTotals(column);
					if (runningTotals != null)
						result = runningTotals.get(key);
				}
			}
			finally
			{
				// revert to key that was set when entering the function (in case nested calls modified the static variables)
				EquationColumnLib.currentRecordKey = previousKey;
			}
			return result;
		}
		/**
		 * @param value A value to cast.
		 * @param newType Either a qualifiedClassName or a Class object referring to the type to cast the value as.
		 */
		public static cast<T>(value:any, newType:Class<T>|string):T
		{
			if (newType == null)
				return value;
			
			// if newType is a qualified class name, get the Class definition
			if (Weave.IS(newType, String))
				newType = Weave.getDefinition(newType as string);

			// cast the value as the desired type
			if ((newType as GenericClass) == Number)
			{
				value = StandardLib.asNumber(value);
			}
			else if ((newType as GenericClass) == String)
			{
				value = StandardLib.asString(value);
			}
			else if ((newType as GenericClass) == Boolean)
			{
				value = StandardLib.asBoolean(value);
			}
			else if ((newType as GenericClass) == Array)
			{
				if (value != null && !Weave.IS(value, Array))
					value = [value];
			}

			return Weave.AS(value, newType as GenericClass);
		}
		
		/**
		 * This is a macro for IQualifiedKey that can be used in equations.
		 */		
		public static QKey:Class<IQualifiedKey> = IQualifiedKey;
	}
}
