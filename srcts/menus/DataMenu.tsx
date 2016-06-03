import * as React from "react";
import * as FileSaver from "filesaver.js";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import DataSourceManager from "../ui/DataSourceManager";
import IDataSource = weavejs.api.data.IDataSource;
import IDataSource_File = weavejs.api.data.IDataSource_File;
import IDataSource_Service = weavejs.api.data.IDataSource_Service;
import FileMenu from "./FileMenu";
import FileInput from "../react-ui/FileInput";
import ChartsMenu from "./ChartsMenu";

export default class DataMenu implements MenuBarItemProps
{
	constructor(weave:Weave, createObject:(type:new(..._:any[])=>any)=>void, openDataSourceManagerCallback:Function)
	{
		this.weave = weave;
		this.fileMenu = new FileMenu(weave);
		this.chartsMenu = new ChartsMenu(weave, createObject);
		this.createObject = createObject;
		this.openDataSourceManagerCallback = openDataSourceManagerCallback;
	}

	label:string = "Data";
	weave:Weave;
	chartsMenu:ChartsMenu;//menu to be passed for creating visualizations from tha datasource manager
	fileMenu:FileMenu; // temp solution
	createObject:(type:new(..._:any[])=>any)=>void;
	openDataSourceManagerCallback:Function; // callback function passed that will open the data source manager
	
	get menu():MenuItemProps[]
	{
		return [].concat(
			{
				label: Weave.lang('Manage data...'),
				click: () => this.openDataSourceManagerCallback()
			},
//			{},
//			{
//				shown: Weave.beta,
//				label: <FileInput onChange={(()=>alert('Not implemented yet')) || this.fileMenu.openFile} accept={this.fileMenu.getSupportedFileTypes(true).join(',')}>{Weave.lang("Import data file(s)... (not implemented yet)")}</FileInput>
//			},
			{},
			{
				enabled: this.getColumnsToExport().length > 0,
				label: Weave.lang("Export CSV"),
				click: this.exportCSV
			}
		);
	}

	getDataSourceItems()
	{
		var registry = weavejs.WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IDataSource);
		
		// filter out those data sources without editors
		impls = impls.filter(impl => DataSourceManager.editorRegistry.has(impl));
	
		var items:MenuItemProps[] = [];
		for (var partition of weavejs.core.ClassRegistryImpl.partitionClassList(impls, IDataSource_File, IDataSource_Service))
		{
			if (items.length)
				items.push({});
			partition.forEach(impl => {
				var label = Weave.lang(registry.getDisplayName(impl));
				items.push({
					get shown() {
						return Weave.beta || !DataMenu.isBeta(impl);
					},
					get label() {
						if (DataMenu.isBeta(impl))
							return label + " (beta)";
						return label;
					},
					click: this.createObject.bind(this, impl)
				});
			});
		}
		
		return items;
	}

	static isBeta(impl:new()=>IDataSource):boolean
	{
		return impl == weavejs.data.source.CensusDataSource
			|| impl == weavejs.data.source.GroupedDataTransform;
	}
	
	getColumnsToExport=()=>
	{
		var columnSet = new Set<weavejs.api.data.IAttributeColumn>();
		for (var rc of Weave.getDescendants(this.weave.root, weavejs.data.column.ReferencedColumn))
		{
			var col = rc.getInternalColumn();
			if (col && col.getMetadata(weavejs.api.data.ColumnMetadata.DATA_TYPE) != weavejs.api.data.DataType.GEOMETRY)
				columnSet.add(col)
		}
		return weavejs.util.JS.toArray(columnSet.values());
	}

	exportCSV=()=>
	{
		var columns = this.getColumnsToExport();
		var filter = Weave.AS(this.weave.getObject('defaultSubsetKeyFilter'), weavejs.api.data.IKeyFilter);
		var csv = weavejs.data.ColumnUtils.generateTableCSV(columns, filter);	
		FileSaver.saveAs(new Blob([csv]), "Weave-data-export.csv");
	}
}
