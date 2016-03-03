import * as React from "react";
import VBox from "../react-ui/VBox";

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

class TreeNode extends React.Component<ITreeNodeProps, any>
{
	constructor(props:ITreeNodeProps)
	{
		super(props);
	}

	get open():boolean
	{
		return this.props.root.getOpen(this.props.node);
	}
	set open(value:boolean)
	{
		this.props.root.setOpen(this.props.node, value);
	}

	get selected():boolean
	{
		return this.props.root.getSelected(this.props.node);
	}
	set selected(value:boolean)
	{
		this.props.root.setSelected(this.props.node, value);
	}

	render(): JSX.Element
	{
		let children: Array<JSX.Element> = [];
		if (this.props.node.isBranch() && this.open)
		{
			children = this.props.node.getChildren().map( (value,index) => {
				return <li key={index}><TreeNode node={value} root={this.props.root}/></li>;
			});
		}
		return <span>
			<span onClick={() => {this.open = !this.open} }>{this.props.node.getLabel()}</span>
			<ul>
				{children}
			</ul>
		</span>;
	}
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
		console.log("");
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

	setSelected(node: IWeaveTreeNode, value:boolean)
	{
		let isSelected = this.getSelected(node);
		let openItems = this.state.openItems;
		let selectedItems = this.state.selectedItems;
		if (value && !isSelected) {
			selectedItems = selectedItems.concat([node]);
		}
		else if (!value && isSelected) {
			selectedItems = selectedItems.filter((other) => !node.equals(other));
		}
		this.setState({ openItems, selectedItems });
	}

	render(): JSX.Element
	{
		return <VBox>
			<TreeNode node={this.props.root} root={this}/>
		</VBox>;
	}
}