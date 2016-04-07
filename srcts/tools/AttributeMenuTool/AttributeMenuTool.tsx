import * as React from 'react';
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "../IVisTool";
import {HBox, VBox} from "../../react-ui/FlexBox";
import ReactUtils from "../../utils/ReactUtils";
import StatefulComboBox from "../../ui/StatefulComboBox";
import {ListOption} from "../../react-ui/List";
import List from "../../react-ui/List";
import * as lodash from "lodash";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableWatcher = weavejs.core.LinkableWatcher;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import ColumnUtils = weavejs.data.ColumnUtils;
import WeaveAPI = weavejs.WeaveAPI;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;

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

    public targetToolPathWatcher = Weave.linkableChild(this, new LinkableWatcher());//this will re render the EDITOR (callbacks attached in editor)
    public targetAttributeWatcher = Weave.linkableChild(this, new LinkableWatcher());//this will re render the EDITOR (callbacks attached in editor)

    public targetToolPath = Weave.linkableChild(this, new LinkableVariable());
    public targetAttribute = Weave.linkableChild(this, new LinkableVariable());//this will re render the EDITOR (callbacks attached in editor)

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

    get options (): ListOption[]{
        var options :ListOption[] =[];
        //TODO handle them according to the layout mode
        this.choices.getObjects().forEach((column:IAttributeColumn):void =>{
            var option:ListOption = {label: ColumnUtils.getTitle(column), value : column};
            options.push(option);
        });
        return options;
    }

    componentDidMount(){

    }

    renderEditor():JSX.Element{

        return(<VBox>
                <AttributeMenuTargetEditor attributeMenuTool={ this }/>
                { renderSelectableAttributes(this) }
        </VBox>);
    }

    render():JSX.Element{

        switch(this.layoutMode.value){
            case(LAYOUT_LIST):
                return(<VBox><List options={ this.options }/></VBox>);
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

}

class AttributeMenuTargetEditor extends React.Component<IAttributeMenuTargetEditorProps, IAttributMenuToolEditorState>
{
    constructor(props:IAttributeMenuTargetEditorProps){
        super(props);
        this.weaveRoot = Weave.getRoot(this.props.attributeMenuTool);

        //TODO resolve the issue of tool list not being updated
        this.getOpenVizTools();
        this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizTools);//will be called whenever a new tool is added

        Weave.getCallbacks(this.props.attributeMenuTool.targetToolPathWatcher).addGroupedCallback(this, this.forceUpdate);//registering callbacks
        Weave.getCallbacks(this.props.attributeMenuTool.targetAttributeWatcher).addGroupedCallback(this, this.forceUpdate);

        this.props.attributeMenuTool.targetToolPath.addGroupedCallback(this, this.setTargetToolPathWatcher, true);
        this.props.attributeMenuTool.targetAttribute.addGroupedCallback(this, this.setTargetAttributeWatcher, true);
    }

    private openTools:any [];
    private weaveRoot:ILinkableHashMap;
    /*private targetTool:IVisTool;
    private targetAttribute:IColumnWrapper|LinkableHashMap;*/

    getOpenVizTools=():void =>{
        this.openTools = [];

        this.weaveRoot.getObjects().forEach((tool:any):void=>{
            if(tool.selectableAttributes && tool != this.props.attributeMenuTool)//excluding AttributeMenuTool from the list
                this.openTools.push(this.weaveRoot.getName(tool));
        });
    };

    handleTargetToolChange = (selectedItem:string):void => {
        this.props.attributeMenuTool.targetToolPath.state = [selectedItem ];

    };

    handleTargetAttributeChange =(selectedItem:string):void =>{
        this.props.attributeMenuTool.targetAttribute.state = selectedItem ;
    };

    setTargetToolPathWatcher = ():void=>{
        var amt = this.props.attributeMenuTool;
        amt.targetToolPathWatcher.targetPath = amt.targetToolPath.state as string[];

        console.log('targetTool',amt.targetToolPathWatcher.target );
    };

    setTargetAttributeWatcher = ():void=>{
        var amt = this.props.attributeMenuTool;
        amt.targetAttributeWatcher.targetPath = amt.targetAttribute.state as string;

    };


    get targetToolAttributes():string[]{
        var attributes : string[] = [];

        if(this.props.attributeMenuTool.targetToolPath){
            let toolPath = this.props.attributeMenuTool.targetToolPath.state as string[];
            let tool = this.weaveRoot.getObject(toolPath[0]) as IVisTool;
            attributes= Array.from(tool.selectableAttributes.keys());
        }
        return attributes;
    };

    get toolConfigs():[string, JSX.Element][]{
        let toolPath = this.props.attributeMenuTool.targetToolPath.state as string[];
        let tool = toolPath[0];
        let attrPath = this.props.attributeMenuTool.targetAttribute.state as string;

        return[
            [
                Weave.lang("Visualization Tool"),
                <StatefulComboBox value={ tool } options={ this.openTools } onChange={ this.handleTargetToolChange } />
            ],
            [
                Weave.lang("Visualization Attribute"),
                <StatefulComboBox value={ attrPath } options={ this.targetToolAttributes } onChange={ this.handleTargetAttributeChange }  />
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
            { this.openTools ? ReactUtils.generateTable(null, this.toolConfigs, tableStyles): null}
        </VBox>);
    }

}