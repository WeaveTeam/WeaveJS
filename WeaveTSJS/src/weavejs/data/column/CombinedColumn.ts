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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IKeySet = weavejs.api.data.IKeySet;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import KeySetUnion = weavejs.data.key.KeySetUnion;
	
	/**
	 * This provides a wrapper for a dynamic column, and allows new properties to be added.
	 * The purpose of this class is to provide a base for extending DynamicColumn.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.CombinedColumn", interfaces: [IAttributeColumn]})
	export class CombinedColumn extends CallbackCollection implements IAttributeColumn
	{
		constructor()
		{
			super();
			Weave.linkableChild(this, this.keySetUnion.busyStatus);
			this.columns.childListCallbacks.addImmediateCallback(this, this.handleColumnsList);
		}
		
		public /* readonly */ useFirstColumnMetadata:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public /* readonly */ columns:ILinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));
		private keySetUnion:KeySetUnion = Weave.linkableChild(this, KeySetUnion);
		
		private _columnsArray:IAttributeColumn[] = [];
		
		private handleColumnsList():void
		{
			this._columnsArray = this.columns.getObjects() as IAttributeColumn[];
			if (this.columns.childListCallbacks.lastObjectAdded)
				this.keySetUnion.addKeySetDependency(Weave.AS(this.columns.childListCallbacks.lastObjectAdded, IKeySet));
		}
		
		/************************************
		 * Begin IAttributeColumn interface
		 ************************************/

		public getMetadata(propertyName:string):string
		{
			if (this.useFirstColumnMetadata.value)
			{
				var firstColumn:IAttributeColumn = Weave.AS(this._columnsArray[0], IAttributeColumn);
				return firstColumn ? firstColumn.getMetadata(propertyName) : null;
			}
			return ColumnUtils.getCommonMetadata(this._columnsArray, propertyName);
		}

		public getMetadataPropertyNames():string[]
		{
			// TEMPORARY SOLUTION
			var firstColumn:IAttributeColumn = Weave.AS(this._columnsArray[0], IAttributeColumn);
			return firstColumn ? firstColumn.getMetadataPropertyNames() : null;
		}
		
		/**
		 * @return the keys associated with this column.
		 */
		public get keys():IQualifiedKey[]
		{
			return this.keySetUnion.keys;
		}
		
		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			return this.keySetUnion.containsKey(key);
		}

		/**
		 * getValueFromKey
		 * @param key A key of the type specified by keyType.
		 * @return The value associated with the given key.
		 */
		public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			for (var column of this._columnsArray || [])
				if (column.containsKey(key))
					return column.getValueFromKey(key, dataType);
			return dataType == String ? '' : undefined;
		}
	}
}
