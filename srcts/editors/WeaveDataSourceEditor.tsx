import * as React from "react";
import * as lodash from "lodash";
import StatefulTextField from "../ui/StatefulTextField";
import {linkReactStateRef} from "../utils/WeaveReactUtils";
import ReactUtils from "../utils/ReactUtils";
import WeaveTree from "../ui/WeaveTree";
import {HBox, VBox} from "../react-ui/FlexBox";

import {IDataSourceEditorProps, IDataSourceEditorState} from "./DataSourceEditor";

import WeaveDataSource = weavejs.data.source.WeaveDataSource;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import EntityType = weavejs.api.data.EntityType;
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

export default class WeaveDataSourceEditor extends React.Component<IDataSourceEditorProps,IDataSourceEditorState>
{
	constructor(props:IDataSourceEditorProps)
	{
		super(props);
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

	render():JSX.Element
	{

		let ds = (this.props.dataSource as WeaveDataSource);
		let root = new EntityNode(ds.entityCache, EntityType.HIERARCHY);

		ds.rootId.addGroupedCallback(this, this.setHierarchySelection, false);
		Weave.getCallbacks(ds).addGroupedCallback(this, this.forceUpdate, false);


		var tableStyles = {
			table: { width: "100%", fontSize: "inherit" },
			td: { paddingBottom: 10, textAlign: "right" }
		};

		var tableClasses = {
			tr: "weave-datasource-manager-table-row"
		};

		var labelStyle = {
			paddingRight: 5,
			whiteSpace: "nowrap"
		};

		var inputStyle = {
			width: "100%"
		};

		let editorFields = [
			["Service URL", <StatefulTextField style={inputStyle} ref={linkReactStateRef(this, { content: ds.url }, 500) } placeholder={weavejs.net.WeaveDataServlet.DEFAULT_URL}/>],
			["Root hierarchy ID", <StatefulTextField style={inputStyle} ref={linkReactStateRef(this, { content: ds.rootId }, 500) } placeholder={Weave.lang("Hierarchy ID") }/>]
		].map((value: [string, JSX.Element]) => {
			return [
				<span style={labelStyle}>{Weave.lang(value[0]) }</span>,
				value[1]
			];
		});


		return <VBox>
			{
				[ReactUtils.generateTable(null, editorFields, tableStyles, tableClasses), 
				<WeaveTree style={{ flex: 1 }} hideRoot={true} root={root} onSelect={this.onHierarchySelected} ref={ (c) => { this.tree = c; } }/>]
			}
		</VBox>;
	}
}

Weave.registerClass("weavejs.editors.WeaveDataSourceEditor", WeaveDataSourceEditor, []);