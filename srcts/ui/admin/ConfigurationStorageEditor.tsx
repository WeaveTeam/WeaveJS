import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "../../react-ui/FlexBox";
import Checkbox from "../../semantic-ui/Checkbox";
import {ComboBoxOption} from "../../semantic-ui/ComboBox";
import ComboBox from "../../semantic-ui/ComboBox";
import {LinkedInput} from "./ConnectionEditor";
import Button from "../../semantic-ui/Button";
import StatefulTextField from "../StatefulTextField";
import Accordion from "../../semantic-ui/Accordion";
import PopupWindow from "../../react-ui/PopupWindow";
import SmartComponent from "../SmartComponent";
import Input from "../../semantic-ui/Input";
import List from "../../react-ui/List";
import HelpIcon from "../../react-ui/HelpIcon";
import LogComponent from "./LogComponent";

import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveAdminService = weavejs.net.WeaveAdminService;
import WeavePromise = weavejs.util.WeavePromise;
import StandardLib = weavejs.util.StandardLib;

export interface IConfigurationStorageEditorProps
{
	service: WeaveAdminService;
}

export interface IConfigurationStorageEditorState
{
	/* The world as it is */
	connectionNames?: string[];
	currentConnectionName?: string;

	/* The world as it shall be */
	connectionName?: string;
	connectionPassword?: string;
	schemaName?: string;
	showAdvancedOptions?: boolean;
	metadataIdFields?: string;
	errors?: string[];
	messages?: string[];
}

export default class ConfigurationStorageEditor extends SmartComponent<IConfigurationStorageEditorProps, IConfigurationStorageEditorState>
{
	constructor(props:IConfigurationStorageEditorProps)
	{
		super(props);

		this.state = {errors: [], messages: []};
	}

	updateCurrentConnection()
	{
		this.props.service.getConnectionNames().then(
			(connectionNames) => { 
				this.setState({ connectionNames });
			},
			this.handleError
		);

		this.props.service.getDatabaseConfigInfo().then(
			(info) => {
				this.setState({
					currentConnectionName: info.connection,
					connectionName: info.connection,
					schemaName: info.schema,
					metadataIdFields: weavejs.WeaveAPI.CSVParser.createCSVRow(info.idFields || [])
				});
			},
			this.handleError
		);
	}

	componentDidUpdate()
	{
		console.log(this.state);
	}

	componentDidMount() {
		this.updateCurrentConnection();
	}

	static window: PopupWindow;
	static open(context: React.ReactInstance, service:WeaveAdminService) {
		if (ConfigurationStorageEditor.window)
			PopupWindow.close(ConfigurationStorageEditor.window);

		ConfigurationStorageEditor.window = PopupWindow.open(
			context,
			{
				title: Weave.lang("Configuration Storage"),
				content: <ConfigurationStorageEditor service={service}/>,
				modal: true,
				resizable: true,
				width: 600,
				height: 600,
				footerContent: <div/>,
				onClose: () => { ConfigurationStorageEditor.window = null }
			}
		);
	}

	static close()
	{
		PopupWindow.close(ConfigurationStorageEditor.window);
		ConfigurationStorageEditor.window = null;
	}

	handleError=(error:any)=>
	{
		this.setState({ errors: this.state.errors.concat([error.toString()]) });
	}

	handleMessage =(message: string)=>
	{
		this.setState({ messages: this.state.messages.concat([message.toString()]) });
	}

	save=(): void=>
	{
		let idFields: string[] = weavejs.WeaveAPI.CSVParser.parseCSVRow(this.state.metadataIdFields);
		this.props.service.setDatabaseConfigInfo(this.state.connectionName, this.state.connectionPassword, this.state.schemaName, idFields).then(
			this.handleMessage,
			this.handleError
		);
	}
	render():JSX.Element
	{
		let metadataIdRowStyle = this.state.showAdvancedOptions ? {} : { display: "none" };

		return <VBox className="weave-ToolEditor">
			<p>{Weave.lang("Configuration info for Weave must be stored in an SQL database.")}</p>
			<p>{Weave.lang('You are currently using the "{0}" connection to store configuration data.', this.state.currentConnectionName)}</p>
			<p>{Weave.lang("You may switch to a different location, but the existing configuration data will not be copied over.")}</p>
			<div className="ui left aligned grid">
				<div className="two column row" style={{paddingBottom: 0}}>
					<div className="four wide right aligned column">
						<div className="ui basic segment">
							{Weave.lang("Connection to use")}
						</div>
					</div>
					<div className="twelve wide column">
						<ComboBox style={{flex:1}} value={this.state.connectionName} options={this.state.connectionNames || []}
							onChange={(value: string) => {this.setState({connectionName: value})}}/>
					</div>
				</div>
				<div className="two column row" style={{ paddingBottom: 0 }}>
					<div className="four wide right aligned column">
						<div className="ui basic segment">
							{Weave.lang("Password")}
						</div>
					</div>
					<div className="twelve wide column">
						<LinkedInput field="connectionPassword" type="password" outerComponent={this}/>
					</div>
				</div>
				<div className="two column row" style={{ paddingBottom: 0 }}>
					<div className="four wide right aligned column">
						<div className="ui basic segment">
							{Weave.lang("Database schema") }
						</div>
					</div>
					<div className="twelve wide column">
						<LinkedInput field="schemaName" type="text" outerComponent={this}/>
					</div>
				</div>
				<div className="one column row">
					<div className="sixteen wide right aligned column">
						<Checkbox label={Weave.lang("Show advanced options")} 
							value={this.state.showAdvancedOptions} 
							onChange={(value:boolean)=>this.setState({showAdvancedOptions: value})}/>
					</div>
				</div>
				<div className="two column row" style={metadataIdRowStyle}>
					<div className="four wide right aligned column">
						<div className="ui basic segment">
							{Weave.lang("Metadata ID field(s)")}
							<HelpIcon>
								{Weave.lang("Use this only if you want to use your own custom properties to uniquely identify data columns.")}
							</HelpIcon>
						</div>
					</div>
					<div className="twelve wide column">
						<LinkedInput field="metadataIdFields" type="text" outerComponent={this}/>
					</div>
				</div>
				<div className="one column row">
					<div className="sixteen wide column">
						<div className="ui basic segment">
							{Weave.lang("The following tables will be created in the schema specified above:")}
							{Weave.lang("	weave_hiearchy, weave_meta_private, weave_meta_public")}
							{Weave.lang("If they already exist, no changes will be made.")}
						</div>
					</div>
				</div>
			</div>
			<LogComponent uiClass="positive" header={Weave.lang("Server error")} messages={this.state.errors} clearFunc={() => { this.setState({ errors: [] }) } }/>
			<LogComponent header={Weave.lang("Completed") } messages={this.state.messages} clearFunc={() => { this.setState({ messages: [] }) } }/>
			<HBox>
				<Button colorClass="primary" onClick={this.save}>{Weave.lang("Store Weave configuration at this location") }</Button>
				<Button colorClass="secondary" onClick={() => ConfigurationStorageEditor.close() }>{Weave.lang("Cancel") }</Button>
			</HBox>
		</VBox>;
	}
}