import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import FileSelector from "../ui/FileSelector";

import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import DBFDataSource = weavejs.data.source.DBFDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import LinkableFile = weavejs.core.LinkableFile;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;
import WeaveAPI = weavejs.WeaveAPI;

export default class DBFDataSourceEditor extends React.Component<IDataSourceEditorProps, IDataSourceEditorState>
{
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}
	
	componentWillReceiveProps(props:IDataSourceEditorProps)
	{
		Weave.getCallbacks(props.dataSource).addGroupedCallback(this, this.forceUpdate);
	}

	render():JSX.Element
	{
		let dataSource = this.props.dataSource as DBFDataSource;
		let keyTypeSuggestions = WeaveAPI.QKeyManager.getAllKeyTypes();
		
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"},
			td: { paddingBottom: 10, textAlign: "right"}
		};
		
		var tableClasses = {
			tr: "weave-datasource-manager-table-row"
		}

		var labelStyle = {
			paddingRight: 5,
			whiteSpace: "nowrap"
		}
		
		var inputStyle = {
			width:"100%"
		}

		var editorFields = [
			[
				<span style={labelStyle}>{Weave.lang("Source Name *")}</span>,
				<input type="text" style={inputStyle} placeholder={Weave.lang("SHP/DBF files")}/>
			],
			[
				<span style={labelStyle}>{Weave.lang("DBF URL")}</span>,
				<FileSelector target={dataSource.dbfUrl}
						  	  placeholder={Weave.lang("http://www.example.com/example.dbf")} 
						  	  accept=".dbf"/>
			],
			[
				<span style={labelStyle}>{Weave.lang("SHP URL")}</span>,
				<FileSelector target={dataSource.shpUrl} 
						  	  placeholder={Weave.lang("http://www.example.com/example.shp")} 
						  	  accept=".shp"/>
			],
			[
				<span style={labelStyle}>{Weave.lang("Projection")}</span>,
				<StatefulTextField selectOnFocus={true} 
							   	   placeholder={Weave.lang("Example: EPSG:4326")} 
							       ref={linkReactStateRef(this, { content: dataSource.projection })}/>
			],
			[
				<span style={labelStyle}>{Weave.lang("Key Column")}</span>,
				<StatefulTextField selectOnFocus={true} 
							   	   suggestions={dataSource.getColumnNames()}
							   	   ref={linkReactStateRef(this, { content: dataSource.keyColName })}/>
			],
			[
				<span style={labelStyle}>{Weave.lang("Key Type")}</span>,
				<StatefulTextField selectOnFocus={true} 
							   	   suggestions={keyTypeSuggestions}
							   	   ref={linkReactStateRef(this, { content: dataSource.keyType })}/>
			]
		]
		
		return (
			<VBox style={{flex: 1, margin: 10}}>
				{
					ReactUtils.generateTable(null, editorFields, tableStyles, tableClasses)
				}
			</VBox>
		)
	}
}
