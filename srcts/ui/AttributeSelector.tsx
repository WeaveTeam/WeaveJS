import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";
import {ButtonGroupBar} from "../react-ui/ButtonGroupBar";
import WeaveTree from "./WeaveTree";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import IColumnReference = weavejs.api.data.IColumnReference;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ColumnUtils = weavejs.data.ColumnUtils;
import PopupWindow from "../react-ui/PopupWindow";

export interface IAttributeSelectorProps
{
    selectedAttribute : IColumnWrapper|LinkableHashMap;
    label? : string;
    showLabelAsButton?:boolean;
    selectableAttributes:Map<string,(IColumnWrapper|LinkableHashMap)>;
}

export interface IAttributeSelectorState
{
    leafNode? : IWeaveTreeNode;
    selectAll? :boolean;
    selectedAttribute?: IColumnWrapper|LinkableHashMap;
    label?:string;
}

export default class AttributeSelector extends React.Component<IAttributeSelectorProps,IAttributeSelectorState>
{
    private tree: WeaveTree;
    private rootTreeNode :IWeaveTreeNode;
    private leafTree :WeaveTree;
    private  weaveRoot: ILinkableHashMap;
    private searchFilter :string;
    private items:{[label:string] : Function}={};
    private selectedColumnRef :IColumnReference[];

    constructor(props:IAttributeSelectorProps)
    {
        super(props);

        //required for button bar
        this.props.selectableAttributes.forEach((value, key)=>{
            this.items[key] = this.handleSelectedAttribute.bind(this,key);
        });

        this.weaveRoot = Weave.getRoot(props.selectedAttribute);
        this.rootTreeNode  = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
        //this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.forceUpdate);

        this.state = {leafNode : null, selectAll : false, selectedAttribute:this.props.selectedAttribute, label:this.props.label};
    };

    componentWillReceiveProps (nextProps :IAttributeSelectorProps){
        if(nextProps.selectedAttribute != this.props.selectedAttribute){
            //this.weaveRoot.childListCallbacks.removeCallback(this, this.forceUpdate);
            this.weaveRoot = Weave.getRoot(nextProps.selectedAttribute);
            //this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.forceUpdate);

            this.rootTreeNode  = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
        }
    }

    componentWillUnmount (){
        //this.weaveRoot.childListCallbacks.removeCallback(this, this.forceUpdate);
    }

    handleSelectedAttribute= (name:string):void=>{
        this.setState({selectedAttribute : this.props.selectableAttributes.get(name), label:name});
    };
    addSelected=():void=>
	{
        var counter :number = this.selectedColumnRef.length;
		for(var i:number =0; i < counter; i++ ){
            var ref = this.selectedColumnRef[i];
            var meta = ref && ref.getColumnMetadata();
            if (meta)
            {
                var lhm = Weave.AS(this.state.selectedAttribute, LinkableHashMap);
                if (lhm)
                    lhm.requestObject(null, weavejs.data.column.ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
            }
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
                if(Weave.IS(this.state.selectedAttribute, IColumnWrapper)){//if selectable attribute is a single column
                    let dc = ColumnUtils.hack_findInternalDynamicColumn(this.state.selectedAttribute as IColumnWrapper);
                    if (dc)
                        dc.requestLocalObject(ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
                }
                else{//if selectable attribute is a LinkableHashmap
                      this.selectedColumnRef = [];
                      this.selectedColumnRef = selectedItems.map((item:IWeaveTreeNode)=> {
                            return Weave.AS(item, weavejs.api.data.IColumnReference);
                      });
                }
            }
		}
    };

    //for the fuzzy search Implementation
    filter = (event:React.FormEvent):void =>{
        this.searchFilter = (event.target as HTMLInputElement).value;
        this.forceUpdate();
    };

    static openInstance(label:string, selectedAttribute:IColumnWrapper|LinkableHashMap, selectableAttributes:Map<string, (IColumnWrapper|LinkableHashMap)>):PopupWindow{
       var attrPop = PopupWindow.open({
            title: 'Attribute Selector for ' + label,
            content: <AttributeSelector label={ label } selectedAttribute={ selectedAttribute } selectableAttributes={ selectableAttributes } />,
            modal: false,
            width: 800,
            height: 450,
        });

       return attrPop;
    }

    render():JSX.Element
    {
        var ui:JSX.Element = this.state.selectedAttribute instanceof LinkableHashMap ?
            <VBox><SelectableAttributesList  showLabelAsButton={ false } label={ this.state.label } columns={ (this.state.selectedAttribute as LinkableHashMap)}></SelectableAttributesList></VBox>
            : null;

        return (
            <VBox style={{ flex: 1, minWidth: 700, maxHeight: 400 }}>

                <ButtonGroupBar items={ this.items }></ButtonGroupBar>

                <HBox style={{height: '300px'}}>
                    <VBox style={{ flex: .5 }}>
                        <WeaveTree searchFilter={ this.searchFilter } hideRoot = {true} hideLeaves = {true} onSelect={this.onHierarchySelected} root={this.rootTreeNode} ref={ (c) => { this.tree = c; } }/>
                    </VBox>
                    <VBox style={{ flex: .5 }}>
                        {this.state.leafNode ?
                        <WeaveTree searchFilter={ this.searchFilter } hideRoot={true} root={this.state.leafNode} onSelect={this.setColumn} ref={ (c) => { this.leafTree = c; } }/>
                        : null}

                        {Weave.IS(this.state.selectedAttribute, LinkableHashMap) ? <HBox><button onClick={ this.handleSelectAll }>Select All</button><button onClick={ this.addSelected }>Add Selected</button></HBox>
                        : null}
                    </VBox>
                </HBox>
                {ui}


            </VBox>
        );
    };
}