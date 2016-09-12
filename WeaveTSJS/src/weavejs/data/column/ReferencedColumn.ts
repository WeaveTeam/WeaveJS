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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IDataSource = weavejs.api.data.IDataSource;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import CallbackCollection = weavejs.core.CallbackCollection;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import GlobalColumnDataSource = weavejs.data.hierarchy.GlobalColumnDataSource;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	
	/**
	 * This provides a wrapper for a referenced column.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id:"weavejs.data.column.ReferencedColumn", interfaces: [IColumnWrapper, IAttributeColumn]})
	export class ReferencedColumn extends CallbackCollection implements IColumnWrapper
	{
		constructor()
		{
			super();
		}
		
		private _initialized:boolean = false;
		
		private _dataSource:IDataSource;
		
		private updateDataSource():void
		{
			var root:ILinkableHashMap = Weave.getRoot(this);
			if (!root)
				return;
			
			if (!this._initialized)
			{
				root.childListCallbacks.addImmediateCallback(this, this.updateDataSource);
				this._initialized = true;
			}
			
			var ds:IDataSource = Weave.AS(root.getObject(this.dataSourceName.value), IDataSource);
			if (!ds)
				ds = GlobalColumnDataSource.getInstance(root);
			if (this._dataSource != ds)
			{
				this._dataSource = ds;
				this.triggerCallbacks();
			}
		}
		
		/**
		 * This is the name of an IDataSource in the top level session state.
		 */
		public /* readonly */ dataSourceName:LinkableString = Weave.linkableChild(this, LinkableString, this.updateDataSource);
		
		/**
		 * This holds the metadata used to identify a column.
		 */
		public /* readonly */ metadata:LinkableVariable = Weave.linkableChild(this, LinkableVariable);
		
		public getDataSource():IDataSource
		{
			return this._dataSource;
		}
		
		public getHierarchyNode():IWeaveTreeNode & IColumnReference
		{
			if (!this._dataSource)
				return null;
			
			var meta:IColumnMetadata = this.metadata.getSessionState();
			return this._dataSource.findHierarchyNode(meta);
		}
		
		/**
		 * Updates the session state to refer to a new column.
		 */
		public setColumnReference(dataSource:IDataSource, metadata:IColumnMetadata):void
		{
			this.delayCallbacks();
			var root:ILinkableHashMap = Weave.getRoot(this);
			if (!root)
				throw new Error("ReferencedColumn is not registered with an instance of Weave");
			this.dataSourceName.value = root.getName(dataSource);
			this.metadata.setSessionState(metadata);
			this.resumeCallbacks();
		}
		
		public static generateReferencedColumnStateFromColumnReference(ref:IColumnReference):{dataSourceName:string, metadata: IColumnMetadata}
		{
			var dataSource:IDataSource = ref.getDataSource();
			var root:ILinkableHashMap = Weave.getRoot(dataSource);
			var name:string = root ? root.getName(dataSource) : null;
			return {
				dataSourceName: name,
				metadata: ref.getColumnMetadata()
			};
		}
		
		/**
		 * The trigger counter value at the last time the internal column was retrieved.
		 */		
		private _prevTriggerCounter:uint = 0;
		/**
		 * the internal referenced column
		 */
		private _internalColumn:IAttributeColumn = null;
		
		private _columnWatcher:LinkableWatcher = Weave.linkableChild(this, LinkableWatcher);
		
		public getInternalColumn():IAttributeColumn
		{
			if (this._prevTriggerCounter != this.triggerCounter)
			{
				if (Weave.wasDisposed(this._dataSource))
					this._dataSource = null;
				
				this._columnWatcher.target = this._internalColumn = WeaveAPI.AttributeColumnCache.getColumn(this._dataSource, this.metadata.state);
				
				this._prevTriggerCounter = this.triggerCounter;
			}
			return this._internalColumn;
		}
		
		
		/************************************
		 * Begin IAttributeColumn interface
		 ************************************/

		public getMetadata(attributeName:string):string
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				this.getInternalColumn();
			return this._internalColumn ? this._internalColumn.getMetadata(attributeName) : null;
		}

		public getMetadataPropertyNames():string[]
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				this.getInternalColumn();
			return this._internalColumn ? this._internalColumn.getMetadataPropertyNames() : [];
		}
		
		/**
		 * @return the keys associated with this column.
		 */
		public get keys():IQualifiedKey[]
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				this.getInternalColumn();
			return this._internalColumn ? this._internalColumn.keys : [];
		}

		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		public containsKey(key:IQualifiedKey):boolean
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				this.getInternalColumn();
			return this._internalColumn && this._internalColumn.containsKey(key);
		}
		
		/**
		 * getValueFromKey
		 * @param key A key of the type specified by keyType.
		 * @return The value associated with the given key.
		 */
		public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			if (this._prevTriggerCounter != this.triggerCounter)
				this.getInternalColumn();
			return this._internalColumn ? this._internalColumn.getValueFromKey(key, dataType) : undefined;
		}
	}
}
