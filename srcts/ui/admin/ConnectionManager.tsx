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
import ConnectionEditor from "./ConnectionEditor";
import ServiceLogin from "./ServiceLogin";
import ConfigurationStorageEditor from "./ConfigurationStorageEditor";
import LogComponent from "./LogComponent";

import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveAdminService = weavejs.net.WeaveAdminService;

export interface IConnectionManagerProps {
	service: WeaveAdminService;
}

export interface IConnectionManagerState {
	errors?: string[];
	messages?: string[];
	connections?: string[];
	dbConfigInfo?: DatabaseConfigInfo;
	selected?: string;
}

export default class ConnectionManager extends SmartComponent<IConnectionManagerProps, IConnectionManagerState>
{

	private service: WeaveAdminService;
	private login: ServiceLogin;
	constructor(props:IConnectionManagerProps)
	{
		super(props);
		this.state = {
			errors: [],
			messages: [],
			connections: [],
			dbConfigInfo: null,
			selected: null
		};
		this.login = new ServiceLogin(this, this.props.service);
	}

	static window: PopupWindow;
	static open(context:React.ReactInstance, service:WeaveAdminService, selectIdFunc?: (id: number) => void) {
		if (ConnectionManager.window)
			PopupWindow.close(ConnectionManager.window);

		ConnectionManager.window = PopupWindow.open(
			context,
			{
				title: Weave.lang("Import from SQL"),
				content: <ConnectionManager service={service}/>,
				modal: true,
				resizable: true,
				footerContent: <div/>,
				width: 920,
				height: 675,
				onClose: () => { ConnectionManager.window = null }
			}
		);
	}

	private element: Element;
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		this.updateConnections();
	}

	handleError=(error:any): void => {
		if ((error.message as string).startsWith(WeaveAdminService.WEAVE_AUTHENTICATION_EXCEPTION) ||
			(error.message as string).startsWith("RemoteException: Incorrect username or password."))
		{
			if (this.login) this.login.open(this.updateConnections, () => PopupWindow.close(ConnectionManager.window));
		}
		else
		{
			this.setState({ errors: this.state.errors.concat([error.toString()]) });
		}
	}

	updateConnections=()=>{
		this.props.service.getConnectionNames().then(
			(connections) => this.setState({ connections }),
			this.handleError
		);

		this.props.service.getDatabaseConfigInfo().then(
			(dbConfigInfo) => this.setState({ dbConfigInfo }),
			this.handleError
		);
	}

	private connectionToOption = (connection: string): ListOption => {
		let isConfigConnection: boolean = this.state.dbConfigInfo && this.state.dbConfigInfo.connection == connection;
		let style: React.CSSProperties = {
			fontWeight: isConfigConnection ? "bold" : "normal"
		};

		let title = isConfigConnection ?
			Weave.lang("Connection {0} is the current configuration storage location.", connection) :
			Weave.lang("Connection {0}", connection);

		return {
			value: connection,
			label: <span title={title} style={style}>{connection}</span>
		};
	}

	createNewConnection=()=>
	{
		this.setState({ selected: null });
	}

	removeSelectedConnection = () => {
		/* TODO: Use a prettier/async confirmation dialog, placeholder for now. */
		if (window.confirm(Weave.lang("Are you sure you want to delete the connection {0}", this.state.selected)))
			this.removeConnection(this.state.selected);
	}

	removeConnection=(connection:string)=>
	{
		this.props.service.removeConnectionInfo(connection).then(
			this.updateConnections, this.handleError
		);
	}

	render():JSX.Element
	{
		let options = this.state.connections.map(this.connectionToOption);
		return <VBox className="weave-padded-vbox" style={ { flex: 1, overflow: 'auto' } }>
			<HBox className="weave-padded-hbox" style={ { flex: 1 } }>
				<VBox className="weave-padded-vbox" style={ {flex: 0.33 } }>
					<div>{this.props.service.user ? Weave.lang("Signed in as '{0}'.", this.props.service.user) : Weave.lang("Not signed in.") }</div>
					<VBox className="weave-container" style={ { flex: 1, padding: 0 } }>
						
						<List selectedValues={[this.state.selected]} options={options} 
						onChange={(selectedValues: any[]) => this.setState({ selected: selectedValues[0] }) }/>
					</VBox>
					<HBox>
						<Button title={Weave.lang("Create new connection")} style={{flex:"1", borderTopRightRadius:0, borderBottomRightRadius:0}}
							onClick={this.createNewConnection}>
							<i className="fa fa-plus fa-fw"/>
							{Weave.lang("New Connection")}
						</Button>
						<Button disabled={!this.state.selected} title={Weave.lang("Remove selected connection")} style={{ flex: "1", borderRadius: 0}}
							onClick={this.removeSelectedConnection}>
							<i className="fa fa-minus fa-fw"/>
							{Weave.lang("Remove Connection") }
						</Button>
						<Button title={Weave.lang("Refresh connection names.")} style={{ flex: "1", borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
							onClick={this.updateConnections}>
							<i className="fa fa-refresh fa-fw"/>
						</Button>
					</HBox>
					<Button title={Weave.lang("Manage configuration storage...")} onClick={()=>ConfigurationStorageEditor.open(this, this.props.service)}>
						{Weave.lang("Manage configuration storage...")}
					</Button>
				</VBox>
				<ConnectionEditor refreshFunc={this.updateConnections} service={this.props.service} connectionName={this.state.selected} handleError={this.handleError} handleMessage={_.noop}/>
			</HBox>
			<LogComponent header={Weave.lang("Server error") } messages={this.state.errors} clearFunc={() => { this.setState({ errors: [] }) } }/>
		</VBox>
	}
}