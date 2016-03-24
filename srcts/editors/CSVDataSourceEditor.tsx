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
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;

export default class CSVDataSourceEditor extends DataSourceEditor
{
	private _dataSourceNode:ColumnTreeNode
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
	}
	
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
		return super.editorFields.concat(editorFields);
	}
	
	get dataSourceTreeNode():ColumnTreeNode
	{
		return new ColumnTreeNode({ dataSource: this.props.dataSource });
	}
	
	renderChildEditor():JSX.Element
	{
		let ds = this.props.dataSource as CSVDataSource;
		let idProperty = '';
		var columnNames = ds.getColumnNames();
		var columns = columnNames.map((name) => ds.getColumnByName(name));
	
		if (weavejs.WeaveAPI.Locale.reverseLayout)
		{
			columns.reverse();
			columnNames.reverse();
		}
		
		var format:any = _.zipObject(columnNames, columns);
		format[idProperty] = IQualifiedKey;
		
		var keys = ColumnUtils.getAllKeys(columns);
		var records = ColumnUtils.getRecords(format, keys, String);

		var titles:string[] = columns.map(column => Weave.lang(column.getMetadata("title")));
		var columnTitles = _.zipObject(columnNames, titles) as { [columnId: string]: string; };

		return (
			<div style={{flex: 1, position: "relative"}}>
				<div style={{position: "absolute", width: "100%", height: "100%", overflow: "scroll"}}>
					<ReactBootstrapTable columnTitles={columnTitles}
								 rows={records}
								 idProperty={''}/>
				</div>
			</div>
		);
	}
}
