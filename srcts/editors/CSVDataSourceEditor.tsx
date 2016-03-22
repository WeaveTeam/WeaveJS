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
			td: [
				{ paddingBottom: 10, textAlign: "right", whiteSpace: "nowrap", paddingRight: 5},
				{ paddingBottom: 10, textAlign: "right", width: "100%"}
			]
		};

		let editorFields = [
			[Weave.lang("URL"), <FileSelector target={(this.props.dataSource as CSVDataSource).url} accept="text/csv,.csv"/>],
			[Weave.lang("Key Type"), <StatefulTextField selectOnFocus={true} ref={linkReactStateRef(this, { content: ds.keyType }) }
				suggestions={keyTypeSuggestions}/>],
			[Weave.lang("Key Column"), <StatefulTextField selectOnFocus={true} ref={linkReactStateRef(this, { content: ds.keyColName }) }
				noneLabel={Weave.lang("Auto-generated keys") } suggestions={ds.getColumnNames().concat([null]) }/>]
		];

		Weave.getCallbacks(ds).addGroupedCallback(this, this.forceUpdate);
		return (
			<VBox style={{flex: 1, margin: 10}}>
				{
					ReactUtils.generateTable(null, editorFields, tableStyles)
				}
			</VBox>
		);
	}
}
