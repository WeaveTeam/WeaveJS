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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import Aggregation = weavejs.api.data.Aggregation;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DataSourceUtils = weavejs.data.DataSourceUtils;
	import IColumnWrapper = weavejs.api.data.IColumnWrapper;
	import IColumnReference = weavejs.api.data.IColumnReference;

	export class GroupedDataTransform extends AbstractDataSource implements ISelectableAttributes
	{
		public static /* readonly */ DATA_COLUMNNAME_META:string = "__GroupedDataColumnName__";

		/* override */ public get isLocal():boolean
		{
			return !DataSourceUtils.hasRemoteColumnDependencies(this);
		}

		public get selectableAttributes()
		{
			return new Map<string, IColumnWrapper|ILinkableHashMap>()
				.set("Group by", this.groupByColumn)
				.set("Data to transform", this.dataColumns);
		}
		
		/* override */protected get initializationComplete():boolean
		{
			return super.initializationComplete
				&& !Weave.isBusy(this.groupByColumn)
				&& !Weave.isBusy(this.dataColumns);
		}

		/* override */protected initialize(forceRefresh:boolean = false):void
		{
			super.initialize(true);
		}

		public /* readonly */groupByColumn:DynamicColumn = Weave.linkableChild(this, DynamicColumn);
		public /* readonly */groupKeyType:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */dataColumns:ILinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));

		/**
		 * The session state maps a column name in dataColumns hash map to a value for its "aggregation" metadata.
		 */
		public /* readonly */aggregationModes:ILinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, this.typeofIsObject));
		private typeofIsObject(value:Object):boolean
		{
			return typeof value == 'object';
		}
		
		/* override */public getHierarchyRoot():IWeaveTreeNode&IColumnReference
		{
			if (!this._rootNode)
				this._rootNode = new ColumnTreeNode({
					cacheSettings: {"label": false},
					dataSource: this,
					dependency: this.dataColumns.childListCallbacks,
					data: this,
					"label": () => this.getLabel(),
					hasChildBranches: false,
					children: () => {
						return this.dataColumns.getNames().map(
							(columnName:string) => {
								var meta:{[key:string]:string} = {};
								meta[GroupedDataTransform.DATA_COLUMNNAME_META] = columnName;
								return this.generateHierarchyNode(meta);
							}
						);
					}
				});
			return this._rootNode;
		}

		/* override */protected generateHierarchyNode(metadata:{[key:string]:string}):IWeaveTreeNode
		{
			if (!metadata)
				return null;

			metadata = this.getColumnMetadata(metadata[GroupedDataTransform.DATA_COLUMNNAME_META]);

			if (!metadata)
				return null;

			return new ColumnTreeNode({
				dataSource: this,
				idFields: [GroupedDataTransform.DATA_COLUMNNAME_META],
				data: metadata
			});
		}
		
		private getColumnMetadata(dataColumnName:string):{[key:string]:string}
		{
			var column:IAttributeColumn = this.dataColumns.getObject(dataColumnName) as IAttributeColumn;
			if (!column)
				return null;

			var metadata:{[key:string]:string} = ColumnMetadata.getAllMetadata(column);
			metadata[ColumnMetadata.KEY_TYPE] = this.groupKeyType.value || this.groupByColumn.getMetadata(ColumnMetadata.DATA_TYPE);
			metadata[GroupedDataTransform.DATA_COLUMNNAME_META] = dataColumnName;

			var aggState = this.aggregationModes.getSessionState() as any;
			var aggregation:string = aggState ? aggState[dataColumnName] : null;
			aggregation = aggregation || Aggregation.DEFAULT;
			metadata[ColumnMetadata.AGGREGATION] = aggregation;
			
			if (aggregation != Aggregation.SAME)
				metadata[ColumnMetadata.TITLE] = Weave.lang("{0} ({1})", metadata[ColumnMetadata.TITLE], aggregation);

			return metadata;
		}
		
		/* override */protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var columnName:string = proxyColumn.getMetadata(GroupedDataTransform.DATA_COLUMNNAME_META);
			var metadata:{[key:string]:string} = this.getColumnMetadata(columnName);
			if (!metadata)
			{
				proxyColumn.dataUnavailable();
				return;
			}
			proxyColumn.setMetadata(metadata);
			
			var dataColumn:IAttributeColumn = Weave.AS(this.dataColumns.getObject(columnName), IAttributeColumn);
			var aggregateColumn:AggregateColumn = Weave.AS(proxyColumn.getInternalColumn(), AggregateColumn) || new AggregateColumn(this);
			aggregateColumn.setup(metadata, dataColumn, this.getGroupKeys());

			proxyColumn.setInternalColumn(aggregateColumn);
		}

		private _groupKeys:IQualifiedKey[];
		private getGroupKeys():IQualifiedKey[]
		{
			if (Weave.detectChange(this.getGroupKeys, this.groupByColumn, this.groupKeyType))
			{
				this._groupKeys = [];
				var stringLookup:{[key:string]:boolean} = {};
				var keyType:string = this.groupKeyType.value || this.groupByColumn.getMetadata(ColumnMetadata.DATA_TYPE);
				for(var key of this.groupByColumn.keys)
				{
					var localName:string;
					// if the foreign key column is numeric, avoid using the formatted strings as keys
					if (this.groupByColumn.getMetadata(ColumnMetadata.DATA_TYPE) == DataType.NUMBER)
						localName = this.groupByColumn.getValueFromKey(key, Number);
					else
						localName = this.groupByColumn.getValueFromKey(key, String);
					
					if (!stringLookup[localName])
					{
						stringLookup[localName] = true;
						var groupKey:IQualifiedKey = WeaveAPI.QKeyManager.getQKey(keyType, localName);
						this._groupKeys.push(groupKey);
					}
				}
			}
			return this._groupKeys;
		}
	}
	Weave.registerClass(GroupedDataTransform, "weavejs.data.source.GroupedDataTransform", [IDataSource], "Grouped data transform");
}

