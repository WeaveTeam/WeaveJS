import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "../../react-ui/FlexBox";
import Checkbox from "../../semantic-ui/Checkbox";
import {ComboBoxOption} from "../../semantic-ui/ComboBox";
import ComboBox from "../../semantic-ui/ComboBox";
import Button from "../../semantic-ui/Button";
import StatefulTextField from "../StatefulTextField";
import Accordion from "../../semantic-ui/Accordion";
import PopupWindow from "../../react-ui/PopupWindow";
import SmartComponent from "../SmartComponent";
import Input from "../../semantic-ui/Input";
import List from "../../react-ui/List";
import HelpIcon from "../../react-ui/HelpIcon";

import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveAdminService = weavejs.net.WeaveAdminService;

interface ILinkedInputProps {
	field: string,
	outerComponent: ConnectionEditor,
	type?: string
}
class LinkedInput extends React.Component<ILinkedInputProps, Object>
{
	constructor(props:ILinkedInputProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		return <Input fluid value={(this.props.outerComponent.state as any)[this.props.field]} type={this.props.type || "text"}
			onChange={(evt) => this.props.outerComponent.setState({ [this.props.field]: (evt.target as HTMLInputElement).value }) }/>
	}
}

export interface IConnectionEditorProps {
	service: WeaveAdminService;
	connectionName: string;
	handleError: (error: any) => void;
}

export interface IConnectionEditorState {
	is_superuser?: boolean;
	name?: string;
	pass?: string;
	folderName?: string;
	showPass?: boolean;
	connectString?: string;

	editorMode?: string;

	dbServerAddress?: string; /* Also used for path in SQLite */
	dbServerPort?: string;
	dbDatabaseName?: string; /* Also used for instance name in SQLSERVER */
	dbUsername?: string;
	dbPassword?: string;
	dbDomain?: string;
	dbShowPass?: boolean;
}

const MYSQL = "mysql";
const POSTGRES = "postgresql";
const SQLSERVER = "sqlserver";
const ORACLE = "oracle";
const SQLITE = "sqlite";
const CUSTOM = "custom";

const EDITOR_MODES:ComboBoxOption[] = [
	{ label: Weave.lang("MySQL"), value: MYSQL},
	{ label: Weave.lang("PostGreSQL"), value: POSTGRES},
	{ label: Weave.lang("Microsoft SQL Server"), value: SQLSERVER},
	{ label: Weave.lang("Oracle"), value: ORACLE},
	{ label: Weave.lang("SQLite"), value: SQLITE},
	{ label: Weave.lang("Custom"), value: CUSTOM}
];

export default class ConnectionEditor extends SmartComponent<IConnectionEditorProps, IConnectionEditorState> {
	constructor(props:IConnectionEditorProps)
	{
		super(props);
		this.state = {
			editorMode: "custom",
			showPass: false,
			dbShowPass: false,
		};
	}

	componentWillReceiveProps(nextProps:IConnectionEditorProps)
	{
		if (this.props.connectionName != nextProps.connectionName)
		{
			this.loadFromConnection();
		}
	}

	loadFromConnection=()=>
	{
		this.props.service.getConnectionInfo(this.props.connectionName).then(
			(info)=>{
				this.setState({
					is_superuser: info.is_superuser,
					name: info.name,
					folderName: info.folderName,
					connectString: info.connectString,
					editorMode: CUSTOM
				});
			},
			this.props.handleError
		);
	}

	componentDidMount()
	{

	}

	renderSQLiteConfiguration()
	{

	}

	renderLinkedInput=(entry:string[]):[string, JSX.Element]=>
	{
		let [label, field, type, helpText] = entry;
		let displayType = (type === "password") && !this.state.dbShowPass ? "password" : "text";

		let showPassIcon: JSX.Element = null;

		if (type === "password")
		{
			let iconName = this.state.dbShowPass ? "fa fa-eye fa-lg" : "fa fa-eye-slash fa-lg";
			showPassIcon = <button className="ui button" onClick={() => this.setState({ dbShowPass: !this.state.dbShowPass })}>
				<i className={iconName}/>
			</button>
		}

		return [Weave.lang(label), <Input className={type === "password" ? "action" : ""} key={field} fluid value={(this.state as any)[field]} type={displayType}
			onChange={(evt) => this.setState({ [field]: (evt.target as HTMLInputElement).value }) }>
			{showPassIcon}
		</Input>];
	}

	render():JSX.Element
	{
		let dbEditorDefs: string[][];
		switch (this.state.editorMode) {
			case SQLITE:
				dbEditorDefs = [
					["SQLite Database File", "dbServerAddress", "text"]
				];
				break;
			case MYSQL:
			case ORACLE:
			case POSTGRES:
				dbEditorDefs = [
					["Server Address", "dbServerAddress", "text"],
					["Server Port", "dbServerPort", "text"],
					["Database Name", "dbDatabaseName", "text"],
					["Username", "dbUsername", "text"],
					["Password", "dbPassword", "password"]
				];
				break;
			case SQLSERVER:
				dbEditorDefs = [
					["Server Address", "dbServerAddress", "text"],
					["Server Port", "dbServerPort", "text"],
					["Instance Name", "dbDatabaseName", "text"],
					["Domain", "dbDomain", "text"],
					["Username", "dbUsername", "text"],
					["Password", "dbPassword", "password"]
				];
				break;
			case CUSTOM:
			default:
				dbEditorDefs = [
					["JDBC Connect String", "connectString", "password"]
				];
		};

		let dbEditor = dbEditorDefs.map(this.renderLinkedInput);

		dbEditor.unshift([Weave.lang("Database Type"), <ComboBox options={EDITOR_MODES} 
			value={this.state.editorMode} onChange={(value) => this.setState({ editorMode: value }) }/>])

		let accordion = Accordion.render([
			Weave.lang("Connection Properties"),
			[
				[
					<span>{Weave.lang("Superuser")}<HelpIcon>{Weave.lang("Grant this connection superuser privileges.")}</HelpIcon></span>,
					<Checkbox label=""
						value={!this.state.is_superuser}
						onChange={(value) => this.setState({ is_superuser: !value })}
						/>
				],
				[
					<span>{Weave.lang("Connection Name")}<HelpIcon></HelpIcon></span>,
					<Input type="text" value={this.state.name} onChange={(evt) => this.setState({name: (evt.target as HTMLInputElement).value})}/>
				],
				[
					<span>{Weave.lang("Password")}<HelpIcon></HelpIcon></span>,					
					<Input type={this.state.showPass ? "text" : "password"} value={this.state.pass} onChange={(evt) => this.setState({ pass: (evt.target as HTMLInputElement).value }) }/>
				],
				[
					<span>{Weave.lang("Folder name")}
						<HelpIcon>
							{Weave.lang("Specify the folder relative to the docroot to store configuration files created by this user.") }
						</HelpIcon>
					</span>,
					<Input value={this.state.folderName} onChange={(evt) => this.setState({ folderName: (evt.target as HTMLInputElement).value }) }/>
				]
			]
		],
		[
			Weave.lang("Database Configuration"),
			dbEditor
		]);



		return <VBox className="weave-ToolEditor" style={ { flex: 0.66 } }>
			{accordion}
			<HBox>
				<Button>
					{Weave.lang("Save changes")}
				</Button>
				<Button onClick={this.loadFromConnection}>
					{Weave.lang("Discard changes")}
				</Button>
			</HBox>
		</VBox>
	}
}