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
import WeavePromise = weavejs.util.WeavePromise;
import StandardLib = weavejs.util.StandardLib;

export interface ILinkedInputProps {
	field: string,
	outerComponent: React.Component<any,any>,
	type?: string
}
export class LinkedInput extends React.Component<ILinkedInputProps, Object>
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
	handleMessage: (message: string) => void;
	handleSuccessfulSave: (message: string, password: string) => void;
}

export interface IConnectionEditorState {
	is_superuser?: boolean;
	name?: string;
	pass?: string;
	folderName?: string;
	passShow?: boolean;
	connectString?: string;

	editorMode?: string;

	dbServerAddress?: string; /* Also used for path in SQLite */
	dbServerPort?: string;
	dbDatabaseName?: string; /* Also used for instance name in SQLSERVER */
	dbUsername?: string;
	dbPassword?: string;
	dbDomain?: string;
	dbPasswordShow?: boolean;
}

const CUSTOM = "custom";

const EDITOR_MODES:ComboBoxOption[] = [
	{ label: Weave.lang("MySQL"), value: ConnectionInfo.MYSQL},
	{ label: Weave.lang("PostGreSQL"), value: ConnectionInfo.POSTGRESQL},
	{ label: Weave.lang("Microsoft SQL Server"), value: ConnectionInfo.SQLSERVER},
	{ label: Weave.lang("Oracle"), value: ConnectionInfo.ORACLE},
	{ label: Weave.lang("SQLite"), value: ConnectionInfo.SQLITE},
	{ label: Weave.lang("Custom"), value: CUSTOM}
];

export default class ConnectionEditor extends SmartComponent<IConnectionEditorProps, IConnectionEditorState> {
	constructor(props:IConnectionEditorProps)
	{
		super(props);
		this.state = {
			name: "",
			pass: "",
			folderName: "",
			editorMode: "custom",
			dbPasswordShow: false,
			passShow: false
		};
	}

	componentWillReceiveProps(nextProps:IConnectionEditorProps)
	{
		if (this.props.connectionName != nextProps.connectionName)
		{
			this.loadFromConnection(nextProps.connectionName);
		}
	}

	saveConnection=(overwrite:boolean)=>
	{
		let info = new ConnectionInfo()
		info.is_superuser = !!this.state.is_superuser;
		info.name = this.state.name;
		info.pass = this.state.pass;
		info.folderName = this.state.folderName;
		info.connectString = this.connectString;

		let savePromise: WeavePromise<string>;

		/* If we're editing the connection we have selected, bypass the overwrite confirmation dialog. */
		savePromise = this.props.service.saveConnectionInfo(info, (info.name === this.props.connectionName) || overwrite);
		savePromise.then(this.props.handleMessage, this.props.handleError).then(() => this.props.handleSuccessfulSave(info.name, info.pass));
	}

	loadFromConnection=(connectionName:string)=>
	{
		this.props.service.getConnectionInfo(connectionName).then(
			(info)=>{
				this.setState({
					is_superuser: info ? info.is_superuser : false,
					name: info ? info.name : "",
					pass: info ? info.pass : "",
					folderName: info ? info.folderName : "",
					connectString: info ? info.connectString : "",
					editorMode: CUSTOM
				});
			},
			this.props.handleError
		);
	}

