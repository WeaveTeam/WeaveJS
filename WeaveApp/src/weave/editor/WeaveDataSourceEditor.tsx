import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import StatefulTextField = weavejs.ui.StatefulTextField;
import WeaveReactUtils = weavejs.util.WeaveReactUtils
import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import Button = weavejs.ui.Button;

import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import MenuButton = weavejs.ui.menu.MenuButton;
import PopupWindow = weavejs.ui.PopupWindow;
import WeaveAdminService = weavejs.net.WeaveAdminService;
import WeaveDataServlet = weavejs.net.WeaveDataServlet;
import IColumnReference = weavejs.api.data.IColumnReference;
import DataSourceEditor, {IDataSourceEditorProps} from "weave/editor/DataSourceEditor";
import ConnectionManager from "weave/admin/ConnectionManager";
import SqlImport from "weave/admin/SqlImport";


const SQL:string = "SQL";
const CSV:string = "CSV";

const dataImportTypes:string[] = [SQL];

export default class WeaveDataSourceEditor extends DataSourceEditor
{
	componentWillReceiveProps(props:IDataSourceEditorProps)
	{
		super.componentWillReceiveProps(props);
		(props.dataSource as WeaveDataSource).rootId.addGroupedCallback(this, this.setHierarchySelection, false);
	}

	onHierarchySelected=(selectedItems:(IWeaveTreeNode & IColumnReference)[]):void=>
	{
		let item = selectedItems[0] as EntityNode;
		if (this.props.dataSource && item instanceof EntityNode)
		{
			(this.props.dataSource as WeaveDataSource).rootId.state = item.getEntity().id;
		}
		else
		{
			(this.props.dataSource as WeaveDataSource).rootId.state = null;
		}
	};

	setHierarchySelection():void
	{/*
		if (this.tree && this.props.dataSource)
		{
			let id:number = (this.props.dataSource as WeaveDataSource).rootId.state as number;
			let node = this.props.dataSource.findHierarchyNode(id) as EntityNode;
			if (node != null && node.id > -1)
			{
				//this.tree.setSelected([node]);
			}
			else
			{
				//this.tree.setSelected([]);
			}
		}
	*/}

	get service()
	{
		return WeaveAdminService.getInstance(WeaveDataSourceEditor.getBaseUrl((this.props.dataSource as WeaveDataSource).url.value));
	}

	private static getBaseUrl(serviceUrl: string): string {
		if (!serviceUrl)
			return "/WeaveServices";
		/* TODO: Use a proper URL parsing library to get the base URL */
		let pathComponents = serviceUrl.split('/');
		pathComponents.pop();
		return pathComponents.join('/');
	}

	private selectId=(id:number)=>
	{
		/* TODO: Make data preview highlight the new table */
		this.props.dataSource.hierarchyRefresh.triggerCallbacks();
	}

	openSqlImport = PopupWindow.generateOpener(() => ({
		context: this,
		title: Weave.lang("Import data from SQL"),
		content: <SqlImport service={this.service} selectIdFunc={this.selectId}/>,
		resizable: true,
		width: 920,
		footerContent: <div/>,
		height: 675,
		suspendEnter: true
	}));

	openCsvImport = () =>{
		console.log("opening the csv import opo");
	};

	openConnectionManager = PopupWindow.generateOpener(() => ({
		context: this,
		title: Weave.lang("Manage Users and Connections"),
		content: <ConnectionManager service={this.service}/>,
		modal: true,
		resizable: true,
		footerContent: <div/>,
		width: 920,
		height: 675,
		suspendEnter: true
	}));

	get editorFields():[React.ReactChild, React.ReactChild][]
	{
		let ds = (this.props.dataSource as WeaveDataSource);
		/* Hack, use actual parser, or better, have it configured in the admin service and use an actual call to retrieve. */
		let consoleUri = (ds.url.value || "/WeaveServices/DataService") + "/../../" + "AdminConsole.html";


		let editorFields:[React.ReactChild, React.ReactChild][] = [
			this.getLabelEditor(ds.label),
			[
				"",
				<HBox style={{flex: 1, justifyContent: "flex-end"}}><a target="_blank" href={consoleUri}>{Weave.lang("Open Admin Console") + " " }</a></HBox>
			],
			[
				Weave.lang("Service URL"),
				<StatefulTextField style={{width: "100%"}}
								   ref={WeaveReactUtils.linkReactStateRef(this, { value: ds.url }, 500) }
								   placeholder={WeaveDataServlet.DEFAULT_URL}/>
			],
			[
				Weave.lang("Root hierarchy ID"),
				<StatefulTextField style={{width: "100%"}}
								   ref={WeaveReactUtils.linkReactStateRef(this, { value: ds.rootId }, 500) }
								   placeholder={Weave.lang("Hierarchy ID") }/>
			],
			[
				Weave.lang("Import Data to Server"),
				/*<Button onClick={this.openSqlImport}>{Weave.lang("Import from SQL...") }</Button>*/
				<MenuButton
					className={"ui icon button"}
					showIcon={false}
					style={{flex: 1, alignItems: "center", justifyContent: "center"}}
					menu={
						dataImportTypes.map((importType:string) => {
							if (importType == SQL)
							{
								var click = this.openSqlImport;
							}
							else if (importType == CSV)
							{
								//var click =  this.openCsvImport;
							}

							return{
								label:Weave.lang(importType),
								click:click
							}
						})
					}
				>{Weave.lang("Import Data")}
				</MenuButton>
			],
			[
				Weave.lang("Manage Server"),
				<Button onClick={this.openConnectionManager}>{Weave.lang("Manage users and connections") }</Button>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}

Weave.registerClass(WeaveDataSourceEditor, "weavejs.editor.WeaveDataSourceEditor", []);
