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
	import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IAttributeColumnCache = weavejs.api.data.IAttributeColumnCache;
	import IBaseColumn = weavejs.api.data.IBaseColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IQualifiedKey = weavejs.api.data.IQualifiedKey;
	import DateColumn = weavejs.data.column.DateColumn;
	import GeometryColumn = weavejs.data.column.GeometryColumn;
	import NumberColumn = weavejs.data.column.NumberColumn;
	import StringColumn = weavejs.data.column.StringColumn;
	import QKeyManager = weavejs.data.key.QKeyManager;
	import CachedDataSource = weavejs.data.source.CachedDataSource;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import Dictionary2D = weavejs.util.Dictionary2D;
	import JS = weavejs.util.JS;
	import WeavePromise = weavejs.util.WeavePromise;

	export declare type Cache = any;
	export class AttributeColumnCache implements IAttributeColumnCache
	{
		public getColumn(dataSource:IDataSource, metadata:{[key:string]:string}):IAttributeColumn
		{
			// null means no column
			if (dataSource == null || metadata == null)
				return null;

			// Get the column pointer associated with the hash value.
			var hashCode = Weave.stringify(metadata);
			var column = this.d2d_dataSource_metadataHash_column.get(dataSource, hashCode);
			if (!column)
			{
				// if this is the first time we've seen this data source, add dispose callback
				if (!this.d2d_dataSource_metadataHash_column.map.has(dataSource))
					Weave.getCallbacks(dataSource).addDisposeCallback(this, function():void {
						this.d2d_dataSource_metadataHash_column.map['delete'](dataSource);
					});

				// If no column is associated with this hash value, request the
				// column from its data source and save the column pointer.
				column = dataSource.generateNewAttributeColumn(metadata);
				if (column)
					column.addDisposeCallback(this, function():void {
						this.d2d_dataSource_metadataHash_column.remove(dataSource, hashCode);
					});
				this.d2d_dataSource_metadataHash_column.set(dataSource, hashCode, column);
			}
			return column;
		}

		private d2d_dataSource_metadataHash_column = new Dictionary2D<IDataSource, string, IAttributeColumn>();

		// TEMPORARY SOLUTION for WeaveArchive to access this cache data
		public /* readonly */ map_root_saveCache:WeakMap<ILinkableHashMap, Cache> = new WeakMap();

		/**
		 * Creates a cache dump and modifies the session state so data sources are non-functional.
		 * @return A WeavePromise that returns a cache dump that can later be passed to restoreCache();
		 */
		public convertToCachedDataSources(root:ILinkableHashMap)
		{
			var promise = new WeavePromise(root).setResult(root);
			var dispose = () => promise.dispose();
			var promiseThen = promise
				.then(function(root:ILinkableHashMap):ILinkableHashMap {
					// request data from every column
					var column:IAttributeColumn;
					var columns = Weave.getDescendants(root, IAttributeColumn);
					for (column of columns)
					{
						// simply requesting the keys will cause the data to be requested
						if (column.keys.length)
							column.getValueFromKey(column.keys[0]);
						// wait for the column to finish any async tasks
						promise.depend(column);
					}
					return root;
				})
				.then(this._convertToCachedDataSources);
			promiseThen.then(dispose, dispose);
			return promiseThen;
		}

		private _convertToCachedDataSources(root:ILinkableHashMap):IDataSource[]
		{
			//cache data from AttributeColumnCache
			var output:Cache = [];
			var dataSource:IDataSource;
			var dataSources:IDataSource[] = this.d2d_dataSource_metadataHash_column.primaryKeys();
			for (var dataSource of dataSources)
			{
				// skip local data sources
				if (dataSource.isLocal)
					continue;

				var dataSourceName:string = root.getName(dataSource);

				// skip disposed data sources and global columns (EquationColumn, CSVColumn)
				if (!dataSourceName)
					continue;

				var metadataHashes:string[] = this.d2d_dataSource_metadataHash_column.secondaryKeys(dataSource);
				for (var metadataHash of metadataHashes)
				{
					var column:IAttributeColumn = this.d2d_dataSource_metadataHash_column.get(dataSource, metadataHash);
					if (!column || Weave.wasDisposed(column))
						continue;
					var metadata:Object = ColumnMetadata.getAllMetadata(column);
					var dataType:string = column.getMetadata(ColumnMetadata.DATA_TYPE);
					var keys:string[] = [];
					var data:any[] = [];
					for (var key of column.keys)
					{
						var values:any[] = column.getValueFromKey(key, Array);
						// special case if column misbehaves and does not actually return an array when one is requested (not sure if this occurs)
						if (values != null && !(Array.isArray(values)))
						values = [values];
						for (var value of values)
						{
							if (dataType == DataType.GEOMETRY)
							{
								keys.push(key.localName);
								data.push((value as GeneralizedGeometry).toGeoJson());
							}
							else
							{
								keys.push(key.localName);
								data.push(value);
							}
						}
					}

					// output a set of arguments to addToColumnCache()
					output.push([dataSourceName, metadataHash, metadata, keys, data]);
				}
			}

			// stub out data sources
			dataSources = root.getObjects(IDataSource);
			for (var dataSource of dataSources)
			{
				// skip local data sources
				if (dataSource.isLocal)
					continue;

				var type:string = Weave.className(dataSource);
				var state:Object = Weave.getState(dataSource);
				var cds:CachedDataSource = root.requestObject(root.getName(dataSource), CachedDataSource, false);
				cds.label.value = Weave.lang('{0} (Cached)', dataSource.getLabel());
				cds.type.value = type;
				cds.state.state = state;
			}

			// repopulate cache for newly created data sources
			this.restoreCache(root, output);

			// TEMPORARY SOLUTION
			this.map_root_saveCache.set(root, output);

			return output;
		}

		/**
		 * Restores the cache from a dump created by convertToLocalDataSources().
		 * @param cacheData The cache dump.
		 */
		public restoreCache(root:ILinkableHashMap, cacheData:Cache):void
		{
			this.map_root_saveCache.set(root, cacheData);
			for (var args of cacheData as any)
				this.addToColumnCache.apply(this, [root].concat(args));
		}

		private addToColumnCache(root:ILinkableHashMap, dataSourceName:string, metadataHash:string, metadata:{[key:string]:string}, keyStrings:string[], data:any[]):void
		{
			// create the column object
			var dataSource:IDataSource = Weave.AS(root.getObject(dataSourceName), IDataSource);
			if (!dataSource)
			{
				if (dataSourceName)
					JS.error("Data source not found: " + dataSourceName);
				return;
			}

			var column:IBaseColumn;
			var keyType:string = metadata[ColumnMetadata.KEY_TYPE];
			var dataType:string = metadata[ColumnMetadata.DATA_TYPE];

			if (dataType == DataType.GEOMETRY)
				column = Weave.disposableChild(dataSource, column = new GeometryColumn(metadata));
			else if (dataType == DataType.DATE)
				column = Weave.disposableChild(dataSource, column = new DateColumn(metadata));
			else if (dataType == DataType.NUMBER)
				column = Weave.disposableChild(dataSource, column = new NumberColumn(metadata));
			else // string
				column = Weave.disposableChild(dataSource, column = new StringColumn(metadata));

			(WeaveAPI.QKeyManager as QKeyManager)
				.getQKeysPromise(column, keyType, keyStrings)
				.then(function(keys:IQualifiedKey[]):void {
					if (Weave.IS(column, GeometryColumn))
					{
						var geomKeys:IQualifiedKey[] = [];
						var geoms:GeneralizedGeometry[] = [];
						for (var i:int = 0; i < data.length; i++)
						{
							var geomsFromGeoJson:GeneralizedGeometry[] = GeneralizedGeometry.fromGeoJson(data[i]);
							for (var geom of geomsFromGeoJson)
							{
								geomKeys.push(keys[i]);
								geoms.push(geom);
							}
						}
						keys = geomKeys;
						data = geoms;
					}
					column.setRecords(keys, data);
				});

			// insert into cache
			this.d2d_dataSource_metadataHash_column.set(dataSource, metadataHash, column);
		}

		/**
		 * Restores a session state to what it was before calling convertToCachedDataSources().
		 */
		public restoreFromCachedDataSources(root:ILinkableHashMap):void
		{
			for (var cds of root.getObjects(CachedDataSource))
			{
				this.d2d_dataSource_metadataHash_column.removeAllPrimary(cds);
				cds.hierarchyRefresh.triggerCallbacks();
			}
		}
	}
	Weave.registerClass(AttributeColumnCache, "weavejs.data.AttributeColumnCache");
	WeaveAPI.ClassRegistry.registerSingletonImplementation(IAttributeColumnCache, AttributeColumnCache);
}
