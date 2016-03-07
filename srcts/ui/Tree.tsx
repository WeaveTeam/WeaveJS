import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import DOMUtils from "../utils/DOMUtils";
import ListView from "./ListView";

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

export interface ExtendedIWeaveTreeNode extends IWeaveTreeNode {
	depth: number;
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

	handleItemClick=(node:IWeaveTreeNode, e:React.MouseEvent)=>
	{
			this.setSelected(node, !this.getSelected(node), e.ctrlKey);
	}

	static CLASSNAME = "weave-tree-view";
	static SELECTED_CLASSNAME = "selected";
	
	static BRANCH_ICON_CLASSNAME = "fa fa-folder-o fa-fw";
	static LEAF_ICON_CLASSNAME = "fa fa-file-text-o fa-fw";
	static OPEN_BRANCH_ICON_CLASSNAME = "fa fa-folder-open-o fa-fw";

	renderItem=(node:ExtendedIWeaveTreeNode, index:number):JSX.Element=>
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

		return <span key={index} className={className}
			onClick={ this.handleItemClick.bind(this, node) }
			onDoubleClick={ iconClickFunc } style={{ position: "absolute", top: index * this.rowHeight, width: "100%"}}>
			<span style={{ marginLeft: node.depth * 16, whiteSpace: "pre"}}>
				<i onMouseDown={ iconClickFunc } className={iconClassName}/>
				{ " "+node.getLabel() }
			</span></span>;
	}

	enumerateItems=(_node:IWeaveTreeNode):Array<IWeaveTreeNode>=>
	{
		let node = _node as ExtendedIWeaveTreeNode;
		let resultArray = [node as ExtendedIWeaveTreeNode];
		
		if (node.depth === undefined) node.depth = 0;

		if (node.isBranch() && this.getOpen(node))
		{
			for (let child of node.getChildren()||[])
			{
				(child as ExtendedIWeaveTreeNode).depth = node.depth + 1; 
				for (let resultItem of this.enumerateItems(child))
				{
					resultArray.push(resultItem as ExtendedIWeaveTreeNode);
				}
			}
		}

		return resultArray;
	}

	rowHeight: number;

	render(): JSX.Element
	{
		this.rowHeight = DOMUtils.getTextHeightForClasses("M", Tree.CLASSNAME);
		return <ListView items={this.enumerateItems(this.props.root)}
				itemRender={this.renderItem}
				itemHeight={this.rowHeight}/>;
	}
}