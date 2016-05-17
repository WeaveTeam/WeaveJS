import * as React from "react";
import {HBox,VBox} from "../../react-ui/FlexBox";
import Checkbox from "../../semantic-ui/Checkbox";
import ComboBox from "../../semantic-ui/ComboBox";
import Button from "../../semantic-ui/Button";
import StatefulTextField from "../StatefulTextField";
import Accordion from "../../semantic-ui/Accordion";
import PopupWindow from "../../react-ui/PopupWindow";
import SmartComponent from "../SmartComponent";
import Input from "../../semantic-ui/Input";

import Admin = weavejs.net.Admin;
import WeaveAdminService = weavejs.net.WeaveAdminService;

export interface ISqlImportProps extends React.HTMLProps<SqlImport>
{
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
	errors?: string[];
}

export default class SqlImport extends SmartComponent<ISqlImportProps, ISqlImportState>
{
	private service:WeaveAdminService;

	constructor(props:ISqlImportProps)
	{
		super(props);
		this.service = weavejs.net.Admin.service;

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
			errors: []
		};
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
			this.service.getSQLTableNames(schema).then(
				(tableOptions: string[]) => this.setState({ tableOptions }),
				this.handleError
			);
	}

	updateColumns=(schema:string, table:string)=>
	{
		if (schema && table)
			this.service.getSQLColumnNames(schema, table).then(
				(columnOptions: string[]) => this.setState({columnOptions}),
				this.handleError
			);
	}

	updateKeyTypeSuggestions=()=>
	{
		this.service.getKeyTypes().then(
			(keyTypeSuggestions:string[])=> this.setState({keyTypeSuggestions}),
			this.handleError
		)
	}

	handleError=(error:any):void=>
	{
		this.setState({ errors: this.state.errors.concat([error.toString()]) });
	}

	testKeyColumn=()=>
	{
		if (this.state.schema && this.state.table && this.state.keyColumn)
			this.service.checkKeyColumnsForSQLImport(
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
		this.service.importSQL(
			this.state.schema, this.state.table, this.state.keyColumn,
			null /*secondaryKeyColumnName, deprecated */, this.state.displayName,
			this.state.keyType, this.state.filteredKeyColumns, this.state.append
		).then(null, this.handleError);
	}

	static window: PopupWindow;
	static open()
	{
		if (SqlImport.window)
			PopupWindow.close(SqlImport.window);

		SqlImport.window = PopupWindow.open(
			{
				title: Weave.lang("Import from SQL"),
				content: <SqlImport/>,
				resizable: true,
				width: 920,
				height: 675,
				onClose: SqlImport.close
			});
	}

	componentDidMount() {
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

	static close()
	{
		SqlImport.window = null;
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

	render():JSX.Element
	{

		let validityButton: React.ReactChild;
		console.log(this.state);

		if (this.state.keyColumnValid === true)
		{
			validityButton = Weave.lang("OK");
		}
		else if (this.state.keyColumnValid === false)
		{
			validityButton = Weave.lang("Keys are not unique.");
		}
		else
		{
			validityButton = <Button onClick={this.testKeyColumn}>{Weave.lang("Test") }</Button>;
		}
		let accordion = Accordion.render([
			Weave.lang("Table"),
				[
					[
						<Checkbox label={Weave.lang("Create a new Weave table entry even if a matching one already exists.") }
							value={!this.state.append}
							onChange={(value) => this.setState({ append: !value }) }
							/>, undefined, undefined
					],
					[
						Weave.lang("SQL schema"),
						<ComboBox value= { this.state.schema } options= { this.state.schemaOptions } onChange= {(schema) => {this.setState({ schema });} }/>,
						<Button title={Weave.lang("Refresh") } onClick={this.updateSchemas}><i className="fa fa-refresh"/></Button>
					],
					[
						Weave.lang("SQL table"),
						<ComboBox value={this.state.table} options={this.state.tableOptions} onChange={(table) => {this.setState({ table });} }/>,
						<Button title={Weave.lang("Refresh") } onClick={this.updateSchemas}><i className="fa fa-refresh"/></Button>
					],
					[
						Weave.lang("Table display name"),
						<Input type="text" value={this.state.displayName} onChange={(evt) => this.setState({ displayName: (evt.target as HTMLInputElement).value }) }/>
					]
				]
			],
			[Weave.lang("Data"),
				[
					[
						Weave.lang("Key column"),
						<ComboBox value= { this.state.keyColumn } options= { this.state.columnOptions } onChange= {(value) => this.setState({ keyColumn: value, keyColumnValid: null }) }/>,
						validityButton
					],
					[
						Weave.lang("Key namespace"),
						<ComboBox allowAdditions= { true} value= { this.state.keyType } options= { this.state.keyTypeSuggestions } onChange= {(value) => this.setState({ keyType: value }) }/>,
						<Button title={Weave.lang("Refresh") } onClick={this.updateKeyTypeSuggestions}><i className="fa fa-refresh"/></Button>
					],
					[
						Weave.lang("Filter columns"),
						<ComboBox type="multiple" value={this.state.filteredKeyColumns} options={this.state.columnOptions} onChange={(value) => this.setState({ filteredKeyColumns: value }) }/>
					]
				]
			]
		);

		return <VBox className="weave-ToolEditor">
			{accordion}
			{this.renderErrors()}
			<HBox>
				<Button onClick={this.onImportClick}>{Weave.lang("Import") }</Button>
			</HBox>
		</VBox>
	}
}
