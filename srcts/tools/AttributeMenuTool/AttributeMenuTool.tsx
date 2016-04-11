import * as React from 'react';
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "../IVisTool";
import {HBox, VBox} from "../../react-ui/FlexBox";
import ReactUtils from "../../utils/ReactUtils";
import StatefulComboBox from "../../ui/StatefulComboBox";
import {ListOption} from "../../react-ui/List";
import List from "../../react-ui/List";
import * as lodash from "lodash";
import HSlider from "../../react-ui/RCSlider/HSlider";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import ColumnUtils = weavejs.data.ColumnUtils;
import WeaveAPI = weavejs.WeaveAPI;
import ReferencedColumn = weavejs.data.column.ReferencedColumn;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import SliderOption from "../../react-ui/RCSlider/RCSlider";

const LAYOUT_LIST:string = "List";
const LAYOUT_COMBO:string = "ComboBox";
const LAYOUT_VSLIDER:string = "VSlider";
const LAYOUT_HSLIDER:string = "HSlider";

export interface IAttributeMenuToolState extends IVisToolState{

}

export default class AttributeMenuTool extends React.Component<IVisToolProps, IAttributeMenuToolState> implements IVisTool
{
    //session properties
    public choices = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), this.forceUpdate, true );//this will re render the TOOL (callbacks attached in TOOL)
    public layoutMode = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST), this.forceUpdate, true);//this will re render the TOOL (callbacks attached in TOOL)
    public selectedAttribute = Weave.linkableChild(this, new LinkableString, this.forceUpdate, true);

    public targetToolPathWatcher = Weave.linkableChild(this, new LinkableWatcher());//this will re render the EDITOR (callbacks attached in editor)

    public targetToolPath:LinkableVariable = Weave.linkableChild(this, new LinkableVariable(Array));
    public targetAttribute = Weave.linkableChild(this, new LinkableVariable(null));//this will re render the EDITOR (callbacks attached in editor)

    constructor (props:IVisToolProps){
        super(props);
        this.state = {};
    }

    get title():string{
        return Weave.lang('Attribute Menu Tool');
    }

    get selectableAttributes()
    {
        return new Map<string, IColumnWrapper | LinkableHashMap>().set("Choices", this.choices);
    }

    get options (){
        return(this.choices.getObjects().map((column:IAttributeColumn) =>{
            return({label: ColumnUtils.getTitle(column), value : column});//TODO replace getTitle with metadata title property?
        }));
    };

    //crude function, should be deleted when possible
    getLabelToAttributeMapping = (labelToMap:string, tool:IVisTool):string =>{
        let mappedvalue:string;
        let root = Weave.getRoot(tool);
        for (let [label, attribute] of tool.selectableAttributes.entries())
        {
            if(label == labelToMap){

                let path = Weave.findPath(root, attribute);
                mappedvalue = lodash.last(path);
                break;
            }

        }
        return mappedvalue;
    };

    //TODO confirm if right way to do
    handleSelection = (selectedValues:any[]):void =>{
        //get target attribute column
        //NOTE: using the target Tool path and the label selected from the target dropdown combobox , we need to construct the correct path and retrieve the column
        var root = Weave.getRoot(selectedValues[0]);//get root hashmap
        var tool = Weave.followPath(root, this.targetToolPath.state as string[]) as IVisTool;//retrieve tool from targetTool Path
        var attrLabel = this.getLabelToAttributeMapping(this.targetAttribute.state as string, tool);//get correct target attribute name from label selected in dropdown
        var path = (this.targetToolPath.state as string[]).slice(); path.push(attrLabel);//get the entire path
        let targetCol = ColumnUtils.hack_findInternalDynamicColumn(Weave.followPath(root, path) as IColumnWrapper);//retrieve column using that path

        //use selected column to set session state of target column
        var selectedColumn = selectedValues[0] as IColumnWrapper;

        this.selectedAttribute.state = this.choices.getName(selectedColumn);//for the list UI to re render
        Weave.copyState(selectedColumn, (targetCol.getInternalColumn() as ReferencedColumn))

    };

    renderEditor():JSX.Element{
        return(<VBox>
                <AttributeMenuTargetEditor attributeMenuTool={ this }/>
                { renderSelectableAttributes(this) }
        </VBox>);
    }

    render():JSX.Element{

        let selectedAttribute = this.choices.getObject(this.selectedAttribute.state as string) as IAttributeColumn;//get object from name

        switch(this.layoutMode.value){
            case(LAYOUT_LIST):
                return(<VBox><List options={ this.options }  onChange={ this.handleSelection } selectedValues={ [selectedAttribute] }/></VBox>);
            case(LAYOUT_HSLIDER):
                return(<VBox style={{ padding: "70px" }}>
                        <HSlider options={ this.options } onChange={ this.handleSelection} selectedValues={ [selectedAttribute] } type={ "categorical" }/></VBox>);
        }
    }
}
Weave.registerClass('weavejs.tool.AttributeMenu', AttributeMenuTool, [weavejs.api.ui.IVisTool],'Attribute Menu Tool' );
Weave.registerClass('weave.ui::AttributeMenuTool', AttributeMenuTool);


