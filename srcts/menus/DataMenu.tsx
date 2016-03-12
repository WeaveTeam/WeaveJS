import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import DataSourceManager from "../ui/DataSourceManager";
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;

export default class DataMenu implements MenuBarItemProps{

	constructor(weave:Weave){
		this.weave = weave;
		this.menu = [
			{
				label: Weave.lang('Manage or browse data'),
				click: DataSourceManager.openInstance.bind(null, weave)
			},
			{
				label: Weave.lang('Add CSV DataSource'),
				click: this.addCSVDataSource
			}
		];
	}

	dataSourceListItems : ListOption[] =[];
	label : string = "Data";
	weave : Weave;
	menu: MenuItemProps[];

	bold : boolean = false;

	addCSVDataSource (){
		console.log("adding a csv datasource");
	}

	//this function wraps up the list of datasources into list items
	createDataSourceItems(dataSources : ColumnTreeNode[]){
		for(var d:number=0; d < dataSources.length; d++){
			let listItem :ListOption = {label:dataSources[d].getLabel(), value :dataSources[d]};
			this.dataSourceListItems.push(listItem);
		}
	}
}