import WeaveAPI = weavejs.WeaveAPI;
import Aggregation = weavejs.api.data.Aggregation;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import DataType = weavejs.api.data.DataType;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IPrimitiveColumn = weavejs.api.data.IPrimitiveColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import SessionManager = weavejs.core.SessionManager;
import ColumnUtils = weavejs.data.ColumnUtils;
import EquationColumnLib = weavejs.data.EquationColumnLib;
import AbstractAttributeColumn = weavejs.data.column.AbstractAttributeColumn;
import NumberColumn = weavejs.data.column.NumberColumn;
import StringColumn = weavejs.data.column.StringColumn;
import GroupedDataTransform = weavejs.data.source.GroupedDataTransform;
import ArrayUtils = weavejs.util.ArrayUtils;
import Dictionary2D = weavejs.util.Dictionary2D;
import StandardLib = weavejs.util.StandardLib;

class AggregateColumn extends AbstractAttributeColumn implements IPrimitiveColumn
{
	constructor(source:GroupedDataTransform)
	{
		super();
		Weave.linkableChild(this, source);
		this._groupByColumn = source.groupByColumn;
	}
	
	private _groupByColumn:IAttributeColumn;
	private _dataColumn:IAttributeColumn;
	private _keys:IQualifiedKey[];
	private _cacheTriggerCounter:uint = 0;
	
	public setup(metadata:{[key:string]:string}, dataColumn:IAttributeColumn, keys:IQualifiedKey[]):void
	{
		if (this._dataColumn && this._dataColumn != dataColumn)
			(WeaveAPI.SessionManager as SessionManager).unregisterLinkableChild(this, this._dataColumn);
		
		this._metadata = AggregateColumn.copyValues(metadata);
		this._dataColumn = dataColumn && Weave.linkableChild(this, dataColumn);
		this._keys = keys;
		this._cacheTriggerCounter = 0;
		this.triggerCallbacks();
	}
	
	/* override */public getMetadata(propertyName:string):string
	{
		return super.getMetadata(propertyName)
			|| (this._dataColumn ? this._dataColumn.getMetadata(propertyName) : null);
	}
	
	/* override */public getMetadataPropertyNames():string[]
	{
		if (this._dataColumn)
			return ArrayUtils.union(super.getMetadataPropertyNames(), this._dataColumn.getMetadataPropertyNames());
		return super.getMetadataPropertyNames();
	}

	/**
	 * @inheritDoc
	 */
	/* override */public get keys()
	{
		return this._keys;
	}
	
	/**
	 * @inheritDoc
	 */
	/* override */public containsKey(key:IQualifiedKey):boolean
	{
		return this._dataColumn && this._dataColumn.containsKey(key);
	}
	
