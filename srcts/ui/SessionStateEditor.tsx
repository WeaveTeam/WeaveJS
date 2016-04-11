import * as React from "react";
import {HBox,VBox,HDividedBox} from '../react-ui/FlexBox';
import SessionStateTree from './SessionStateTree';
import PopupWindow from "../react-ui/PopupWindow";
import IconButton from "../react-ui/IconButton";
import LinkableDynamicObjectComponent from "./LinkableDynamicObjectComponent";

import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveTreeItem = weavejs.util.WeaveTreeItem;
import SessionManager = weavejs.core.SessionManager;
import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import LinkableString = weavejs.core.LinkableString;
import SmartComponent from "./SmartComponent";
import FormEvent = __React.FormEvent;


export interface ISessionStateEditorProps extends React.HTMLProps<SessionStateEditor>
{
    weaveRoot:ILinkableHashMap;
    name:string;
}

export interface ISessionStateEditorState
{
    activeItem:WeaveTreeItem;
}

export default class SessionStateEditor extends SmartComponent<ISessionStateEditorProps, ISessionStateEditorState>
{
    static openInstance(label:string, weaveRoot:ILinkableHashMap):PopupWindow{

        var attrPop = PopupWindow.open({
            title: 'Session State for ' + label,
            content: <SessionStateEditor  weaveRoot={ weaveRoot } name= {label}/>,
            modal: false,
            width: 800,
            height: 450,
        });

        return attrPop;
    }



    constructor(props:ISessionStateEditorProps)
    {
        super(props);

        this.rootWeaveTreeItem = (weavejs.WeaveAPI.SessionManager as SessionManager).getSessionStateTree(this.props.weaveRoot,"Weave") as WeaveTreeItem;

        if(this.props.name)
        {
            let filteredItem:WeaveTreeItem[] = this.rootWeaveTreeItem.children.filter(function(weaveTreeItem:WeaveTreeItem,index:number){
                return weaveTreeItem.label == this.props.name
            },this);

            this.rootWeaveTreeItem = filteredItem[0];
        }

        this.state = {
            activeItem:this.rootWeaveTreeItem
        }
    }

    componentWillReceiveProps(nextProps:ISessionStateEditorProps)
    {
        if(nextProps.weaveRoot != this.props.weaveRoot)
        {
            this.rootWeaveTreeItem = (weavejs.WeaveAPI.SessionManager as SessionManager).getSessionStateTree(nextProps.weaveRoot,"Weave") as WeaveTreeItem;
        }
        if(nextProps.name != this.props.name)
        {
            let filteredItem:WeaveTreeItem[] = this.rootWeaveTreeItem.children.filter(function(weaveTreeItem:WeaveTreeItem,index:number){
                return weaveTreeItem.label == nextProps.name
            },this);

            this.rootWeaveTreeItem = filteredItem[0];
        }
    }

    private rootWeaveTreeItem:WeaveTreeItem = null;

    private nodeClickHandler = (item:WeaveTreeItem,isOpen:boolean):void=>
    {
        this.setState({
          activeItem:item
        });

    }

    render():JSX.Element
    {
        return (<HDividedBox style={{flex:1}}>
                    <div style={ {padding:"4px",fontSize:"14px"} }>
                        <SessionStateTree root={ this.rootWeaveTreeItem } clickHandler= { this.nodeClickHandler } open={true}/>
                    </div>
                    <WeaveTreeItemEditor item={ this.state.activeItem } style={ {padding:"4px",fontSize:"14px"} }/>
                </HDividedBox>
            );
    }
}

interface IWeaveTreeItemEditorProps  extends React.HTMLProps<WeaveTreeItemEditor>
{
    item:WeaveTreeItem
}

interface IWeaveTreeItemEditorState
{
    sessionValue:string
}

class WeaveTreeItemEditor extends SmartComponent<IWeaveTreeItemEditorProps, IWeaveTreeItemEditorState>
{

    constructor(props:IWeaveTreeItemEditorProps)
    {
        super(props);
        this.state = {
            sessionValue: this.getStateAsStringFromItem()
        }
    }

    componentWillReceiveProps(nextProps:IWeaveTreeItemEditorProps):void
    {
        if(this.props.item != nextProps.item)
        {
            this.setState({
                sessionValue:this.getStateAsStringFromItem(nextProps.item)
            })
        }

    }

    get isDynamicLinkableObject():boolean
    {
        return (this.props.item.dependency instanceof weavejs.core.LinkableDynamicObject);
    }


    private getStateAsStringFromItem =(item:WeaveTreeItem = null):string=>
    {
        if(!this.props.item)
            return "";

        var activeItem:WeaveTreeItem = item ? item : this.props.item;
        var state:any = Weave.getState(activeItem.data);
        var str:string;
        /*if (activeItem.data instanceof weavejs.core.LinkableString)
            str = state as string;
        else*/
        //to display null, we have to use stringify even for LinkableString
        str = Weave.stringify(state, null, '\t', true);

        return str;
    }

    private saveSessionValue = ():void =>
    {
        var value:string = this.state.sessionValue;
        if (this.props.item.data instanceof weavejs.core.LinkableString)
            (this.props.item.data as LinkableString).value = value;
        else
            Weave.setState(this.props.item.data, JSON.parse(value));
    }

    changeSessionStateValue=(e:FormEvent):void=>
    {
        this.setState({
            sessionValue: (e.target as HTMLTextAreaElement).value
        })
    }

    render():JSX.Element
    {
        var linkableDynamicObjectUI:JSX.Element = null;
        var title:string="";
        if(this.props.item)
        {
            if(this.isDynamicLinkableObject)
            {
                linkableDynamicObjectUI = <LinkableDynamicObjectComponent  dynamicObject={this.props.item.dependency as LinkableDynamicObject}/>
            }
            title = this.props.item.label;
        }


        return (<VBox className = "weave-padded-vbox" style={ this.props.style }>
                    <HBox className = "weave-window-header" style= { {alignItems:"center",fontSize:"inherit"} }>
                        {title}
                        <span style={ {flex:"1"} }/>
                        {linkableDynamicObjectUI}
                        <IconButton clickHandler={ this.saveSessionValue }
                                    toolTip={"click to save Session State of " + title}
                                    style={ {borderColor:"grey",fontSize:"inherit"} }>
                            Apply
                        </IconButton>
                    </HBox>
                    <form style={ {display:"flex",flexWrap:"wrap",overflow:"auto", flex:"1"} }>
                        <textarea ref="textArea" style={ {border:"none",flex:"1"} }
                                   value={this.state.sessionValue} onChange={this.changeSessionStateValue}/>
                    </form>


                </VBox>
        );
    }
}

