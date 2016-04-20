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
    enableAccordion?:boolean;
    filter?:ILinkableObject;
    selectionStyle?:React.CSSProperties;
    clickHandler?:(selectedItem: WeaveTreeItem, state: boolean) => void;
};

export interface ISessionTreeState {
    open?: boolean;
}


export default class SessionStateTree extends React.Component<ISessionTreeProps, ISessionTreeState>
{
    public openedItems:WeaveTreeItem[] = [];
    public filteredArray:WeaveTreeItem[] = [];
    public selectedTreeNode:any = null;
    public selectedTreeNodeAtEachDepth:any[] = [];

    constructor(props:ISessionTreeProps)
    {
        super(props);


        if(this.props.filter)
        {
            this.filteredArray = [];
            this.getChildrenTrailOfType(this.props.root,null, null,this.props.filter);
        }
    }

    state: ISessionTreeState = {
        open: this.props.open !== undefined?this.props.open:false,
    };

    componentWillReceiveProps(nextProps:ISessionTreeProps)
    {
        if(nextProps.open !== undefined)
        {
            this.setState({
                open:nextProps.open
            })
        }
    }

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

    render(): JSX.Element {
        return <TreeNode root={ this.props.root }
                         clickHandler= { this.props.clickHandler }
                         open={ this.props.open }
                         filter={ this.props.filter }
                         manager={this}
                         depth={0} />
    }
}


export interface ITreeNodeProps extends ISessionTreeProps {
    root:WeaveTreeItem;
    open?:boolean;
    filter?:ILinkableObject;
    selectionStyle?:React.CSSProperties;
    clickHandler?:(selectedItem: WeaveTreeItem, state: boolean) => void;
    manager:SessionStateTree;
    depth:number;
};

class TreeNode extends React.Component<ITreeNodeProps, ISessionTreeState>
{
    constructor(props:ITreeNodeProps)
    {
        super(props);

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

    public isLeafNode=():boolean=>{
        if(this.props.root.children && this.props.root.children.length >  0 ){
            return false;
        }else{
            return true;
        }
    }

    toggleOpen=()=>
    {
        let selectedTreeNode:TreeNode = this.props.manager.selectedTreeNode;
        let selectedTreeNodeAtCurrentDepth:TreeNode = this.props.manager.selectedTreeNodeAtEachDepth[this.props.depth];

        if(selectedTreeNode)
        {
            if(this.props.manager.props.enableAccordion && (selectedTreeNode == selectedTreeNodeAtCurrentDepth) )
            {
                selectedTreeNode.setState({
                    open: false
                });
            }
            else if(selectedTreeNode.isLeafNode())
            {
                selectedTreeNode.setState({
                    open: false
                });
            }

            if(selectedTreeNodeAtCurrentDepth) // found another selected Node at current depth
            {
                if(this.props.manager.props.enableAccordion  || selectedTreeNodeAtCurrentDepth.isLeafNode()) {
                    selectedTreeNodeAtCurrentDepth.setState({
                        open: false
                    });
                }
            }

        }
        this.setState({
            open:!this.state.open
        });

        if(!this.state.open)
        {
            this.props.manager.selectedTreeNode = this;
            this.props.manager.selectedTreeNodeAtEachDepth[this.props.depth] = this;
        }
        else
        {
            this.props.manager.selectedTreeNode = null;
            this.props.manager.selectedTreeNodeAtEachDepth[this.props.depth] = null;
        }

        if(this.props.clickHandler)
        {
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
    }



    private renderChildren=():JSX.Element[]=>
    {
        var childrenUI:JSX.Element[];
        var weaveTreeItems:WeaveTreeItem[] = this.props.root.children;

        if( this.props.filter)
        {
            weaveTreeItems = this.props.manager.filteredArray;
        }

        childrenUI = weaveTreeItems.map(function(weaveTreeItem:WeaveTreeItem,index:number){
            return <TreeNode key={ index }
                             root={ weaveTreeItem }
                             clickHandler={ this.props.clickHandler }
                             manager={this.props.manager}
                             depth = {this.props.depth + 1}/>;
        },this);

        return childrenUI;
    };


    render(): JSX.Element {
        var branchUI:JSX.Element = <div/>;

        if(this.props.root)
        {
            let iconClassName:string = TreeNode.LEAF_ICON_CLASSNAME; //leaf
            if(this.isBranch(this.props.root))// Branch
            {
                iconClassName = this.state.open ? TreeNode.OPEN_BRANCH_ICON_CLASSNAME : TreeNode.BRANCH_ICON_CLASSNAME ;
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
                let listStyle:React.CSSProperties = {};
                if(this.state.open){
                    let selectionStyle:React.CSSProperties = this.props.manager.props.selectionStyle;
                    listStyle = selectionStyle ? selectionStyle : {color:"white",background:"grey"};
                }

                branchUI = <li style={listStyle}> {treeItemUI} </li>;
            }
        }

        return (branchUI);
    }
}

