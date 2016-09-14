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
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
	import ILinkableDynamicObject = weavejs.api.core.ILinkableDynamicObject;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import Dictionary2D = weavejs.util.Dictionary2D;

	/**
	 * This provides a wrapper for a dynamically created column.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.DynamicColumn", interfaces: [IColumnWrapper, IAttributeColumn, ILinkableDynamicObject, ICallbackCollection]})
	export class DynamicColumn extends LinkableDynamicObject implements IColumnWrapper
	{
		constructor(columnTypeRestriction:GenericClass = null)
		{
			super(columnTypeRestriction && Weave.IS(columnTypeRestriction && columnTypeRestriction.prototype, IAttributeColumn) ? columnTypeRestriction : IAttributeColumn);
			if (columnTypeRestriction && !Weave.IS(columnTypeRestriction.prototype, IAttributeColumn))
			{
				console.error("DynamicColumn(): columnTypeRestriction does not implement IAttributeColumn:", columnTypeRestriction);
			}
		}
		
		/**
		 * This function lets you skip the step of casting internalObject as an IAttributeColumn.
		 */
		public getInternalColumn():IAttributeColumn
		{
			return Weave.AS(this.internalObject, IAttributeColumn);
		}
		
		/************************************
		 * Begin IAttributeColumn interface
		 ************************************/

		public getMetadata(propertyName:string):string
		{
			if (this.internalObject)
				return Weave.AS(this.internalObject, IAttributeColumn).getMetadata(propertyName);
			return null;
		}
		
		public getMetadataPropertyNames():string[]
		{
			if (this.internalObject)
				return Weave.AS(this.internalObject, IAttributeColumn).getMetadataPropertyNames();
			return [];
		}
		
		/**
		 * @return the keys associated with this column.
		 */
		public get keys():IQualifiedKey[]
		{
			return this.getInternalColumn() ? this.getInternalColumn().keys : [];
		}
		
		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			var col:IAttributeColumn = Weave.AS(this.internalObject, IAttributeColumn);
			return col ? col.containsKey(key) : false;
		}

		// TEMPORARY PERFORMANCE IMPROVEMENT SOLUTION
		public static cache:boolean = true;
		private d2d_type_key:Dictionary2D<GenericClass, IQualifiedKey, any> = new Dictionary2D<GenericClass, IQualifiedKey, any>(true, true);
		private _cacheCounter:int = 0;
		
		/**
		 * @param key A key of the type specified by keyType.
		 * @return The value associated with the given key.
		 */
		public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			if (!dataType)
				dataType = Array;
			if (!DynamicColumn.cache)
			{
				var col:IAttributeColumn = Weave.AS(this.internalObject, IAttributeColumn);
				return col ? col.getValueFromKey(key, dataType) : undefined;
			}
			
			if (this.triggerCounter != this._cacheCounter)
			{
				this._cacheCounter = this.triggerCounter;
				this.d2d_type_key = new Dictionary2D<GenericClass, IQualifiedKey, any>(true, true);
			}
			
			var value:any = this.d2d_type_key.get(dataType, key);
			if (value === undefined)
			{
				col = Weave.AS(this.internalObject, IAttributeColumn);
				if (col)
					value = col.getValueFromKey(key, dataType);
				this.d2d_type_key.set(dataType, key, value === undefined ? DynamicColumn.UNDEFINED : value);
			}
			return value === DynamicColumn.UNDEFINED ? undefined : value;
		}
		
		private static /* readonly */ UNDEFINED:Object = {};
	}
}
