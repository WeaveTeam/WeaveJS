import * as React from "react";
import * as _ from "lodash";
import {HBox,VBox} from "../react-ui/FlexBox";
import {HDividedBox} from "../react-ui/DividedBox";
import {ButtonGroupBar} from "../react-ui/ButtonGroupBar";
import WeaveTree from "./WeaveTree";
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnReference = weavejs.api.data.IColumnReference;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ColumnUtils = weavejs.data.ColumnUtils;
import HierarchyUtils = weavejs.data.hierarchy.HierarchyUtils;
import IDataSource = weavejs.api.data.IDataSource;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import SmartComponent from "./SmartComponent";
import DynamicComponent from "./DynamicComponent";
import ControlPanel from "./ControlPanel";
import Button from "../semantic-ui/Button";

export interface IHierarchyExplorerProps
{
	initialSelectedItems: IWeaveTreeNode[];
	root: IWeaveTreeNode;
	onSelect: (selectedNodes: IWeaveTreeNode[])=>void;
}

export interface IHierarchyExplorerState
{
}

export default class HierarchyExplorer extends SmartComponent<IHierarchyExplorerProps, IHierarchyExplorerState>
{
	constructor(props:IHierarchyExplorerProps)
	{
		super(props);
	}

	componentWillReceiveProps(nextProps:IHierarchyExplorerProps)
	{
		if (Weave.isLinkable(nextProps.root))
		{
			if (Weave.isLinkable(this.props.root)) Weave.getCallbacks(this.props.root).removeCallback(this, this.forceUpdate);
			Weave.getCallbacks(nextProps.root).addGroupedCallback(this, this.forceUpdate);
		}
	}

	get selectedFolder(): IWeaveTreeNode
	{
		return this.folderTree && this.folderTree.state.selectedItems[0];
	}

	get selectedItems(): IWeaveTreeNode[]
	{
		return this.columnTree && this.columnTree.state.selectedItems;
	}

	set selectedItems(items:IWeaveTreeNode[])
	{
		if (this.columnTree) this.columnTree.setState({ selectedItems: items });
	}

	componentDidMount()
	{
		this.forceUpdate(); /* Now that we have the refs, render again */;
	}

	private folderTree: WeaveTree;
	private columnTree: WeaveTree;

	render()
	{
		let paths = this.props.initialSelectedItems.map((value) => (HierarchyUtils.findPathToNode(this.props.root, value))).filter(_.identity) as IWeaveTreeNode[][];

		let firstPath = paths[0];
		let selectedFolderNodes: IWeaveTreeNode[] = firstPath ? [firstPath[firstPath.length - 2]] : [this.props.root.getChildren()[0]];
		let openFolderNodes = firstPath ? firstPath.slice(0, firstPath.length - 2) : null;

		return <HDividedBox style={{ flex: 1 }} loadWithEqualWidthChildren>
			<div style={{display: "flex"}}>
				<WeaveTree ref={(c) => { if (c) this.folderTree = c } } hideRoot hideLeaves
					initialSelectedItems={selectedFolderNodes} initialOpenItems={openFolderNodes} root={this.props.root} onSelect={()=>this.forceUpdate()}/>
			</div>
			<div style={{display: "flex"}}>
				<DynamicComponent dependencies={[this.props.root]} render={() => {
					return <WeaveTree ref={(c) => { if (c) this.columnTree = c } } hideRoot hideBranches
						initialSelectedItems={
							this.props.initialSelectedItems} root={this.selectedFolder} onSelect={this.props.onSelect}/>;
				}}/>
			</div>
		</HDividedBox>;
	}
}