import * as React from "react";
import {VBox, HBox} from "../react-ui/FlexBox";
import ReactUtils from "../utils/ReactUtils";

import WeaveAPI = weavejs.WeaveAPI;

export interface IDataSourceEditorProps {
	dataSource: weavejs.api.data.IDataSource;
};

export interface IDataSourceEditorState {
	
};

export default class DataSourceEditor extends React.Component<IDataSourceEditorProps, IDataSourceEditorState> 
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

	get editorFields():[string, JSX.Element][]
	{
		return [
			[
				Weave.lang("Source Name *"),
				<input type="text" style={{width: "100%"}} placeholder={Weave.lang(Weave.getRoot(this.props.dataSource).getName(this.props.dataSource))}/>
			]
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
				<label> {Weave.lang("Add {0}", Weave.getRoot(dataSource).getName(dataSource))} </label>
				{
					ReactUtils.generateTable(null, this.editorFields, tableStyles)
				}
			</VBox>
		)
	}
	
	render():JSX.Element
	{
		return (
			<VBox style={{flex:1, margin: 10}}>
				{
					this.renderFields()
				}
			</VBox>
		)
	}
};
