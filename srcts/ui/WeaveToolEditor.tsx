import * as React from "react";
import * as ReactDOM from "react-dom";

import {HBox, VBox} from "../react-ui/FlexBox";
import SessionStateEditor from "../ui/SessionStateEditor";
import {IVisTool} from "../tools/IVisTool";
import IconButton from "../react-ui/IconButton";

import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;

export interface WeaveToolEditorProps extends React.HTMLProps<WeaveToolEditor>
{
    tool:IVisTool
}

export interface WeaveToolEditorState
{

}

export default class WeaveToolEditor extends React.Component<WeaveToolEditorProps, WeaveToolEditorState>
{
    private weaveRoot:ILinkableHashMap;
    private toolName:string;

    constructor(props:WeaveToolEditorProps)
    {
        super(props);
        this.weaveRoot = Weave.getRoot(this.props.tool);
        this.toolName = this.weaveRoot.getName(this.props.tool);
    }

    openSessionStateEditor=()=>{
        SessionStateEditor.openInstance(this.toolName,this.weaveRoot)
    }


    componentWillReceiveProps(nextProps:WeaveToolEditorProps)
    {
        if(this.props.tool !== nextProps.tool)
        {
            this.weaveRoot = Weave.getRoot(nextProps.tool);
            this.toolName = this.weaveRoot.getName(nextProps.tool);
        }
    }

    render()
    {
        var crumbStyle:React.CSSProperties = {}
        var toolEditorUI:JSX.Element[] | JSX.Element = this.props.tool.renderEditor()

        return (<div>
                    <HBox className="weave-window-header" style = { {alignItems:"center"} }>
                        <div style={ crumbStyle }>
                            {this.toolName}
                        </div>
                        <span style={ {flex:"1"} }/>
                        <IconButton clickHandler={ this.openSessionStateEditor }
                                    useDefaultStyle={true}
                                    iconName="fa fa-bars"
                                    toolTip="Open Session State"
                                    mouseOverStyle={ {color:"white",background:"grey"} }/>
                    </HBox>


                    <div style={{padding:"8px",display:"inherit",flexDirection:"inherit"}}>
                        {toolEditorUI}
                    </div>

                </div>);
    }
}



