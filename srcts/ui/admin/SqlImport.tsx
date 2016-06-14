import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox,VBox} from "../../react-ui/FlexBox";
import Checkbox from "../../semantic-ui/Checkbox";
import ComboBox from "../../semantic-ui/ComboBox";
import Button from "../../semantic-ui/Button";
import StatefulTextField from "../StatefulTextField";
import Accordion from "../../semantic-ui/Accordion";
import PopupWindow from "../../react-ui/PopupWindow";
import SmartComponent from "../SmartComponent";
import Input from "../../semantic-ui/Input";
import ServiceLogin from "./ServiceLogin";

import WeaveDataSource = weavejs.data.source.WeaveDataSource;

import Admin = weavejs.net.Admin;
import WeaveAdminService = weavejs.net.WeaveAdminService;

export interface ISqlImportProps extends React.HTMLProps<SqlImport>
{
	service: WeaveAdminService;
	selectIdFunc: (id: number) => void;
}

export interface ISqlImportState
{
	append?: boolean;
	schema?: string;
	table?: string;
	displayName?: string;
	keyColumn?: string;
	keyColumnValid?: boolean;
	keyType?: string;
	filteredKeyColumns?: string[];
	schemaOptions?: string[];
	tableOptions?: string[];
	columnOptions?: string[];
	keyTypeSuggestions?: string[];
	importInProgress?: boolean;
	errors?: string[];
}

export default class SqlImport extends SmartComponent<ISqlImportProps, ISqlImportState>
{	
	private login: ServiceLogin;

	constructor(props:ISqlImportProps)
	{
		super(props);

		this.state = {
			append: false,
			schema: null,
			table: null,
			displayName: null,
			keyColumn: null,
			keyColumnValid: null,
			keyType: null,
			filteredKeyColumns: [],
			schemaOptions: [],
			tableOptions: [],
			columnOptions: [],
			keyTypeSuggestions: [],
			importInProgress: false,
			errors: []
		};

		this.login = new ServiceLogin(this, this.props.service);

		this.updateKeyTypeSuggestions();
	}

	updateSchemas = () => {
		weavejs.net.Admin.service.getSQLSchemaNames().then(
			(schemaNames: string[]) => this.setState({ schemaOptions: schemaNames }),
			this.handleError
		);
	}

	updateTables=(schema:string)=>
	{
		if (schema)
			this.props.service.getSQLTableNames(schema).then(
				(tableOptions: string[]) => this.setState({ tableOptions }),
				this.handleError
			);
	}

	updateColumns=(schema:string, table:string)=>
	{
		if (schema && table)
			this.props.service.getSQLColumnNames(schema, table).then(
				(columnOptions: string[]) => this.setState({columnOptions}),
				this.handleError
			);
	}

	updateKeyTypeSuggestions=()=>
	{
		this.props.service.getKeyTypes().then(
			(keyTypeSuggestions:string[])=> this.setState({keyTypeSuggestions}),
			this.handleError
		)
	}

	handleError=(error:any):void=>
	{
		if ((error.message as string).startsWith(WeaveAdminService.WEAVE_AUTHENTICATION_EXCEPTION) ||
			(error.message as string).startsWith("RemoteException: Incorrect username or password."))
		{
			if (this.login) this.login.open(() => this.updateSchemas(), () => PopupWindow.close(SqlImport.window));
		}
		else
		{
			this.setState({ errors: this.state.errors.concat([error.toString()]) });	
		}
	}

	testKeyColumn=()=>
	{
		if (this.state.schema && this.state.table && this.state.keyColumn)
			this.props.service.checkKeyColumnsForSQLImport(
				this.state.schema, this.state.table, [this.state.keyColumn]
			).then(
				()=>this.setState({keyColumnValid: true}),
				(error) => {
					this.setState({ keyColumnValid: false });
					this.handleError(error);
				}
			)
	}

	onImportClick=()=>
	{
		/* TODO: Feedback: on success, close the dialog, on failure update a status widget with the error message. */
		this.setState({ importInProgress: true });
		this.props.service.importSQL(
			this.state.schema, this.state.table, this.state.keyColumn,
			null /*secondaryKeyColumnName, deprecated */, this.state.displayName,
			this.state.keyType, this.state.filteredKeyColumns, this.state.append
		).then(
			(newId: number) => {
				this.setState({ importInProgress: false });;
				this.props.selectIdFunc(newId);
				PopupWindow.close(SqlImport.window);
			},
			(error:any)=> {
				this.setState({ importInProgress: false });
				this.handleError(error);
			}
		);
	}

	static window: PopupWindow;
	static open(context:React.ReactInstance, service:WeaveAdminService, selectIdFunc?: (id:number)=>void)
	{
		if (SqlImport.window)
			PopupWindow.close(SqlImport.window);

		SqlImport.window = PopupWindow.open(
			context,
			{
				title: Weave.lang("Import data from SQL"),
				content: <SqlImport service={service} selectIdFunc={selectIdFunc || _.noop}/>,
				resizable: true,
				width: 920,
				footerContent: <div/>,
				height: 675,
				onClose: () => {SqlImport.window = null}
			}
		);
	}

