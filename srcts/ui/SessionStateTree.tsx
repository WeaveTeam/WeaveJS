import * as React from "react";
import {HBox, VBox} from "../react-ui/FlexBox";

import WeaveTreeItem = weavejs.util.WeaveTreeItem;
import ColumnDataFilter = weavejs.data.key.ColumnDataFilter;
import ILinkableObject = weavejs.api.core.ILinkableObject;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import SessionManager = weavejs.core.SessionManager;


export interface ISessionTreeProps extends React.HTMLProps<SessionStateTree> {
    root:WeaveTreeItem;
    open?:boolean;
    filter?:ILinkableObject;
    clickHandler?:(selectedItem: WeaveTreeItem, state: boolean) => void;
};

export interface ISessionTreeState {
    open?: boolean;
}

class SessionStateTreeManager
{
    public openedItems:WeaveTreeItem[] = [];
    public selectedItem:WeaveTreeItem = null;

}

export default class SessionStateTree extends React.Component<ISessionTreeProps, ISessionTreeState>
{
    constructor(props:ISessionTreeProps)
    {
        super(props);


        if(this.props.filter)
        {
            this.filteredArray = [];
            //var rootCopy:WeaveTreeItem = this.getWeaveTreeItemCopy(this.props.root);
            this.getChildrenTrailOfType(this.props.root,null, null,this.props.filter);
        }
    }

    state: ISessionTreeState = {
        open: this.props.open !== undefined?this.props.open:false,
    };


    static BRANCH_ICON_CLASSNAME = "weave-tree-view-icon fa fa-folder fa-fw";
    static LEAF_ICON_CLASSNAME = "weave-tree-view-icon fa fa-file-text-o fa-fw";
    static OPEN_BRANCH_ICON_CLASSNAME = "weave-tree-view-icon fa fa-folder-open fa-fw";

    private isBranch=(node:WeaveTreeItem):boolean=>{
        if(node.children && node.children.length >  0 ){
            return true;
        }else{
            return false;
        }
    }

    toggleOpen=()=>
    {
        this.setState({
            open:!this.state.open
        });
        if(this.props.clickHandler){
            this.props.clickHandler(this.props.root,!this.state.open)
        }

    };




    componentWillReceiveProps(nextProps:ISessionTreeProps)
    {
        if(nextProps.open !== undefined)
        {
            this.setState({
                open:nextProps.open
            })
        }

        if(this.props.filter != nextProps.filter)
        {
            this.filteredArray = [];
            //var rootCopy:WeaveTreeItem = this.getWeaveTreeItemCopy(this.props.root);
            this.getChildrenTrailOfType(this.props.root,null,null, this.props.filter);
        }

    }

    private filteredArray:WeaveTreeItem[];
    private rootCopy:WeaveTreeItem;

    getChildrenTrailOfType(child:WeaveTreeItem,childCopy:WeaveTreeItem,rootParent:WeaveTreeItem, filter:any):boolean
    {
        if(Weave.IS(child.dependency , filter))
        {
            if(this.filteredArray.indexOf(rootParent)== -1)
                this.filteredArray.push(rootParent);
            return true;
        }

        if(child.children )
        {
            let filteredChildren:WeaveTreeItem[] = child.children.filter(function(weaveTreeItem:WeaveTreeItem,index:number){
                if(!rootParent){
                    var rootParentCopy:WeaveTreeItem = this.getWeaveTreeItemCopy(weaveTreeItem);
                    return this.getChildrenTrailOfType(rootParentCopy,rootParentCopy,rootParentCopy,filter);
                }else{
                    return this.getChildrenTrailOfType(weaveTreeItem,child,rootParent,filter);
                }


            },this);

            if(filteredChildren && filteredChildren.length > 0)
            {
                if(childCopy)
                    childCopy.children = filteredChildren;
                else
                    child.children = filteredChildren;
                return true;
            }
        }

        return false;
    }


    private getWeaveTreeItemCopy = (item:WeaveTreeItem):WeaveTreeItem =>
    {
        var copy:WeaveTreeItem = new WeaveTreeItem();
        copy.label = item.label;
        copy.data = item.data;
        copy.dependency = item.dependency;
        copy.children = item.children;
        return copy

    }



    private renderChildren=():JSX.Element[]=>
    {
        var childrenUI:JSX.Element[];
        var weaveTreeItems:WeaveTreeItem[] = this.props.root.children;
        
        if( this.props.filter)
        {

            weaveTreeItems = this.filteredArray;
        }



        childrenUI = weaveTreeItems.map(function(weaveTreeItem:WeaveTreeItem,index:number){
            return <SessionStateTree key={ index } 
                                     root={ weaveTreeItem }
                                     clickHandler={ this.props.clickHandler }/>;
        },this);

        return childrenUI;
    };




    render(): JSX.Element {
        var branchUI:JSX.Element = <div/>;

        if(this.props.root)
        {
            let iconClassName:string = SessionStateTree.LEAF_ICON_CLASSNAME; //leaf
            if(this.isBranch(this.props.root))// Branch
            {
                iconClassName = this.state.open ? SessionStateTree.OPEN_BRANCH_ICON_CLASSNAME : SessionStateTree.BRANCH_ICON_CLASSNAME ;
            }

            var treeItemUI:JSX.Element = <HBox  style={{alignItems:"center"}}>
                                            <HBox onClick={this.toggleOpen} style={{alignItems:"inherit"}}>
                                                <i className={ iconClassName } ></i>
                                                <span>&nbsp;{this.props.root.label}</span>
                                            </HBox>
                                        </HBox>;

            if(this.isBranch(this.props.root))// Branch
            {
                var nodesUI:JSX.Element[] = this.state.open? this.renderChildren() : [];

                branchUI = <span>
                                {treeItemUI}
                                <ul style={ {listStyleType:"none",paddingLeft:"8px",margin:"0"} }>
                                    {nodesUI}
                                </ul>
                            </span>;
            }
            else //leaf
            {
                //var listStyle:React.CSSProperties = this.state.open ? {color:"white",background:"aqua"} : {};
                branchUI = <li > {treeItemUI} </li>;
            }
        }

        return (branchUI);
    }
}