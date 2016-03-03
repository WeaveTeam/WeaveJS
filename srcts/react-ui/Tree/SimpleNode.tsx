import * as React from "react";
import SimpleTreeConfig from "./SimpleTreeConfig";

import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;

export interface ISimpleNodeProps
{
    clickCallback: Function;
    data: any;
    treeConfig: SimpleTreeConfig;
    label?: string | Function;
    children?: Array<JSX.Element>;
}

class SimpleNode extends React.Component<ISimpleNodeProps,any> {

    active = Weave.linkableChild(this, LinkableBoolean);
    open = Weave.linkableChild(this, LinkableBoolean);

    constructor(props:any) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.renderChildren = this.renderChildren.bind(this);
        this.addCallbacks();
    }

    addCallbacks(){
        this.open.addImmediateCallback(this, this.forceUpdate);
        this.active.addImmediateCallback(this, this.forceUpdate);
    }

    componentWillUnmount () {
        this.open.removeCallback(this, this.forceUpdate);
        this.active.removeCallback(this, this.forceUpdate);
    }

    toggle(){
        this.open.value = !this.open.value;
        if(this.props.clickCallback)
            this.props.clickCallback.call(this,this.props.data,this.open,this.active);
        this.props.treeConfig.changeActiveNode(this);
    }


    shouldComponentUpdate(nextProps:any){
        if(this.props.data !== nextProps.data){ //makes sure change in child node won't render this node
            return true
        }else{
            return false
        }
    }

    renderChildren(){
        var nodes = this.props.treeConfig.getTreeNodes(this.props.data);
        var nodesUI = nodes.map(function(nodeData:any,index:any):JSX.Element{
            return <SimpleNode key={index}
                        data={nodeData}
                        treeConfig={this.props.treeConfig}
                        clickCallback={this.props.clickCallback}/>;
        }.bind(this));

        return nodesUI;
    }

    isNode(){
        var nodes = this.props.treeConfig.getTreeNodes(this.props.data);
        if(nodes && nodes.length > 0)
            return true; // node
        else
            return false; // leaf
    }

    render() {
        var branchUI = <div/>;

        if(this.props.data){
            var nodesUI:Array<JSX.Element> = [];
            if(this.open.state){
                nodesUI = this.renderChildren();
            }

            var label = this.props.treeConfig.getTreeLabel(this.props.data);
            if(this.isNode()){ //Node

                var fontAwesomeNodeIcon = this.props.treeConfig.getIcon("node",this.open.value);
                var folderUI = <span onClick={this.toggle}>
                                    <i className={fontAwesomeNodeIcon} ></i>
                                    &nbsp;{label}
                                </span>;

                var nodePadding = this.props.treeConfig.nodePadding.state;
                branchUI = <span>
                                {folderUI}
                                <ul style={{listStyleType:"none",paddingLeft:nodePadding}}>
                                    {nodesUI}
                                </ul>
                            </span>;
            }
            else{ //leaf
                var fontAwesomeLeafIcon = this.props.treeConfig.getIcon("leaf",this.open.value);
                // this will return either normal/Active/Slected Style based on state of the leaf
                var leafStyle = this.props.treeConfig.getLeafStyle(this.open.value,this.active.value);
                branchUI = <li style={leafStyle} onClick={this.toggle}>
                            <i className={fontAwesomeLeafIcon} ></i>
                            &nbsp;{label}
                         </li>
            }
        }

        return (branchUI);
    }

}

export default SimpleNode;
