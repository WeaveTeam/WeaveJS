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
	import DataTypes = weavejs.api.data.DataTypes;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import AbstractAttributeColumn = weavejs.data.column.AbstractAttributeColumn;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;

	/**
	 * This column is defined by two columns of CSV data: keys and values.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.CSVColumn", interfaces: [ICallbackCollection, IAttributeColumn]})
	export class CSVColumn extends AbstractAttributeColumn implements IAttributeColumn
	{
		constructor()
		{
			super();
			this.numericMode.value = false;
		}
		
		/* override */ public getMetadata(propertyName:string):string
		{
			switch (propertyName)
			{
				case ColumnMetadata.TITLE: return this.title.value;
				case ColumnMetadata.KEY_TYPE: return this.keyType.value;
				case ColumnMetadata.DATA_TYPE: return this.numericMode.value ? DataTypes.NUMBER : DataTypes.STRING;
			}
			return super.getMetadata(propertyName);
		}

		public /* readonly */ title:LinkableString = Weave.linkableChild(this, LinkableString);

		/**
		 * This should contain a two-column CSV with the first column containing the keys and the second column containing the values.
		 */
		public /* readonly */ data:LinkableVariable = Weave.linkableChild(this, LinkableVariable, this.invalidate);
		
		/**
		 * Use this function to set the keys and data of the column.
		 * @param table An Array of rows where each row is an Array containing a key and a data value.
		 */		
		public setDataTable(table:string[][]):void
		{
			var stringTable:string[][] = [];
			for (var r:int = 0; r < table.length; r++)
			{
				var row:string[] = table[r].concat(); // make a copy of the row
				// convert each value to a string
				for (var c:int = 0; c < row.length; c++)
					row[c] = String(row[c]);
				stringTable[r] = row; // save the copied row
			}
			this.data.setSessionState(stringTable);
		}

		/**
		 * @deprecated
		 */
		public set csvData(value:string)
		{
			this.data.setSessionState(WeaveAPI.CSVParser.parseCSV(value));
		}
		
		/**
		 * This is the key type of the first column in the csvData.
		 */
		public /* readonly */ keyType:LinkableString = Weave.linkableChild(this, LinkableString, this.invalidate);
		
		/**
		 * If this is set to true, the data will be parsed as numbers to produce the numeric data.
		 */
		public /* readonly */ numericMode:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean, this.invalidate);

		private map_key_index:Map<IQualifiedKey, number> = null; // This maps a key to a row index.
		private _keys:IQualifiedKey[] = []; // list of keys from the first CSV column
		private _stringValues:string[] = []; // list of Strings from the first CSV column
		private _numberValues:number[] = []; // list of Numbers from the first CSV column

		/**
		 * This value is true when the data changed and the lookup tables need to be recreated.
		 */
		private dirty:boolean = true;
		
		/**
		 * This function gets called when csvData changes.
		 */
		private invalidate():void
		{
			this.dirty = true;
		}

		/**
		 * This function generates three Vectors from the CSV data: _keys, _stringValues, _numberValues
		 */
		private validate():void
		{
			// replace the previous _keyToIndexMap with a new empty one
			this.map_key_index = new Map<IQualifiedKey, number>();
			this._keys.length = 0;
			this._stringValues.length = 0;
			this._numberValues.length = 0;
			
			var key:IQualifiedKey;
			var value:string;
			var table:string[][] = Weave.AS(this.data.getSessionState(), Array) || [];
			for (var i:int = 0; i < table.length; i++)
			{
				var row:string[] = Weave.AS(table[i], Array);
				if (row == null || row.length == 0)
					continue; // skip blank lines

				// get the key from the first column and the value from the second.
				key = WeaveAPI.QKeyManager.getQKey(this.keyType.value, String(row[0]));
				value = String(row.length > 1 ? row[1] : '');
				
				// save the results of parsing the CSV row
				this.map_key_index.set(key, this._keys.length);
				this._keys.push(key);
				this._stringValues.push(value);
				try
				{
					this._numberValues.push(Number(value));
				}
				catch (e)
				{
					this._numberValues.push(NaN);
				}
			}
			this.dirty = false;
		}
		
		/**
		 * This function returns the list of String values from the first column in the CSV data.
		 */
		/* override */ public get keys():IQualifiedKey[]
		{
			// refresh the data if necessary
			if (this.dirty)
				this.validate();
			
			return this._keys;
		}

		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			// refresh the data if necessary
			if (this.dirty)
				this.validate();
			
			return this.map_key_index.has(key);
		}
		
		/**
		 * This function returns the corresponding numeric or string value depending on the dataType parameter and the numericMode setting.
		 */
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass=null):any
		{
			// refresh the data if necessary
			if (this.dirty)
				this.validate();
			
			// get the index from the key
			var keyIndex:number = this.map_key_index.get(key);
			
			// cast to different data types
			if (dataType == Boolean)
			{
				return !isNaN(keyIndex);
			}
			if (dataType == Number)
			{
				if (isNaN(keyIndex))
					return NaN;
				return this._numberValues[keyIndex];
			}
			if (dataType == String)
			{
				if (isNaN(keyIndex))
					return '';
				return this._stringValues[keyIndex];
			}

			// return default data type
			if (isNaN(keyIndex))
				return this.numericMode.value ? NaN : '';
			
			if (this.numericMode.value)
				return this._numberValues[keyIndex];
			
			return this._stringValues[keyIndex];
		}
	}
}
