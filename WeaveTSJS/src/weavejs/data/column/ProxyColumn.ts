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
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import LinkableWatcher = weavejs.core.LinkableWatcher;
	import ArrayUtils = weavejs.util.ArrayUtils;
	import ICallbackCollection = weavejs.api.core.ICallbackCollection;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	/**
	 * This class is a proxy (a wrapper) for another attribute column.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({id: "weavejs.data.column.ProxyColumn", interfaces: [IAttributeColumn, IColumnWrapper, ICallbackCollection]})
	export class ProxyColumn extends AbstractAttributeColumn implements IColumnWrapper
	{
		constructor(metadata:IColumnMetadata = null)
		{
			super(metadata);
		}
		
		private /* readonly */ watcher:LinkableWatcher = Weave.linkableChild(this, new LinkableWatcher(IAttributeColumn));
		
		/**
		 * @return the keys associated with this column.
		 */
		/* override */ public get keys():IQualifiedKey[]
		{
			var column:IAttributeColumn = Weave.AS(this.watcher.target, IAttributeColumn);
			return column ? column.keys : [];
		}
		
		/**
		 * @param key A key to test.
		 * @return true if the key exists in this IKeySet.
		 */
		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			var column:IAttributeColumn = Weave.AS(this.watcher.target, IAttributeColumn);
			return column ? column.containsKey(key) : false;
		}

		/**
		 * This function updates the proxy metadata.
		 * @param metadata New metadata for the proxy.
		 */
		/* override */ public setMetadata(metadata:IColumnMetadata):void
		{
			this._metadata = AbstractAttributeColumn.copyValues(metadata);
			this.triggerCallbacks();
		}

		/**
		 * The metadata specified by ProxyColumn will override the metadata of the internal column.
		 * First, this function checks thet ProxyColumn metadata.
		 * If the value is null, it checks the metadata of the internal column.
		 * @param propertyName The name of a metadata property to get.
		 * @return The metadata value of the ProxyColumn or the internal column, ProxyColumn metadata takes precendence.
		 */
		/* override */ public getMetadata(propertyName:string):string
		{
			if (propertyName === ColumnMetadata.TITLE && this._overrideTitle)
				return this._overrideTitle;
			
			var column:IAttributeColumn = Weave.AS(this.watcher.target, IAttributeColumn);
			var overrideValue:string = super.getMetadata(propertyName);
			if (overrideValue == null && column != null)
				return column.getMetadata(propertyName);
			return overrideValue;
		}
		
		public getProxyMetadata():IColumnMetadata
		{
			return AbstractAttributeColumn.copyValues(this._metadata);
		}
		
		/* override */ public getMetadataPropertyNames():string[]
		{
			var column:IAttributeColumn = Weave.AS(this.watcher.target, IAttributeColumn);
			if (column)
				return ArrayUtils.union(super.getMetadataPropertyNames(), column.getMetadataPropertyNames());
			return super.getMetadataPropertyNames();
		}
		
		/**
		 * internalAttributeColumn
		 * This is the IAttributeColumn object contained in this ProxyColumn.
		 */
		public getInternalColumn():IAttributeColumn
		{
			return Weave.AS(this.watcher.target, IAttributeColumn);
		}
		public setInternalColumn(newColumn:IAttributeColumn):void
		{
			this._overrideTitle = null;
			this.watcher.target = newColumn;
		}
		
		/**
		 * The functions below serve as wrappers for matching function calls on the internalAttributeColumn.
		 */
		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			var column:IAttributeColumn = Weave.AS(this.watcher.target, IAttributeColumn);
			if (column)
				return column.getValueFromKey(key, dataType);
			return undefined;
		}

		/* override */ public dispose():void
		{
			super.dispose();
			this._metadata = null;
		}
		
		private _overrideTitle:string;
		
		/**
		 * Call this function when the ProxyColumn should indicate that the requested data is unavailable.
		 * @param message The message to display in the title of the ProxyColumn.
		 */
		public dataUnavailable(message:string = null):void
		{
			this.delayCallbacks();
			this.setInternalColumn(null);
			if (message)
			{
				this._overrideTitle = message;
			}
			else
			{
				var title:string = this.getMetadata(ColumnMetadata.TITLE);
				if (title)
					this._overrideTitle = Weave.lang('(Data unavailable: {0})', title);
				else
					this._overrideTitle = Weave.lang(ProxyColumn.DATA_UNAVAILABLE);
			}
			this.triggerCallbacks();
			this.resumeCallbacks();
		}
		
		private static /* readonly */ DATA_UNAVAILABLE:string = '(Data unavailable)';
	}
}
