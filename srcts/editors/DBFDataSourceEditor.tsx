import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import FileSelector from "../ui/FileSelector";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import DBFDataSource = weavejs.data.source.DBFDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import LinkableFile = weavejs.core.LinkableFile;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import WeaveAPI = weavejs.WeaveAPI;

export default class DBFDataSourceEditor extends DataSourceEditor
{
	get editorFields():[string, JSX.Element][]
	{
		let dataSource = this.props.dataSource as DBFDataSource;
		let keyTypeSuggestions = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes();
		let editorFields:[string, JSX.Element][] = [
			[
				Weave.lang("DBF URL"),
				<FileSelector target={dataSource.dbfUrl}
						  	  placeholder={Weave.lang("http://www.example.com/example.dbf")} 
						  	  accept=".dbf"/>
			],
			[
				Weave.lang("SHP URL"),
				<FileSelector target={dataSource.shpUrl} 
						  	  placeholder={Weave.lang("http://www.example.com/example.shp")} 
						  	  accept=".shp"/>
			],
			[
				Weave.lang("Projection"),
				<StatefulTextField selectOnFocus={true} 
							   	   placeholder={Weave.lang("Example: EPSG:4326")} 
							       ref={linkReactStateRef(this, { content: dataSource.projection })}/>
			],
			[
				Weave.lang("Key Column"),
				<StatefulTextField selectOnFocus={true} 
							   	   suggestions={dataSource.getColumnNames()}
							   	   ref={linkReactStateRef(this, { content: dataSource.keyColName })}/>
			],
			[
				Weave.lang("Key Type"),
				<StatefulTextField selectOnFocus={true} 
							   	   suggestions={keyTypeSuggestions}
							   	   ref={linkReactStateRef(this, { content: dataSource.keyType })}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