	renderLinkedInput=(entry:[React.ReactChild, string, string, React.ReactChild, string]):[React.ReactChild, JSX.Element]=>
	{
		let [label, field, type, helpText, placeholder] = entry;
		let showPass = (this.state as any)[field + "Show"] as boolean;
		let displayType = (type === "password") && !showPass ? "password" : "text";

		let showPassIcon: JSX.Element = null;
		let leftColumn: React.ReactChild = label;

		if (helpText)
		{
			leftColumn = <span>{label}<HelpIcon>{helpText}</HelpIcon></span>
		}

		if (type === "password")
		{
			let iconName = showPass ? "fa fa-eye fa-lg" : "fa fa-eye-slash fa-lg";
			showPassIcon = <button title={showPass ? Weave.lang("Hide password") : Weave.lang("Show password") } className="ui button" onClick={() => {
				let option: any = {};
				option[field + "Show"] = !(this.state as any)[field + "Show"];
				this.setState(option);
			}}>
				<i className={iconName}/>
			</button>
		}

		return [leftColumn, <Input placeholder={placeholder} className={type === "password" ? "action" : ""} key={field} fluid value={(this.state as any)[field]} type={displayType}
			onChange={(evt) => this.setState({ [field]: (evt.target as HTMLInputElement).value }) }>
			{showPassIcon}
		</Input>];
	}

	get connectString():string
	{
		if (this.state.editorMode == CUSTOM)
		{
			return this.state.connectString;
		}
		else
		{
			return ConnectionEditor.getConnectString(
				this.state.editorMode,
				this.state.dbServerAddress || "",
				this.state.dbServerPort || "",
				this.state.dbDatabaseName || "",
				this.state.dbUsername || "",
				this.state.dbPassword || "",
				this.state.dbDomain || "");
		}
	}

	private static DBNAME_MESSAGE = `This field is optional.
You can specify the name of a default database to connect to.
For SQL Server, this is an instance name.
Similarly in PostGreSQL, databases are different from schemas.
MySQL does not differentiate between the two.`;
	private static ADDRESS_MESSAGE = `The hostname or IP address of the database server to connect to.`;
	private static PORT_MESSAGE = `The port on the database server to connect to. If left blank, the default port for the database type selected will be used.`;

	render():JSX.Element
	{

		let connectionPropertyEditorDefs: [React.ReactChild, string, string, React.ReactChild][] = [
			["Connection Name", "name", "text", null],
			["Password", "pass", "password", null],
			["Folder Name", "folderName", "text", "Specify the folder relative to the docroot to store configurations files created by this user."]
		]

		let connectionPropertyEditors = connectionPropertyEditorDefs.map(this.renderLinkedInput);

		connectionPropertyEditors.unshift(
			[<span>{Weave.lang("Superuser") }<HelpIcon>{Weave.lang("Grant this connection superuser privileges.") }</HelpIcon></span>, <Checkbox label=" "
				value={this.state.is_superuser}
				onChange={(value) => this.setState({ is_superuser: value }) }
				/>]);

		let dbEditorDefs: [React.ReactChild, string, string, React.ReactChild, string][];
		switch (this.state.editorMode) {
			case ConnectionInfo.SQLITE:
				dbEditorDefs = [
					["SQLite Database File", "dbDatabaseName", "text", Weave.lang("An absolute path to an SQLite database file. Ensure that your application server has permission to access this file"), null]
				];
				break;
			case ConnectionInfo.MYSQL:
			case ConnectionInfo.ORACLE:
			case ConnectionInfo.POSTGRESQL:
				dbEditorDefs = [
					["Server Address", "dbServerAddress", "text", Weave.lang(ConnectionEditor.ADDRESS_MESSAGE), null],
					["Server Port", "dbServerPort", "text", Weave.lang(ConnectionEditor.PORT_MESSAGE), String(ConnectionInfo.getDefaultPort(this.state.editorMode))],
					["Database Name", "dbDatabaseName", "text", Weave.lang(ConnectionEditor.DBNAME_MESSAGE), null],
					["Username", "dbUsername", "text", null, null],
					["Password", "dbPassword", "password", null, null]
				];
				break;
			case ConnectionInfo.SQLSERVER:
				dbEditorDefs = [
					["Server Address", "dbServerAddress", "text", Weave.lang(ConnectionEditor.ADDRESS_MESSAGE), null],
					["Server Port", "dbServerPort", "text", Weave.lang(ConnectionEditor.PORT_MESSAGE), String(ConnectionInfo.getDefaultPort(this.state.editorMode))],
					["Instance Name", "dbDatabaseName", "text", Weave.lang(ConnectionEditor.DBNAME_MESSAGE), null],
					["Domain", "dbDomain", "text", null, null],
					["Username", "dbUsername", "text", null, null],
					["Password", "dbPassword", "password", null, null]
				];
				break;
			case CUSTOM:
			default:
				dbEditorDefs = [
					["JDBC Connect String", "connectString", "password", null, null]
				];
		};

		let dbEditors = dbEditorDefs.map(this.renderLinkedInput);

		dbEditors.unshift([Weave.lang("Database Type"), <ComboBox options={EDITOR_MODES} 
			value={this.state.editorMode} onChange={(value) => this.setState({ editorMode: value }) }/>])



		return <VBox className="weave-ToolEditor" style={ { flex: 0.66, justifyContent: "space-between"} }>
			<HBox style={{ overflow: "auto", flex: 1 }}>
			{Accordion.render(
				[
					Weave.lang("Connection Properties"),
					connectionPropertyEditors
				],
				[
					Weave.lang("Database Configuration"),
					dbEditors
				]
			)}
			</HBox>
			<HBox style={{ alignSelf: "flex-end" }}>
				<Button colorClass="primary" onClick={() => this.saveConnection(false)}>
					{Weave.lang("Save changes")}
				</Button>
				<Button style={{marginLeft: 8}} colorClass="secondary" onClick={() => this.loadFromConnection(this.props.connectionName)}>
					{Weave.lang("Discard changes")}
				</Button>
			</HBox>
		</VBox>
	}

