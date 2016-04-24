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
import IDataSource = weavejs.api.data.IDataSource;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import SmartComponent from "./SmartComponent";
import DynamicComponent from "./DynamicComponent";
import ControlPanel from "./ControlPanel";
import Button from "../semantic-ui/Button";

export interface IAttributeSelectorProps
{
    attributeName? : string;
    attributes:Map<string,(IColumnWrapper|ILinkableHashMap)>;
}

export interface IAttributeSelectorState
{
    categoryNode? : IWeaveTreeNode;
    selectedAttributeName?:string;

}

export default class AttributeSelector extends SmartComponent<IAttributeSelectorProps,IAttributeSelectorState>
{
    private tree: WeaveTree;
    private rootTreeNode :IWeaveTreeNode;
    private leafTree :WeaveTree;
    private weaveRoot: ILinkableHashMap;
    private searchFilter :string;
    private attributeNames:string[];
    private selectedColumnRef :IColumnReference[] = [];
    private selectedNodes:IWeaveTreeNode[];

	private get selectedAttribute()
	{
		return this.props.attributes.get(this.state.selectedAttributeName);
	}
    constructor(props:IAttributeSelectorProps)
    {
        super(props);

        //required for button bar
        // get all labels for Button Bar
		var attribute = this.props.attributes.get(this.props.attributeName);
        this.attributeNames = Array.from(this.props.attributes.keys());

        this.weaveRoot = Weave.getRoot(attribute);
        this.rootTreeNode  = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);

        this.state = {
            categoryNode : this.getSelectedNodeRoot(attribute),
            selectedAttributeName: this.props.attributeName
        };

        this.selectedNodes = this.getSelectedTreeNodesFor(attribute);//handles initial loading of selected items
    };

    componentWillReceiveProps (nextProps:IAttributeSelectorProps)
    {
		var attribute = this.props.attributes.get(this.props.attributeName);
		var nextAttribute = nextProps.attributes.get(this.props.attributeName);
		
        if(attribute != nextAttribute)
        {
            this.weaveRoot = Weave.getRoot(nextAttribute);
            this.rootTreeNode  = new weavejs.data.hierarchy.WeaveRootDataTreeNode(this.weaveRoot);
        }

        // if the attributes changed by parent update the items
        if(nextProps.attributes != this.props.attributes)
        {
            this.attributeNames = Array.from(this.props.attributes.keys());
        }
    }

    handleSelectedAttribute = (event:React.MouseEvent, name:string = null, index:number = null):void=>
    {
        let selectedAttribute:IColumnWrapper|ILinkableHashMap = this.props.attributes.get(name);

        this.setState({
            selectedAttributeName: name
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
                var lhm = Weave.AS(this.selectedAttribute, ILinkableHashMap);
                if (lhm)
                    lhm.requestObject(null, weavejs.data.column.ReferencedColumn).setColumnReference(ref.getDataSource(), meta);
            }
        }
    };

    handleSelectAll=():void=>{
        if(this.state.categoryNode){
            this.selectedNodes = this.state.categoryNode.getChildren() as IWeaveTreeNode[];//get all leaf nodes
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
        this.setState({
            categoryNode : selectedItems[0]
        });
    };

    setColumn =(selectedItems:Array<IWeaveTreeNode>):void =>{

        var ref = Weave.AS(selectedItems[0], weavejs.api.data.IColumnReference);
        if (ref)
        {
            //TODO is column handling correct?
            var meta = ref.getColumnMetadata();
            if (meta)
            {
                if (Weave.IS(this.selectedAttribute, IColumnWrapper))
				{
					//if selectable attribute is a single column
                    let dc = ColumnUtils.hack_findInternalDynamicColumn(this.selectedAttribute as IColumnWrapper);
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
        else if(Weave.IS(selectedAttribute, ILinkableHashMap))
        {
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

    static openInstance(attributeName:string, attributes:Map<string, IColumnWrapper|ILinkableHashMap>):ControlPanel{
        let weave = Weave.getWeave(attributes.get(attributeName));
        return ControlPanel.openInstance<IAttributeSelectorProps>(weave, AttributeSelector,
                                        {title:Weave.lang('Attribute Selector')},
                                        {attributeName, attributes});
    }
    

    render():JSX.Element
    {
        let constrollerStyle:React.CSSProperties = {
            justifyContent: 'flex-end',
            background: "#F8F8F8",
            padding: "4px",
            marginLeft: "0"
        };

        // weave tree contains absolute child inside so its important to have dispaly flex wrapper to pass on width height
        return (
            <VBox className="weave-padded-vbox" style={ {flex:1} }>
				{
					(this.attributeNames.length > 0)
					?	<ButtonGroupBar activeButton={ this.props.attributeName }
							items={ this.attributeNames }
							clickHandler={this.handleSelectedAttribute}
						/>
					:	null
				}
				{
					Weave.IS(this.selectedAttribute, ILinkableHashMap)
					?	<SelectableAttributesList
							style={{flex: null}}
							attributeName={ this.state.selectedAttributeName }
							attributes={ this.props.attributes}
						/>
					:	null
				}
				{
					Weave.IS(this.selectedAttribute, ILinkableHashMap) ? "WORK IN PROGRESS" : null
				}
                <HDividedBox style={ {flex:1} } loadWithEqualWidthChildren={true}>
				   <div style={{display:"flex"}}>
					   <WeaveTree style={ {flex:"1"} }
								  hideRoot = {true}
								  hideLeaves = {true}
								  onSelect={this.onHierarchySelected}
								  root={this.rootTreeNode}
								  ref={ (c) => { this.tree = c; } }/>
					</div>
					<div style={{display:"flex"}}>
						{
							this.state.categoryNode
                                ? <DynamicComponent dependencies={[this.rootTreeNode]}
                                    render={
                                        () =>
                                            <WeaveTree
                                                style={ { flex: "1" } }
                                                multipleSelection={ true }
                                                initialSelectedItems={ this.selectedNodes }
                                                hideRoot={true}
                                                hideBranches={true}
                                                root={this.state.categoryNode}
                                                onSelect={this.setColumn}
                                                ref={ (c) => { this.leafTree = c; } }
                                                />}/>
							:	null
						}
					</div>
				</HDividedBox>
				{
					Weave.IS(this.selectedAttribute, LinkableHashMap) && this.state.categoryNode
					?
						<HBox className="weave-padded-hbox" style={ constrollerStyle } >
							<Button onClick={ this.handleSelectAll }>Select All</Button>
							<Button onClick={ this.addSelected }>Add Selected</Button>
						</HBox>
					:	null
				}
				{/*
					Weave.IS(this.state.selectedAttribute, ILinkableHashMap)
					?	<VBox>
							<SelectableAttributesList label={ this.state.attributeName } showAsList={true} columns={ this.state.selectedAttribute as ILinkableHashMap}></SelectableAttributesList>
						</VBox>
					:	null
				*/}
			</VBox>
		);
	};
}
