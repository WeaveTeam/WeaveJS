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
	import IDataSource = weavejs.api.data.IDataSource;
	import IDataSource_Service = weavejs.api.data.IDataSource_Service;
	import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
	import LinkableBoolean = weavejs.core.LinkableBoolean;
	import LinkableNumber = weavejs.core.LinkableNumber;
	import LinkableString = weavejs.core.LinkableString;
	import ProxyColumn = weavejs.data.column.ProxyColumn;

	export declare type CKANResult = CKANActionResult | CKANActionResult[] | string | string[];
	export declare type DKANResult = [DKANActionResult];
	export declare type ICKANActionMetadata = CKANActionResult & DKANActionResult & CKANParams & CKANField & CKANResource & ICSVColumnMetadata;

	export interface DKANActionResult
	{
		uuid?:string;
		mimetype?:string
	}

	export interface CKANParams
	{
		id?:string;
		ckan_id?:string;
		ckan_url?:string;
		ckan_format?:string;
		ckan_field?:string;
		resource_id?:string;
		limit?:number;
	}

	export interface CKANActionResult
	{
		title?:string;
		display_name?:string;
		description?:string;
		name?:string;
		packages?: CKANPackage[];
		resources?: CKANResource[];
		fields?: CKANField[];
	}

	export interface CKANField
	{
		id?: string;
		type?:string;
	}

	export interface CKANResource
	{
		id?:string;
		url?:string;
		format?:string;
		datastore_active?:boolean;
	}

	export interface CKANResponse
	{
		result?:CKANActionResult;
		error?: Error;
		success?: boolean;
	}

	export interface CKANPackage
	{
		id?:string;
	}

	export class CKANDataSource extends AbstractDataSource implements IDataSource
	{
		static WEAVE_INFO = Weave.setClassInfo(CKANDataSource, {
			id: "weavejs.data.source.CKANDataSource",
			interfaces: [IDataSource],
			label: "CKAN Server"
		});

		public get isLocal():boolean
		{
			return false;
		}

		public url:LinkableString = Weave.linkableChild(this, new LinkableString());
		public apiVersion:LinkableNumber = Weave.linkableChild(this, new LinkableNumber(3, this.validateApiVersion));
		public useHttpPost:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(false));
		public showPackages:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public showGroups:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public showTags:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));
		public useDataStore:LinkableBoolean = Weave.linkableChild(this, new LinkableBoolean(true));

		private validateApiVersion(value:number):boolean { return [1, 2, 3].indexOf(value) >= 0; }

		/**
		 * This gets called when callbacks are triggered.
		 */
		protected initialize(forceRefresh:boolean = false):void
		{
			// TODO handle url change

			super.initialize(forceRefresh);
		}

		protected refreshHierarchy():void
		{
			Weave.getCallbacks(this).delayCallbacks();
			for (var url in this._dataSourceCache)
			{
				var ds:IDataSource = this._dataSourceCache[url];
				ds.hierarchyRefresh.triggerCallbacks();
			}
			super.refreshHierarchy();
			Weave.getCallbacks(this).resumeCallbacks();
		}

		/**
		 * Gets the root node of the attribute hierarchy.
		 */
		public getHierarchyRoot():IWeaveTreeNode&IColumnReference
		{
			if (!Weave.IS(this._rootNode, CKANAction))
				this._rootNode = new CKANAction(this);
			return this._rootNode;
		}

		protected generateHierarchyNode(metadata:ICKANActionMetadata):IWeaveTreeNode
		{
			if (!metadata)
				return null;

			var ds:IDataSource = this.getChildDataSource(metadata);
			if (!ds)
				return null;

			var node:CKANAction;
			if (metadata.ckan_format == CKANDataSource.DATASTORE_FORMAT)
			{
				node = new CKANAction(this);
				node.no_action = CKANAction.GET_COLUMN;
				node.params = {
					ckan_id: metadata.ckan_id,
					ckan_url: metadata.ckan_url,
					ckan_format: metadata.ckan_format,
					ckan_field: metadata.ckan_field
				};
				return node;
			}

			var search:ICKANActionMetadata = JS.copyObject(metadata);
			delete search.ckan_id;
			delete search.ckan_url;
			delete search.ckan_format;

			var internalNode = ds.findHierarchyNode(search);
			if (!internalNode)
				return null;

			node = new CKANAction(this);
			node.action = CKANAction.GET_COLUMN;
			node.params = {};
			node.params.ckan_id = metadata.ckan_id;
			node.params.ckan_url = metadata.ckan_url;
			node.params.ckan_format = metadata.ckan_format;
			node.internalNode = internalNode;
			return node;
		}

		/**
		 * @inheritDoc
		 */
		protected requestColumnFromSource(proxyColumn:ProxyColumn):void
		{
			var metadata:ICKANActionMetadata|string = proxyColumn.getProxyMetadata();
			var dataSource:IDataSource = this.getChildDataSource(metadata);
			if (dataSource)
			{
				if ((metadata as ICKANActionMetadata).ckan_format == CKANDataSource.DATASTORE_FORMAT)
					metadata = (metadata as ICKANActionMetadata).ckan_field;
				proxyColumn.setInternalColumn(dataSource.generateNewAttributeColumn(metadata));
			}
			else
				proxyColumn.dataUnavailable();
		}

		public static PARAMS_CKAN_ID:string = 'ckan_id';
		public static PARAMS_CKAN_URL:string = 'ckan_url';
		public static PARAMS_CKAN_FORMAT:string = 'ckan_format';
		public static PARAMS_CKAN_FIELD:string = 'ckan_field';
		public static DATASTORE_FORMAT:string = 'ckan_datastore';

		public getBaseURL():string
		{
			var baseurl = this.url.value || '';
			var i = baseurl.lastIndexOf('/api');
			baseurl = baseurl.substr(0, i);
			if (baseurl.charAt(baseurl.length - 1) != '/')
				baseurl += '/';
			return baseurl;
		}
		public getFullURL(relativeURL:string):string
		{
			return this.getBaseURL() + relativeURL;
		}

		/**
		 * @private
		 */
		public getChildDataSource(params:CKANParams):IDataSource
		{
			var url = params.ckan_url;
			if (!url)
				return null;
			var dataSource:IDataSource = this._dataSourceCache[url];
			if (!dataSource)
			{
				var format:string = String(params.ckan_format).toLowerCase();
				if (format == 'csv')
				{
					var csv:CSVDataSource = new CSVDataSource();
					csv.url.value = url;
					csv.keyType.value = url;
					dataSource = csv;
				}
//				if (format == 'xls')
//				{
//					var xls:XLSDataSource = new XLSDataSource();
//					xls.url.value = url;
//					xls.keyType.value = url;
//					dataSource = xls;
//				}
//				if (format == 'wfs')
//				{
//					var wfs:WFSDataSource = new WFSDataSource();
//					wfs.url.value = url;
//					dataSource = wfs;
//				}
				if (format == CKANDataSource.DATASTORE_FORMAT)
				{
					var datastore:CSVDataSource = new CSVDataSource();
					datastore.url.value = this.getFullURL('datastore/dump/' + params.ckan_id);
					var node:CKANAction = new CKANAction(this);
					node.action = CKANAction.DATASTORE_SEARCH;
					node.params = {resource_id: params.ckan_id, limit: 1};
					node.resultHandler = (result:{fields:CKANField[]}) => {
						datastore.metadata.setSessionState(
								result.fields.map((field:CKANField) => {
									var type:string = field.type;
									if (type == 'numeric' || type == 'int4' || type == 'int' || type == 'float' || type == 'double')
										type = DataType.NUMBER;
									if (type == 'text')
										type = DataType.STRING;
									if (type == 'timestamp')
										type = DataType.DATE;
									var meta:ICSVColumnMetadata = {};
									meta.dataType = type as any; // TODO fix this type
									meta.title = field.id;
									meta.csvColumn = field.id;
									return meta;
								})
						);
					};
					node.result; // will cause resultHandler to be called later
					dataSource = datastore;
				}
			}
			// cache now if not cached
			if (dataSource && !this._dataSourceCache[url])
				this._dataSourceCache[url] = Weave.linkableChild(this, dataSource);
			return dataSource;
		}

		/**
		 * url -> IDataSource
		 */
		private _dataSourceCache:{[key:string]:IDataSource} = {};
	}


	import IColumnReference = weavejs.api.data.IColumnReference;
	import IExternalLink = weavejs.api.data.IExternalLink;
	import IWeaveTreeNodeWithPathFinding = weavejs.api.data.IWeaveTreeNodeWithPathFinding;
	import ResponseType = weavejs.net.ResponseType;
	import Servlet = weavejs.net.Servlet;
	import URLRequest = weavejs.net.URLRequest;
	import JS = weavejs.util.JS;
	import StandardLib = weavejs.util.StandardLib;
	import ICSVColumnMetadata = weavejs.data.source.ICSVColumnMetadata;
	import IColumnMetadata = weavejs.api.data.IColumnMetadata;
	import ResquestMethod = weavejs.net.RequestMethod;

	class CKANAction implements IWeaveTreeNode, IColumnReference, IWeaveTreeNodeWithPathFinding
	{
		static WEAVE_INFO = Weave.setClassInfo(CKANAction, {
			id: "weavejs.data.source.CKANAction",
			interfaces: [IWeaveTreeNode, IColumnReference, IWeaveTreeNodeWithPathFinding]
		});

		public static PACKAGE_LIST:string = 'package_list';
		public static PACKAGE_SHOW:string = 'package_show';
		public static GROUP_LIST:string = 'group_list';
		public static GROUP_SHOW:string = 'group_show';
		public static GROUP_PACKAGE_SHOW:string = 'group_package_show';
		public static TAG_LIST:string = 'tag_list';
		public static TAG_SHOW:string = 'tag_show';
		public static DATASTORE_SEARCH:string = 'datastore_search';

		public static GET_DATASOURCE:string = 'get_datasource';
		public static GET_COLUMN:string = 'get_column';
		public static NO_ACTION:string = 'no_action';

		private source:CKANDataSource;
		/**
		 * The metadata associated with the node (includes more than just request params)
		 */
		public metadata:ICKANActionMetadata|string;
		/**
		 * The CKAN API action associated with this node
		 */
		public action:string;

		public no_action:string;

		/**
		 * The CKAN API parameters for this action
		 */
		public params:CKANParams;

		public internalNode:IWeaveTreeNode&IColumnReference;

		private _result:CKANActionResult|DKANActionResult|string = {};

		constructor(source:CKANDataSource)
		{
			this.source = source;
		}

		/**
		 * The result received from the RPC
		 */
		public get result():CKANResult|DKANResult
		{
			if (Weave.detectChange(this, this.source.url, this.source.apiVersion, this.source.useHttpPost))
			{
				if ([
							CKANAction.PACKAGE_LIST,
							CKANAction.PACKAGE_SHOW,
							CKANAction.GROUP_LIST,
							CKANAction.GROUP_SHOW,
							CKANAction.GROUP_PACKAGE_SHOW,
							CKANAction.TAG_LIST,
							CKANAction.TAG_SHOW,
							CKANAction.DATASTORE_SEARCH
						].indexOf(this.action) >= 0)
				{
					// make CKAN API request
					this._result = {};
					var handler = this.handleResponse.bind(this, this._result);
					WeaveAPI.URLRequestUtils.request(source, this.getURLRequest()).then(handler, handler);
				}
			}
			return this._result || {};
		}

		/**
		 * This function will be passed the result when it is downloaded.
		 */
		public resultHandler:(result:CKANResult|DKANResult) => void = null;

		private get apiVersion3():boolean
		{
			return this.source.apiVersion.value == 3;
		}

		private getURLRequest():URLRequest
		{
			// append api command to url
			var request:URLRequest;
			if (this.apiVersion3)
			{
				request = new URLRequest(this.source.getFullURL("api/3/action/" + this.action));
				if (this.params)
				{
					if (this.source.useHttpPost.value)
					{
						request.method = ResquestMethod.POST;
						request.requestHeaders = {"Content-Type": "application/json; charset=utf-8"};
						request.data = JSON.stringify(this.params);
					}
					else
					{
						request.url = Servlet.buildUrlWithParams(request.url, this.params);
					}
				}
			}
			else
			{
				var cmd:string = 'api/' +this.source.apiVersion.value + '/rest/' + this.action.split('_')[0];
				if (this.params && this.params.hasOwnProperty('id'))
					cmd += '/' + this.params.id;
				request = new URLRequest(this.source.getFullURL(cmd));
			}
			request.responseType = ResponseType.JSON;

			return request;
		}

		private handleResponse(placeholder:CKANResult|DKANResult, response:CKANResponse|Error):void
		{
			// ignore old results
			if (this._result != placeholder)
				return;

			//response = JSON.parse(response as string);
			if (this.apiVersion3 && response && response.hasOwnProperty('success') && (response as CKANResponse).success)
			{
				this._result = (response as CKANResponse).result;
			}
			else if (!this.apiVersion3 && response)
			{
				this._result = response;
			}
			else
			{
				var error = response && response.hasOwnProperty('error') ? (response as CKANResponse).error : response as Error;
				JS.error("CKANaction failed", this, error);
			}

			// hack to support DKAN
			if (this.action == CKANAction.PACKAGE_SHOW && Weave.IS(this._result, Array) && (this._result as DKANResult).length == 1)
				this._result = (this._result as DKANResult)[0];

			if (this.resultHandler != null)
				this.resultHandler(this._result);
		}

		public equals(other:IWeaveTreeNode):boolean
		{
			var that:CKANAction = Weave.AS(other, CKANAction);
			if (!that)
				return false;

			if (this.internalNode && that.internalNode)
				return this.source && that.source
						&& this.internalNode.equals(that.internalNode);

			return !this.internalNode == !that.internalNode
					&& this.source == that.source
					&& this.action == that.action
					&& StandardLib.compare(this.params, that.params) == 0;
		}

		public getLabel():string
		{
			if (this.internalNode)
				return this.internalNode.getLabel();

			if (!this.action)
				return this.source.getLabel();

			if (this.action == CKANAction.PACKAGE_LIST)
				return Weave.lang("Packages");
			if (this.action == CKANAction.GROUP_LIST)
				return Weave.lang("Groups");
			if (this.action == CKANAction.TAG_LIST)
				return Weave.lang("Tags");

			if (this.action == CKANAction.PACKAGE_SHOW || this.action == CKANAction.GROUP_SHOW ||this.action == CKANAction.GROUP_PACKAGE_SHOW || this.action == CKANAction.TAG_SHOW)
				return (this.metadata as ICKANActionMetadata).display_name
						|| (this.metadata as ICKANActionMetadata).name
						|| (this.metadata as ICKANActionMetadata).title
						|| (this.metadata as ICKANActionMetadata).description
						|| (this.metadata as ICKANActionMetadata).url
						|| (Weave.IS(this.result, String)
				? this.result as string
				: (this.result as CKANActionResult).title || (this.result as CKANActionResult).display_name || (this.result as CKANActionResult).name) || this.params.id;

			if (this.action == CKANAction.GET_DATASOURCE || this.action == CKANAction.DATASTORE_SEARCH)
			{
				var str:string = (this.metadata as ICKANActionMetadata).name
						|| (this.metadata as ICKANActionMetadata).title
						|| (this.metadata as ICKANActionMetadata).description
						|| (this.metadata as ICKANActionMetadata).url
						|| (this.metadata as ICKANActionMetadata).id;

				// hack to support DKAN
				if (!(this.metadata as ICKANActionMetadata).format && (this.metadata as ICKANActionMetadata).mimetype == 'text/csv')
					(this.metadata as ICKANActionMetadata).format = 'csv';

				// also display the format
				if ((this.metadata as ICKANActionMetadata).format)
					str = StandardLib.substitute("{0} ({1})", str, (this.metadata as ICKANActionMetadata).format);

				return str;
			}

			if (this.action == CKANAction.GET_COLUMN)
				return this.params.ckan_field;

			return this.toString();
		}
		public isBranch():boolean
		{
			if (this.internalNode)
				return this.internalNode.isBranch();

			if (this.action == CKANAction.GET_DATASOURCE || this.action == CKANAction.DATASTORE_SEARCH)
				return true;

			return this.action != CKANAction.NO_ACTION && this.action != CKANAction.GET_COLUMN;
		}
		public hasChildBranches():boolean
		{
			if (this.internalNode)
				return this.internalNode.hasChildBranches();

			if (this.action == CKANAction.PACKAGE_SHOW || this.action == CKANAction.GROUP_PACKAGE_SHOW)
				return this.getChildren().length > 0;
			if (this.action == CKANAction.GROUP_SHOW || this.action == CKANAction.TAG_SHOW)
			{
				var metapkg = (this.metadata as ICKANActionMetadata).packages;
				if (Weave.IS(metapkg, Number))
					return (Number(metapkg)) > 0;
				if (Weave.IS(metapkg, Array))
					return Weave.AS(metapkg, Array).length > 0;
				return this.getChildren().length > 0;
			}

			return this.action != CKANAction.GET_DATASOURCE && this.action != CKANAction.DATASTORE_SEARCH && this.action != CKANAction.NO_ACTION;
		}

		private _childNodes:CKANAction[] = [];
		/**
		 * @param input The input metadata items for generating child nodes
		 * @param child Action The action property of the child nodes
		 * @param updater A function like function(node:CKANAction, item:Object):void which receives the child node and its corresponding input metadata item.
		 * @return The updated _childNodes Array.
		 */
		private updateChildren(input:CKANResult[], updater:(node:CKANAction, item:CKANResult) => void = null, nodeType:Class<CKANAction> = null):CKANAction[]
		{
			if (!nodeType)
				nodeType = CKANAction;
			var outputIndex:int = 0;
			for (var item of input || [])
			{
				var node:CKANAction = this._childNodes[outputIndex];
				if (!node || Object(node).constructor != nodeType)
					this._childNodes[outputIndex] = node = new nodeType(source);

				var oldAction:string = node.action;
				var oldParams:Object = node.params;

				updater(node, item);

				// if something changed, clear the previous result
				if (oldAction != node.action || StandardLib.compare(oldParams, node.params))
					node._result = null;

				outputIndex++;
			}
			this._childNodes.length = outputIndex;
			return this._childNodes;
		}

		public getChildren():IWeaveTreeNode[]
		{
			if (this.internalNode)
				return this.internalNode.getChildren();

			if (!this.action)
			{
				var list:CKANActionResult[] = [];
				if (this.source.showPackages.value)
					list.push([CKANAction.PACKAGE_LIST, null]);
				if (this.source.showGroups.value)
					list.push([CKANAction.GROUP_LIST, {"all_fields": true}]);
				if (this.source.showTags.value)
					list.push([CKANAction.TAG_LIST, {"all_fields": true}]);
				return this.updateChildren(list, (node:CKANAction, actionAndParams:[string, CKANParams]) => {
					node.action = actionAndParams[0];
					node.params = actionAndParams[1];
					node.metadata = null;
				});
			}

			// handle all situations where result is just an array of IDs
			if (StandardLib.getArrayType(Weave.AS(this.result, Array)) == String)
				return this.updateChildren(Weave.AS(this.result, Array) as CKANResult[], (node:CKANAction, id:string) => {
					if (this.action == CKANAction.PACKAGE_LIST || this.action == CKANAction.TAG_SHOW)
						node.action = CKANAction.PACKAGE_SHOW;
					if (this.action == CKANAction.GROUP_LIST)
						node.action = CKANAction.GROUP_PACKAGE_SHOW;
					if (this.action == CKANAction.TAG_LIST)
						node.action = CKANAction.TAG_SHOW;
					node.metadata = node.params = {id: id};
				});

			if (this.action == CKANAction.GROUP_LIST || this.action == CKANAction.TAG_LIST)
				return this.updateChildren(Weave.AS(this.result, Array) as CKANResult[], (node:CKANAction, meta:ICKANActionMetadata) => {
					if (this.action == CKANAction.GROUP_LIST)
						node.action = CKANAction.GROUP_PACKAGE_SHOW;
					if (this.action == CKANAction.TAG_LIST)
						node.action = CKANAction.TAG_SHOW;
					node.metadata = meta;

					// hack to support DKAN
					if (!meta.id && meta.uuid)
						meta.id = meta.uuid;

					node.params = {"id": meta.id};
				});

			if (this.result && (this.action == CKANAction.GROUP_SHOW || this.action == CKANAction.GROUP_PACKAGE_SHOW || this.action == CKANAction.TAG_SHOW))
				return this.updateChildren(Weave.AS(this.result, Array) as CKANResult[] || (this.result as CKANActionResult).packages, (node:CKANAction, pkg:CKANPackage|string) => {
					if (Weave.IS(pkg, String))
						pkg = {"id": pkg as string};
					node.action = CKANAction.PACKAGE_SHOW;
					node.metadata = pkg as string;
					node.params = {"id": (pkg as CKANPackage).id};
				});

			if (this.action == CKANAction.PACKAGE_SHOW && this.result.hasOwnProperty('resources'))
			{
				return this.updateChildren((this.result as CKANActionResult).resources, (node:CKANAction, resource:CKANResource) => {
					if (this.source.useDataStore.value && resource.datastore_active)
					{
						node.action = CKANAction.DATASTORE_SEARCH;
						node.metadata = resource;
						node.params = {
							resource_id: resource.id,
							limit: 1
						};
					}
					else
					{
						node.action = CKANAction.GET_DATASOURCE;
						node.metadata = resource;
						node.params = {};
						node.params.ckan_id = resource.id;
						node.params.ckan_url = resource.url;
						node.params.ckan_format = resource.format;
					}
				});
			}

			if (this.action == CKANAction.DATASTORE_SEARCH)
			{
				return this.updateChildren((this.result as CKANActionResult).fields, (node:CKANAction, field:CKANField) => {
					node.action = CKANAction.GET_COLUMN;
					node.metadata = field;
					node.params = {};
					node.params.ckan_id = (this.metadata as ICKANActionMetadata).id;
					node.params.ckan_url = CKANDataSource.DATASTORE_FORMAT + "://" + (this.metadata as ICKANActionMetadata).id;
					node.params.ckan_format = CKANDataSource.DATASTORE_FORMAT;
					node.params.ckan_field = field.id;
				});
			}

			if (this.action == CKANAction.GET_DATASOURCE)
			{
				var ds:IDataSource =this.source.getChildDataSource(this.params);
				if (ds)
				{
					var root:IWeaveTreeNode = ds.getHierarchyRoot();
					return this.updateChildren(root.getChildren(), (node:CKANAction, otherNode:IWeaveTreeNode&IColumnReference) => {
						node.action = CKANAction.GET_COLUMN;
						node.internalNode = otherNode;
						node.params = this.params; // copy params from parent
					});
				}
				else
				{
					var keys:string[] = JS.objectKeys(this.metadata);
					keys = keys.filter((key) =>  {
						return (this.metadata as ICKANActionMetadata)[key] != null && (this.metadata as ICKANActionMetadata)[key] != '';
					});

					keys.sort(this.keyCompare);
					return this.updateChildren(keys, (node:MetadataNode, key:string) => {
						node.metadata = this.metadata;
						node.params = key;
					}, MetadataNode);
				}
			}

			this._childNodes.length = 0;
			return this._childNodes;
		}

		private /* readonly */ static _KEY_ORDER = [
			'title', 'display_name', 'name', 'description',
			'format', 'resource_type', 'mimetype',
			'url',
			'url_type',
			'created', 'publish-date',
			'last_modified', 'revision_timestamp'
		];

		private keyCompare(a:string, b:string):number
		{
			var order = CKANAction._KEY_ORDER;
			var ia:number = order.indexOf(a);
			var ib:number = order.indexOf(b);
			if (ia >= 0 && ib >= 0)
				return StandardLib.numericCompare(ia, ib);
			if (ia >= 0)
				return -1;
			if (ib >= 0)
				return 1;

			return StandardLib.stringCompare(a, b, true);
		}

		public getDataSource():IDataSource
		{
			return this.source;
		}
		public getColumnMetadata():IColumnMetadata
		{
			if (Weave.IS(this.internalNode, IColumnReference))
			{
				var meta:ICKANActionMetadata = (this.internalNode as IColumnReference).getColumnMetadata();
				meta.ckan_id = this.params.ckan_id;
				meta.ckan_format = this.params.ckan_format;
				meta.ckan_url = this.params.ckan_url;
				return meta;
			}
			if (this.action == CKANAction.GET_COLUMN)
				return JS.copyObject(this.params);
			return null;
		}

		public findPathToNode(descendant:IWeaveTreeNode):IWeaveTreeNode[]
		{
			if (!descendant)
				return null;
			if (this.equals(descendant))
				return [this];

			// search cached children only
			for (var child of this._childNodes || [])
			{
				var path = child.findPathToNode(descendant);
				if (path)
				{
					path.unshift(this);
					return path;
				}
			}
			return null;
		}

		public toString():string
		{
			if (!this.action && !this.params)
				return Weave.stringify(this.metadata);
			return Weave.stringify({"action": this.action, "params": this.params});
		}
	}

	/**
	 * No CKANAction is associated with this type of node.
	 * Uses the 'params' property as a key for the 'metadata' object.
	 */
	class MetadataNode extends CKANAction implements IExternalLink
	{
		static WEAVE_INFO = Weave.setClassInfo(MetadataNode, {
			id: "weavejs.data.source.MetadataNode",
			interfaces: [IWeaveTreeNode, IColumnReference, IWeaveTreeNodeWithPathFinding, IExternalLink]
		});

		params:CKANParams|string;
		constructor(source:CKANDataSource)
		{
			super(source);
			this.action = CKANAction.NO_ACTION;
		}

		public getURL():string
		{
			return this.params == 'url' ? (this.metadata as ICKANActionMetadata).url : null;
		}

		public toString():string
		{
			return Weave.lang("{0}: {1}", this.params as string, Weave.stringify((this.metadata as ICKANActionMetadata)[this.params as string]));
		}
	}
}


