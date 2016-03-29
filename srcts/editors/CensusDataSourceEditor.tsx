import * as React from "react";
import * as _ from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import StatefulComboBox from "../ui/StatefulComboBox";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import FileSelector from "../ui/FileSelector";
import ReactBootstrapTable from "../react-bootstrap-datatable/ReactBootstrapTable";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import ColumnUtils = weavejs.data.ColumnUtils;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;
import StandardLib = weavejs.util.StandardLib;

import CensusDataSource = weavejs.data.source.CensusDataSource;
import CensusApi = weavejs.data.source.CensusApi;

interface CensusRawDataset {
	c_dataset: string[];
	c_vintage: string;
	identifier: string;
	title: string;
	c_isAvailable: boolean;
};

function isUsableFamily(family:string):boolean
{
	return family && (family.indexOf("acs") == 0 || family.indexOf("sf") == 0);
}

function isInFamily(family: string, dataset: CensusRawDataset):boolean
{
	return family && dataset && ((family == "All") || (dataset.c_dataset.indexOf(family) != -1));
}

function isOfVintage(vintage: string, dataset: CensusRawDataset):boolean
{
	return vintage && dataset && ((vintage == "All") || (dataset.c_vintage == vintage));
}

export default class CensusDataSourceEditor extends DataSourceEditor
{
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}

	componentWillReceiveProps(nextProps:IDataSourceEditorProps)
	{
		let ds = (this.props.dataSource as CensusDataSource);
		this.api = ds.getAPI();
		this.api.getDatasets().then(
			(result: { dataset: CensusRawDataset[] }) => { this.raw_datasets = result.dataset; this.forceUpdate(); }
		);
	}

	private raw_datasets:CensusRawDataset[];
	private geographies: { value: string, label: string }[];

	private api: CensusApi;

	private getDataFamilies():string[]
	{
		if (!this.raw_datasets) return ["All"];

		let families_set = new Set<string>(_.flatten(_.map(this.raw_datasets, (d) => d.c_dataset)).filter(isUsableFamily));
		let families_list = _.sortBy(Array.from(families_set));
		families_list.unshift("All");
		return families_list;
	}

	private getDataVintages(family:string):string[]
	{
		if (!this.raw_datasets || !family) return ["All"];

		let datasetsInFamily = this.raw_datasets.filter(isInFamily.bind(null, family));
		let vintages_set = new Set<string>(datasetsInFamily.map((d) => d.c_vintage));
		let vintages_list = _.sortBy(Array.from(vintages_set));

		vintages_list.unshift("All");

		return vintages_list;
	}

	private getDatasets(family:string, vintage:string)
	{
		let ds = this.props.dataSource as CensusDataSource;
		if (!this.raw_datasets || !family || !vintage) return [{ value: ds.dataSet.value, label: ds.dataSet.value}];

		let filterFunc = (dataset: CensusRawDataset) => isInFamily(family, dataset) && isOfVintage(vintage, dataset);
		let makeEntry = (dataset: CensusRawDataset) => { return { value: dataset.identifier, label: dataset.title }; };

		return _.sortBy(this.raw_datasets.filter(filterFunc).map(makeEntry), "label");
	}

	private getGeographies(dataSet: string): { label: string, value: string }[]
	{
		if (!dataSet || !this.api) return [];

		this.api.getGeographies(dataSet).then(
			(geographies: { [id: string]: { name: string } }) => {
				let tempGeographies = new Array<{ value: string, label: string }>();
				for (let id in geographies) {
					tempGeographies.push({ value: id, label: geographies[id].name });
				}

				tempGeographies = _.sortBy(tempGeographies, "value");
				this.geographies = tempGeographies;
				this.forceUpdate();
			});
	}

	private dataFamily: string;
	private dataVintage: string;
	private dataSet: string;

	dataFamilyChanged=(selectedItem:any)=>
	{
		this.dataFamily = selectedItem;
		this.forceUpdate();
	}

	dataVintageChanged=(selectedItem:any)=>
	{
		this.dataVintage = selectedItem;
		this.forceUpdate();
	}
	dataSetChanged = (selectedItem: any) =>
	{
		this.getGeographies(selectedItem);
	}

	get editorFields(): [string, JSX.Element][] {
		let ds = (this.props.dataSource as CensusDataSource);
		let keyTypeSuggestions = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes();
		this.api = ds.getAPI();
		let dataSet_lrsr = linkReactStateRef(this, { content: ds.dataSet });
		let editorFields: [string, JSX.Element][] = [
			[
				Weave.lang("API Key"),
				<StatefulTextField ref={linkReactStateRef(this, { content: ds.apiKey }) }/>
			],
			[
				Weave.lang("Key Type"),
				<StatefulTextField selectOnFocus={true}
					ref={linkReactStateRef(this, { content: ds.keyType }) }
					suggestions={keyTypeSuggestions}/>
			],
			[
				Weave.lang("Data Family"),
				<StatefulComboBox onChange={this.dataFamilyChanged} 
					options={this.getDataFamilies()}/>
			],
			[
				Weave.lang("Year"),
				<StatefulComboBox onChange={this.dataVintageChanged} 
					options={this.getDataVintages(this.dataFamily)}/>
			],
			[
				Weave.lang("Dataset"),
				<StatefulComboBox onChange={this.dataSetChanged} ref={linkReactStateRef(this, { value: ds.dataSet })}
					options={this.getDatasets(this.dataFamily, this.dataVintage)}/>
			],
			[
				Weave.lang("Geographic Scope"),
				<StatefulComboBox ref={linkReactStateRef(this, {value: ds.geographicScope })}
					options={this.geographies || [{value: ds.geographicScope.value, label: ds.geographicScope.value}]}/>
			],
		];
		return super.editorFields.concat(editorFields);
	}
	
	renderChildEditor():JSX.Element
	{
		// let ds = this.props.dataSource as CensusDataSource;
		// let idProperty = '';
		// var columnNames = ds.getColumnNames();
		// var columns = columnNames.map((name) => ds.getColumnByName(name));
	
		// if (weavejs.WeaveAPI.Locale.reverseLayout)
		// {
		// 	columns.reverse();
		// 	columnNames.reverse();
		// }
		
		// var format:any = _.zipObject(columnNames, columns);
		// format[idProperty] = IQualifiedKey;
		
		// var keys = ColumnUtils.getAllKeys(columns);
		// var records = ColumnUtils.getRecords(format, keys, String);

		// var titles:string[] = columns.map(column => Weave.lang(column.getMetadata("title")));
		// var columnTitles = _.zipObject(columnNames, titles) as { [columnId: string]: string; };

		// return (
		// 	<div style={{flex: 1, position: "relative"}}>
		// 		<div style={{position: "absolute", width: "100%", height: "100%", overflow: "scroll"}}>
		// 			<ReactBootstrapTable columnTitles={columnTitles}
		// 						 rows={records}
		// 						 idProperty={''}/>
		// 		</div>
		// 	</div>
		// );
		return <div/>;
	}
}
