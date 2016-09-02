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
    import IDataSource = weavejs.api.data.IDataSource;
    import IDataSource_Service = weavejs.api.data.IDataSource_Service;
    import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
    import LinkableString = weavejs.core.LinkableString;
    import LinkableVariable = weavejs.core.LinkableVariable;
    import DataSourceUtils = weavejs.data.DataSourceUtils;
    import ProxyColumn = weavejs.data.column.ProxyColumn;
    import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
    import StandardLib = weavejs.util.StandardLib;
	import IColumnReference = weavejs.api.data.IColumnReference;
	import WeavePromise = weavejs.util.WeavePromise;

	export declare type Data = {
		concept?: string,
		variableId?: string
	}

	export declare type ConceptNode = {
		dataSource: IDataSource;
		data: Data;
		label: string;
		idFields: ("concept"|"variableId")[];
		hasChildBranches?: boolean;
		children: ConceptNode[];
	};

    export class CensusDataSource extends AbstractDataSource implements IDataSource
    {
		static WEAVE_INFO = Weave.classInfo(CensusDataSource, {
			id: "weavejs.data.source.CensusDataSource",
			label: "Census.gov",
			interfaces: [IDataSource]
		});

		private static /* readonly */ baseUrl:string = "http://api.census.gov/";
		
		/* override */ public get isLocal():boolean
		{
			return false;
		}
		
		/* override */ protected initialize(forceRefresh:boolean = false):void
        {
            // recalculate all columns previously requested
            //forceRefresh = true;
            
            super.initialize(forceRefresh);
        }
		
		public /* readonly */ keyType:LinkableString = Weave.linkableChild(this, LinkableString);
		public /* readonly */ apiKey:LinkableString = Weave.linkableChild(this, new LinkableString(""));
		public /* readonly */ dataSet:LinkableString = Weave.linkableChild(this, new LinkableString("http://api.census.gov/data/id/ACSSF2014"));
		public /* readonly */ geographicScope:LinkableString = Weave.linkableChild(this, new LinkableString("040"));
		public /* readonly */ geographicFilters:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Object));
		private /* readonly */ api:CensusApi = Weave.linkableChild(this, CensusApi);

		public getAPI()
		{
			return this.api;
		}

		public createDataSetNode():ColumnTreeNode
		{
			var _ds:IDataSource = this;
			var name:string = this.getLabel();
			var data:Data = {};
			var ctn:ColumnTreeNode = new ColumnTreeNode({
				dataSource: this,
				data: data,
				label: () => { return this.dataSet.value || name; },
				hasChildBranches: true,
				children: (node:ColumnTreeNode) => {
					var children:ConceptNode[] = [];

					this.api.getVariables(this.dataSet.value).then((result) =>
					{
						var concept_nodes = new Map<string, ConceptNode>();
						var concept_node:ConceptNode;
						for (var variableId in result)
						{							
							var variableInfo = result[variableId];
							concept_node = concept_nodes.get(variableInfo.concept);
							
							if (!concept_node)
							{
								var concept_label:string = variableInfo.concept;

								if (!concept_label)
									concept_label = Weave.lang("No Concept");

								concept_node = {
									dataSource: _ds,
									data: _.clone(data),
									label: concept_label,
									idFields: ["concept"],
									hasChildBranches: false,
									children: []
								};
								
								concept_node.data.concept = variableInfo.concept;
								
								children.push(concept_node);
								concept_nodes.set(variableInfo.concept, concept_node);
							}
							
							var variable_descriptor:ConceptNode = {
								dataSource: _ds,
								data: _.clone(concept_node.data),
								label: variableInfo.title,
								idFields: ["concept", "variableId"],
								children: null
							};
							
							variable_descriptor.data.variableId = variableId;
							
							concept_node.children.push(variable_descriptor);
						}
						for (var [key, concept_node] of concept_nodes)
						{
							StandardLib.sortOn(concept_node.children, (obj:ConceptNode) => {return obj.data.variableId});
						}
						StandardLib.sortOn(children, (obj:ConceptNode) => {return obj.data.concept});
					});
					return children;
				}
			});
			this.api.getDatasets().then(
				(datasetsInfo:CensusApiResult):void =>
				{
					for (var dataset of datasetsInfo.dataset)
					{
						if (dataset.identifier == this.dataSet.value)
						{
							ctn.label = dataset.title;
							return;
						}
					}
					ctn.label = this.dataSet.value;
				}
			);
			return ctn;
		}
		
        /* override */ public getHierarchyRoot():IWeaveTreeNode&IColumnReference
        {
            if (!this._rootNode)
                this._rootNode = this.createDataSetNode();
            return this._rootNode;
        }
		
		/* override */ protected generateHierarchyNode(metadata:{[key:string]:string}):IWeaveTreeNode
		{
			if (!metadata)
				return null;
			var idFields = ["concept", "variableId"];

			var ctn:ColumnTreeNode = new ColumnTreeNode({dataSource: this, idFields: idFields, data: metadata});
			return ctn; 
		}
		
        /* override */ protected requestColumnFromSource(proxyColumn:ProxyColumn):void
        {
        	var metadata = ColumnMetadata.getAllMetadata(proxyColumn);
        	
			this.getColumn(metadata).then(
				(columnInfo:{keys: any;	values: any; metadata: any; data:any}):void =>
				{
					if (!columnInfo) return;

					if (this.keyType.value)
						columnInfo.metadata[ColumnMetadata.KEY_TYPE] = this.keyType.value;
					
					proxyColumn.setMetadata(columnInfo.metadata);
					
					DataSourceUtils.initColumn(proxyColumn, columnInfo.keys, columnInfo.data);
				}
			);
        }

		/**
		 *
		 * @param metadata
		 * @return An object containing three fields, "keys," "data," and "metadata"
		 */
		public getColumn(metadata:{[key:string]:string}):WeavePromise<{keys:string[], data:string[], metadata:{[key:string]:string}}>
		{
			var dataset_name:string;
			var geography_id:string;
			var geography_filters:Object;
			var api_key:string;

			var variable_name:string = metadata["variableId"];

			var params:CensusApiParams = {};
			var title:string = null;
			var access_url:string = null;
			var filters:string[] = [];
			var requires:string[] = null;

			return new WeavePromise(this)
				.setResult(this)
				.depend(this.dataSet)
				.then(
					() =>
					{
						dataset_name = this.dataSet.value;
						return this.api.getDatasetPromise(dataset_name);
					}
				).then(
					(datasetInfo:CensusApiDataSet) =>
					{
						if (datasetInfo &&
							datasetInfo.distribution &&
							datasetInfo.distribution[0])
						{
							access_url = datasetInfo.distribution[0].accessURL;
						}

						if (!access_url)
						{
							throw new Error("Dataset distribution information malformed.");
						}

						return this.api.getVariables(dataset_name);
					}
				).then(
					(variableInfo) =>
					{
						if (variableInfo && variableInfo[variable_name])
							title = variableInfo[variable_name].title;
						return this.api.getGeographies(dataset_name);
					}
				).depend(this.geographicScope, this.apiKey, this.geographicFilters)
				.then(
					(geographyInfo) =>
					{
						if (geographyInfo == null) return null;
						geography_id = this.geographicScope.value;
						geography_filters = this.geographicFilters.getSessionState();
						api_key = this.apiKey.value;
						requires = ArrayUtils.copy(geographyInfo[geography_id].requires || []);
						requires.push(geographyInfo[geography_id].name);
						filters = [];
						for (var key in geography_filters)
						{
							filters.push(key + ":" + (geography_filters as any)[key]);
						}

						params.get = variable_name;
						params.for = geographyInfo[geography_id].name + ":*";

						if (filters.length != 0)
							params.in =  filters.join(",");

						if (api_key)
							params.key = api_key;

						return this.api.getJsonCachePromise(access_url, params);
					}
				).then(
					(dataResult:any):any =>
					{
						if (dataResult == null)
							return null;
						var idx:int;
						var columns = Weave.AS(dataResult[0], Array);
						var rows = Weave.AS(dataResult, Array);
						var data_column:string[] = new Array(rows.length - 1);
						var key_column:string[] = new Array(rows.length - 1);
						var key_column_indices:number[] = new Array(columns.length);
						var data_column_index:int = columns.indexOf(variable_name);

						var tmp_key_type:string = WeaveAPI.CSVParser.createCSVRow(requires);



						metadata[ColumnMetadata.KEY_TYPE] = tmp_key_type;
						metadata[ColumnMetadata.TITLE] = title;
						for (idx = 0; idx < requires.length; idx++)
						{
							key_column_indices[idx] = columns.indexOf(requires[idx]);
						}
						for (var row_idx:int = 0; row_idx < data_column.length; row_idx++)
						{
							var row = rows[row_idx+1];
							var key_values = new Array(key_column_indices.length);

							for (idx = 0; idx < key_column_indices.length; idx++)
							{
								key_values[idx] = row[key_column_indices[idx]];
							}
							key_column[row_idx] = key_values.join("");
							data_column[row_idx] = row[data_column_index];
						}
						return {
							keys: key_column,
							data: data_column,
							metadata: metadata
						};
					}
				);
		}
    }
}