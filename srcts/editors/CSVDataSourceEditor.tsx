import * as React from "react";
import * as lodash from "lodash";
import LinkableTextField from "../ui/LinkableTextField";
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
		return <div>
			<FileSelector target={(this.props.dataSource as CSVDataSource).url} accept="text/csv"/>
		</div>;
	}
}