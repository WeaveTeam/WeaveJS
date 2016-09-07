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

namespace weavejs.data.source
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
	import DataSourceUtils = weavejs.data.DataSourceUtils;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;

	export interface IForeightDataMappingColumnMetadata extends IColumnMetadata
	{
		dataColumnName?:string;
	}

	export class ForeignDataMappingTransform extends AbstractDataSource implements ISelectableAttributes
	{
		static WEAVE_INFO = Weave.setClassInfo(ForeignDataMappingTransform, {
			id: "weavejs.data.source.ForeignDataMappingTransform",
			label: "Foreign data mapping",
			interfaces: [IDataSource, ISelectableAttributes]
		});

		public static DATA_COLUMNNAME_META = "dataColumnName";
		public /* const */ keyColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public /* const */ dataColumns:ILinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));

		/* override */ public get isLocal():boolean
		{
			return !DataSourceUtils.hasRemoteColumnDependencies(this);
		}

		public get selectableAttributes()
		{
			return new Map<string, IColumnWrapper|ILinkableHashMap>()
				.set("Foreign key mapping", this.keyColumn)
				.set("Data to transform", this.dataColumns);
		}
		
		/* override */ protected get initializationComplete():boolean
		{
			return super.initializationComplete
				&& !Weave.isBusy(this.keyColumn)
				&& !Weave.isBusy(this.dataColumns);
		}
		
		/* override */ protected initialize(forceRefresh:boolean = false):void
		{
			// recalculate all columns previously requested
			super.initialize(true);
		}
		
		/* override */ public getHierarchyRoot():IWeaveTreeNode&IColumnReference
		{
			if (!this._rootNode)
				this._rootNode = new ColumnTreeNode({
					cacheSettings: {"label": false},
					dataSource: this,
					dependency: this.dataColumns,
					data: this,
					label: () => this.getLabel(),
					hasChildBranches: false,
					children: () => {
						return this.dataColumns.getNames().map(
							(dataColumnName:string) => {
								var column:IAttributeColumn = Weave.AS(this.dataColumns.getObject(dataColumnName), IAttributeColumn);
								var title:string = column.getMetadata(ColumnMetadata.TITLE);
								var metadata:IForeightDataMappingColumnMetadata = {};
								metadata.title = title;
								metadata.dataColumnName = dataColumnName;
								return this.generateHierarchyNode(metadata);
							}
						);
					}
				});
			return this._rootNode;
		}

		/* override */ protected generateHierarchyNode(metadata:IForeightDataMappingColumnMetadata):IWeaveTreeNode&IColumnReference
		{
			if (!metadata)
				return null;
			
			var name:string = metadata.dataColumnName;
			metadata = this.getColumnMetadata(name);
			if (!metadata)
				return null;
			
			return new ColumnTreeNode({
				dataSource: this,
				idFields: [ForeignDataMappingTransform.DATA_COLUMNNAME_META],
				data: metadata
			});
		}
		
		private getColumnMetadata(dataColumnName:string, includeSourceColumnMetadata:boolean = true):IForeightDataMappingColumnMetadata
		{
			var column:IAttributeColumn = Weave.AS(this.dataColumns.getObject(dataColumnName), IAttributeColumn);
			if (!column)
				return null;
			
			var metadata:IForeightDataMappingColumnMetadata = includeSourceColumnMetadata ? ColumnMetadata.getAllMetadata(column) : {};
			metadata.keyType = this.keyColumn.getMetadata(ColumnMetadata.KEY_TYPE);
			metadata.dataColumnName = dataColumnName;
			return metadata;
		}
		
		/* override */ protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var dataColumnName:string = proxyColumn.getMetadata(ForeignDataMappingTransform.DATA_COLUMNNAME_META);
			var metadata = this.getColumnMetadata(dataColumnName, false);
			if (!metadata)
			{
				proxyColumn.dataUnavailable();
				return;
			}
			proxyColumn.setMetadata(metadata);
			
			var dataColumn = Weave.AS(this.dataColumns.getObject(dataColumnName), IAttributeColumn);
			var foreignDataColumn = Weave.AS(proxyColumn.getInternalColumn(), ForeignDataColumn) || new ForeignDataColumn(this);
			foreignDataColumn.setup(metadata, dataColumn);
			proxyColumn.setInternalColumn(foreignDataColumn);
		}
	}

	class ForeignDataColumn extends AbstractAttributeColumn implements IPrimitiveColumn
	{
		static WEAVE_INFO = Weave.setClassInfo(ForeignDataColumn, {
			id: "weavejs.data.source.ForeignDataColumn",
			interfaces: [IPrimitiveColumn]
		});

		constructor(source:ForeignDataMappingTransform)
		{
			super();
			Weave.linkableChild(this, source);
			this._keyColumn = source.keyColumn;
		}

		private _keyColumn:IAttributeColumn;
		private _dataColumn:IAttributeColumn;
		private _keyType:string;

		public setup(metadata:IColumnMetadata, dataColumn:IAttributeColumn):void
		{
			if (this._dataColumn && this._dataColumn != dataColumn)
				Weave.AS(WeaveAPI.SessionManager, SessionManager).unregisterLinkableChild(this, this._dataColumn);

			this._metadata = AbstractAttributeColumn.copyValues(metadata);
			this._dataColumn = Weave.linkableChild(this, dataColumn);
			this._keyType = dataColumn.getMetadata(ColumnMetadata.KEY_TYPE);
			this.triggerCallbacks();
		}

		/* override */ public getMetadata(propertyName:string):string
		{
			return super.getMetadata(propertyName)
				|| this._dataColumn.getMetadata(propertyName);
		}

		/* override */ public getMetadataPropertyNames():string[]
		{
			if (this._dataColumn)
				return ArrayUtils.union(super.getMetadataPropertyNames(), this._dataColumn.getMetadataPropertyNames());
			return super.getMetadataPropertyNames();
		}

		/* override */ public get keys()
		{
			return this._keyColumn.keys;
		}

		/* override */ public containsKey(key:IQualifiedKey):boolean
		{
			return this._dataColumn.containsKey(key);
		}

		public deriveStringFromNumber(value:number):string
		{
			return ColumnUtils.deriveStringFromNumber(this._dataColumn, value);
		}

		/* override */ public getValueFromKey(key:IQualifiedKey, dataType:GenericClass = null):any
		{
			//TODO - this should be cached
			var localName:string;
			// if the foreign key column is numeric, avoid using the formatted strings as keys
			if (this._keyColumn.getMetadata(ColumnMetadata.DATA_TYPE) == DataType.NUMBER)
				localName = this._keyColumn.getValueFromKey(key, Number);
			else
				localName = this._keyColumn.getValueFromKey(key, String);

			var foreignKey:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(this._keyType, localName);
			return this._dataColumn.getValueFromKey(foreignKey, dataType);
		}
	}
}
