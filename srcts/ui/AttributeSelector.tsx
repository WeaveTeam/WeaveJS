import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ButtonGroupBar} from "../react-ui/ButtonGroupBar";
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
import IAttributeColumn = weavejs.api.data.IAttributeColumn;

export interface IAttributeSelectorProps
{
    attribute : IColumnWrapper|LinkableHashMap;
    label? : string;
    attributeNames?:string[];
}

export interface IAttributeSelectorState
{
    leafNode? : IWeaveTreeNode;
    selectAll? :boolean
}

export default class AttributeSelector extends React.Component<IAttributeSelectorProps,IAttributeSelectorState>
{
    private tree: WeaveTree;
    private leafTree :WeaveTree;
    private  weaveRoot: ILinkableHashMap;
    private searchFilter :string;
    private items:{[label:string] : Function}={};
    private selectedColumnRef :IColumnReference;
    constructor(props:IAttributeSelectorProps)
    {
        super(props);
        this.weaveRoot = Weave.getRoot(props.attribute);
        this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.forceUpdate);
        
        if(this.props.attributeNames){
            props.attributeNames.forEach((label:string)=>{
                this.items[label] = this.forceUpdate;
            });
        }
        this.state = {leafNode : null, selectAll : false};
    };

    componentDidMount(){
       /* if(Weave.IS(this.props.attribute, LinkableHashMap))
            Weave.getCallbacks(this.props.attribute).addGroupedCallback(this, this.forceUpdate);*/
    }

    addSelected=():void=>
	{
		var ref = this.selectedColumnRef;
        var meta = ref && ref.getColumnMetadata();
        if (meta)
		{
			var lhm = Weave.AS(this.props.attribute, LinkableHashMap);
            if (lhm)
                lhm.requestObject(null, weavejs.data.column.ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
        }
    };

    handleSelectAll=():void=>{
       let selectedItems = this.state.leafNode.getChildren();//get all leaf nodes
       this.leafTree.setState({selectedItems});//accessing leaf tree using ref concept
       this.setState({selectAll :true});
    };

    onHierarchySelected=(selectedItems:Array<IWeaveTreeNode>):void=>{
        this.setState({leafNode : selectedItems[0]});
    };

    setColumn =(selectedItems:Array<IWeaveTreeNode>):void =>{
        if(!this.state.selectAll)//if single item is clicked, disable selectAll boolean
            this.setState({selectAll : false});
		var ref = Weave.AS(selectedItems[0], weavejs.api.data.IColumnReference);
		if (ref)
		{
            //TODO is column handling correct?
			var meta = ref.getColumnMetadata();
		    if (meta)
			{
                if(Weave.IS(this.props.attribute, IColumnWrapper)){//if selectable attribute is a single column
                    let dc = ColumnUtils.hack_findInternalDynamicColumn(this.props.attribute as IColumnWrapper);
                    if (dc)
                        dc.requestLocalObject(ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
                }
                else{//if selectable attribute is a LinkableHashmap
                  this.selectedColumnRef = ref;
                }
            }
		}
    };

    //for the fuzzy search Implementation
    filter = (event:React.FormEvent):void =>{
        this.searchFilter = (event.target as HTMLInputElement).value;
        this.forceUpdate();
    };

    render():JSX.Element
    {
        let treeNode:WeaveRootDataTreeNode = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);

        return (
            <VBox style={{ flex: 1, minWidth: 700, maxHeight: 400 }}>

                <ButtonGroupBar items={ this.items }></ButtonGroupBar>

                <HBox>
                    <VBox style={{ flex: .5 }}>
                        <WeaveTree searchFilter={ this.searchFilter } hideRoot = {true} hideLeaves = {true} onSelect={this.onHierarchySelected} root={treeNode} ref={ (c) => { this.tree = c; } }/>
                    </VBox>
                    <VBox style={{ flex: .5 }}>
                        {this.state.leafNode ? <WeaveTree searchFilter={ this.searchFilter } hideRoot={true} root={this.state.leafNode} onSelect={this.setColumn} ref={ (c) => { this.leafTree = c; } }/> : null}

                        {Weave.IS(this.props.attribute, LinkableHashMap) ? <HBox><button onClick={ this.handleSelectAll }>Select All</button><button onClick={ this.addSelected }>Add Selected</button></HBox>
                        : null}
                    </VBox>
                </HBox>


                {this.props.attribute instanceof LinkableHashMap ?
                    <VBox><SelectableAttributesList button={ false } label={ this.props.label } columns={ (this.props.attribute as LinkableHashMap)}></SelectableAttributesList></VBox>
                    : null}
            </VBox>
        );
    };
}