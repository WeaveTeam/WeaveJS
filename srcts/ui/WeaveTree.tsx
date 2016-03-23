import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import DOMUtils from "../utils/DOMUtils";
import ListView from "./ListView";
import * as fs from 'fuse.js';
var Fuse = (fs as any)["default"] as typeof fs;

import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;

export interface IWeaveTreeState {
	selectedItems: Array<IWeaveTreeNode>;
	openItems: Array<IWeaveTreeNode>;
}

export interface IWeaveTreeProps {
	root:IWeaveTreeNode
	style?: any;
	hideRoot?: boolean;
	hideLeaves? : boolean;
	multipleSelection?: boolean;
	searchFilter? : string;
	onSelect?: (selectedItems: Array<IWeaveTreeNode>) => void;
	onExpand?: (openItems: Array<IWeaveTreeNode>) => void;
};

interface ExtendedIWeaveTreeNode extends IWeaveTreeNode {
	depth: number;
}

export default class WeaveTree extends React.Component<IWeaveTreeProps, IWeaveTreeState>
{
	constructor(props:IWeaveTreeProps)
	{
		super(props);
	}

	state: IWeaveTreeState = {
		selectedItems: [],
		openItems: []
	};

	getOpen(node: IWeaveTreeNode): boolean
	{
		if (node === this.props.root && this.props.hideRoot)
		{
			return true;
		}
		else
		{
			return !!this.state.openItems.find((otherNode) => otherNode.equals(node));
		}
	}

	getSelected(node: IWeaveTreeNode): boolean
	{
		return !!this.state.selectedItems.find((otherNode) => otherNode.equals(node));
	}

	setSelected(newSelectedItems:Array<IWeaveTreeNode>):void
	{
		this.setState({
			selectedItems: newSelectedItems,
			openItems: this.state.openItems
		});
	}

	static arrayChanged<T>(arrayA:Array<T>, arrayB:Array<T>, itemEqFunc:(a:T,b:T)=>boolean):boolean
	{
		return (arrayA.length != arrayB.length) || !arrayA.every((d, i, a) => itemEqFunc(d, arrayB[i]));
	}

	componentDidUpdate(prevProps:IWeaveTreeProps, prevState:IWeaveTreeState)
	{
		let nodeComp = (a:IWeaveTreeNode, b:IWeaveTreeNode) => a.equals(b);
		if (this.props.onSelect && WeaveTree.arrayChanged(prevState.selectedItems, this.state.selectedItems, nodeComp))
		{
			this.props.onSelect(this.state.selectedItems);
		}

		if (this.props.onExpand && WeaveTree.arrayChanged(prevState.openItems, this.state.openItems, nodeComp))
		{
			this.props.onExpand(this.state.openItems);
		}

		return;
	}



	private internalSetOpen(node: IWeaveTreeNode, value: boolean)
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

	private internalSetSelected(node: IWeaveTreeNode, value:boolean, keepSelection:boolean = false)
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
			this.internalSetSelected(node, !this.getSelected(node), e.ctrlKey);
	};

	static CLASSNAME = "weave-tree-view";
	static SELECTED_CLASSNAME = "selected";
	
	static BRANCH_ICON_CLASSNAME = "icon fa fa-folder fa-fw";
	static LEAF_ICON_CLASSNAME = "icon fa fa-file-text-o fa-fw";
	static OPEN_BRANCH_ICON_CLASSNAME = "icon fa fa-folder-open fa-fw";
	static EXPANDER_CLOSED_CLASS_NAME = "icon fa fa-play fa-fw expander";
	static EXPANDER_OPEN_CLASS_NAME = "icon fa fa-play fa-fw fa-rotate-90 expander";

	private renderItem=(node:ExtendedIWeaveTreeNode, index:number):JSX.Element=>
	{
		let className = WeaveTree.CLASSNAME;
		let iconClassName = WeaveTree.LEAF_ICON_CLASSNAME;
		let iconClickFunc: React.MouseEventHandler = null;
		let expanderClassName:string = null;

		let isOpen = this.getOpen(node);
		let isSelected = this.getSelected(node);

		/* If we are a branch, we still might not be expandable due to hiding leaves and not having any children who are also branches. */
		let isExpandable = node.isBranch() && !(this.props.hideLeaves && !node.getChildren().some(child => child.isBranch()));

		if (node.isBranch())
		{
			iconClassName = isOpen ? WeaveTree.OPEN_BRANCH_ICON_CLASSNAME : WeaveTree.BRANCH_ICON_CLASSNAME;
		}

		if (isExpandable)
		{
			iconClickFunc = (e: React.MouseEvent): void => {
				this.internalSetOpen(node, !this.getOpen(node)); e.preventDefault();
			};

			expanderClassName = isOpen ? WeaveTree.EXPANDER_OPEN_CLASS_NAME : WeaveTree.EXPANDER_CLOSED_CLASS_NAME;
		}

		if (this.getSelected(node))
		{
			className += " " + WeaveTree.SELECTED_CLASSNAME;
		}

		return <span key={index} className={className}
			onClick={ this.handleItemClick.bind(this, node) }
			onDoubleClick={ iconClickFunc } style={{ verticalAlign: "middle", position: "absolute", top: index * this.rowHeight, width: "100%"}}>
			<span style={{ marginLeft: node.depth * 16, whiteSpace: "pre"}}>
				<i onMouseDown={ iconClickFunc } className={ expanderClassName } style={{display: expanderClassName ? null : "none" }}/>
				<i className={iconClassName}/>
				{ " "+node.getLabel() }
			</span></span>;
	};

	enumerateItems=(_node:IWeaveTreeNode, result:Array<IWeaveTreeNode> = [], depth:number = 0):Array<IWeaveTreeNode>=>
	{
		let node = _node as ExtendedIWeaveTreeNode;

		if (node !== this.props.root || !this.props.hideRoot)
		{
			if(node.isBranch() || node == this.props.root || !this.props.hideLeaves){
				node.depth = depth;
				result.push(node);
				depth++;
			}
		}

		if (node.isBranch() && this.getOpen(node))
		{
			for (let child of node.getChildren())
			{
				this.enumerateItems(child, result, depth);
			}
		}

		if(this.props.searchFilter)
			result = this.fuzzySearch(result, ['label'], this.props.searchFilter);//TODO make search possible using diff props of EntityNode

		return result;
	};

	//filters a oollection of nodes by any filter Object
	fuzzySearch=(input :Array<IWeaveTreeNode>, filterProps: Array<string>, filterString :string):Array<IWeaveTreeNode>=>{
		var options:Object = {keys : filterProps};
		let fuze:any = new Fuse(input, options);
		var result : Array<IWeaveTreeNode> = fuze.search(filterString);
		return result;
	};

	rowHeight: number;

	render(): JSX.Element {
		if (Weave.isLinkable(this.props.root)) {
			Weave.getCallbacks(this.props.root).addGroupedCallback(this, this.forceUpdate);
		}
		this.rowHeight = Math.max(DOMUtils.getTextHeightForClasses("M", WeaveTree.CLASSNAME), 22);
		return <ListView style={this.props.style} items={this.enumerateItems(this.props.root)}
				itemRender={this.renderItem}
				itemHeight={this.rowHeight}/>;
	}
}