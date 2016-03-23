import * as React from "react";
import * as _ from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import FileSelector from "../ui/FileSelector";
import ReactBootstrapTable from "../react-bootstrap-datatable/ReactBootstrapTable";

import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";
import CSVDataSource = weavejs.data.source.CSVDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import ColumnUtils = weavejs.data.ColumnUtils;

export default class CSVDataSourceEditor extends DataSourceEditor
{
	get editorFields():[string, JSX.Element][]
	{
		let ds = (this.props.dataSource as CSVDataSource);
		let keyTypeSuggestions = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes();
		let editorFields:[string, JSX.Element][] = [
			[
				Weave.lang("URL"), 
				<FileSelector target={(this.props.dataSource as CSVDataSource).url} accept="text/csv,.csv"/>
			],
			[
				Weave.lang("Key Type"), 
				<StatefulTextField selectOnFocus={true} 
								   ref={linkReactStateRef(this, { content: ds.keyType }) } 
								   suggestions={keyTypeSuggestions}/>
			],
			[
				Weave.lang("Key Column"),
				<StatefulTextField selectOnFocus={true} 
								   ref={linkReactStateRef(this, { content: ds.keyColName }) }
								   noneLabel={Weave.lang("Auto-generated keys") } 
								   suggestions={ds.getColumnNames().concat([null]) }/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
	
	renderChildEditor():JSX.Element
	{
		let ds = this.props.dataSource as CSVDataSource;
		if(!ds.keyColName.value)
			return null;
		
		var keyColumn = ds.getColumnByName(ds.keyColName.value);
		var keys = keyColumn.keys;
		
		var columnNames = ds.getColumnNames();
		var columns = columnNames.map((name) => ds.getColumnByName(name));
		
		var records = ColumnUtils.getRecords(columns, keys, String);
		
		console.log(columns);
		console.log(records);
		
		var titles:string[] = columns.map(column => Weave.lang(column.getMetadata("title")));
		var columnTitles = _.zipObject(columnNames, titles) as { [columnId: string]: string; };

		return (
			<ReactBootstrapTable columnTitles={columnTitles}
								 rows={records}
								 idProperty={''}
								 striped={true}
								 hover={true}
								 bordered={true}
								 condensed={true}
								 showIdColumn={true}/>
		);
	}
}