//EDITOR for the Attribute Menu Tool

interface IAttributeMenuTargetEditorProps {
    attributeMenuTool:AttributeMenuTool;
}

interface IAttributMenuToolEditorState {
    openTools?:any[];
}

class AttributeMenuTargetEditor extends React.Component<IAttributeMenuTargetEditorProps, IAttributMenuToolEditorState>
{
    constructor(props:IAttributeMenuTargetEditorProps){
        super(props);
        this.weaveRoot = Weave.getRoot(this.props.attributeMenuTool);

        this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizTools,true);//will be called whenever a new tool is added

        Weave.getCallbacks(this.props.attributeMenuTool.targetToolPathWatcher).addGroupedCallback(this, this.forceUpdate);//registering callbacks

        this.props.attributeMenuTool.targetToolPath.addImmediateCallback(this, this.setTargetToolPathWatcher, true);
        this.props.attributeMenuTool.targetAttribute.addGroupedCallback(this, this.monitoringAttribute);
    }

    componentWillReceiveProps(nextProps:IAttributeMenuTargetEditorProps)
    {
        if(this.props.attributeMenuTool != nextProps.attributeMenuTool)
        {
            this.weaveRoot.childListCallbacks.removeCallback(this, this.getOpenVizTools);
            Weave.getCallbacks(this.props.attributeMenuTool.targetToolPathWatcher).removeCallback(this, this.forceUpdate);
            this.props.attributeMenuTool.targetToolPath.removeCallback(this, this.setTargetToolPathWatcher);
            this.props.attributeMenuTool.targetAttribute.removeCallback(this, this.monitoringAttribute);

            this.weaveRoot = Weave.getRoot(nextProps.attributeMenuTool);
            this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizTools,true);//will be called whenever a new tool is added
            Weave.getCallbacks(nextProps.attributeMenuTool.targetToolPathWatcher).addGroupedCallback(this, this.forceUpdate);//registering callbacks
            nextProps.attributeMenuTool.targetToolPath.addImmediateCallback(this, this.setTargetToolPathWatcher, true);
            nextProps.attributeMenuTool.targetAttribute.addGroupedCallback(this, this.monitoringAttribute);
        }


    }

    state : {openTool:any[]};
    private openTools:any [];//visualization tools open at the given time
    private weaveRoot:ILinkableHashMap;

    getOpenVizTools=():void =>
    {
        this.openTools = [];

        this.weaveRoot.getObjects().forEach((tool:any):void=>
        {
            if(tool.selectableAttributes && tool != this.props.attributeMenuTool)//excluding AttributeMenuTool from the list
                this.openTools.push(this.weaveRoot.getName(tool));
        });
        this.setState({openTools: this.openTools});
    };

    //UI event handler for target Tool
    handleTargetToolChange = (selectedItem:string):void =>
    {
        this.props.attributeMenuTool.targetToolPath.state = [selectedItem ];
    };

    //UI event handler for target attribute (one of the selectable attributes of the target tool)
    handleTargetAttributeChange =(selectedItem:string):void =>
    {
        this.props.attributeMenuTool.targetAttribute.state = selectedItem ;
    };

    //callback for the attribute
    monitoringAttribute = ():void =>{
        console.log("target Attribute callback");
        console.log("attribute label", this.props.attributeMenuTool.targetAttribute.state);
        this.forceUpdate();
    };

    //callback for targetToolPath
    setTargetToolPathWatcher = ():void=>{
        var amt = this.props.attributeMenuTool;
        if(amt.targetToolPath.state)
            amt.targetToolPathWatcher.targetPath = amt.targetToolPath.state as string[];
    };

    get tool():IVisTool{
        if(this.props.attributeMenuTool.targetToolPath.state)
            return Weave.followPath(this.weaveRoot, this.props.attributeMenuTool.targetToolPath.state as string[]) as IVisTool;
    }
    getTargetToolAttributeOptions():{label: string, value: string}[] {
        let tool:IVisTool = this.tool;
        let attributes:{label:string, value: string}[] = [];

       if(tool){
           for (let [label, attribute] of tool.selectableAttributes.entries())
           {
               let path = Weave.findPath(this.weaveRoot, attribute);
               let value = lodash.last(path);

               attributes.push({label, value});
           }
       }

        //attributes.unshift({label:'Select an attribute', value : '0'});
       // console.log((this.props.attributeMenuTool.targetToolPath.state as string[])[0],attributes);
        return attributes;
    }

    getTargetToolPath= ():string =>{
        let toolPath = this.props.attributeMenuTool.targetToolPath.state as string[];
        return (toolPath[0] as string);
    };

    getTargetAttribute = ():string =>{
        var tool:IVisTool= this.tool;
        var path:string[];
        if(tool) {
            var attributeName:string = this.props.attributeMenuTool.targetAttribute.state as string;
            var attribute:ILinkableObject = tool.selectableAttributes.get(attributeName) as ILinkableObject;
            path = Weave.findPath(this.weaveRoot, attribute);
        }
        return(lodash.last(path) as string);
    };

    get toolConfigs():[string, JSX.Element][]{

        var toolName:string;
        var attributeValue :string;

        if(this.props.attributeMenuTool.targetToolPath.state){
            toolName = this.getTargetToolPath();
            attributeValue = this.getTargetAttribute();
        }

        console.log('toolName', toolName);
        console.log('attributeValue', attributeValue );
        console.log('open tools in toolconfigs', this.openTools);

        return[
            [
                Weave.lang("Visualization Tool"),
                //<StatefulComboBox value={ 'Scatterplot' } options={ this.openTools } onChange={ this.handleTargetToolChange } />
                <StatefulComboBox value={ toolName } options={ this.openTools } onChange={ this.handleTargetToolChange } />
            ],
            [
                Weave.lang("Visualization Attribute"),

                //<StatefulComboBox value={ 'c' } options={ ['a', 'c'] } onChange={ this.handleTargetAttributeChange }  />
                <StatefulComboBox value={ attributeValue } options={ this.getTargetToolAttributeOptions() } onChange={ this.handleTargetAttributeChange }  />
            ]
        ];
    }


    render ():JSX.Element{
        var tableStyles = {
            table: { width: "100%", fontSize: "smaller" },
            td: [
                { paddingBottom: 10, textAlign: "right", whiteSpace: "nowrap", paddingRight: 5 },
                { paddingBottom: 10, textAlign: "right", width: "100%" }
            ]
        };

        return (<VBox>
            {this.openTools && this.openTools.length >0 ? ReactUtils.generateTable(null, this.toolConfigs, tableStyles):null}
        </VBox>);
    }

}