import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

import {HBox, VBox} from "../react-ui/FlexBox";
import SessionStateEditor from "../ui/SessionStateEditor";
import {IVisTool} from "../tools/IVisTool";
import IconButton from "../react-ui/IconButton";

import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import ControlPanel from "./ControlPanel";

export interface WeaveToolEditorProps extends React.HTMLProps<WeaveToolEditor>
{
    tool:IVisTool
}

export interface WeaveToolEditorState
{
    activeCrumb:string
}

export default class WeaveToolEditor extends React.Component<WeaveToolEditorProps, WeaveToolEditorState>
{
    private weaveRoot:ILinkableHashMap;
    private toolName:string;
    private childrenCrumbMap:any = {};
    private crumbOrder:string[] = [];

    constructor(props:WeaveToolEditorProps)
    {
        super(props);
        this.weaveRoot = Weave.getRoot(this.props.tool);
        this.toolName = this.weaveRoot.getName(this.props.tool);
        //todo : find a better way to get linked children
        this.childrenCrumbMap[this.toolName] = this.props.tool.renderEditor(this.linkFunction);
        this.state = {
            activeCrumb: this.toolName
        }
        this.crumbOrder[0] = this.toolName;
    }

    openSessionStateEditor=()=>
    {
        SessionStateEditor.openInstance(this.toolName,this.weaveRoot)
    }


    //todo : find a better way to get linked children
    linkFunction=(obj:any):void=>
    {
        this.childrenCrumbMap[obj.title] = <obj.toolClass {...obj.toolProps}/>
        this.setState({
            activeCrumb:obj.title
        });
        this.crumbOrder.push(obj.title);
    }


    componentWillReceiveProps(nextProps:WeaveToolEditorProps)
    {
        if(this.props.tool !== nextProps.tool)
        {
            //reset
            this.childrenCrumbMap= {};
            this.crumbOrder =[];

            //set new
            this.weaveRoot = Weave.getRoot(nextProps.tool);
            this.toolName = this.weaveRoot.getName(nextProps.tool);
            this.childrenCrumbMap[this.toolName] = nextProps.tool.renderEditor(this.linkFunction);
            this.setState({
                activeCrumb: this.toolName
            });
            this.crumbOrder[0] = this.toolName;
        }
    }

    crumbClick=(crumbTitle:string,index:number)=>{
        this.setState({
            activeCrumb:crumbTitle
        });
        this.crumbOrder = this.crumbOrder.slice(0,index+1);
    }

    render()
    {
        var crumbStyle:React.CSSProperties = {}
        var editorUI:JSX.Element[] | JSX.Element = this.childrenCrumbMap[this.state.activeCrumb]

        var crumbUI:JSX.Element[] | JSX.Element = this.crumbOrder.map(function(crumb:string,index:number){
            let styleObj:React.CSSProperties = {}

            let label:string = crumb;
            if(this.state.activeCrumb == crumb && this.crumbOrder.length > 1)
            {
                styleObj.color = "black"
                styleObj["cursor"] ="none";

            }else{
                styleObj.color = "grey";
                styleObj["cursor"] ="pointer";
            }

            if(this.crumbOrder.length > 1 && index < this.crumbOrder.length -1){
                label = label + " >";
            }

            return <span key={String(index)}
                         ref={String(index)}
                         style={styleObj}
                         onClick={this.crumbClick.bind(this,crumb,index)}> {label}&nbsp;</span>
        },this);

        var styleObj:React.CSSProperties = _.merge({},this.props.style,{
            flex:1
        })

        return (<VBox className={this.props.className} style={styleObj}>
                    <HBox className="weave-editor-header" style = { {alignItems:"center"} }>
                        <HBox style={ crumbStyle }>
                            {crumbUI}
                        </HBox>
                        <span style={ {flex:"1"} }/>
                        <IconButton clickHandler={ this.openSessionStateEditor }
                                    iconName="fa fa-bars"
                                    toolTip={"Click to open Session State of " + this.toolName}/>
                    </HBox>


                    <div style={{padding:"8px",display:"flex",flexDirection:"inherit",flex:1}}>
                        {editorUI}
                    </div>

                </VBox>);
    }
}



