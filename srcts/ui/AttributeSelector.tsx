import * as React from "react";
import {HBox, VBox,HDividedBox} from "../react-ui/FlexBox";
import {ButtonGroupBar} from "../react-ui/ButtonGroupBar";
import WeaveTree from "./WeaveTree";
import SelectableAttributesList from "../ui/SelectableAttributesList";
import IWeaveTreeNode = weavejs.api.data.IWeaveTreeNode;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveRootDataTreeNode = weavejs.data.hierarchy.WeaveRootDataTreeNode;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IColumnReference = weavejs.api.data.IColumnReference;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import ColumnUtils = weavejs.data.ColumnUtils;
import PopupWindow from "../react-ui/PopupWindow";
import IDataSource = weavejs.api.data.IDataSource;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import SmartComponent from "./SmartComponent";

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
    selectedAttribute?: IColumnWrapper|LinkableHashMap;
    label?:string;

}

export default class AttributeSelector extends SmartComponent<IAttributeSelectorProps,IAttributeSelectorState>
{
    private tree: WeaveTree;
    private rootTreeNode :IWeaveTreeNode;
    private leafTree :WeaveTree;
    private  weaveRoot: ILinkableHashMap;
    private searchFilter :string;
    private items:{[label:string] : Function}={};
    private selectedColumnRef :IColumnReference[];
    private selectedNodes:IWeaveTreeNode[];

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

        this.state = {
            leafNode : null,
            selectedAttribute:this.props.selectedAttribute,
            label:this.props.label
        };

        this.selectedNodes = this.getSelectedTreeNodesFor(this.props.selectedAttribute);//handles initial loading of selected items
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

    handleSelectedAttribute = (name:string):void=>
    {
        let selectedAttribute:IColumnWrapper|LinkableHashMap = this.props.selectableAttributes.get(name);

        this.setState({
            selectedAttribute : selectedAttribute,
            label:name
        });
        this.selectedNodes = this.getSelectedTreeNodesFor(selectedAttribute);
    };

    addSelected =():void=>
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
        if(this.state.leafNode){
            this.selectedNodes = this.state.leafNode.getChildren() as IWeaveTreeNode[];//get all leaf nodes
            this.leafTree.setState({
                selectedItems:this.selectedNodes
            });//accessing leaf tree using ref concept
            //this.setState({selectAll :true});
        }
        else{
            alert("Please select a datasource");
        }

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
        this.selectedNodes = selectedItems;
    };

    //for the fuzzy search Implementation
    filter = (event:React.FormEvent):void =>{
        this.searchFilter = (event.target as HTMLInputElement).value;
        this.forceUpdate();
    };

    getSelectedTreeNodesFor = (selectedAttribute:IColumnWrapper|LinkableHashMap):IWeaveTreeNode[] =>{
        let selectedNodes:IWeaveTreeNode[]=[];
        let selectableObjects:any[] = [];

        if(Weave.IS(selectedAttribute, IColumnWrapper))
        {
            selectableObjects.push(selectedAttribute);//single entry
        }
        else
        {//LinkableHashMap
            selectableObjects = (selectedAttribute as LinkableHashMap).getObjects();
        }

        for(var i:number = 0; i < selectableObjects.length; i++)
        {
            var dsources = ColumnUtils.getDataSources(selectableObjects[i] as IColumnWrapper);
            var dsource = dsources[0] as IDataSource;
            var metadata = ColumnMetadata.getAllMetadata(selectableObjects[i] as IColumnWrapper);
            if (dsource)
            {
                selectedNodes.push(dsource.findHierarchyNode(metadata));

            }
        }
        console.log(selectedNodes);
        return selectedNodes;
    };

    getSelectedNodeRoot = ():IWeaveTreeNode =>{
        var dsources  = ColumnUtils.getDataSources(this.state.selectedAttribute as IColumnWrapper);
        var dsource = dsources[0] as IDataSource;
        if(dsource){
            return dsource.getHierarchyRoot();
        }
        else
            return;
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
        if(this.rootTreeNode)
            var ui:JSX.Element = this.state.selectedAttribute instanceof LinkableHashMap && this.state.leafNode ?
                <VBox>
                    <SelectableAttributesList  showLabelAsButton={ false } label={ this.state.label } columns={ (this.state.selectedAttribute as LinkableHashMap)}></SelectableAttributesList>
                </VBox>
                : null;

        //var selectedNodes:IWeaveTreeNode[];
        //selectedNodes = this.getSelectedTreeNodes();
        //console.log("selected nodes", selectedNodes);

        return (
            <VBox style={{ flex: 1, minWidth: 700, maxHeight: 400 }}>

                <ButtonGroupBar style={{ margin:'10px' }} items={ this.items }></ButtonGroupBar>

                <HDividedBox style={{height: '200px', margin:'10px'}}>
                    <VBox>
                        <WeaveTree searchFilter={ this.searchFilter } hideRoot = {true} hideLeaves = {true} onSelect={this.onHierarchySelected} root={this.rootTreeNode} ref={ (c) => { this.tree = c; } }/>
                    </VBox>
                    <VBox>
                        {this.state.leafNode ?
                        <WeaveTree searchFilter={ this.searchFilter } multipleSelection={ true } initialSelectedItems={ this.selectedNodes } hideRoot={true} root={this.state.leafNode} onSelect={this.setColumn} ref={ (c) => { this.leafTree = c; } }/>
                            : null}

                        {Weave.IS(this.state.selectedAttribute, LinkableHashMap) && this.state.leafNode ?
                        <HBox style={{ justifyContent:'flex-end'} }><button onClick={ this.handleSelectAll }>Select All</button><button onClick={ this.addSelected }>Add Selected</button></HBox>
                            : null}
                    </VBox>
                </HDividedBox>

                {ui}
            </VBox>
        );
    };
}