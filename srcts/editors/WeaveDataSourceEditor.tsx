import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";
import DataSourceEditor from "./DataSourceEditor";
import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

export default class WeaveDataSourceEditor extends DataSourceEditor
{
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
	}
	
	componentWillReceiveProps(props:IDataSourceEditorProps)
	{
		super.componentWillReceiveProps(props);
		(props.dataSource as WeaveDataSource).rootId.addGroupedCallback(this, this.setHierarchySelection, false);
	}

	state:IDataSourceEditorState = {dataSource: null};

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

	private tree: WeaveTree;
	
	setHierarchySelection=():void=>{
		if (this.tree && this.props.dataSource)
		{
			let id:number = (this.props.dataSource as WeaveDataSource).rootId.state as number;
			let node = this.props.dataSource.findHierarchyNode(id) as EntityNode;
			if (node != null && node.id > -1)
			{
				this.tree.setSelected([node]);	
			}
			else
			{
				this.tree.setSelected([]);
			}
		}
	}
	
	get editorFields():[string, JSX.Element][]
	{
		let ds = (this.props.dataSource as WeaveDataSource);

		let editorFields:[string, JSX.Element][] = [
			[
				Weave.lang("Service URL"), 
				<StatefulTextField ref={linkReactStateRef(this, { content: ds.url }, 500) } 
								   placeholder={weavejs.net.WeaveDataServlet.DEFAULT_URL}/>
			],
			[
				Weave.lang("Root hierarchy ID"),
				<StatefulTextField ref={linkReactStateRef(this, { content: ds.rootId }, 500) } 
								   placeholder={Weave.lang("Hierarchy ID") }/>
			]
		];
		return super.editorFields.concat(editorFields)
	}
	
	render():JSX.Element
	{
		let ds = (this.props.dataSource as WeaveDataSource);
		let root = new EntityNode(ds.entityCache, EntityType.HIERARCHY);

		return (
			<VBox style={{flex:1, margin: 10}}>
				{
					this.renderFields()
				}
				<WeaveTree style={{ flex: 1 }} hideRoot={true} root={root} onSelect={this.onHierarchySelected} ref={ (c) => { this.tree = c; } }/>
			</VBox>
		);
	}
}

Weave.registerClass("weavejs.editors.WeaveDataSourceEditor", WeaveDataSourceEditor, []);
