import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import MiscUtils from "../utils/MiscUtils";

export interface ITreeState {
	selectedItems: Array<IWeaveTreeNode>;
	openItems: Array<IWeaveTreeNode>;
}

import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

export interface ITreeProps {
	root:IWeaveTreeNode
	style?: any;
};

interface ITreeNodeProps {
	node: IWeaveTreeNode;
	root: Tree;
}

interface ITreeNode {
	getOpen(node:IWeaveTreeNode): boolean;
	getSelected(node: IWeaveTreeNode): boolean;
	setOpen(node: IWeaveTreeNode, isOpen: boolean):void;
	setSelected(node: IWeaveTreeNode, isSelected: boolean):void;
}

export default class Tree extends React.Component<ITreeProps, ITreeState>
{
	constructor(props:ITreeProps)
	{
		super(props);
	}

	state: ITreeState = {
		selectedItems: [],
		openItems: []
	};

	getOpen(node: IWeaveTreeNode): boolean
	{
		return !!this.state.openItems.find((otherNode) => otherNode.equals(node));
	}

	getSelected(node: IWeaveTreeNode): boolean
	{
		return !!this.state.selectedItems.find((otherNode) => otherNode.equals(node));
	}

	componentDidUpdate()
	{
		console.log("open:", this.state.openItems);
		console.log("selected:", this.state.selectedItems);
		return;
	}



	setOpen(node: IWeaveTreeNode, value: boolean)
	{
		let isOpen = this.getOpen(node);
		let openItems = this.state.openItems;
		let selectedItems = this.state.selectedItems;
		if (value && !isOpen)
		{
			openItems = openItems.concat([node]);
		}
		else if (!value && isOpen)
		{
			openItems = openItems.filter((other) => !node.equals(other));
		}

		this.setState({ openItems, selectedItems });
	}

	setSelected(node: IWeaveTreeNode, value:boolean, keepSelection:boolean = false)
	{
		let isSelected = this.getSelected(node);
		let openItems = this.state.openItems;
		let selectedItems = this.state.selectedItems;

		if (!keepSelection && value && !isSelected) {
			selectedItems = [node];
		} else if (value && !isSelected) {
			selectedItems = selectedItems.concat([node]);
		}
		else if (!value && isSelected) {
			selectedItems = selectedItems.filter((other) => !node.equals(other));
		}


		this.setState({ openItems, selectedItems });
	}

	static PX_TO_EM = 16;
	isVisible(top: number):boolean
	{
		if (!this.container) return true;

		let topPx = this.container.scrollTop;
		let bottomPx = (this.container.clientHeight) + topPx;
		return (top >= topPx && top <= bottomPx);
	}
	private rowHeight: number

	handleItemClick=(node:IWeaveTreeNode, e:React.MouseEvent)=>
	{
			this.setSelected(node, !this.getSelected(node), e.ctrlKey);
	}

	renderRecursive(node:IWeaveTreeNode, top:number, depth:number): [JSX.Element[], number]
	{
		let resultElements:JSX.Element[] = []
		let childElements: JSX.Element[];

		let className = Tree.CLASSNAME;
		let iconClassName = Tree.LEAF_ICON_CLASSNAME;
		let iconClickFunc: React.MouseEventHandler = null;

		let isOpen = this.getOpen(node);
		let isSelected = this.getSelected(node);

		if (node.isBranch())
		{
			iconClassName = isOpen ? Tree.OPEN_BRANCH_ICON_CLASSNAME : Tree.BRANCH_ICON_CLASSNAME;
			iconClickFunc = (e: React.MouseEvent):void => {
				this.setOpen(node, !this.getOpen(node)); e.preventDefault();
			};
		}
		if (this.getSelected(node))
		{
			className += " " + Tree.SELECTED_CLASSNAME;
		}

		if (this.isVisible(top)) {
			resultElements.push(<span className={className} key={top}
				onClick={ this.handleItemClick.bind(this, node) }
				onDoubleClick={ iconClickFunc } style={{ position: "absolute", top: top, width: "100%"}}>
				<span style={{ marginLeft: depth * this.rowHeight, whiteSpace: "pre"}}>
					<i onMouseDown={ iconClickFunc } className={iconClassName}/>
					{ " "+node.getLabel() }
				</span></span>);
		}

		if (this.getOpen(node)) {
			for (let child of node.getChildren() || []) {
				top += this.rowHeight;
				[childElements, top] = this.renderRecursive(child, top, depth + 1);
				for (let ele of childElements) {
					resultElements.push(ele);
				}
			}
		}
		return [resultElements, top];
	}

	private container: HTMLElement;

	updateScroll():void
	{
		if (this.container)
		{
			this.forceUpdate();
		}
	}

	static CLASSNAME = "weave-tree-view";
	static SELECTED_CLASSNAME = "selected";
	
	static BRANCH_ICON_CLASSNAME = "fa fa-folder-o fa-fw";
	static LEAF_ICON_CLASSNAME = "fa fa-file-text-o fa-fw";
	static OPEN_BRANCH_ICON_CLASSNAME = "fa fa-folder-open-o fa-fw";

	render(): JSX.Element
	{
		this.rowHeight = MiscUtils.getTextHeightForClasses("M", Tree.CLASSNAME);

		let [children, totalHeight] = this.renderRecursive(this.props.root, 0, 0);
		return <div className={Tree.CLASSNAME} onScroll={this.updateScroll.bind(this)} ref={ (c:HTMLElement) => {this.container = c;}} style={{height: "100%", width: "100%", overflow: "scroll", position: "relative"}}>
			<div style={{ height: totalHeight + "px" }}>
				{children}
			</div>
		</div>;
	}
}