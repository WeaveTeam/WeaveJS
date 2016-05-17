import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import Button from "../semantic-ui/Button";
import SqlImport from "../ui/admin/SqlImport";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

export default class WeaveDataSourceEditor extends DataSourceEditor
{	
	componentWillReceiveProps(props:IDataSourceEditorProps)
	{
		super.componentWillReceiveProps(props);
		(props.dataSource as WeaveDataSource).rootId.addGroupedCallback(this, this.setHierarchySelection, false);
	}

	onHierarchySelected=(selectedItems:Array<IWeaveTreeNode>):void=>{
		let item = selectedItems[0] as EntityNode;
		if (this.props.dataSource && item instanceof EntityNode)
		{
			(this.props.dataSource as WeaveDataSource).rootId.state = item.getEntity().id;
		}
		else
		{
			(this.props.dataSource as WeaveDataSource).rootId.state = null;
		}
	}

	setHierarchySelection():void {
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
	}
	
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
								   ref={linkReactStateRef(this, { value: ds.url }, 500) } 
								   placeholder={weavejs.net.WeaveDataServlet.DEFAULT_URL}/>
			],
			[
				Weave.lang("Root hierarchy ID"),
				<StatefulTextField style={{width: "100%"}}
								   ref={linkReactStateRef(this, { value: ds.rootId }, 500) } 
								   placeholder={Weave.lang("Hierarchy ID") }/>
			],
			[
				Weave.lang("Import data"),
				<Button onClick={SqlImport.open}>{Weave.lang("Import from SQL...")}</Button>
			]
		];
		return super.editorFields.concat(editorFields)
	}
}

Weave.registerClass(WeaveDataSourceEditor, "weavejs.editors.WeaveDataSourceEditor", []);
