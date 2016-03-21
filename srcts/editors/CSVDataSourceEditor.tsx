import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import FileSelector from "../ui/FileSelector";

import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import CSVDataSource = weavejs.data.source.CSVDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import URLRequestUtils = weavejs.api.data.IWeaveTreeNode;

export default class CSVDataSourceEditor extends React.Component<IDataSourceEditorProps, IDataSourceEditorState>
{
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		let ds = (this.props.dataSource as CSVDataSource);
		let keyTypeSuggestions = weavejs.WeaveAPI.QKeyManager.getAllKeyTypes();

		var tableStyles = {
			table: { width: "100%", fontSize: "inherit" },
			td: { paddingBottom: 10, textAlign: "right" }
		};

		var tableClasses = {
			tr: "weave-datasource-manager-table-row"
		}

		var labelStyle = {
			paddingRight: 5,
			whiteSpace: "nowrap"
		}

		var inputStyle = {
			width: "100%"
		}

		let editorFields = [
			["URL", <FileSelector target={(this.props.dataSource as CSVDataSource).url} accept="text/csv,.csv"/>],
			["Key Type", <StatefulTextField style={inputStyle} selectOnFocus={true} ref={linkReactStateRef(this, { content: ds.keyType }) }
				suggestions={keyTypeSuggestions}/>],
			["Key Column", <StatefulTextField style={inputStyle} selectOnFocus={true} ref={linkReactStateRef(this, { content: ds.keyColName }) }
				noneLabel={Weave.lang("Auto-generated keys") } suggestions={ds.getColumnNames().concat([null]) }/>]
		].map((value: [string, JSX.Element]) => {
			return [
				<span style={labelStyle}>{Weave.lang(value[0]) }</span>,
				value[1]
			];
		});

		Weave.getCallbacks(ds).addGroupedCallback(this, this.forceUpdate);
		return <div>
			{ReactUtils.generateTable(null, editorFields, tableStyles, tableClasses)}
		</div>;
	}
}