import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import DOMUtils from "../utils/DOMUtils";
import FixedDataTable from "../tools/FixedDataTable";
import * as fs from 'fuse.js';
import * as lodash from 'lodash';
var Fuse = (fs as any)["default"] as typeof fs;

import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

export interface IWeaveTreeState {
	selectedItems?: Array<IWeaveTreeNode>;
	openItems?: Array<IWeaveTreeNode>;
}

export interface IWeaveTreeProps {
	root:IWeaveTreeNode
	style?: any;
	hideRoot?: boolean;
	hideLeaves? : boolean;
	hideBranches? : boolean;
	multipleSelection?: boolean;
	onSelect?: (selectedItems: Array<IWeaveTreeNode>) => void;
	onExpand?: (openItems: Array<IWeaveTreeNode>) => void;
	initialOpenItems?: Array<IWeaveTreeNode>;
	initialSelectedItems?: Array<IWeaveTreeNode>;
};

interface ExtendedIWeaveTreeNode extends IWeaveTreeNode {
	depth: number;
}

export default class WeaveTree extends React.Component<IWeaveTreeProps, IWeaveTreeState>
{
	constructor(props: IWeaveTreeProps) {
		super(props);

		this.state = { selectedItems: props.initialSelectedItems || [], openItems: props.initialOpenItems || [] };
	}

	state: IWeaveTreeState = {
		selectedItems: [],
		openItems: []
	};

	componentWillReceiveProps(nextProps: IWeaveTreeProps) {
		if (!this.props.root != !nextProps.root || (nextProps.root && !nextProps.root.equals(this.props.root))) {
			this.setState({ selectedItems: nextProps.initialSelectedItems || [], openItems: nextProps.initialOpenItems || [] });
		}
		if (!lodash.isEqual(nextProps.initialSelectedItems, this.props.initialSelectedItems))//TODO does not work with _.IsEqual
            this.setState({ selectedItems: nextProps.initialSelectedItems || [] });
	}

	getOpen(node: IWeaveTreeNode): boolean {
		if (node === this.props.root && this.props.hideRoot) {
			return true;
		}
		else {
			return node && !!this.state.openItems.find((otherNode) => otherNode.equals(node));
		}
	}

	static arrayChanged<T>(arrayA: Array<T>, arrayB: Array<T>, itemEqFunc: (a: T, b: T) => boolean): boolean {
		return (arrayA.length != arrayB.length) || !arrayA.every((d, i, a) => itemEqFunc(d, arrayB[i]));
	}

	componentDidUpdate(prevProps: IWeaveTreeProps, prevState: IWeaveTreeState) {
		let nodeComp = (a: IWeaveTreeNode, b: IWeaveTreeNode) => a.equals(b);
		if (this.props.onSelect && WeaveTree.arrayChanged(prevState.selectedItems, this.state.selectedItems, nodeComp)) {
			this.props.onSelect(this.state.selectedItems);
		}

		if (this.props.onExpand && WeaveTree.arrayChanged(prevState.openItems, this.state.openItems, nodeComp)) {
			this.props.onExpand(this.state.openItems);
		}

		return;
	}



	private internalSetOpen(node: IWeaveTreeNode, value: boolean) {
		if (!node) return;
		let isOpen = this.getOpen(node);
		let openItems = this.state.openItems;
		let selectedItems = this.state.selectedItems;
		if (value && !isOpen) {
			openItems = openItems.concat([node]);
		}
		else if (!value && isOpen) {
			openItems = openItems.filter((other) => !node.equals(other));
		}

		this.setState({ openItems, selectedItems });
	}

	static CLASSNAME = "weave-tree-view";
	static CONTAINER_CLASSNAME = "weave-tree-view-container";

	static BRANCH_ICON_CLASSNAME = "weave-tree-view-icon fa fa-folder fa-fw";
	static LEAF_ICON_CLASSNAME = "weave-tree-view-icon fa fa-file-text-o fa-fw";
	static OPEN_BRANCH_ICON_CLASSNAME = "weave-tree-view-icon fa fa-folder-open fa-fw";
	static EXPANDER_CLOSED_CLASS_NAME = "weave-tree-view-icon-expander fa fa-play fa-fw";
	static EXPANDER_OPEN_CLASS_NAME = "weave-tree-view-icon-expander fa fa-play fa-fw fa-rotate-90";
	static EXPANDER_HIDDEN_CLASS_NAME = "weave-tree-view-icon-expander fa fa-fw hidden-expander";

