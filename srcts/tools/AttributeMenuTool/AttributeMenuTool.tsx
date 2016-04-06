import * as React from 'react';
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "../IVisTool";
import {HBox, VBox} from "../../react-ui/FlexBox";
import ReactUtils from "../../utils/ReactUtils";
import StatefulComboBox from "../../ui/StatefulComboBox";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
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
    private choices = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));

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

    renderEditor():JSX.Element{

        return(<VBox>
                <AttributeMenuTargetEditor attributeMenuTool={ this }/>
                { renderSelectableAttributes(this) }
        </VBox>);
    }

    render():JSX.Element{

        return(<VBox>

        </VBox>);
    }
}
Weave.registerClass('weavejs.tool.AttributeMenu', AttributeMenuTool, [weavejs.api.ui.IVisTool],'Attribute Menu Tool' );
Weave.registerClass('weave.ui::AttributeMenuTool', AttributeMenuTool);


//EDITOR for the Attribute Menu Tool

interface IAttributeMenuTargetEditorProps {
    attributeMenuTool:IVisTool;
}

interface IAttributMenuToolEditorState {
    targetTool?:IVisTool;
    targetAttribute?:string;
    menuLayout?:string;
}

class AttributeMenuTargetEditor extends React.Component<IAttributeMenuTargetEditorProps, IAttributMenuToolEditorState>
{
    constructor(props:IAttributeMenuTargetEditorProps){
        super(props);
        this.weaveRoot = Weave.getRoot(this.props.attributeMenuTool);

        //TODO resolve the issue of tool list not being updated
        this.getOpenVizTools();
        this.weaveRoot.childListCallbacks.addGroupedCallback(this, this.getOpenVizTools);//will be called whenever a new tool is added
    }

    state : IAttributMenuToolEditorState = {targetTool:null, targetAttribute:null, menuLayout:null};

    private openTools:any [];
    private targetToolAttributes:{label:string, value:any}[];
    private weaveRoot:ILinkableHashMap;

    getOpenVizTools=():void =>{
        this.openTools = ['Select a Visualization Tool'];

        this.weaveRoot.getObjects().forEach((tool:any):void=>{
            if(tool.selectableAttributes && tool != this.props.attributeMenuTool)
                this.openTools.push({label:this.weaveRoot.getName(tool), value:tool});
        });
    };

    handleToolChange = (selectedItem:IVisTool):void => {
        //let targetToolName = this.weaveRoot.getName(selectedItem);
        this.setState({targetTool:selectedItem});
    };

    getTargetToolAttributes =():void =>{
        this.targetToolAttributes =[];

        if(this.state.targetTool){
            let attributesObj = (this.state.targetTool as IVisTool).selectableAttributes;
            attributesObj.forEach((value:ILinkableHashMap|IColumnWrapper, key:string):void=>{
                this.targetToolAttributes.push({label:key, value:value});
            });
        }
    };

    get toolConfigs():[string, JSX.Element][]{
        console.log('targetTool in render editor', this.state.targetTool);
        return[
            [
                Weave.lang("Visualization Tool"),
                <StatefulComboBox value={ this.state.targetTool } options={ this.openTools } onChange={ this.handleToolChange } />
            ],
            [
                Weave.lang("Visualization Attribute"),
                <StatefulComboBox value={ this.state.targetAttribute } options={ this.targetToolAttributes }/>
            ]
        ];
    }

    componentDidMount(){

    }

    render ():JSX.Element{
        var tableStyles = {
            table: { width: "100%", fontSize: "smaller" },
            td: [
                { paddingBottom: 10, textAlign: "right", whiteSpace: "nowrap", paddingRight: 5 },
                { paddingBottom: 10, textAlign: "right", width: "100%" }
            ]
        };

        this.getTargetToolAttributes();
        console.log('targetTool in redner', this.state.targetTool);

        return(<VBox>
            { this.openTools ? ReactUtils.generateTable(null, this.toolConfigs, tableStyles): null}
        </VBox>);
    }

}