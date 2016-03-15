import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ListOption} from "../react-ui/List";
import List from "../react-ui/List";
import WeaveTree from "./WeaveTree";
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;


export interface IAttributeSelectorProps
{
    column : DynamicColumn;
}

export interface IAttributeSelectorState
{
    listOptions : ListOption[];
}

export default class AttributeSelector extends React.Component<IAttributeSelectorProps,IAttributeSelectorState>
{
    private tree: WeaveTree;
    private  weaveRoot: ILinkableHashMap;
    constructor(props:IAttributeSelectorProps)
    {
        super(props);
        this.weaveRoot = Weave.getRoot(props.column);
        this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
        this.state = {listOptions:[]};
    };

    onHierarchySelected=(selectedItems:Array<IWeaveTreeNode>):void=>{
        let item = selectedItems[0] as EntityNode;
        var columns : ListOption[] = [];
        if( item && item.isBranch()){//TODO figure out async issue
            (item.getChildren() as EntityNode[]).forEach( (node:EntityNode,index:number) => {
                columns.push({label : node.getLabel(), value : node});
            });
            this.setState({listOptions : columns});
        }
    };

    setData =(selectedItems:Array<EntityNode>):void =>{
        var node:EntityNode = selectedItems[0];
        (this.props.column.getInternalColumn() as ReferencedColumn).setColumnReference(node.getDataSource(),node.getColumnMetadata());
    };

    render():JSX.Element
    {
        let treeNode:WeaveRootDataTreeNode = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
        return (
            <HBox style={{ flex: 1, minWidth: 700, maxHeight: 400 }}>
                <VBox style={{ flex: .5 }}>
                    <WeaveTree hideRoot = {true} hideLeaves = {true} onSelect={this.onHierarchySelected} root={treeNode} ref={ (c) => { this.tree = c; } }/>
                </VBox>
                <VBox style={{ flex: .5 }}>
                    <List options={this.state.listOptions} onChange={this.setData}/>
                </VBox>
            </HBox>
        );
    };
}