	private renderItem = (node: ExtendedIWeaveTreeNode, index: number): JSX.Element => {
		let className = WeaveTree.CLASSNAME;
		let iconClassName = WeaveTree.LEAF_ICON_CLASSNAME;
		let iconClickFunc: React.MouseEventHandler = null;
		let expanderClassName: string = WeaveTree.EXPANDER_HIDDEN_CLASS_NAME;

		let isOpen = this.getOpen(node);

		/* If we are a branch, we still might not be expandable due to hiding leaves and not having any children who are also branches. */
		let isExpandable = node.isBranch() && !(this.props.hideLeaves && !node.getChildren().some(child => child.isBranch()));

		if (node.isBranch()) {
			iconClassName = isOpen ? WeaveTree.OPEN_BRANCH_ICON_CLASSNAME : WeaveTree.BRANCH_ICON_CLASSNAME;
		}

		if (isExpandable) {
			iconClickFunc = (e: React.MouseEvent): void => {
				this.internalSetOpen(node, !this.getOpen(node)); e.stopPropagation();
			};

			expanderClassName = isOpen ? WeaveTree.EXPANDER_OPEN_CLASS_NAME : WeaveTree.EXPANDER_CLOSED_CLASS_NAME;
		}

		return <HBox key={index}
			className={className}
			onDoubleClick={ iconClickFunc }
			style={{ alignItems: "center", width: "100%" }}>
			<HBox style={{ marginLeft: (node.depth || 0) * 16 + 5, whiteSpace: "nowrap" }}>
				<span style={{ alignSelf: "stretch", display: "flex" }}>
					<i
						onMouseDown={ iconClickFunc }
						onDoubleClick={(e) => e.stopPropagation() }
						className={ expanderClassName }
						style={{ alignSelf: "center" }}
						></i>
				</span>
				<span style={{ alignSelf: "stretch", display: "flex" }}>
					<i
						style={{ alignSelf: "center" }}
						className={iconClassName}
						/>
				</span>
				{ " " + node.getLabel() }
			</HBox>
		</HBox>;
	};

	enumerateItems = (_node: IWeaveTreeNode, result: Array<IWeaveTreeNode> = [], depth: number = 0): Array<IWeaveTreeNode> => {
		let node = _node as ExtendedIWeaveTreeNode;
		if (!node)
			return result;

		if (node !== this.props.root || !this.props.hideRoot) {
			if (node.isBranch() || node == this.props.root || !this.props.hideLeaves) {
				node.depth = depth;
				result.push(node);
				depth++;
			}
		}

		if (node.isBranch() && this.getOpen(node)) {
			for (let child of node.getChildren()) {
				this.enumerateItems(child, result, depth);
			}
		}

		return result;
	};

	rowHeight: number;
	private lastEnumeration: IWeaveTreeNode[];

	onSelect=(indices:string[])=>
	{
		let nodes = indices.map((index) => this.lastEnumeration[Number(index)]);
		this.setState({ selectedItems: nodes });
	}

	render(): JSX.Element {
		if (Weave.isLinkable(this.props.root)) {
			Weave.getCallbacks(this.props.root).addGroupedCallback(this, this.forceUpdate);
		}
		this.rowHeight = Math.max(DOMUtils.getTextHeightForClasses("M", WeaveTree.CLASSNAME), 22) + 5;
		let rootChildren = this.props.root && this.props.root.getChildren() || [];
		this.lastEnumeration = this.props.hideBranches ? rootChildren.filter((n) => !n.isBranch()) : this.enumerateItems(this.props.root);
		let selectedIndices:string[] = [];
		let rows = this.lastEnumeration.map(
			(item, index): { [columnId: string]: React.ReactChild } => {
				if (this.state.selectedItems.some(node => node.equals(item))) selectedIndices.push(index.toString());
				return ({ id: index.toString(), tree: this.renderItem(item as ExtendedIWeaveTreeNode, index) });
			});
		return <FixedDataTable
			idProperty={"id"}
			headerHeight={0}
			rowHeight={this.rowHeight}
			columnIds={["id", "tree"]}
			rows={rows}
			selectedIds={selectedIndices}
			onSelection={this.onSelect}
			/>;
	}
}