	public deriveStringFromNumber(value:number):string
	{
		return ColumnUtils.deriveStringFromNumber(this._dataColumn, value);
	}
	
	/**
	 * @inheritDoc
	 */
	/* override */public getValueFromKey(groupKey:IQualifiedKey, dataType:Class = null):any
	{
		if (this.triggerCounter != this._cacheTriggerCounter)
		{
			this._cacheTriggerCounter = this.triggerCounter;
			this.dataCache = new Dictionary2D<Class, IQualifiedKey, any>();
		}
		
		if (!dataType)
			dataType = Array;

		var value:any = this.dataCache.get(dataType, groupKey);

		if (value === undefined)
		{
			value = this.getAggregateValue(groupKey, dataType);
			this.dataCache.set(dataType, groupKey, value === undefined ? AggregateColumn.UNDEFINED : value);
		}
		else if (value === AggregateColumn.UNDEFINED)
		{
			value = undefined;
		}

		return value;
	}
	
	private static /* readonly */ UNDEFINED:Object = {}; // used as a placeholder for undefined values in dataCache
	
	/**
	 * Computes an aggregated value.
	 * @param groupKey A key that references a String value and is associated with a set of input keys.
	 * @param dataType The dataType parameter passed to the EquationColumn.
	 */
	public getAggregateValue(groupKey:IQualifiedKey, dataType:Class):any
	{
		if (groupKey.keyType != this.getMetadata(ColumnMetadata.KEY_TYPE))
			return undefined;
		
		if (!dataType)
			dataType = Array;
		
		// get input keys from groupKey
		var tempKeys:IQualifiedKey[] = EquationColumnLib.getAssociatedKeys(this._groupByColumn, groupKey, true);
		var meta_dataType:string = this._dataColumn ? this._dataColumn.getMetadata(ColumnMetadata.DATA_TYPE) : null;
		var inputType:Class = DataType.getClass(meta_dataType);

		if (dataType === Array)
		{
			// We want a flat Array of values, not a nested Array, so we request the original input type
			// in case they need to be pre-aggregated.
			return AggregateColumn.getValues(this._dataColumn, tempKeys, inputType);
		}
		
		var meta_aggregation:string = this.getMetadata(ColumnMetadata.AGGREGATION) || Aggregation.DEFAULT;
		
		if (inputType === Number || inputType === Date)
		{
			var array:any[] = Weave.AS(this.getValueFromKey(groupKey, Array), Array);
			var number:number = NumberColumn.aggregate(array, meta_aggregation);
			
			if (dataType === Number)
				return number;
			
			if (dataType === Date)
				return new Date(number);
			
			if (dataType === String)
			{
				if (isNaN(number) && array && array.length > 1 && meta_aggregation == Aggregation.SAME)
					return Aggregation.AMBIGUOUS_DATA;
				return ColumnUtils.deriveStringFromNumber(this._dataColumn, number)
					|| StandardLib.formatNumber(number);
			}
			
			return undefined;
		}
		
		if (inputType === String)
		{
			// get a list of values of the requested type, then treat them as Strings and aggregate the Strings
			var values = AggregateColumn.getValues(this._dataColumn, tempKeys, dataType);

			var string:string = StringColumn.aggregate(values, meta_aggregation);
			
			if (dataType === Number)
				return StandardLib.asNumber(string);
			
			if (dataType === String)
				return string;
			
			return undefined;
		}
		
		if (meta_dataType === DataType.GEOMETRY)
		{
			if (dataType === String)
				return this.containsKey(groupKey) ? 'Geometry(' + groupKey.keyType + '#' + groupKey.localName + ')' : '';
		}
		
		return undefined;
	}
	
	/**
	 * Gets an Array of values from a column, excluding missing data.
	 * Flattens Arrays.
	 */
	private static getValues(column:IAttributeColumn, keys:IQualifiedKey[], dataType:Class):any[]
	{
		var values:any[] = [];
		if (!column)
			return values;
		for (var key of keys)
		{
			if (!column.containsKey(key))
				continue;
			var value:any = column.getValueFromKey(key, dataType);
			if (Array.isArray(value))
				values.push.apply(values, value);
			else
				values.push(value);
		}
		return values;
	}
}
