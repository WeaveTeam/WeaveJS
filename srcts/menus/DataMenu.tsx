import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/ListItem";
import ListItem from "../react-ui/ListItem";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import ColumnTreeNode = weavejs.data.hierarchy.ColumnTreeNode;

export default class DataMenu implements MenuBarItemProps{

	constructor(weave:Weave){
		this.weave = weave;
		let tree : ColumnTreeNode = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weave.root) as ColumnTreeNode;
		let dataSources : ColumnTreeNode[] = tree.getChildren();

		this.createDataSourceItems(dataSources);
	}

	dataSourceListItems : ListOption[] =[];
	label : string = "Data";
	weave : Weave;
	menu: MenuItemProps[] = [
		{
			label : Weave.lang('Manage or browse data'),
			click : this.manageOrBrowseData
		},
		{
			label : Weave.lang('Add CSV DataSource'),
			click : this.addCSVDataSource
		}
	];

	bold : boolean = false;

	manageOrBrowseData (){
		PopupWindow.open({
			title : "Manage data sources",
			content: (
						<HBox style = {{width: 700, height: 400}}>
							<VBox style = {{width: "25%"}}>Select a datasource
								<ListItem options = {this.dataSourceListItems}/>
							</VBox>
							<VBox style = {{width: "75%"}}>Browse or Configure</VBox>
						</HBox>
					 ),
			modal: false
		});
	}

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