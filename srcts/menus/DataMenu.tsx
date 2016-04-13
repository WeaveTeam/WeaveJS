import * as React from "react";
import * as FileSaver from "filesaver.js";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import DataSourceManager from "../ui/DataSourceManager";
import IDataSource = weavejs.api.data.IDataSource;
import FileMenu from "./FileMenu";
import FileInput from "../react-ui/FileInput";

export default class DataMenu implements MenuBarItemProps
{
	constructor(weave:Weave, createObject:(type:new(..._:any[])=>any)=>void)
	{
		this.weave = weave;
		this.fileMenu = new FileMenu(weave);
		this.createObject = createObject;

		var registry = weavejs.WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IDataSource);
		
		// filter out those data sources without editors
		impls = impls.filter(impl => DataSourceManager.editorRegistry.has(impl));
		
		this.menu = [].concat(
			{
				label: <FileInput onChange={(()=>alert('Not implemented yet')) || this.fileMenu.openFile} accept={this.fileMenu.getSupportedFileTypes(true).join(',')}>{Weave.lang("Import data file(s)...")}</FileInput>
			},
			{
				enabled: this.getColumnsToExport().length > 0,
				label: Weave.lang("Export CSV"),
				click: this.exportCSV
			},
			{},
			{
				label: Weave.lang('Manage or browse data'),
				click: DataSourceManager.openInstance.bind(null, weave)
			},
			{},
			impls.filter(impl => impl != weavejs.data.source.CensusDataSource).map(impl => ({
				label: Weave.lang('+ {0}', registry.getDisplayName(impl)),
				click: this.createObject.bind(this, impl)
			}))
		);
	}

	label:string = "Data";
	weave:Weave;
	fileMenu:FileMenu; // temp solution
	menu:MenuItemProps[];
	createObject:(type:new(..._:any[])=>any)=>void;
	
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
