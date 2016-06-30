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
import HelpIcon from "../../react-ui/HelpIcon";
import LogComponent from "./../../react-ui/LogComponent";

import WeavePromise = weavejs.util.WeavePromise;
import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import Admin = weavejs.net.Admin;
import WeaveAdminService = weavejs.net.WeaveAdminService;
import ReactUtils from "../../utils/ReactUtils";

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
	keyColumnTestInProgress?: boolean;
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
			if (this.login) this.login.open(() => this.updateSchemas());
		}
		else
		{
			this.setState({ errors: this.state.errors.concat([error.toString()]) });	
		}
	}

	testKeyColumn=()=>
	{
		if (this.state.schema && this.state.table && this.state.keyColumn)
		{
			this.setState({ keyColumnTestInProgress: true });
			let columnCheck = this.props.service.checkKeyColumnsForSQLImport(
				this.state.schema, this.state.table, [this.state.keyColumn]
			);
			columnCheck.then(
					() => { this.setState({ keyColumnValid: true, keyColumnTestInProgress: false});},
					(error) => {
						if (error && (error.message as string).startsWith("RemoteException: Values in the selected column do not uniquely identify rows in the table."))
						{
							this.setState({ keyColumnValid: false, keyColumnTestInProgress: false });	
						}
						else
						{
							this.setState({ keyColumnValid: null, keyColumnTestInProgress: false });
							this.handleError(error);
						}
					}
				);
		}
	}

	onImportClick=()=>
	{
		this.setState({ importInProgress: true });

		this.props.service.checkKeyColumnsForSQLImport(this.state.schema, this.state.table, [this.state.keyColumn]).then(
			():WeavePromise<number> => {
				return this.props.service.importSQL(
					this.state.schema, this.state.table, this.state.keyColumn,
					null /*secondaryKeyColumnName, deprecated */, this.state.displayName,
					this.state.keyType, this.state.filteredKeyColumns, this.state.append
				);
			}
		).then(
			(newId: number) => {
				this.setState({ importInProgress: false });;
				this.props.selectIdFunc(newId);
				PopupWindow.close(this);
			},
			(error: any) => {
				this.setState({ importInProgress: false });
				this.handleError(error);
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

	private element: Element;

	render():JSX.Element
	{
		let validityButtonText: string;
		let iconColor: string;
		let keyColumnTestIconClass: string;
		if (this.state.keyColumnTestInProgress)
		{
			keyColumnTestIconClass = "fa fa-fw fa-circle-o-notch fa-spinner"
			validityButtonText = Weave.lang("The selected column is currently being tested for value uniqueness.");
		}
		else
		{
			if (this.state.keyColumnValid === true) {
				keyColumnTestIconClass = "fa fa-fw fa-check-circle-o";
				iconColor = "green";
				validityButtonText = Weave.lang("The selected column contains unique values.");
			}
			else if (this.state.keyColumnValid === false) {
				keyColumnTestIconClass = "fa fa-fw fa-exclamation-circle";
				iconColor = "red";
				validityButtonText = Weave.lang("The selected column does not contain unique values.");
			}
			else {
				keyColumnTestIconClass = "fa fa-fw fa-circle-o"
				iconColor = null;
				validityButtonText = Weave.lang("The selected column has not been tested for value uniqueness. Click to test.");
			}			
		}


		return (
			<VBox className="weave-ToolEditor" style={{ justifyContent: "space-between", flex: 1 }}>
				<div style={{ overflow: "auto", flex: 1 }}>
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
								<HBox overflow style={{flex:1}}>
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
								<HBox overflow style={{flex:1}}>
									<ComboBox value={this.state.table} options={this.state.tableOptions} onChange={(table) => {this.setState({ table });} }/>
									<Button className="attached" title={Weave.lang("Refresh") } onClick={this.updateSchemas}><i className="fa fa-refresh"/></Button>
								</HBox>
							</div>
						</div>
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("Table display name") }
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
									{Weave.lang("Key column")+" "}
									<HelpIcon>
											{Weave.lang("A Column that can uniquely identify each row in the data.")}
									</HelpIcon>
								</div>
							</div>
							<div className="twelve wide column">
								<HBox overflow style={{flex:1}}>
									<ComboBox value= { this.state.keyColumn } options= { this.state.columnOptions } onChange= {(value) => {
										if (value != this.state.keyColumn)
											this.setState({ keyColumn: value, keyColumnValid: null });
										}
									}/>
									<Button disabled={!this.state.keyColumn} title={validityButtonText} className="attached" onClick={this.testKeyColumn}>
										<span style={{ whiteSpace: "nowrap" }}><i style={{ color: iconColor }} className={keyColumnTestIconClass}/>{Weave.lang("Test")}</span>
									</Button>
								</HBox>
							</div>
						</div>
						<div className="two column row" style={{paddingBottom: 0}}>
							<div className="four wide right aligned column">
								<div className="ui basic segment">
									{Weave.lang("Key namespace") + " "}
									<HelpIcon>{Weave.lang("Key namespaces are used to link tables using matching key columns.") }</HelpIcon>
								</div>
							</div>
							<div className="twelve wide column">
								<HBox overflow style={{flex:1}}>
									<ComboBox allowAdditions={true} type="search"
										onNew={(keyType: string): void => {
											this.setState({ keyType })
										}} value= {this.state.keyType} options= { this.state.keyTypeSuggestions } onChange= {(value) => this.setState({ keyType: value }) }/>
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
								<HBox overflow style={{flex:1}}>
									<ComboBox type="multiple" value={this.state.filteredKeyColumns} options={this.state.columnOptions} onChange={(value) => this.setState({ filteredKeyColumns: value }) }/>
								</HBox>
							</div>
						</div>
						<div className="one column row">
							<LogComponent clearFunc={()=>this.setState({errors: []})} header="Server error" messages={this.state.errors}/>
						</div>
					</div>
				</div>
				<HBox style={{ alignSelf: "flex-end" }}>
					<Button colorClass="primary" disabled={this.state.importInProgress} onClick={this.onImportClick}>{Weave.lang("Import") }</Button>
					<Button colorClass="secondary" disabled={this.state.importInProgress} onClick={() => PopupWindow.close(this) }>{Weave.lang("Cancel") }</Button>
				</HBox>
			</VBox>
		)
	}
}
