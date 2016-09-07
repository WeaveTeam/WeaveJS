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

namespace weavejs.data
{
	import WeaveAPI = weavejs.WeaveAPI;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import IDataSource = weavejs.api.data.IDataSource;
	import DateColumn = weavejs.data.column.DateColumn;
	import NumberColumn = weavejs.data.column.NumberColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import StringColumn = weavejs.data.column.StringColumn;
	import QKeyManager = weavejs.data.key.QKeyManager;
	import StandardLib = weavejs.util.StandardLib;
	import JS = weavejs.util.JS;

	export class DataSourceUtils
	{
		private static /* readonly */ numberRegex:RegExp = /^(0|0?\\.[0-9]+|[1-9][0-9]*(\\.[0-9]+)?)([eE][-+]?[0-9]+)?$/;

		public static guessDataType(data:number[]|string[]):string
		{
			var dateFormats:string[] = DateColumn.detectDateFormats(data);
			if (dateFormats.length)
				return DataType.DATE;

			for (var value of data)
				if (value != null && !(typeof value == "number") && !DataSourceUtils.numberRegex.test(value as string))
					return DataType.STRING;

			return DataType.NUMBER;
		}

		private static _weakMap_dataSource_isLocal = new WeakMap<IDataSource,boolean>();
		/**
		 * Determine whether a datasource that uses columns from other datasources that are remote.
		 * @param  dataSource The datasource to test.
		 * @return            True if a remote column is used by the datasource; false otherwise.
		 */
		public static hasRemoteColumnDependencies(dataSource:IDataSource):boolean
		{
			/* Possibly cache this and check for changes? */
			for (var column of Weave.getDescendants(dataSource, IAttributeColumn))
			{
				for (var columnDataSource of ColumnUtils.getDataSources(column))
				{
					if (columnDataSource === dataSource) continue;
					var isLocal:boolean;
					if (Weave.detectChange(DataSourceUtils._weakMap_dataSource_isLocal, columnDataSource))
					{
						isLocal = columnDataSource.isLocal;
						DataSourceUtils._weakMap_dataSource_isLocal.set(columnDataSource, isLocal);
					}
					else
					{
						isLocal = DataSourceUtils._weakMap_dataSource_isLocal.has(columnDataSource) ? 
							DataSourceUtils._weakMap_dataSource_isLocal.get(columnDataSource) : true;
					}

					if (!isLocal)
						return true;
				}
			}

			return false;
		}

		/**
		 * Fills a ProxyColumn with an appropriate internal column containing the given keys and data.
		 * @param proxyColumn A column, pre-filled with metadata
		 * @param keys An Array of either IQualifiedKeys or Strings
		 * @param data An Array of data values corresponding to the keys.
		 */
		public static initColumn(proxyColumn:ProxyColumn, keys:string[]|IQualifiedKey[], data:string[]|number[]):void
		{
			var asyncCallback = function ():void
			{
				var newColumn:IAttributeColumn;
				if (dataType == DataType.NUMBER)
				{
					newColumn = new NumberColumn(metadata);
					(newColumn as NumberColumn).setRecords(qkeys, data);
				}
				else if (dataType == DataType.DATE)
				{
					newColumn = new DateColumn(metadata);
					(newColumn as DateColumn).setRecords(qkeys, data);
				}
				else
				{
					newColumn = new StringColumn(metadata);
					(newColumn as StringColumn).setRecords(qkeys, data);
				}
				proxyColumn.setInternalColumn(newColumn);
			}

			var metadata:IColumnMetadata = proxyColumn.getProxyMetadata();
			var dataType:string = metadata[ColumnMetadata.DATA_TYPE];
			if (!dataType && StandardLib.getArrayType(data) === Number)
				dataType = DataType.NUMBER;
			if (!dataType)
			{
				dataType = DataSourceUtils.guessDataType(data);
				metadata[ColumnMetadata.DATA_TYPE] = dataType;
				proxyColumn.setMetadata(metadata);
			}

			var qkeys:IQualifiedKey[];
			if (StandardLib.arrayIsType(keys, IQualifiedKey))
			{
				qkeys = keys as IQualifiedKey[];
				asyncCallback();
			}
			else
			{
				qkeys = [];
				(WeaveAPI.QKeyManager as QKeyManager).getQKeysAsync(proxyColumn, metadata[ColumnMetadata.KEY_TYPE], keys as string[], asyncCallback, qkeys);
			}

		}
	}
}
