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
	import ColumnMetadata = weavejs.api.data.ColumnMetadata;
	import DataType = weavejs.api.data.DataType;
	import IAttributeColumn = weavejs.api.data.IAttributeColumn;
	import IDataSource = weavejs.api.data.IDataSource;
	import IDataSourceWithAuthentication = weavejs.api.data.IDataSourceWithAuthentication;
	import IDataSource_Service = weavejs.api.data.IDataSource_Service;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import IWeaveGeometryTileService = weavejs.api.net.IWeaveGeometryTileService;
	import LinkableString = weavejs.core.LinkableString;
	import LinkableVariable = weavejs.core.LinkableVariable;
	import ColumnUtils = weavejs.data.ColumnUtils;
	import DateColumn = weavejs.data.column.DateColumn;
	import GeometryColumn = weavejs.data.column.GeometryColumn;
	import NumberColumn = weavejs.data.column.NumberColumn;
	import ProxyColumn = weavejs.data.column.ProxyColumn;
	import SecondaryKeyNumColumn = weavejs.data.column.SecondaryKeyNumColumn;
	import StreamedGeometryColumn = weavejs.data.column.StreamedGeometryColumn;
	import StringColumn = weavejs.data.column.StringColumn;
	import EntityNode = weavejs.data.hierarchy.EntityNode;
	import QKeyManager = weavejs.data.key.QKeyManager;
	import EntityCache = weavejs.net.EntityCache;
	import WeaveDataServlet = weavejs.net.WeaveDataServlet;
	import AttributeColumnData = weavejs.net.beans.AttributeColumnData;
	import TableData = weavejs.net.beans.TableData;
	import DebugUtils = weavejs.util.DebugUtils;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import WeavePromise = weavejs.util.WeavePromise;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import AbstractDataSource = weavejs.data.source.AbstractDataSource;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import EntityType = weavejs.api.data.EntityType;
	import Entity = weavejs.api.net.beans.Entity;
	import EntityHierarchyInfo = weavejs.api.net.beans.EntityHierarchyInfo;
	import BLGTreeUtils = weavejs.geom.BLGTreeUtils;
	import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;
	import GeometryType = weavejs.geom.GeometryType;

	export interface IWeaveDataSourceColumnMetadata extends IColumnMetadata
	{
		entityType?:string;
		weaveEntityId?:number|IColumnMetadata;
	}

	/**
	 * WeaveDataSource is an interface for retrieving columns from Weave data servlets.
	 * 
	 * @author adufilie
	 */
	@Weave.classInfo({
		id: "weavejs.data.source.WeaveDataSource",
		interfaces: [IDataSource, IDataSourceWithAuthentication],
		label: "Weave server"
	})
	export class WeaveDataSource extends AbstractDataSource implements IDataSource, IDataSourceWithAuthentication
	{
		private static /* readonly */ SQLPARAMS:string = 'sqlParams';
		
		public static debug:boolean = false;
		
		constructor()
		{
			super();
			this.url.addImmediateCallback(this, this.handleURLChange, true);
		}

		/* override */ public get isLocal():boolean
		{
			return false;
		}

		private _service:WeaveDataServlet = null;
		private _tablePromiseCache:{[hash:string]:WeavePromise<TableData>};
		private map_proxy_promise:WeakMap<ProxyColumn, WeavePromise<TableData>>;
		private _entityCache:EntityCache = null;
		public /* readonly */ url:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ hierarchyURL:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ rootId:LinkableVariable = Weave.linkableChild(this, LinkableVariable);
		
		/**
		 * This is an Array of public metadata field names that should be used to uniquely identify columns when querying the server.
		 */
		private /* readonly */ _idFields:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array, this.verifyStringArray));
		
		// for backwards compatibility to override server idFields setting
		private /* readonly */ _overrideIdFields:LinkableVariable;
		
		/**
		 * Provided for backwards compatibility - setting this will override the server setting.
		 * @deprecated
		 */
		public get idFields():LinkableVariable
		{
			if (!this._overrideIdFields)
				this._overrideIdFields = Weave.linkableChild(this._idFields, new LinkableVariable(Array, this.verifyStringArray), this.handleDeprecatedIdFields);
			return this._overrideIdFields;
		}

		private handleDeprecatedIdFields():void
		{
			// if session state is set to some array, use it as an override for the server setting. otherwise, ignore it.
			var state:string[] = Weave.AS(this._overrideIdFields.getSessionState(), Array) as string[];
			if (state)
				this._idFields.setSessionState(state);
		}
		
		/**
		 * @inheritDoc
		 */
		public get authenticationSupported():boolean
		{
			return  this._service.authenticationSupported;
		}
		
		/**
		 * @inheritDoc
		 */
		public get authenticationRequired():boolean
		{
			return this._service.authenticationRequired;
		}
		
		/**
		 * @inheritDoc
		 */
		public get authenticatedUser():string
		{
			return this._service.authenticatedUser;
		}
		
		/**
		 * @inheritDoc
		 */
		public authenticate(user:string, pass:string):void
		{
			this._service.authenticate(user, pass);
		}
		
		public get entityCache():EntityCache
		{
			return this._entityCache;
		}
		
		private verifyStringArray(array:string[]):boolean
		{
			return !array || StandardLib.getArrayType(array) == String;
		}
		
		/* override */protected refreshHierarchy():void
		{
			super.refreshHierarchy();
			this.entityCache.invalidateAll();
			if (Weave.IS(this._rootNode, RootNode_TablesAndGeoms))
				(this._rootNode as RootNode_TablesAndGeoms).refresh(); // TODO bypassing type checking because not compatible with column reference
		}
		
		/**
		 * Gets the root node of the attribute hierarchy.
		 */
		/* override */ public getHierarchyRoot():IWeaveTreeNode&IColumnReference
		{
			var id:string|number|IWeaveDataSourceColumnMetadata = this.rootId.getSessionState();
			if (typeof id == 'string')
				id = StandardLib.asNumber(id);
			var isNumber:boolean = typeof id == 'number' && isFinite(Weave.AS(id, Number) as number);
			var isObject:boolean = id != null && typeof id == 'object';
			
			if (!isNumber && !isObject)
			{
				// no valid id specified
				if (!Weave.IS(this._rootNode, RootNode_TablesAndGeoms))
					this._rootNode = new RootNode_TablesAndGeoms(this); // TODO bypassing type checking because it's not compatible with IColumnReference
				return this._rootNode;
			}
			
			var node:EntityNode = Weave.AS(this._rootNode, EntityNode);
			if (!node)
				this._rootNode = node = new EntityNode();
			node.setEntityCache(this.entityCache);
			
			if (isNumber)
			{
				node.id = Weave.AS(id, Number) as number;
			}
			else if (Weave.detectChange(this.getHierarchyRootObserver, this.rootId))
			{
				node.id = -1;
				this._service.findEntityIds(id as IWeaveDataSourceColumnMetadata, null).then((result:number[]) => this.handleRootId(this.rootId.triggerCounter, result));
			}
			
			return this._rootNode;
		}
		private getHierarchyRootObserver = {};

		private handleRootId(triggerCount:number, result:number[]):void
		{
			var node:EntityNode = Weave.AS(this.getHierarchyRoot(), EntityNode);
			if (!node || this.rootId.triggerCounter != triggerCount)
				return;
			var ids:number[] = result || [];
			if (!ids.length)
			{
				console.error("No entity matches specified rootId: " + Weave.stringify(this.rootId.getSessionState()));
				return;
			}
			if (ids.length > 1)
				console.error("Multiple entities (" + ids.length + ") match specified rootId: " + Weave.stringify(this.rootId.getSessionState()));
			node.id = ids[0];
			Weave.getCallbacks(this).triggerCallbacks();
		}
		
		/* override */ protected generateHierarchyNode(metadata:IWeaveDataSourceColumnMetadata):IWeaveTreeNode&IColumnReference
		{
			if (!metadata)
				return null;
			
			// NOTE - this code won't work if idFields are specified and EntityNodes are used in the hierarchy.
			// This function would have to be made asynchronous in order to support that.
			
			var id:number;
			if (typeof metadata != 'object')
			{
				id = StandardLib.asNumber(metadata);
			}
			else if (metadata.hasOwnProperty(WeaveDataSource.ENTITY_ID))
			{
				id = metadata.weaveEntityId as number;
			}
			else
			{
				return super.generateHierarchyNode(metadata);
			}
			
			var node:EntityNode = new EntityNode(this.entityCache);
			node.id = id;
			return node;
		}
		
		private static /* readonly */ DEFAULT_BASE_URL:string = '/WeaveServices';
		private static /* readonly */ DEFAULT_SERVLET_NAME:string = '/DataService';
		
		/**
		 * This function prevents url.value from being null.
		 */
		private handleURLChange():void
		{
			this.url.delayCallbacks();
			
			for (var deprecatedBaseURL of ['/OpenIndicatorsDataServices', '/OpenIndicatorsDataService'])
				if (this.url.value == deprecatedBaseURL || this.url.value == deprecatedBaseURL + WeaveDataSource.DEFAULT_SERVLET_NAME)
					this.url.value = null;
			
			// backwards compatibility -- if url ends in default base url, append default servlet name
			if (this.url.value && this.url.value.split('/').pop() == WeaveDataSource.DEFAULT_BASE_URL.split('/').pop())
				this.url.value += WeaveDataSource.DEFAULT_SERVLET_NAME;
			
			// replace old service
			Weave.dispose(this._service);
			Weave.dispose(this._entityCache);
			this._service = Weave.linkableChild(this, new WeaveDataServlet(this.url.value), this.setIdFields);
			this._entityCache = Weave.linkableChild(this._service, new EntityCache(this._service));
			this._tablePromiseCache = {};
			this.map_proxy_promise = new WeakMap<ProxyColumn, WeavePromise<TableData>>();
			this.refreshAllProxyColumns();
			
			this.url.resumeCallbacks();
		}
		
		public get serverVersion():string
		{
			var info = this._service.getServerInfo();
			return info ? info['version'] : null;
		}
		
		private setIdFields():void
		{
			// if deprecated idFields state has been set to an array, ignore server setting
			if (this._overrideIdFields && this._overrideIdFields.getSessionState())
				return;
			var info = this._service.getServerInfo();
			this._idFields.setSessionState(info ? Weave.AS(info['idFields'], Array) : null);
		}
		
		/**
		 * This gets called as a grouped callback when the session state changes.
		 */
		/* override */ protected initialize(forceRefresh:boolean = false):void
		{
			super.initialize(forceRefresh);
		}
		
		/* override */ protected get initializationComplete():boolean
		{
			return super.initializationComplete && this._service.entityServiceInitialized;
		}
		
		/* override */ public generateNewAttributeColumn(metadata:IWeaveDataSourceColumnMetadata):IAttributeColumn
		{
			if (typeof metadata != 'object')
			{
				var meta:IWeaveDataSourceColumnMetadata;
				var id:number = StandardLib.asNumber(metadata);
				if (isFinite(id))
					meta = JS.copyObject(this.entityCache.getEntity(id).publicMetadata);
				else
					meta = {};
				meta.weaveEntityId = metadata;
				metadata = meta;
			}
			return super.generateNewAttributeColumn(metadata);
		}
		
		private static /* readonly */ NO_RESULT_ERROR:string = "Received null result from Weave server.";

		public static /* readonly */ ENTITY_ID:string = 'weaveEntityId';

		/**
		 * @inheritDoc
		 */
		/* override */ protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			// get metadata properties from XML attributes
			var params:IWeaveDataSourceColumnMetadata = this.getMetadata(proxyColumn, [WeaveDataSource.ENTITY_ID, ColumnMetadata.MIN, ColumnMetadata.MAX, WeaveDataSource.SQLPARAMS], false);
			var query:WeavePromise<any>;
			var idFieldsArray:string[] = this._idFields.getSessionState() as string[];
			
			if (idFieldsArray || params.weaveEntityId)
			{
				var id = idFieldsArray ? this.getMetadata(proxyColumn, idFieldsArray, true) : StandardLib.asNumber(params[WeaveDataSource.ENTITY_ID]);
				var sqlParams:string[] = this.parseSqlParams(params[WeaveDataSource.SQLPARAMS]);
				query = this._service.getColumn(id as any, params[ColumnMetadata.MIN], params[ColumnMetadata.MAX], sqlParams);
			}
			else // backwards compatibility - search using metadata
			{
				this.getMetadata(proxyColumn, [ColumnMetadata.DATA_TYPE, 'dataTable', 'name', 'year', 'sqlParams'], false, params);
				// dataType is only used for backwards compatibility with geometry collections
				if (params[ColumnMetadata.DATA_TYPE] != DataType.GEOMETRY)
					delete params[ColumnMetadata.DATA_TYPE];
				
				query = this._service.getColumnFromMetadata(params);
			}
			query.then(this.handleGetColumn.bind(this, proxyColumn), this.handleGetColumnFault.bind(this, proxyColumn));
			WeaveAPI.ProgressIndicator.addTask(query, proxyColumn, "Requesting column from server: " + Weave.stringify(params));
		}
		
		/**
		 * @param column An attribute column.
		 * @param propertyNames A list of metadata property names.
		 * @param forUniqueId If true, missing property values will be set to empty strings.
		 *                    If false, missing property values will be omitted.
		 * @param output An object to store the values.
		 * @return An object containing the metadata values.
		 */
		private getMetadata(column:IAttributeColumn, propertyNames:string[], forUniqueId:boolean, output:{[key:string]:string} = null):IWeaveDataSourceColumnMetadata
		{
			if (!output)
				output = {};
			var found:boolean = false;
			for (var name of propertyNames || [])
			{
				var value:string = column.getMetadata(name);
				if (value)
				{
					found = true;
					output[name] = value;
				}
			}
			if (!found && forUniqueId)
				for (var name of propertyNames || [])
					output[name] = '';
			return output;
		}
		
		private handleGetColumnFault(column:ProxyColumn, error:Object):void
		{
			if (column.wasDisposed)
				return;
			
			JS.error(error, "Error retrieving column:", column.getProxyMetadata(), column);
			
			column.dataUnavailable();
		}

		//		private function handleGetColumn(event:ResultEvent, token:Object = null):void
