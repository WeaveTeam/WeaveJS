import * as React from 'react';
import {IVisTool,IVisToolState, IVisToolProps} from "../IVisTool";
import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import {HBox, VBox} from "../../react-ui/FlexBox";
import LinkableVariable = weavejs.core.LinkableVariable;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveAPI = weavejs.WeaveAPI;
export interface IAttributeMenuToolState extends IVisToolState{

}

export default class AttributeMenuTool extends React.Component<IVisToolProps, IAttributeMenuToolState> implements IVisTool
{
    targetToolPath = Weave.linkableChild(this, new LinkableVariable(Array));
    private weaveRoot :ILinkableHashMap;
    constructor (props:IVisToolProps){
        super(props);
        console.log(props);

        WeaveAPI.Scheduler.callLater(this, this.getOpenVizTools);
    }

    get title():string{
        return Weave.lang('Attribute Menu Tool');
    }

    getOpenVizTools=():void =>{
        var tools:any[];
        this.weaveRoot = Weave.getRoot(this);

        tools = this.weaveRoot.getObjects().filter((tool:any)=>{return tool.selectableAttributes;});//returns IVisTools
    };

    get selectableAttributes()
    {
        return new Map<string, IColumnWrapper | LinkableHashMap>();
    }

    renderEditor():JSX.Element{
        return(<VBox>

        </VBox>);
    }

    render():JSX.Element{
        return(<VBox></VBox>);
    }
}

Weave.registerClass(
	AttributeMenuTool,
	['weave.ui::AttributeMenuTool', 'weavejs.tool.AttributeMenu'],
	[weavejs.api.ui.IVisTool],
	'Attribute Menu Tool'
);
