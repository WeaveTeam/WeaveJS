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
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	
	/**
	 * This provides a wrapper for a dynamic column, and allows new properties to be added.
	 * The purpose of this class is to provide a base for extending DynamicColumn.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.ExtendedDynamicColumn", interfaces: [IColumnWrapper, ICallbackCollection, IAttributeColumn]})
	export class ExtendedDynamicColumn extends CallbackCollection implements IColumnWrapper
	{
		constructor()
		{
			super();
			Weave.linkableChild(this, WeaveAPI.StatisticsCache.getColumnStatistics(this.internalDynamicColumn));
		}
		
		/**
		 * This is for the IColumnWrapper interface.
		 */
		public getInternalColumn():IAttributeColumn
		{
			return this.internalDynamicColumn.getInternalColumn();
		}
		
		/**
		 * This is the internal DynamicColumn object that is being extended.
		 */
		public get internalDynamicColumn():DynamicColumn
		{
			return this._internalDynamicColumn;
		}
		private _internalDynamicColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		
		/************************************
		 * Begin IAttributeColumn interface
		 ************************************/

		public getMetadata(propertyName:string):string
		{
			return this.internalDynamicColumn.getMetadata(propertyName);
		}

		public getMetadataPropertyNames():string[]
		{
			return this.internalDynamicColumn.getMetadataPropertyNames();
		}
		
		/**
		 * @return the keys associated with this column.
		 */
		public get keys():IQualifiedKey[]
		{
			return this.internalDynamicColumn.keys;
		}
		
		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			return this.internalDynamicColumn.containsKey(key);
		}

		/**
		 * getValueFromKey
		 * @param key A key of the type specified by keyType.
		 * @return The value associated with the given key.
		 */
		public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			return this.internalDynamicColumn.getValueFromKey(key, dataType);
		}
	}
}