	componentDidMount() {
		this.element = ReactDOM.findDOMNode(this);
		this.updateSchemas();
	}

	componentDidUpdate(prevProps:ISqlImportProps, prevState:ISqlImportState)
	{
		if (prevState)
		{
			if (this.state.schema != prevState.schema)
			{
				this.updateTables(this.state.schema);
			}
			if (this.state.table != prevState.table)
			{
				this.updateColumns(this.state.schema, this.state.table);
			}
		}
	}

	renderErrors():JSX.Element
	{
		if (this.state.errors.length)
		{
			return <div className="ui warning message">
				<i className="close icon" onClick={()=>{this.setState({errors: []})}}></i>
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

	private element: Element;

	render():JSX.Element
	{
		let validityButtonText: React.ReactChild;

		if (this.state.keyColumnValid === true)
		{
			validityButtonText = Weave.lang("OK");
		}
		else if (this.state.keyColumnValid === false)
		{
			validityButtonText = Weave.lang("Keys are not unique.");
		}
		else {
			validityButtonText = Weave.lang("Test");
		}

		return (
			<VBox className="weave-ToolEditor" style={{ justifyContent: "space-between" }}>
				<div style={{ overflow: "auto" }}>
					<div className="ui dividing header">{Weave.lang("Table")}</div>
					<div className="ui left aligned grid">
						<div className="one column row" style={{paddingBottom: 0}}>
							<div className="sixteen wide right aligned column">
								<Checkbox label={Weave.lang("Create a new Weave table entry even if a matching one already exists.") }
								          value={!this.state.append}
								          onChange={(value) => this.setState({ append: !value }) }
								/>
							</div>
						</div>
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("SQL schema")}
								</div>
							</div>
							<div className="twelve wide column">
								<HBox style={{flex:1}}>
									<ComboBox style={{flex: 1}} value= { this.state.schema } options= { this.state.schemaOptions } onChange= {(schema) => {this.setState({ schema });} } fluid={false}/>
									<Button className="attached" title={Weave.lang("Refresh") } onClick={this.updateSchemas}><i className="fa fa-refresh"/></Button>
								</HBox>
							</div>
						</div>
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("SQL table")}
								</div>
							</div>
							<div className="twelve wide column">
								<HBox style={{flex:1}}>
									<ComboBox value={this.state.table} options={this.state.tableOptions} onChange={(table) => {this.setState({ table });} }/>
									<Button className="attached" title={Weave.lang("Refresh") } onClick={this.updateSchemas}><i className="fa fa-refresh"/></Button>
								</HBox>
							</div>
						</div>
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("Table display name")}
								</div>
							</div>
							<div className="twelve wide column">
								<Input type="text" value={this.state.displayName} onChange={(evt) => this.setState({ displayName: (evt.target as HTMLInputElement).value }) }/>
							</div>
						</div>
					</div>
					<div className="ui dividing header">{Weave.lang("Data")}</div>
					<div className="ui left aligned grid">
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("Key column")}
								</div>
							</div>
							<div className="twelve wide column">
								<HBox style={{flex:1}}>
									<ComboBox value= { this.state.keyColumn } options= { this.state.columnOptions } onChange= {(value) => this.setState({ keyColumn: value, keyColumnValid: null }) }/>
									<Button className="attached" onClick={this.testKeyColumn}>{validityButtonText}</Button>
								</HBox>
							</div>
						</div>
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("Key namespace")}
								</div>
							</div>
							<div className="twelve wide column">
								<HBox style={{flex:1}}>
									<ComboBox allowAdditions= { true} value= { this.state.keyType } options= { this.state.keyTypeSuggestions } onChange= {(value) => this.setState({ keyType: value }) }/>
									<Button className="attached" title={Weave.lang("Refresh") } onClick={this.updateKeyTypeSuggestions}><i className="fa fa-refresh"/></Button>
								</HBox>
							</div>
						</div>
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("Filter columns")}
								</div>
							</div>
							<div className="twelve wide column">
								<HBox style={{flex:1}}>
									<ComboBox type="multiple" value={this.state.filteredKeyColumns} options={this.state.columnOptions} onChange={(value) => this.setState({ filteredKeyColumns: value }) }/>
								</HBox>
							</div>
						</div>
						<div className="one column row">
							{this.renderErrors()}
						</div>
					</div>
				</div>
				<HBox style={{ alignSelf: "flex-end" }}>
						<Button colorClass="primary" disabled={this.state.importInProgress} onClick={this.onImportClick}>{Weave.lang("Import") }</Button>
						<Button colorClass="secondary" disabled={this.state.importInProgress} onClick={() => PopupWindow.close(SqlImport.window) }>{Weave.lang("Cancel") }</Button>
				</HBox>
			</VBox>
		)
	}
}
