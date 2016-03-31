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
	get editorFields():[JSX.Element, JSX.Element][]
	{
		let dataSource = this.props.dataSource as DBFDataSource;
		let keyTypeSuggestions = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes();
		let editorFields:[JSX.Element, JSX.Element][] = [
			[
				<span>{Weave.lang("DBF URL")}</span>,
				<FileSelector target={dataSource.dbfUrl}
						  	  placeholder={Weave.lang("http://www.example.com/example.dbf")} 
						  	  accept=".dbf"/>
			],
			[
				<span>{Weave.lang("SHP URL")}</span>,
				<FileSelector target={dataSource.shpUrl} 
						  	  placeholder={Weave.lang("http://www.example.com/example.shp")} 
						  	  accept=".shp"/>
			],
			[
				<span>{Weave.lang("Projection")}</span>,
				<StatefulTextField selectOnFocus={true} 
							   	   placeholder={Weave.lang("Example: EPSG:4326")} 
							       ref={linkReactStateRef(this, { content: dataSource.projection })}/>
			],
			[
				<span>{Weave.lang("Key Column")}</span>,
				<StatefulTextField selectOnFocus={true} 
							   	   suggestions={dataSource.getColumnNames()}
							   	   ref={linkReactStateRef(this, { content: dataSource.keyColName })}/>
			],
			[
				<span>{Weave.lang("Key Type")}</span>,
				<StatefulTextField selectOnFocus={true} 
							   	   suggestions={keyTypeSuggestions}
							   	   ref={linkReactStateRef(this, { content: dataSource.keyType })}/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}