	/**
	* @param dbms The name of a DBMS (MySQL, PostGreSQL, Microsoft SQL Server)
	* @param ip The IP address of the DBMS.
	* @param port The port the DBMS is on (optional, can be "" to use default).
	* @param database The name of a database to connect to (can be "" for MySQL)
	* @param user The username to use when connecting.
	* @param pass The password associated with the username.
	* @param domain The domain paramter for a SQLServer connection.
	* @return A connect string that can be used in the getConnection() function.
	*/
	static getConnectString(dbms:string, ip:string, port:string, database:string, user:string, pass:string, domain:string):string
	{
		var host: string;
		if (!port)
			host = ip; // default port for specific dbms will be used
		else
			host = ip + ":" + port;

		// in format strings: {0}=dbms,{1}=host,{2}=database,{3}=user,{4}=pass,{5}=domain

		var format: string = null;
		if (dbms == ConnectionInfo.SQLSERVER) 
		{
				dbms = "sqlserver"; // this will be put in the format string
			if (user || pass)
				format = "jdbc:jtds:{0}://{1}/;instance={2};domain={5};user={3};password={4}";
			else
				format = "jdbc:jtds:{0}://{1}/;instance={2};domain={5}";
		}
		else if (dbms == ConnectionInfo.SQLITE) {
			format = "jdbc:{0}:{2}";
			// jdbc:sqlite:C:\\path\\to\\file.db
		}
		else if (dbms == ConnectionInfo.ORACLE) {
			if (user || pass)
				format = "jdbc:{0}:thin:{3}/{4}@{1}:{2}";
			else
				format = "jdbc:{0}:thin:{1}:{2}";
			//"jdbc:oracle:thin:<user>/<password>@<host>:<port>:<instance>"
		}
		else // MySQL or PostGreSQL
		{
			if (user || pass)
				format = "jdbc:{0}://{1}/{2}?user={3}&password={4}";
			else
				format = "jdbc:{0}://{1}/{2}";
		}

		// MySQL connect string uses % as an escape character, so we must use URLEncoder.
		// PostGreSQL does not support % as an escape character, and does not work with the & character.
		if (dbms == ConnectionInfo.MYSQL) {
			database = encodeURIComponent(database);
			user = encodeURIComponent(user);
			pass = encodeURIComponent(pass);
		}

		var result: string = StandardLib.substitute(format, dbms.toLowerCase(), host, database, user, pass, domain);

		return result;
	}
}