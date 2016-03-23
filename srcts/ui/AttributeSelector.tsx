import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import WeaveTree from "./WeaveTree";
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import EntityNode = weavejs.data.hierarchy.EntityNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import IColumnReference = weavejs.api.data.IColumnReference;


export interface IAttributeSelectorProps
{
    column : DynamicColumn;
}

export interface IAttributeSelectorState
{
    leafNode : IWeaveTreeNode;
}

export default class AttributeSelector extends React.Component<IAttributeSelectorProps,IAttributeSelectorState>
{
    private tree: WeaveTree;
    private  weaveRoot: ILinkableHashMap;
    private searchFilter :string;
    constructor(props:IAttributeSelectorProps)
    {
        super(props);
        this.weaveRoot = Weave.getRoot(props.column);
        this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
        this.state = {leafNode : null};
    };

    onHierarchySelected=(selectedItems:Array<IWeaveTreeNode>):void=>{
        this.setState({leafNode : selectedItems[0]});
    };

    setColumn =(selectedItems:Array<IWeaveTreeNode>):void =>{
		var ref = Weave.AS(selectedItems[0], weavejs.api.data.IColumnReference);
		if (ref)
		{
			var meta = ref.getColumnMetadata();
			if (meta)
				this.props.column.requestLocalObject(ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
		}
    };

    filter = (event:React.FormEvent):void =>{
        this.searchFilter = (event.target as HTMLInputElement).value;
        this.forceUpdate();
    };

    render():JSX.Element
    {
        let treeNode:WeaveRootDataTreeNode = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
        return (
            <VBox style={{ flex: 1, minWidth: 700, maxHeight: 400 }}>
                <input type="text" placeholder="Search" onChange={ this.filter }/>
                <HBox>
                    <VBox style={{ flex: .5 }}>
                        <WeaveTree searchFilter={ this.searchFilter } hideRoot = {true} hideLeaves = {true} onSelect={this.onHierarchySelected} root={treeNode} ref={ (c) => { this.tree = c; } }/>
                    </VBox>
                    <VBox style={{ flex: .5 }}>
                        {this.state.leafNode ? <WeaveTree searchFilter={ this.searchFilter } hideRoot={true} root={this.state.leafNode} onSelect={this.setColumn} ref={ (c) => { this.tree = c; } }/> : null}
                    </VBox>
                </HBox>
            </VBox>
        );
    };
}