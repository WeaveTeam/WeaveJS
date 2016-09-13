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
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableString = weavejs.core.LinkableString;
	import EquationColumnLib = weavejs.data.EquationColumnLib;
	import AsyncSort = weavejs.util.AsyncSort;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	@Weave.classInfo({id: "weavejs.data.column.SecondaryKeyNumColumn", interfaces: [IAttributeColumn, ICallbackCollection, IPrimitiveColumn]})
	export class SecondaryKeyNumColumn extends AbstractAttributeColumn implements IPrimitiveColumn
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super(metadata);
			SecondaryKeyNumColumn.secondaryKeyFilter.addImmediateCallback(this, this.triggerCallbacks);
			SecondaryKeyNumColumn.useGlobalMinMaxValues.addImmediateCallback(this, this.triggerCallbacks);
		}

		/**
		 * This overrides the base title value
		 */
		public baseTitle:string;

		/**
		 * This function overrides the min,max values.
		 */
		/* override */ public getMetadata(propertyName:string):string
		{
			if (SecondaryKeyNumColumn.useGlobalMinMaxValues.value)
			{
				if (propertyName == ColumnMetadata.MIN)
					return String(this._minNumber);
				if (propertyName == ColumnMetadata.MAX)
					return String(this._maxNumber);
			}
			
			var value:string = super.getMetadata(propertyName);
			
			switch (propertyName)
			{
				case ColumnMetadata.TITLE:
					value = this.baseTitle || value;
					if (value != null && SecondaryKeyNumColumn.secondaryKeyFilter.value && !SecondaryKeyNumColumn.allKeysHack)
						return value + ' (' + SecondaryKeyNumColumn.secondaryKeyFilter.value + ')';
					break;
				case ColumnMetadata.KEY_TYPE:
					if (SecondaryKeyNumColumn.secondaryKeyFilter.value == null)
						return value + this.TYPE_SUFFIX;
					break;
				case ColumnMetadata.DATA_TYPE:
					return value || (this._dataType == Number ? DataType.NUMBER : DataType.STRING);
			}
			
			return value;
		}
		
		private TYPE_SUFFIX:string = ',Year';
		
		private _minNumber:number = NaN; // returned by getMetadata
		private _maxNumber:number = NaN; // returned by getMetadata
		
		/**
		 * This object maps keys to data values.
		 */
		private d2d_qkeyA_keyB_number:Dictionary2D<IQualifiedKey, string, number> = new Dictionary2D<IQualifiedKey, string, number>();
		private map_qkeyAB_number:Map<IQualifiedKey, number> = new Map<IQualifiedKey, number>();

		/**
		 * Derived from the record data, this is a list of all existing values in the dimension, each appearing once, sorted alphabetically.
		 */
		private _uniqueStrings:string[] = [];

		/**
		 * This is the value used to filter the data.
		 */
		public static get secondaryKeyFilter():LinkableString
		{
			if (!SecondaryKeyNumColumn._secondaryKeyFilter)
				SecondaryKeyNumColumn._secondaryKeyFilter = new LinkableString();
			return SecondaryKeyNumColumn._secondaryKeyFilter;
		}
		public static get useGlobalMinMaxValues():LinkableBoolean
		{
			if (!SecondaryKeyNumColumn._useGlobalMinMaxValues)
				SecondaryKeyNumColumn._useGlobalMinMaxValues = new LinkableBoolean(true);
			return SecondaryKeyNumColumn._useGlobalMinMaxValues;
		}
		
		private static _secondaryKeyFilter:LinkableString;
		private static _useGlobalMinMaxValues:LinkableBoolean;
		
		private _uniqueSecondaryKeys:string[] = [];

		public get secondaryKeys():string[]
		{
			return this._uniqueSecondaryKeys;
		}

		/**
		 * This is a list of unique keys this column defines values for.
		 */
		private _uniqueKeysA:IQualifiedKey[] = [];
		private _uniqueKeysAB:IQualifiedKey[] = [];

		/* override */ public get keys():IQualifiedKey[]
		{
			if (SecondaryKeyNumColumn.secondaryKeyFilter.value == null || SecondaryKeyNumColumn.allKeysHack) // when no secondary key specified, use the real unique keys
				return this._uniqueKeysAB;
			return this._uniqueKeysA;
		}
		
		public static allKeysHack:boolean = false; // used by DataTableTool
		
		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			var skfv:string = SecondaryKeyNumColumn.secondaryKeyFilter.value;
			if (skfv == null || SecondaryKeyNumColumn.allKeysHack)
				return this.map_qkeyAB_number.get(key) !== undefined;
			
			return this.d2d_qkeyA_keyB_number.get(key, skfv) !== undefined;
		}

		/**
		 * @param qkeysA Array of IQualifiedKey
		 * @param keysB Array of String
		 * @param data
		 */
		public updateRecords(qkeysA:IQualifiedKey[], keysB:string[], data:any[]):void
		{
			if (this._uniqueStrings.length > 0)
			{
				console.error("Replacing existing records is not supported");
			}
			
			var index:int, qkeyA:IQualifiedKey, keyB:string, qkeyAB:IQualifiedKey;
			var _key:IQualifiedKey;
			var dataObject:any = null;

			if (qkeysA.length != data.length || keysB.length != data.length)
			{
				console.error("Array lengths differ");
				return;
			}
			
			// clear previous data mapping
			this.d2d_qkeyA_keyB_number = new Dictionary2D<IQualifiedKey, string, number>();
			
			//if it's string data - create list of unique strings
			var dataType:string = super.getMetadata(ColumnMetadata.DATA_TYPE);
			if (Weave.IS(data[0], String) || (dataType && dataType != DataType.NUMBER))
			{
				if (!dataType)
					dataType = DataType.STRING;
				for (var i:int = 0; i < data.length; i++)
				{
					if (this._uniqueStrings.indexOf(data[i]) < 0)
						this._uniqueStrings.push(data[i]);
				}
				AsyncSort.sortImmediately(this._uniqueStrings);
				
				// min,max numbers are the min,max indices in the unique strings array
				this._minNumber = 0;
				this._maxNumber = this._uniqueStrings.length - 1;
			}
			else
			{
				dataType = DataType.NUMBER;
				// reset min,max before looping over records
				this._minNumber = NaN;
				this._maxNumber = NaN;
			}
			this._metadata.dataType = dataType as any;
			this._dataType = dataType == DataType.NUMBER ? Number : String;
			
			// save a mapping from keys to data
			for (index = 0; index < qkeysA.length; index++)
			{
				qkeyA = qkeysA[index] as IQualifiedKey;
				keyB = String(keysB[index]);
				dataObject = data[index];
				
				qkeyAB = WeaveAPI.QKeyManager.getQKey(qkeyA.keyType + this.TYPE_SUFFIX, qkeyA.localName + ',' + keyB);
				//if we don't already have keyB - add it to _uniqueKeysB
				//  @todo - optimize this - searching every time is not the optimal method
				if (this._uniqueSecondaryKeys.indexOf(keyB) < 0)
					this._uniqueSecondaryKeys.push(keyB);
				if (Weave.IS(dataObject, String))
				{
					var iString:int = this._uniqueStrings.indexOf(dataObject);
					if (iString < 0)
					{
						//iString = _uniqueStrings.push(dataObject) - 1;
						iString = this._uniqueStrings.length;
						this._uniqueStrings[iString] = dataObject;
					}
					this.d2d_qkeyA_keyB_number.set(qkeyA, keyB, iString);
					this.map_qkeyAB_number.set(qkeyAB, iString);
				}
				else
				{
					this.d2d_qkeyA_keyB_number.set(qkeyA, keyB, dataObject);//Number(dataObject));
					this.map_qkeyAB_number.set(qkeyAB, dataObject);//Number(dataObject));
					
					this._minNumber = isNaN(this._minNumber) ? dataObject : Math.min(this._minNumber, dataObject);
					this._maxNumber = isNaN(this._maxNumber) ? dataObject : Math.max(this._maxNumber, dataObject);
				}
			}
			
			AsyncSort.sortImmediately(this._uniqueSecondaryKeys);
			
			// save lists of unique keys
			this._uniqueKeysA = this.d2d_qkeyA_keyB_number.primaryKeys();
			this._uniqueKeysAB = JS.mapKeys(this.map_qkeyAB_number);
			
			this.triggerCallbacks();
		}

		/**
		 * maximum number of significant digits to return when calling deriveStringFromNorm()
		 */		
		private maxDerivedSignificantDigits:uint = 10;
		
		// get a string value for a given numeric value
		public deriveStringFromNumber(number:number):string
		{
			if (int(number) == number && (this._uniqueStrings.length > 0) && (number < this._uniqueStrings.length))
				return this._uniqueStrings[number];
			
			return StandardLib.formatNumber(
				StandardLib.roundSignificant(
						number,
						this.maxDerivedSignificantDigits
					)
				);
		}
		
		private map_qkeyAB_qkeyData = new WeakMap<IQualifiedKey, any>();
		private _dataType:GenericClass;

		/**
		 * get data from key value
		 */
		/* override */ public getValueFromKey(qkey:IQualifiedKey, dataType:GenericClass = null):any
		{
			if (!dataType)
				dataType = this._dataType;
			
			var value:number = NaN;
			if (this.map_qkeyAB_number.has(qkey))
				value = this.map_qkeyAB_number.get(qkey);
			else
				value = this.d2d_qkeyA_keyB_number.get(qkey, SecondaryKeyNumColumn.secondaryKeyFilter.value);
			
			if (isNaN(value))
				return EquationColumnLib.cast(undefined, dataType);
			
			if (dataType == IQualifiedKey)
			{
				if (!this.map_qkeyAB_qkeyData.has(qkey))
				{
					var type:string = this.getMetadata(ColumnMetadata.DATA_TYPE);
					if (type == DataType.NUMBER)
						return null;
					if (type == '')
						type = DataType.STRING;
					this.map_qkeyAB_qkeyData.set(qkey, WeaveAPI.QKeyManager.getQKey(type, this.deriveStringFromNumber(value)));
				}
				return this.map_qkeyAB_qkeyData.get(qkey);
			}
			
			if (dataType == String)
				return this.deriveStringFromNumber(value);
			
			return value;
		}
	}
}
