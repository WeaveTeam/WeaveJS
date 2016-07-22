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

package weavejs.data.source
{
	import weavejs.WeaveAPI;
	import weavejs.api.core.ILinkableHashMap;
	import weavejs.api.core.ILinkableVariable;
	import weavejs.api.data.Aggregation;
	import weavejs.api.data.ColumnMetadata;
	import weavejs.api.data.DataType;
	import weavejs.api.data.IAttributeColumn;
	import weavejs.api.data.IDataSource;
	import weavejs.api.data.IQualifiedKey;
	import weavejs.api.data.ISelectableAttributes;
	import weavejs.api.data.IWeaveTreeNode;
	import weavejs.core.LinkableHashMap;
	import weavejs.core.LinkableString;
	import weavejs.core.LinkableVariable;
	import weavejs.core.LinkableBoolean;
	import weavejs.core.LinkableNumber;
	import weavejs.data.column.DynamicColumn;
	import weavejs.data.column.ProxyColumn;
	import weavejs.data.column.StringColumn;
	import weavejs.data.hierarchy.ColumnTreeNode;
	import weavejs.data.ColumnUtils;
	import weavejs.data.DataSourceUtils;
	import weavejs.util.JS;
	import weavejs.util.StandardLib;

	public class WebSocketDataSource extends AbstractDataSource
	{
		WeaveAPI.ClassRegistry.registerImplementation(IDataSource, WebSocketDataSource, "WebSocket Data Source");

		public static const DATA_COLUMNNAME_META:String = "__WebSocketJsonPropertyName__";


		public function WebSocketDataSource()
		{
		}

		public const keyType:LinkableString = Weave.linkableChild(this, LinkableString);
		public const keyProperty:LinkableString = Weave.linkableChild(this, LinkableString);
		public const keepLast:LinkableNumber = Weave.linkableChild(this, LinkableNumber, onKeepLastChange);
		//public const selectionFeedback:LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
		public const url:LinkableString = Weave.linkableChild(this, LinkableString, onUrlChange);


		private var _socket:Object = null;
		private function onUrlChange():void
		{
			if (_socket && _socket.readyState < 2)
			{
				_socket.close(1000, "No longer needed.");
				_socket = null;
			}

			records = [];
			propertyNames.clear();


			_socket = new JS.global.WebSocket(url.value);

			_socket.onmessage = onMessage;
			_socket.onclose = onClose;
			_socket.onerror = onError;
		}

		private function onClose(event:Object):void
		{
			_socket = null;
		}

		private function onError(event:Object):void
		{
			JS.error(event);
			_socket = null;
		}

		private function onMessage(event:/*/MessageEvent/*/Object):void
		{
			var str:String = event.data;
			var record:Object = JSON.parse(str);

			if ((records.length == keepLast.value) && (keepLast.value > 0))
			{
				records.shift();
			}

			records.push(record);

			/* Update set of property names */
			for each (var key:String in JS.objectKeys(record))
			{
				propertyNames.add(key);
			}

			refreshAllProxyColumns();
		}

		public function getPropertyNames():Array/*/<string>/*/
		{
			return JS.mapKeys(propertyNames)
		}

		private function onKeepLastChange():void
		{
			var diff:int = records.length - keepLast.value;
			if (diff > 0)
			{
				records = records.slice(diff);
			}
		}

		/**
		 * The session state maps a column name in dataColumns hash map to a value for its "aggregation" metadata.
		 */
		public const aggregationModes:ILinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, typeofIsObject));
		private function typeofIsObject(value:Object):Boolean
		{
			return typeof value == 'object';
		}

		private var records:Array = [];
		private var propertyNames:Object = new JS.global.Set();
		
		override public function getHierarchyRoot():IWeaveTreeNode
		{
			if (!_rootNode)
				_rootNode = new ColumnTreeNode({
					cacheSettings: {"label": false},
					dataSource: this,
					dependency: this,
					data: this,
					"label": getLabel,
					hasChildBranches: false,
					children: function():Array {
						return JS.mapValues(propertyNames).map(
							function (columnName:String, ..._):* {
								var meta:Object = {};
								meta[DATA_COLUMNNAME_META] = columnName;
								return generateHierarchyNode(meta);
							}
						);
					}
				});
			return _rootNode;
		}

		override protected function generateHierarchyNode(metadata:Object):IWeaveTreeNode
		{
			if (!metadata)
				return null;

			metadata = getColumnMetadata(metadata[DATA_COLUMNNAME_META]);

			if (!metadata)
				return null;

			return new ColumnTreeNode({
				dataSource: this,
				idFields: [DATA_COLUMNNAME_META],
				data: metadata
			});
		}
		
		private function getColumnMetadata(dataColumnName:String):Object
		{
			var metadata:Object = {};
			metadata[ColumnMetadata.KEY_TYPE] = keyType.value || DataType.STRING;
			metadata[DATA_COLUMNNAME_META] = dataColumnName;
			metadata[ColumnMetadata.TITLE] = dataColumnName;
			
			var aggState:Object = aggregationModes.getSessionState();
			var aggregation:String = aggState ? aggState[dataColumnName] : null;
			aggregation = aggregation || Aggregation.LAST; /* Keep the last value by default, this makes more sense in streaming applications. */
			metadata[ColumnMetadata.AGGREGATION] = aggregation;
			
			if (aggregation != Aggregation.SAME)
				metadata[ColumnMetadata.TITLE] = Weave.lang("{0} ({1})", metadata[ColumnMetadata.TITLE], aggregation);

			return metadata;
		}
		
		override protected function requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var columnName:String = proxyColumn.getMetadata(DATA_COLUMNNAME_META);

			var keys:Array;
			var data:Array = StandardLib.lodash.map(records, columnName);/*.map(
				function (d:*,i:int,a:Array):*
				{
					return d !== undefined ? d : null;
				}
			);*/

			if (keyProperty.value)
			{
				keys = StandardLib.lodash.map(records, keyProperty.value);
			}
			else
			{
				keys = StandardLib.lodash.range(data.length);
			}

			var metadata:Object = getColumnMetadata(columnName);

			var dataType:String = DataSourceUtils.guessDataType(data);
			metadata[ColumnMetadata.DATA_TYPE] = dataType;
			proxyColumn.setMetadata(metadata);

			DataSourceUtils.initColumn(proxyColumn, keys, data);
		}		
	}
}
