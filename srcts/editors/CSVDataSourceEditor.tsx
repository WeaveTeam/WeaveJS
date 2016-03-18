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

		Weave.getCallbacks(ds).addGroupedCallback(this, this.forceUpdate);
		return <div>
			{Weave.lang("URL")}<FileSelector target={(this.props.dataSource as CSVDataSource).url} accept="text/csv,.csv"/><br/>
			{Weave.lang("Key Type") }<StatefulTextField selectOnFocus={true} ref={linkReactStateRef(this, { content: ds.keyType }) } suggestions={keyTypeSuggestions}/><br/>
			{Weave.lang("Key Column") }<StatefulTextField selectOnFocus={true} ref={linkReactStateRef(this, { content: ds.keyColName }) } suggestions={ds.getColumnNames() }/><br/>
		</div>;
	}
}