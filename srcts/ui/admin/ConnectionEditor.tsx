import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "../../react-ui/FlexBox";
import Checkbox from "../../semantic-ui/Checkbox";
import ComboBox from "../../semantic-ui/ComboBox";
import Button from "../../semantic-ui/Button";
import StatefulTextField from "../StatefulTextField";
import Accordion from "../../semantic-ui/Accordion";
import PopupWindow from "../../react-ui/PopupWindow";
import SmartComponent from "../SmartComponent";
import Input from "../../semantic-ui/Input";
import List from "../../react-ui/List";
import {ListOption} from "../../react-ui/List";

import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveAdminService = weavejs.net.WeaveAdminService;

interface IConnectionEditorProps {
	service: WeaveAdminService;
	connectionName: string;
	errorMode: string;
	handleError: (error: any) => void;
}

interface IConnectionEditorState {
	is_superuser?: boolean;
	name?: string;
	pass?: string;
	folderName?: string;
	showPass?: boolean;
	connectString?: string;

	editorMode?: string;
	
	info?: ConnectionInfo;
}

class SQLConfigEditor extends SmartComponent<IConnectionEditorProps, IConnectionEditorState> {
	constructor(props:IConnectionEditorProps)
	{
		super(props);
		this.state = {
			editorMode: "custom"
		}
	}

	loadFromConnection()
	{
		this.props.service.getConnectionInfo(this.props.connectionName).then(
			(info)=>{
				this.setState({
					info,
					is_superuser: info.is_superuser,
					name: info.name,
					folderName: info.folderName,
					connectString: info.connectString,
					editorMode: "custom"
				});
			},
			this.props.handleError
		);
	}

	componentDidMount()
	{

	}

	render():JSX.Element
	{
		let accordion = Accordion.render([
			Weave.lang("Connection Properties"),
			[
				[
					<Checkbox label={Weave.lang("Grant this connection superuser privileges.") }
						value={!this.state.is_superuser}
						onChange={(value) => this.setState({ is_superuser: !value }) }
						/>, undefined
				],
				[
					Weave.lang("Connection Name"),
					<Input type="text" value={this.state.name} onChange={(evt) => this.setState({name: (evt.target as HTMLInputElement).value})}/>
				],
				[
					Weave.lang("Password"),
					<Input type={this.state.showPass ? "text" : "password"} value={this.state.pass} onChange={(evt) => this.setState({ pass: (evt.target as HTMLInputElement).value }) }/>
				],
				[
					Weave.lang("Folder name"),
					<Input type="text" value={this.state.folderName} onChange={(evt) => this.setState({ folderName: (evt.target as HTMLInputElement).value }) }/>
				]
			]
		],
		[
			Weave.lang("Database Configuration"),
			[]
		]);
		return <VBox>
			{accordion}
		</VBox>
	}
}