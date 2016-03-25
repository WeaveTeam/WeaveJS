import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import WeaveTree from "./WeaveTree";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import IColumnReference = weavejs.api.data.IColumnReference;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ColumnUtils = weavejs.data.ColumnUtils;

export interface IAttributeSelectorProps
{
    attribute : IColumnWrapper|LinkableHashMap;
    label? : string;
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
        this.weaveRoot = Weave.getRoot(props.attribute);
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
            //TODO is column handling correct?
			var meta = ref.getColumnMetadata();
			/*if (meta && Weave.IS(this.props.attribute, DynamicColumn))
                (this.props.attribute as DynamicColumn).requestLocalObject(ReferencedColumn).setColumnReference(ref.getDataSource(), meta);

            if (meta && Weave.IS(this.props.attribute, AlwaysDefinedColumn)){
                let dy = ColumnUtils.hack_findInternalDynamicColumn(this.props.attribute as IColumnWrapper);
                (dy as DynamicColumn).requestLocalObject(ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
            }*/

            if(meta && Weave.IS(this.props.attribute, IColumnWrapper)){
                let dy = ColumnUtils.hack_findInternalDynamicColumn(this.props.attribute as IColumnWrapper);
                (dy as DynamicColumn).requestLocalObject(ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
            }
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


                {this.props.attribute instanceof LinkableHashMap ?
                    <VBox><SelectableAttributesList button={ false } label={ this.props.label } columns={ (this.props.attribute as LinkableHashMap)}></SelectableAttributesList></VBox>
                    : null}
            </VBox>
        );
    };
}