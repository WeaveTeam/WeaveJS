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

export interface IAttributeMenuToolState extends IVisToolState{

}

export default class AttributeMenuTool extends React.Component<IVisToolProps, IAttributeMenuToolState> implements IVisTool
{
    private openTools:any [];
    private weaveRoot :ILinkableHashMap;
    private choices = Weave.linkableChild(this, new LinkableHashMap(IAttributeColumn));

    constructor (props:IVisToolProps){
        super(props);
        this.state = {};
        WeaveAPI.Scheduler.callLater(this, this.getOpenVizTools);
    }

    get title():string{
        return Weave.lang('Attribute Menu Tool');
    }

    getOpenVizTools=():void =>{
        this.weaveRoot = Weave.getRoot(this);
        this.openTools = [];

        this.weaveRoot.getObjects().forEach((tool:any):void=>{ if(tool.selectableAttributes)
            this.openTools.push({label:this.weaveRoot.getName(tool), value:tool});
        });

        console.log("open tools", this.openTools);
    };

    //TODO Figure out this issue
    handleToolChange = (selectedItem:{label:string, value:IVisTool}):void => {
        var selectedTool = selectedItem.value as IVisTool;
    };


    get selectableAttributes()
    {
        return new Map<string, IColumnWrapper | LinkableHashMap>().set("Choices", this.choices);
    }

    get toolConfigs():[string, JSX.Element][]{
        return[
            [
                Weave.lang("Visualization Tool"),
                <StatefulComboBox options={ this.openTools } onChange={ this.handleToolChange } />
            ]
        ];
    }



    renderEditor():JSX.Element{
        var tableStyles = {
            table: { width: "100%", fontSize: "inherit" },
            td: [
                { paddingBottom: 10, textAlign: "right", whiteSpace: "nowrap", paddingRight: 5 },
                { paddingBottom: 10, textAlign: "right", width: "100%" }
            ]
        };

        return(<VBox>
            { this.openTools ? ReactUtils.generateTable(null, this.toolConfigs, tableStyles): null}
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