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
	import ILinkableObject = weavejs.api.core.ILinkableObject;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import StandardLib = weavejs.util.StandardLib;
	
	/**
	 * This provides a reverse lookup of String values in an IAttributeColumn.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.StringLookup"})
	export class StringLookup implements ILinkableObject
	{
		constructor(column:IAttributeColumn)
		{
			this.internalColumn = column;
			column.addImmediateCallback(this, this.handleInternalColumnChange);
			if (Weave.IS(column, ILinkableObject))
				Weave.linkableChild(this, Weave.AS(column, ILinkableObject))
		}
		
		private internalColumn:IAttributeColumn;
		
		/**
		 * This function gets called when the referenced column changes.
		 */
		protected handleInternalColumnChange():void
		{
			// invalidate lookup
			this._stringToKeysMap = null;
			this._stringToNumberMap = null;
			this._uniqueStringValues.length = 0;
		}
		
		/**
		 * This object maps a String value from the internal column to an Array of keys that map to that value.
		 */
		private _stringToKeysMap:{[key:string]:IQualifiedKey[]} = null;
		
		/**
		 * This object maps a String value from the internal column to the Number value corresponding to that String values in the internal column.
		 */
		private _stringToNumberMap:{[key:string]:number} = null;
		
		/**
		 * This keeps track of a list of unique string values contained in the internal column.
		 */
		private _uniqueStringValues:string[] = new Array();
		
		/**
		 * This is a list of the unique strings of the internal column.
		 */
		public get uniqueStrings():string[]
		{
			if (this._stringToKeysMap == null)
				this.createLookupTable();
			return this._uniqueStringValues;
		}

		/**
		 * This function will initialize the string lookup table and list of unique strings.
		 */
		private createLookupTable():void
		{
			// reset
			this._uniqueStringValues.length = 0;
			this._stringToKeysMap = {};
			this._stringToNumberMap = {};
			// loop through all the keys in the internal column
			var keys:IQualifiedKey[] = this.internalColumn ? this.internalColumn.keys : [];
			for (var i:int = 0; i < keys.length; i++)
			{
				var key:IQualifiedKey = keys[i];
				var stringValue:string  = Weave.AS(this.internalColumn.getValueFromKey(key, String), String) as string;
				if (stringValue == null)
					continue;
				// save the mapping from the String value to the key
				if (Weave.IS(this._stringToKeysMap[stringValue], Array))
				{
					// string value was found previously
					(Weave.AS(this._stringToKeysMap[stringValue], Array) || []).push(key);
				}
				else
				{
					// found new string value
					this._stringToKeysMap[stringValue] = [key];
					this._uniqueStringValues.push(stringValue);
				}
				// save the mapping from the String value to the corresponding Number value
				var numberValue:number = this.internalColumn.getValueFromKey(key, Number);
				if (this._stringToNumberMap[stringValue] == undefined) // no number stored yet
				{
					this._stringToNumberMap[stringValue] = numberValue;
				}
				else if (!isNaN(this._stringToNumberMap[stringValue]) && this._stringToNumberMap[stringValue] != numberValue)
				{
					this._stringToNumberMap[stringValue] = NaN; // different numbers are mapped to the same String, so save NaN.
				}
			}
			// sort the unique values because we want them to be in a predictable order
			StandardLib.sortOn(this._uniqueStringValues, [this._stringToNumberMap, this._uniqueStringValues]);
		}

		/**
		 * @param stringValue A string value existing in the internal column.
		 * @return An Array of keys that map to the given string value in the internal column.
		 */
		public getKeysFromString(stringValue:string):IQualifiedKey[]
		{
			// validate lookup table if necessary
			if (this._stringToKeysMap == null)
				this.createLookupTable();
			
			// get the list of internal keys from the given stringValue
			return (Weave.AS(this._stringToKeysMap[stringValue], Array)) || (this._stringToKeysMap[stringValue] = []) as IQualifiedKey[];
		}
		
		/**
		 * @param stringValue A string value existing in the internal column.
		 * @return The Number value associated with the String value from the internal column.
		 */
		public getNumberFromString(stringValue:string):number
		{
			if (this._stringToNumberMap == null)
				this.createLookupTable();
			return this._stringToNumberMap[stringValue];
		}
	}
}
