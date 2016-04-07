import * as React from 'react';
import {IVisTool, IVisToolProps, IVisToolState, renderSelectableAttributes} from "../IVisTool";
import {HBox, VBox} from "../../react-ui/FlexBox";
import ReactUtils from "../../utils/ReactUtils";
import StatefulComboBox from "../../ui/StatefulComboBox";
import {ListOption} from "../../react-ui/List";
import List from "../../react-ui/List";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
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
    private choices = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn), this.forceUpdate, true );
    private targetTool = Weave.linkableChild(this, new LinkableVariable(IVisTool));
    private layoutMode = Weave.linkableChild(this, new LinkableString(LAYOUT_LIST));


    private editor:AttributeMenuTargetEditor;
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

    //triggers the change in the attribute according to the column selected
    handleColumnChoice =(selectedColumns:any[]):void=>{
        /*var selectedCol = selectedColumns[0];
        var attributeToBeSet = Weave.followPath(Weave.getRoot(this), this.editor.targetAttributePath);
        Weave.copyState(selectedCol, attributeToBeSet);*/
        console.log(this);
        console.log(this.editor.targetAttributePath);
    };

    componentDidMount(){
        this.layoutMode.addGroupedCallback(this, this.forceUpdate);
    }

    renderEditor():JSX.Element{

        return(<VBox>
                <AttributeMenuTargetEditor attributeMenuTool={ this } layoutMode={ this.layoutMode } ref={ (c) => { this.editor = c; }} />
                { renderSelectableAttributes(this) }
        </VBox>);
    }

    render():JSX.Element{

        switch(this.layoutMode.value){
            case(LAYOUT_LIST):
                return(<VBox><List options={ this.options } onChange={ this.handleColumnChoice }/></VBox>);
        }
    }
}
Weave.registerClass('weavejs.tool.AttributeMenu', AttributeMenuTool, [weavejs.api.ui.IVisTool],'Attribute Menu Tool' );
Weave.registerClass('weave.ui::AttributeMenuTool', AttributeMenuTool);


//EDITOR for the Attribute Menu Tool

interface IAttributeMenuTargetEditorProps {
    attributeMenuTool:IVisTool;
    layoutMode?:LinkableString;
}

interface IAttributMenuToolEditorState {
    targetTool?:IVisTool;
    targetAttribute?:string;
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

    state : IAttributMenuToolEditorState = {targetTool:null, targetAttribute:null};

    private openTools:any [];
    private targetToolAttributes:{label:string, value:any}[];
    private weaveRoot:ILinkableHashMap;
    public targetAttributePath:Array<string>;

    getOpenVizTools=():void =>{
        this.openTools = ['Select a Visualization Tool'];

        this.weaveRoot.getObjects().forEach((tool:any):void=>{
            if(tool.selectableAttributes && tool != this.props.attributeMenuTool)//excluding AttributeMenuTool from the list
                this.openTools.push({label:this.weaveRoot.getName(tool), value:tool});
        });
    };

    handleTargetTool = (selectedItem:IVisTool):void => {
        this.setState({targetTool:selectedItem});
    };

    getTargetToolAttributes =():void =>{
        this.targetToolAttributes =[{label:'Select an attribute', value:null}];

        if(this.state.targetTool){
            let attributesObj = (this.state.targetTool as IVisTool).selectableAttributes;
            attributesObj.forEach((value:ILinkableHashMap|IColumnWrapper, key:string):void=>{
                this.targetToolAttributes.push({label:key, value:value});
            });
        }
    };

    handleTargetAttribute =(selectedItem:ILinkableHashMap|IColumnWrapper):void =>{
        if(this.state.targetTool)
            this.targetAttributePath = Weave.findPath(this.weaveRoot, selectedItem);
    };

    get toolConfigs():[string, JSX.Element][]{
        console.log('targetTool in render editor', this.state.targetTool);
        return[
            [
                Weave.lang("Visualization Tool"),
                <StatefulComboBox value={ this.state.targetTool } options={ this.openTools } onChange={ this.handleTargetTool } />
            ],
            [
                Weave.lang("Visualization Attribute"),
                <StatefulComboBox value={ this.state.targetAttribute } options={ this.targetToolAttributes }onChange={ this.handleTargetAttribute }  />
            ],
            [
                Weave.lang('Menu Layout'),
                <StatefulComboBox value={ this.props.layoutMode } options={ [LAYOUT_LIST, LAYOUT_COMBO, LAYOUT_VSLIDER, LAYOUT_HSLIDER ] }/>
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