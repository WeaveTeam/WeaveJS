import * as React from "react";
import * as weavejs from "weavejs";
import * as _ from "lodash";
import {Weave} from "weavejs";
import HBox = weavejs.ui.flexbox.HBox;
import VBox = weavejs.ui.flexbox.VBox;
import HDividedBox = weavejs.ui.HDividedBox;
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
import SmartComponent = weavejs.ui.SmartComponent;
import DynamicComponent = weavejs.ui.DynamicComponent;
import Button = weavejs.ui.Button;
import WeaveDataTree from "weaveapp/ui/WeaveDataTree";
import {WeaveTree} from "weaveapp/ui/WeaveTree";

export interface IHierarchyExplorerProps
{
	initialSelectedItems: (IWeaveTreeNode & IColumnReference)[];
	root: IWeaveTreeNode & IColumnReference;
	onSelect: (selectedNodes: (IWeaveTreeNode & IColumnReference)[]) => void;
	onDoubleClick: (clickedNode: IWeaveTreeNode & IColumnReference) => void;
	skipSelections?: boolean; /* Don't use selectedItems for the right-hand pane, just open the left hand pane's items */
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

	get selectedFolder(): IWeaveTreeNode & IColumnReference
	{
		return this.folderTree && this.folderTree.state.selectedItems[0];
	}

	get selectedItems(): (IWeaveTreeNode & IColumnReference)[]
	{
		return this.columnTree && this.columnTree.state.selectedItems;
	}

	set selectedItems(items:(IWeaveTreeNode & IColumnReference)[])
	{
		if (this.columnTree) this.columnTree.setState({ selectedItems: items });
	}

	componentDidMount()
	{
		this.forceUpdate(); /* Now that we have the refs, render again */;
	}

	private folderTree: WeaveTree<IWeaveTreeNode & IColumnReference>;
	private columnTree: WeaveTree<IWeaveTreeNode & IColumnReference>;

	render()
	{
		let paths = this.props.initialSelectedItems.map((value) => (HierarchyUtils.findPathToNode(this.props.root, value))).filter(_.identity);

		let firstPath = paths[0];
		let selectedFolderNodes = firstPath ? [firstPath[firstPath.length - 2]] : [this.props.root.getChildren()[0] as IWeaveTreeNode & IColumnReference];
		let openFolderNodes = firstPath ? firstPath.slice(0, firstPath.length - 2) : null;

		return <HDividedBox style={{ flex: 1 }} loadWithEqualWidthChildren={true}>
			<div style={{display: "flex"}}>
				<WeaveDataTree
					ref={(c) => { if (c) this.folderTree = c } }
					hideRoot
					hideLeaves
					initialSelectedItems={selectedFolderNodes}
					initialOpenItems={openFolderNodes}
					root={this.props.root}
					onSelect={()=>this.forceUpdate()}
				/>
			</div>
			<div style={{display: "flex"}}>
				<DynamicComponent dependencies={[this.props.root]} render={() => {
					return (
						<WeaveDataTree
							ref={(c) => { if (c) this.columnTree = c } }
							hideRoot
							hideBranches
							initialSelectedItems={this.props.skipSelections ? [] : this.props.initialSelectedItems}
							root={this.selectedFolder}
							onSelect={this.props.onSelect}
							onDoubleClick={this.props.onDoubleClick}
						/>
					);
				}}/>
			</div>
		</HDividedBox>;
	}
}
