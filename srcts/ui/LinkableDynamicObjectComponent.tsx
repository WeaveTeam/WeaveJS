import * as React from "react";
import * as _ from 'lodash';

import {HBox,VBox} from '../react-ui/FlexBox';
import SessionStateTree from './SessionStateTree';
import IconButton from "../react-ui/IconButton";

import LinkableDynamicObject = weavejs.core.LinkableDynamicObject;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import WeaveTreeItem = weavejs.util.WeaveTreeItem;
import SessionManager = weavejs.core.SessionManager;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import SmartComponent from "./SmartComponent";

export interface ILinkableDynamicObjectComponentProps extends React.HTMLProps<LinkableDynamicObjectComponent>
{
    dynamicObject : LinkableDynamicObject;
    label?:string
}

export interface ILinkableDynamicObjectComponentState
{
    openSessionNav?:boolean;
    linkedObjectName?:string;
}

export default class LinkableDynamicObjectComponent extends SmartComponent<ILinkableDynamicObjectComponentProps, ILinkableDynamicObjectComponentState>
{
    constructor(props:ILinkableDynamicObjectComponentProps)
    {
        super(props);
        this.state = {
            openSessionNav:false,
            linkedObjectName:(this.props.dynamicObject as DynamicColumn).globalName
        }
    }

    componentWillReceiveProps(nextProps:ILinkableDynamicObjectComponentProps)
    {
        if(nextProps.dynamicObject != this.props.dynamicObject)
        {
            this.setState({
                linkedObjectName: (nextProps.dynamicObject as DynamicColumn).globalName
            })
        }
    }

    componentDidMount()
    {
        Weave.getCallbacks(this.props.dynamicObject).addGroupedCallback(this, this.forceUpdate)
    }

    private toggleFilteredSessionNav=()=>{
        this.setState({
            openSessionNav: !this.state.openSessionNav
        })
    }

    private closePopOver=()=>{
        this.setState({
            openSessionNav: false
        });
    }

    private linkSessionObject=(selectedItem: WeaveTreeItem, isOpen:boolean):void=>
    {
        (this.props.dynamicObject as DynamicColumn).globalName = selectedItem.label;
        this.setState({
            linkedObjectName: (this.props.dynamicObject as DynamicColumn).globalName
        })
    }

    unLinkSessionObject=():void=>{
        (this.props.dynamicObject as DynamicColumn).globalName = null;
        this.setState({
            linkedObjectName: (this.props.dynamicObject as DynamicColumn).globalName
        })
    }



    render():JSX.Element
    {
        var weaveRoot:ILinkableHashMap = Weave.getRoot(this.props.dynamicObject);
        var weaveTreeItem:WeaveTreeItem = (weavejs.WeaveAPI.SessionManager as SessionManager).getSessionStateTree(weaveRoot,"Dynamic Objects") as WeaveTreeItem;
        var popOverStyle:React.CSSProperties = {
            position:"absolute",
            display:(this.state.openSessionNav?"block":"none"),
            border:"1px solid grey",
            borderRadius:"4px",
            background:"white",
            padding:"8px",
            right:"0"
        };
        console.log((this.props.dynamicObject as any)._typeRestriction);

        var filterType:any = (this.props.dynamicObject as any)._typeRestriction;
        var filterTypeName:string = Weave.className(filterType);

        var styleObj:React.CSSProperties = _.merge({
            justifyContent: 'space-around',
            alignItems: 'center'},this.props.style);

        return (
            <HBox className="weave-padded-hbox" style={styleObj}>
                <span>{this.props.label}</span>
                <input style={{flex: 1}} type="text" value={this.state.linkedObjectName} readOnly/>
                <VBox style={ {position:"relative"} }>
                    <IconButton clickHandler={ this.toggleFilteredSessionNav }
                                iconName="fa fa-link"
                                toolTip={"link object of type " + filterTypeName}>
                    </IconButton>
                    <div ref="popOver" style={popOverStyle} onMouseLeave={this.closePopOver}>
                        <SessionStateTree root={weaveTreeItem}
                                          clickHandler={this.linkSessionObject}
                                          filter={filterType}
                                          open={true} />
                    </div>
                </VBox>

                <IconButton clickHandler={ this.unLinkSessionObject }
                            toolTip={"Un link " + filterTypeName + " object"}
                            iconName="fa fa-chain-broken">
                </IconButton>

            </HBox>
        );
    }
}