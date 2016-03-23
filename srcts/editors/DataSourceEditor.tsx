import * as React from "react";
import {VBox, HBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";
import StatefulTextField from "../ui/StatefulTextField";

import WeaveAPI = weavejs.WeaveAPI;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import IDataSource = weavejs.api.data.IDataSource;

export interface IDataSourceEditorProps {
	dataSource: IDataSource;
};

export interface IDataSourceEditorState {
	
};

export default class DataSourceEditor extends React.Component<IDataSourceEditorProps, IDataSourceEditorState> 
{
	watcher:LinkableWatcher = Weave.disposableChild(this, new LinkableWatcher(IDataSource, null, this.forceUpdate.bind(this)));

	constructor(props:IDataSourceEditorProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}
	
	componentDidMount() {
		
	}

	componentWillReceiveProps(props:IDataSourceEditorProps)
	{
		Weave.getCallbacks(props.dataSource).addGroupedCallback(this, this.forceUpdate);
	}
	
	get editorFields():[string, JSX.Element][]
	{
		return [
			// [
			// 	Weave.lang("Source Name"),
			// 	<input type="text" style={{width: "100%"}}
			// 					   defaultValue={Weave.lang(Weave.getRoot(this.props.dataSource).getName(this.props.dataSource))}
			// 					   onChange={(e:React.FormEvent) => this.renameDataSource((e.target as any).value)}/>
			// ]
		]
	}

	renderFields():JSX.Element
	{
		let dataSource = this.props.dataSource;
		let keyTypeSuggestions = WeaveAPI.QKeyManager.getAllKeyTypes();
		
		var tableStyles = {
			table: { width: "100%", fontSize: "inherit"},
			td: [
				{ paddingBottom: 10, textAlign: "right", whiteSpace: "nowrap", paddingRight: 5},
				{ paddingBottom: 10, textAlign: "right", width: "100%"}
			]
		};

		return (
			<VBox>
				<label> {Weave.lang("Edit {0}", Weave.getRoot(dataSource).getName(dataSource))} </label>
				{
					ReactUtils.generateTable(null, this.editorFields, tableStyles)
				}
			</VBox>
		)
	}
	
	renderChildEditor():JSX.Element
	{
		return null;
	}
	
	render():JSX.Element
	{
		return (
			<VBox style={{flex:1, margin: 10}}>
				{
					this.renderFields()
				}
				{
					this.renderChildEditor()
				}
			</VBox>
		)
	}
};
