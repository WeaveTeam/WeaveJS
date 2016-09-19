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
	import ILinkableVariable = weavejs.api.core.ILinkableVariable;
	import IKeySet = weavejs.api.data.IKeySet;
	import Aggregation = weavejs.api.data.Aggregation;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataTypes = weavejs.api.data.DataTypes;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import LinkableHashMap = weavejs.core.LinkableHashMap;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import DynamicColumn = weavejs.data.column.DynamicColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import StringColumn = weavejs.data.column.StringColumn;
	import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DataSourceUtils = weavejs.data.DataSourceUtils;
	import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
	import StandardLib = weavejs.util.StandardLib;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;

	export interface IWebSocketColumnMetadata extends IColumnMetadata
	{
		jsonPropertyName?:string;
	}
	@Weave.classInfo({id: "weavejs.data.source.WebSocketDataSource", interfaces: [IDataSource], label: "WebSocket Data Source"})
	export class WebSocketDataSource extends AbstractDataSource
	{
		public static /* readonly */ DATA_COLUMNNAME_META:string = "jsonPropertyName";

		public /* readonly */ keyType:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ keyProperty:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ keepLast:LinkableNumber = Weave.linkableChild(this, LinkableNumber, this.onKeepLastChange);
		public /* readonly */ url:LinkableString = Weave.linkableChild(this, LinkableString, this.onUrlChange);

		/* override */ protected initialize(forceRefresh:boolean = false):void
		{
			// recalculate all columns previously requested because CSV data may have changed.
			super.initialize(true);
		}

		public sendMessage(payload:Object):void
		{
			if (this._socket && this._socket.readyState == 1)
			{
				this._socket.send(JSON.stringify(payload));
			}
		}

		private _socket:WebSocket = null;

		private onUrlChange():void
		{
			this.reconnect();

			this.records = [];
			this.propertyNames.clear();
		}

		public reconnect():void /* To be called from UI reconnect button. */
		{
			clearTimeout(this.timeoutId);
			if (this._socket && this._socket.readyState < 2)
			{
				this._socket.close(1000, "No longer needed.");
				this._socket = null;
			}

			try
			{
				this._socket = new WebSocket(this.url.value);

				this._socket.onmessage = this.onMessage;
				this._socket.onclose = this.onClose;
				this._socket.onerror = this.onError;
			}
			catch (e)
			{
				console.error(e);
			}
		}

		private timeoutId:number= 0;
		private onClose=(event:CloseEvent):void=>
		{
			this._socket = null;
			if (this.url.value && event.code == 1006 /* CLOSE_ABNORMAL */)
			{
				this.timeoutId = setTimeout(this.reconnect, 1500)
			}
		}

		private onError=(event:ErrorEvent):void=>
		{
			console.error(event);
			/* Should we automatically retry here? */
			this._socket = null;
		}

		private addRecord(record:Object):void
		{
			if ((this.records.length == this.keepLast.value) && (this.keepLast.value > 0))
			{
				this.records.shift();
			}

			this.records.push(record);

			/* Update set of property names */
			for (var key of Object.keys(record))
			{
				this.propertyNames.add(key);
			}
		}

		private onMessage=(event:MessageEvent):void=>
		{
			var str:string = event.data;
			var message:Object = JSON.parse(str);

			if (Weave.IS(message, Array))
			{
				Weave.AS(message, Array).forEach((message:Object) => this.addRecord(message));
			}
			else
			{
				this.addRecord(message);
			}

			Weave.getCallbacks(this).triggerCallbacks();
		}

		public getPropertyNames():string[]
		{
			return [...this.propertyNames];
		}

		private onKeepLastChange():void
		{
			var diff:number = this.records.length - this.keepLast.value;
			if (diff > 0)
			{
				this.records = this.records.slice(diff);
			}
		}

		/**
		 * The session state maps a column name in dataColumns hash map to a value for its "aggregation" metadata.
		 */
		public /* readonly */ aggregationModes:ILinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, this.typeofIsObject));

		private typeofIsObject(value:Object):boolean
		{
			return typeof value == 'object';
		}

		private records:any[] = [];
		private propertyNames:Set<string> = new Set<string>();
		
		/* override */ public getHierarchyRoot():IWeaveTreeNode&IColumnReference
		{
			if (!this._rootNode)
				this._rootNode = new ColumnTreeNode({
					cacheSettings: {"label": false},
					dataSource: this,
					dependency: this,
					data: this,
					label: () => this.getLabel(),
					hasChildBranches: false,
					children: ()=> {
						return [...this.propertyNames].map(
							(columnName:string) => {
								var meta:IWebSocketColumnMetadata = {};
								meta.jsonPropertyName = columnName;
								return this.generateHierarchyNode(meta);
							}
						);
					}
				});
			return this._rootNode;
		}

		/* override */ protected generateHierarchyNode(metadata:IWebSocketColumnMetadata):IWeaveTreeNode&IColumnReference
		{
			if (!metadata)
				return null;

			metadata = this.getColumnMetadata(metadata.jsonPropertyName);

			if (!metadata)
				return null;

			return new ColumnTreeNode({
				dataSource: this,
				idFields: [WebSocketDataSource.DATA_COLUMNNAME_META],
				data: metadata
			});
		}
		
		private getColumnMetadata(dataColumnName:string):Object
		{
			var metadata:IWebSocketColumnMetadata = {};
			metadata.keyType = this.keyType.value || DataTypes.STRING;
			metadata.jsonPropertyName = dataColumnName;
			metadata.title = dataColumnName;
			
			var aggState = this.aggregationModes.getSessionState() as {[key:string]:string};
			var aggregation:string = aggState ? aggState[dataColumnName] : null;
			aggregation = aggregation || Aggregation.LAST; /* Keep the last value by default, this makes more sense in streaming applications. */
			metadata[ColumnMetadata.AGGREGATION] = aggregation;
			
			if (aggregation != Aggregation.SAME)
				metadata[ColumnMetadata.TITLE] = Weave.lang("{0} ({1})", metadata[ColumnMetadata.TITLE], aggregation);

			return metadata;
		}
		
		/* override */ protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var columnName:string = proxyColumn.getMetadata(WebSocketDataSource.DATA_COLUMNNAME_META);

			var keys:string[];
			var data:any[] = _.map(this.records, columnName);/*.map(
				function (d:*,i:int,a:Array):*
				{
					return d !== undefined ? d : null;
				}
			);*/

			if (this.keyProperty.value)
			{
				keys = _.map(this.records, this.keyProperty.value) as string[];
			}
			else
			{
				keys = _.range(data.length).map(String);
			}

			var metadata:IWebSocketColumnMetadata = this.getColumnMetadata(columnName);

			var dataType = DataSourceUtils.guessDataType(data);
			metadata.dataType = dataType as any;//TODO fix dataType
			proxyColumn.setMetadata(metadata);

			DataSourceUtils.initColumn(proxyColumn, keys, data);
		}		
	}
}
