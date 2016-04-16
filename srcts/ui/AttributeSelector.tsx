import * as React from "react";
import {HBox, VBox,HDividedBox} from "../react-ui/FlexBox";
import IconButton from "../react-ui/IconButton";
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
import IDataSource = weavejs.api.data.IDataSource;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import SmartComponent from "./SmartComponent";
import ControlPanel from "./ControlPanel";
import Button from "../semantic-ui/Button";
import ResizingDiv from "../react-ui/ResizingDiv";

export interface IAttributeSelectorProps
{
    label? : string;
    selectedAttribute : IColumnWrapper|ILinkableHashMap;
    showLabelAsButton?:boolean;
    selectableAttributes:Map<string,(IColumnWrapper|ILinkableHashMap)>;
}

export interface IAttributeSelectorState
{
    leafNode? : IWeaveTreeNode;
    selectedAttribute?: IColumnWrapper|ILinkableHashMap;
    label?:string;

}

export default class AttributeSelector extends SmartComponent<IAttributeSelectorProps,IAttributeSelectorState>
{
    private tree: WeaveTree;
    private rootTreeNode :IWeaveTreeNode;
    private leafTree :WeaveTree;
    private weaveRoot: ILinkableHashMap;
    private searchFilter :string;
    private items:{[label:string] : Function}={};
    private selectedColumnRef :IColumnReference[] = [];
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

        this.state = {
            leafNode : this.getSelectedNodeRoot(this.props.selectedAttribute),
            selectedAttribute:this.props.selectedAttribute,
            label:this.props.label
        };

        this.selectedNodes = this.getSelectedTreeNodesFor(this.props.selectedAttribute);//handles initial loading of selected items
    };

    componentWillReceiveProps (nextProps :IAttributeSelectorProps){
        if(nextProps.selectedAttribute != this.props.selectedAttribute){
            this.weaveRoot = Weave.getRoot(nextProps.selectedAttribute);
            this.rootTreeNode  = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
        }
    }

    handleSelectedAttribute = (name:string):void=>
    {
        let selectedAttribute:IColumnWrapper|ILinkableHashMap = this.props.selectableAttributes.get(name);

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
                var lhm = Weave.AS(this.state.selectedAttribute, ILinkableHashMap);
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
                if (Weave.IS(this.state.selectedAttribute, IColumnWrapper))
				{
					//if selectable attribute is a single column
                    let dc = ColumnUtils.hack_findInternalDynamicColumn(this.state.selectedAttribute as IColumnWrapper);
                    if (dc)
                        dc.requestLocalObject(ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
                }
                else
				{
					//if selectable attribute is an ILinkableHashMap
                    this.selectedColumnRef = selectedItems.map((item:IWeaveTreeNode) => {
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

    getSelectedTreeNodesFor = (selectedAttribute:IColumnWrapper|ILinkableHashMap):IWeaveTreeNode[] =>{
        let selectedNodes:IWeaveTreeNode[]=[];
        let selectableObjects:any[] = [];

        if(Weave.IS(selectedAttribute, IColumnWrapper))
        {
            selectableObjects.push(selectedAttribute);//single entry
        }
        else
        {//ILinkableHashMap
            selectableObjects = (selectedAttribute as ILinkableHashMap).getObjects();
        }

        for(var i:number = 0; i < selectableObjects.length; i++)
        {
            var dsources = ColumnUtils.getDataSources(selectableObjects[i] as IColumnWrapper);
            var dsource = dsources[0] as IDataSource;
            var metadata = ColumnMetadata.getAllMetadata(selectableObjects[i] as IColumnWrapper);
            let node = dsource && dsource.findHierarchyNode(metadata);
            if (node)
            {
                selectedNodes.push(node);
            }
        }
        return selectedNodes;
    };

    getSelectedNodeRoot = (selectedAttribute:IColumnWrapper|ILinkableHashMap):IWeaveTreeNode =>{
        var dsources  = ColumnUtils.getDataSources(selectedAttribute as IColumnWrapper);
        var dsource = dsources[0] as IDataSource;
        if(dsource){
            return dsource.getHierarchyRoot();
        }
        else
            return;
    };

    static openInstance(label:string, selectedAttribute:IColumnWrapper|ILinkableHashMap, selectableAttributes:Map<string, IColumnWrapper|ILinkableHashMap>):ControlPanel{
        let weave = Weave.getWeave(selectedAttribute);
        return ControlPanel.openInstance<IAttributeSelectorProps>(weave, AttributeSelector,
                                        {title:Weave.lang('Attribute Selector')},
                                        {label, selectedAttribute, selectableAttributes});
    }

    static openInWeaveToolEditor(title:string,label:string, selectedAttribute:IColumnWrapper|ILinkableHashMap, selectableAttributes:Map<string, IColumnWrapper|ILinkableHashMap>):any{
        let weave = Weave.getWeave(selectedAttribute);
        return  {title:title,label:label,toolClass:AttributeSelector, toolProps:{label, selectedAttribute, selectableAttributes}};
    }

    render():JSX.Element
    {
		if (this.rootTreeNode)
			var ui:JSX.Element = Weave.IS(this.state.selectedAttribute, ILinkableHashMap) && this.state.leafNode
				?	<VBox>
						<SelectableAttributesList  showLabelAsButton={ false } label={ this.state.label } columns={ this.state.selectedAttribute as ILinkableHashMap}></SelectableAttributesList>
					</VBox>
				:	null;

        let constrollerStyle:React.CSSProperties = {
            justifyContent:'flex-end',
            background:"#F8F8F8",
            padding:"4px",
            marginLeft:"0"
        };

        //var selectedNodes:IWeaveTreeNode[];
        //selectedNodes = this.getSelectedTreeNodes();
        //console.log("selected nodes", selectedNodes);

        return (
            <VBox className="weave-padded-vbox" style={ {border:"none"} }>

                <ButtonGroupBar activeButton={ this.props.label } items={ this.items }></ButtonGroupBar>

                <HDividedBox style={ { border:"1px solid lightgrey",width:"100%",height:"50%"} } loadWithEqualWidthChildren={true}>
                       <div style={{display:"flex"}}>
                           <WeaveTree style={ {flex:"1"} }
                                      hideRoot = {true} hideLeaves = {true}
                                    onSelect={this.onHierarchySelected}
                                    root={this.rootTreeNode}
                                    ref={ (c) => { this.tree = c; } }/>
                       </div>
                        <div style={{display:"flex"}}>
                        {this.state.leafNode ? <WeaveTree style={ {flex:"1"} }
                                                          multipleSelection={ true }
                                                          initialSelectedItems={ this.selectedNodes }
                                                          hideRoot={true}
                                                          root={this.state.leafNode}
                                                          onSelect={this.setColumn}
                                                          ref={ (c) => { this.leafTree = c; } }/>
                            : null}
                        </div>
                </HDividedBox>
                {
                    Weave.IS(this.state.selectedAttribute, LinkableHashMap) && this.state.leafNode ?
                        <HBox className="weave-padded-hbox" style={ constrollerStyle } >
                            <Button style={ {fontSize:"smaller"} } onClick={ this.handleSelectAll }>Select All</Button>
                            <Button style={ {fontSize:"smaller"} } onClick={ this.addSelected }>Add Selected</Button>
                        </HBox>
                        : null}

                {ui}
            </VBox>
        );
    };
}