//		{
//			DebugUtils.callLater(5000, handleGetColumn2, arguments);
//		}
		
		private parseSqlParams(sqlParams:string):string[]
		{
			var result:string[];
			try {
				result = Weave.AS(JSON.parse(sqlParams), Array);
			} catch (e) { }
			if (!Weave.IS(result, Array))
			{
				result = WeaveAPI.CSVParser.parseCSVRow(sqlParams);
				if (result && result.length == 0)
					result = null;
			}
			return result;
		}
		
		private handleGetColumn(proxyColumn:ProxyColumn, result:AttributeColumnData):void
		{
			if (proxyColumn.wasDisposed)
				return;
			var metadata:IWeaveDataSourceColumnMetadata = proxyColumn.getProxyMetadata();

			try
			{
				if (!result)
				{
					JS.error("Did not receive any data from service for attribute column:", metadata);
					return;
				}
				
				//trace("handleGetColumn",pathInHierarchy.toXMLString());
	
				// fill in metadata
				for (var metadataName in result.metadata)
				{
					var metadataValue:string = (result.metadata as IColumnMetadata)[metadataName];
					if (metadataValue)
						metadata[metadataName] = metadataValue;
				}
				metadata.weaveEntityId = result.id;
				proxyColumn.setMetadata(metadata);
				
				// special case for geometry column
				var dataType:string = ColumnUtils.getDataType(proxyColumn);
				var isGeom:boolean = StandardLib.stringCompare(dataType, DataType.GEOMETRY, true) == 0;
				if (isGeom && result.data == null)
				{
					var tileService:IWeaveGeometryTileService = this._service.createTileService(result.id);
					proxyColumn.setInternalColumn(new StreamedGeometryColumn(result.metadataTileDescriptors, result.geometryTileDescriptors, tileService, metadata));
					return;
				}
				
				var setRecords = (qkeys:IQualifiedKey[]):void =>
				{
					if (result.data == null)
					{
						proxyColumn.dataUnavailable();
						return;
					}
					
					if (!dataType) // determine dataType from data
						dataType = DataType.getDataTypeFromData(result.data);
					
					if (isGeom) // result.data is an array of PGGeom objects.
					{
						var geometriesVector:GeneralizedGeometry[] = [];
						var createGeomColumn = () =>
						{
							var newGeometricColumn:GeometryColumn = new GeometryColumn(metadata);
							newGeometricColumn.setRecords(qkeys, geometriesVector);
							proxyColumn.setInternalColumn(newGeometricColumn);
						};
						var pgGeomTask = PGGeomUtil.newParseTask(result.data, geometriesVector);
						// high priority because not much can be done without data
						WeaveAPI.Scheduler.startTask(proxyColumn, pgGeomTask, WeaveAPI.TASK_PRIORITY_HIGH, createGeomColumn);
					}
					else if (result.thirdColumn != null)
					{
						// hack for dimension slider
						var newColumn:SecondaryKeyNumColumn = new SecondaryKeyNumColumn(metadata);
						newColumn.baseTitle = metadata['baseTitle'];
						newColumn.updateRecords(qkeys, result.thirdColumn, result.data);
						proxyColumn.setInternalColumn(newColumn);
						proxyColumn.setMetadata(null); // this will allow SecondaryKeyNumColumn to use its getMetadata() code
					}
					else if (StandardLib.stringCompare(dataType, DataType.NUMBER, true) == 0)
					{
						var newNumericColumn:NumberColumn = new NumberColumn(metadata);
						newNumericColumn.setRecords(qkeys, result.data);
						proxyColumn.setInternalColumn(newNumericColumn);
					}
					else if (StandardLib.stringCompare(dataType, DataType.DATE, true) == 0)
					{
						var newDateColumn:DateColumn = new DateColumn(metadata);
						newDateColumn.setRecords(qkeys, result.data);
						proxyColumn.setInternalColumn(newDateColumn);
					}
					else
					{
						var newStringColumn:StringColumn = new StringColumn(metadata);
						newStringColumn.setRecords(qkeys, result.data);
						proxyColumn.setInternalColumn(newStringColumn);
					} 
					//trace("column downloaded: ",proxyColumn);
				};
	
				var keyType:string = ColumnUtils.getKeyType(proxyColumn);
				if (result.data != null)
				{
					Weave.AS(WeaveAPI.QKeyManager, QKeyManager).getQKeysPromise(proxyColumn, keyType, result.keys).then(setRecords);
				}
				else // no data in result
				{
					if (!result.tableField || result.tableId == AttributeColumnData.NO_TABLE_ID)
					{
						proxyColumn.dataUnavailable();
						return;
					}
					
					// if table not cached, request table, store in cache, and await data
					var sqlParams = this.parseSqlParams(proxyColumn.getMetadata(WeaveDataSource.SQLPARAMS));
					var hash = Weave.stringify([result.tableId, sqlParams]);
					var promise = this._tablePromiseCache[hash];
					if (!promise)
					{
						var getTablePromise:WeavePromise<any> = new WeavePromise(this._service)
							.setResult(this._service.getTable(result.tableId, sqlParams));
						
						var keyStrings:string[]|string[][];
						promise = getTablePromise
							.then((tableData:TableData) => {
								if (WeaveDataSource.debug)
									JS.log('received', DebugUtils.debugId(tableData), hash);
								
								if (!tableData.keyColumns)
									tableData.keyColumns = [];
								if (!tableData.columns)
									tableData.columns = {};
								
								var name:string;
								for (name of tableData.keyColumns)
									if (!tableData.columns.hasOwnProperty(name))
										throw new Error(Weave.lang('Table {0} is missing key column "{1}"', tableData.id, name));
								
								if (tableData.keyColumns.length == 1)
								{
									keyStrings = tableData.columns[tableData.keyColumns[0]] as string[];
									return tableData;
								}
								
								// generate compound keys
								var nCol:number = tableData.keyColumns.length;
								var iCol:number, iRow:number, nRow:number = 0;
								for (iCol = 0; iCol < nCol; iCol++)
								{
									var keyCol = tableData.columns[tableData.keyColumns[iCol]];
									if (iCol == 0)
										keyStrings = new Array(keyCol.length) as string[][];
									nRow = keyStrings.length;
									for (iRow = 0; iRow < nRow; iRow++)
									{
										if (iCol == 0)
											keyStrings[iRow] = new Array(nCol) as string[];
										keyStrings[iRow][iCol] = keyCol[iRow];
									}
								}
								for (iRow = 0; iRow < nRow; iRow++)
									keyStrings[iRow] = WeaveAPI.CSVParser.createCSVRow(keyStrings[iRow] as string[]);
								
								// if no key columns were specified, generate keys
								if (!keyStrings)
								{
									for (var key in tableData.columns || [])
										break;
									keyStrings = tableData.columns[key].map((v:any, i:number):string => { return 'row' + i; });
								}
								
								return tableData;
							})
							.then((tableData:TableData) => {
								if (WeaveDataSource.debug)
									console.log('promising QKeys', DebugUtils.debugId(tableData), hash);
								return (WeaveAPI.QKeyManager as QKeyManager).getQKeysPromise(
									getTablePromise,
									keyType,
									keyStrings as string[]
								).then((qkeys:IQualifiedKey[]) => {
									if (WeaveDataSource.debug)
										JS.log('got QKeys', DebugUtils.debugId(tableData), hash);
									tableData.derived_qkeys = qkeys;
									return tableData;
								});
							});
						this._tablePromiseCache[hash] = promise;
					}
					
					// when the promise returns, set column data
					promise.then((tableData:TableData) => {
						result.data = tableData.columns[result.tableField];
						if (result.data == null)
						{
							proxyColumn.dataUnavailable(Weave.lang('(Missing column: {0})', result.tableField));
							return;
						}
						
						setRecords(tableData.derived_qkeys);
					});
					
					// make proxyColumn busy while table promise is busy
					if (!promise.getResult())
						WeaveAPI.SessionManager.assignBusyTask(promise, proxyColumn);
				}
			}
			catch (e)
			{
				JS.error(e, "handleGetColumn", metadata);
			}
		}
	}

	interface PGGeom
	{
		type:number;
		xyCoords:number[];
	}
	/**
	 * Static functions for retrieving values from PGGeom objects coming from servlet.
	 */
	@Weave.classInfo({id: "weavejs.data.source.PGGeomUtil"})
	class PGGeomUtil
	{
		/**
		 * This will generate an asynchronous task function for use with IScheduler.startTask().
		 * @param pgGeoms An Array of PGGeom beans from a Weave data service.
		 * @param output An Array to store GeneralizedGeometry objects created from the pgGeoms input.
		 * @return A new Function.
		 * @see weavejs.api.core.IScheduler
		 */
		public static newParseTask(pgGeoms:PGGeom[], output:GeneralizedGeometry[]):(returnTime:number)=>number
		{
			var i:number = 0;
			var n:number = pgGeoms.length;
			output.length = n;
			return (returnTime:number):number =>
			{
				for (; i < n; i++)
				{
					if (Date.now() > returnTime)
						return i / n;

					var item:PGGeom = pgGeoms[i];
					var geomType:string = GeometryType.fromPostGISType(item.type);
					var geometry:GeneralizedGeometry = new GeneralizedGeometry(geomType);
					geometry.setCoordinates(item.xyCoords, BLGTreeUtils.METHOD_SAMPLE);
					output[i] = geometry;
				}
				return 1;
			};
		}
	}

	/**
	 * Has two children: "Data Tables" and "Geometry Collections"
	 */
	@Weave.classInfo({id: "weavejs.data.source.RootNode_TablesAndGeoms", interfaces: [IWeaveTreeNode]})
	class RootNode_TablesAndGeoms implements IWeaveTreeNode, IColumnReference
	{
		private source:WeaveDataSource;
		private tableList:EntityNode;
		private geomList:GeomListNode;
		private children:(IWeaveTreeNode&IColumnReference)[];

		constructor(source:WeaveDataSource)
		{
			this.source = source;
			this.tableList = new EntityNode(null, EntityType.TABLE);
			this.geomList = new GeomListNode(source);
			this.children = [this.tableList, this.geomList];
		}
		public getDataSource():IDataSource
		{
			return this.source;
		}
		public refresh():void
		{
			this.geomList.children = null;
		}
		public equals(other:IWeaveTreeNode):boolean { return other == this; }
		public getLabel():string
		{
			return this.source.getLabel();
		}
		public isBranch():boolean { return true; }
		public hasChildBranches():boolean { return true; }
		public getChildren():(IWeaveTreeNode&IColumnReference)[]
		{
			this.tableList.setEntityCache(this.source.entityCache);

			var str:string = Weave.lang("Data Tables");
			if (this.tableList.getChildren().length)
				str = Weave.lang("{0} ({1})", str, this.tableList.getChildren().length);
			this.tableList._overrideLabel = str;

			return this.children;
		}
		public getColumnMetadata():IWeaveDataSourceColumnMetadata
		{
			return null;
		}
	}

	/**
	 * Makes an RPC to find geometry columns for its children
	 */
	@Weave.classInfo({id: "weavejs.data.source.GeomListNode", interfaces: [IWeaveTreeNode]})
	class GeomListNode implements IWeaveTreeNode, IColumnReference
	{
		private source:WeaveDataSource;
		private cache:EntityCache;
		public children:(IWeaveTreeNode&IColumnReference)[];

		constructor(source:WeaveDataSource)
		{
			this.source = source;
		}

		public equals(other:IWeaveTreeNode):boolean { return other == this; }
		public getLabel():string
		{
			var label:string = Weave.lang("Geometry Collections");
			this.getChildren();
			if (this.children && this.children.length)
				return Weave.lang("{0} ({1})", label, this.children.length);
			return label;
		}
		public isBranch():boolean { return true; }
		public hasChildBranches():boolean { return false; }
		public getChildren():(IWeaveTreeNode&IColumnReference)[]
		{
			if (!this.children || this.cache != this.source.entityCache)
			{
				this.cache = this.source.entityCache;
				this.children = [];
				var meta:IWeaveDataSourceColumnMetadata = {};
				meta.entityType = EntityType.COLUMN;
				meta.dataType = DataType.GEOMETRY as any; // TODO fix this type
				this.cache.getHierarchyInfo(meta).then(this.handleHierarchyInfo.bind(this, this.children));
			}
			return this.children;
		}
		private handleHierarchyInfo(children:IWeaveTreeNode[], result:EntityHierarchyInfo[]):void
		{
			// ignore old results
			if (this.children != children)
				return;

			for (var info of result || [])
			{
				var node:EntityNode = new GeomColumnNode(this.source.entityCache);
				node.id = info.id;
				children.push(node);
			}
			Weave.getCallbacks(this.source).triggerCallbacks();
		}
		public getDataSource()
		{
			return this.source;
		}
		public getColumnMetadata():IWeaveDataSourceColumnMetadata
		{
			return null;
		}
	}

	@Weave.classInfo({id: "weavejs.data.source.GeomColumnNode"})
	class GeomColumnNode extends EntityNode
	{
		constructor(cache:EntityCache)
		{
			super(cache);
		}

		/* override */ public getLabel():string
		{
			var title:string = super.getLabel();
			var cache:EntityCache = this.getEntityCache();
			var entity:Entity = this.getEntity();
			for (var parentId of entity.parentIds || [])
			{
				var info:EntityHierarchyInfo = cache.getBranchInfo(parentId);
				if (info && info.title && info.title != title)
					return title + " (" + info.title + ")";
			}
			return title;
		}
	}
}
