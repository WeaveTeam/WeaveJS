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
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JS = weavejs.util.JS;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	
	/**
	 * This object contains a mapping from keys to data values.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.AbstractAttributeColumn", interfaces: [ICallbackCollection, IAttributeColumn]})
	export class AbstractAttributeColumn extends CallbackCollection implements IAttributeColumn
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super();
			if (metadata)
				this.setMetadata(metadata);
		}
		
		protected _metadata:IColumnMetadata = null;

		/**
		 * This function should only be called once, before setting the record data.
		 * @param metadata Metadata for this column.
		 */
		public setMetadata(metadata:IColumnMetadata):void
		{
			if (this._metadata !== null)
				throw new Error("Cannot call setMetadata() if already set");
			// make a copy because we don't want any surprises (metadata being set afterwards)
			this._metadata = AbstractAttributeColumn.copyValues(metadata);
			// make sure dataType will be included in getMetadataPropertyNames() result
			this._metadata.dataType = this.getMetadata(ColumnMetadata.DATA_TYPE) as any; // TODO
		}
		
		/**
		 * Copies key/value pairs from an Object.
		 * Converts Array values to Strings using WeaveAPI.CSVParser.createCSVRow().
		 */
		protected static copyValues(object:{[key:string]:any}):{[key:string]:any}
		{
			var copy:{[key:string]:any} = {};
			for (var key in object)
			{
				var value:any = object[key];
				if (Weave.IS(value, Array))
					copy[key] = JSON.stringify(value);
				else
					copy[key] = value;
			}
			return copy;
		}
		
		// metadata for this attributeColumn (statistics, description, unit, etc)
		public getMetadata(propertyName:string):string
		{
			var value:string = null;
			if (this._metadata)
				value = this._metadata[propertyName] || null;
			return value;
		}
		
		public getMetadataPropertyNames():string[]
		{
			return JS.objectKeys(this._metadata);
		}
		
		// 'abstract' functions, should be defined with override when extending this class

		/**
		 * Used by default getValueFromKey() implementation. Must be explicitly initialized.
		 */
		protected dataTask:ColumnDataTask;
		
		/**
		 * Used by default getValueFromKey() implementation. Must be explicitly initialized.
		 */
		protected dataCache:Dictionary2D<GenericClass, IQualifiedKey, any>;
		
		public get keys():IQualifiedKey[]
		{
			return this.dataTask.uniqueKeys;
		}
		
		public containsKey(key:IQualifiedKey):boolean
		{
			return this.dataTask.map_key_arrayData.has(key);
		}

		public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			var array:any[] = this.dataTask.map_key_arrayData.get(key);
			if (!array)
				return dataType === String ? '' : undefined;
			
			if (!dataType || dataType === Array)
				return array;
			
			var value:any = this.dataCache.get(dataType, key);
			if (value === undefined)
			{
				value = this.generateValue(key, dataType);
				if (!Weave.IS(value, dataType))
					throw new Error("generateValue() did not produce a value of the requested type. Expected " + Weave.className(dataType) + ", got " + Weave.className(value));
				this.dataCache.set(dataType, key, value);
			}
			return value;
		}
		
		/**
		 * Used by default getValueFromKey() implementation to cache values.
		 */
		protected /* abstract */ generateValue(key:IQualifiedKey, dataType:GenericClass):Object
		{
			return null;
		}
	}
}
