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

import ConnectionInfo = weavejs.net.beans.ConnectionInfo;
import DatabaseConfigInfo = weavejs.net.beans.DatabaseConfigInfo;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import WeaveAdminService = weavejs.net.WeaveAdminService;

export interface IConnectionManagerProps {
	dataSource: WeaveDataSource;
}

export interface IConnectionManagerState {
	errors?: string[];
	connections?: string[];
	dbConfigInfo?: DatabaseConfigInfo;
	selected?: string;
}

export default class ConnectionManager extends SmartComponent<IConnectionManagerProps, IConnectionManagerState>
{

	private service: WeaveAdminService;
	constructor(props:IConnectionManagerProps)
	{
		super(props);
		this.state = {
			errors: [],
			connections: [],
			dbConfigInfo: null,
			selected: null
		};
		this.service = new WeaveAdminService(ConnectionManager.getBaseUrl(props.dataSource.url.value));
	}

	private static getBaseUrl(serviceUrl: string): string {
		if (!serviceUrl) return "/WeaveServices";
		/* TODO: Use a proper URL parsing library to get the base URL */
		let pathComponents = serviceUrl.split('/');
		pathComponents.pop();
		return pathComponents.join('/');
	}


	renderErrors(): JSX.Element {
		if (this.state.errors.length) {
			return <div className="ui warning message">
				<i className="close icon" onClick={() => { this.setState({ errors: [] }) } }></i>
				<div className="header">
					{Weave.lang("Server Error") }
				</div>
				<ul className="list">
					{this.state.errors.map((message, idx) => (<li key={idx}>{message}</li>)) }
				</ul>
			</div>;
		}
		else
		{
			return <div/>;
		}
	}

	static window: PopupWindow;
	static open(ds: WeaveDataSource, selectIdFunc?: (id: number) => void) {
		if (ConnectionManager.window)
			PopupWindow.close(ConnectionManager.window);

		ConnectionManager.window = PopupWindow.open(
			{
				title: Weave.lang("Import from SQL"),
				content: <ConnectionManager dataSource={ds}/>,
				modal: true,
				resizable: true,
				width: 920,
				height: 675,
				onClose: () => { ConnectionManager.window = null }
			});
	}

	element: Element;
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this);
		this.updateConnections();
	}

	handleError=(error:any): void => {
		this.setState({ errors: this.state.errors.concat([error.toString()]) });
	}

	updateConnections=()=>{
		this.service.getConnectionNames().then(
			(connections) => this.setState({ connections }),
			this.handleError
		);

		this.service.getDatabaseConfigInfo().then(
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
			Weave.lang("Connection {0}", connection) :
			Weave.lang("Connection {0} is the current configuration storage location.", connection);

		return {
			value: connection,
			label: <span title={title} style={style}>{connection}</span>
		};
	}

	createNewConnection=()=>
	{
		this.setState({ selected: null });
	}

	connectionSelector = ($(this.element) as any);

	removeSelectedConnection = () => {
		/* TODO: Use a prettier/async confirmation dialog, placeholder for now. */
		if (window.confirm(Weave.lang("Are you sure you want to delete the connection {0}", this.state.selected)))
			this.removeConnection(this.state.selected);
	}

	removeConnection=(connection:string)=>
	{
		this.service.removeConnectionInfo(connection).then(
			this.updateConnections, this.handleError
		);
	}

	render():JSX.Element
	{
		let options = this.state.connections.map(this.connectionToOption);
		return <VBox className="weave-padded-vbox" style={ { flex: 1, overflow: 'auto' } }>
			<HBox className="weave-padded-hbox" style={ { flex: 1 } }>
				<VBox className="weave-padded-vbox" style={ {flex: 0.33 } }>
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
				</VBox>
				<ConnectionEditor service={this.service} connectionName={this.state.selected} handleError={this.handleError}/>
			</HBox>
		{ this.renderErrors() }
		</VBox>
	}
}