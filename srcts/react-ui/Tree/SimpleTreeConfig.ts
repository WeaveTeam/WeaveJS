import * as _ from "lodash";
import * as React from "react";
import SimpleNode from "./SimpleNode";
import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;

class SimpleTreeConfig {
    nodeIcon = Weave.linkableChild(this, new LinkableString("fa fa-folder"));
    nodeOpenIcon = Weave.linkableChild(this, new LinkableString("fa fa-folder-open"));
    leafIcon = Weave.linkableChild(this, new LinkableString("fa fa-file-text"));
    leafOpenIcon = Weave.linkableChild(this, new LinkableString("fa fa-file-text-o"));
    nodePadding = Weave.linkableChild(this, new LinkableString("20px"));
    nodeStyle = Weave.linkableChild(this, LinkableVariable);
    leafStyle = Weave.linkableChild(this, LinkableVariable);
    selectedLeafStyle = Weave.linkableChild(this, LinkableVariable);
    activeLeafStyle = Weave.linkableChild(this, LinkableVariable);

    labelAccessor: Function|string;
    childrenAccessor: Function|string;
    activeNode: SimpleNode;

    constructor() {
        this.labelAccessor = null;
        this.childrenAccessor = null;
        this.activeNode = null;

        this.selectedLeafStyle.state = {
            "background" : "grey"
        }

        this.activeLeafStyle.state = {
            "background" : "blue"
        }
    }

    getIcon(type:string, isOpen:boolean):string {
        var iconName = (type === "node")? (isOpen ? this.nodeOpenIcon.value : this.nodeIcon.value) : (isOpen ? this.leafOpenIcon.value : this.leafIcon.value);

        return iconName;
    }

    getTreeNodes(data:any){
        var nodes:string|Function = this.childrenAccessor;
        if(nodes instanceof Function)
            return nodes(data);
        else if (data[nodes as string] instanceof Function)
            return data[nodes as string]();
        else
           return data[nodes as string];
    }


    getTreeLabel(data:any){
        var label = this.labelAccessor;
        if(label instanceof Function)
            return label(data);
        else if(data[label as string] instanceof Function)
            return data[label as string]();
        else
            return data[label as string];
    }


    getLeafStyle(open:boolean, active:boolean){
        var style = this.leafStyle.state ?  this.leafStyle.state : {};

        if(open){
            var selectedStyle = this.selectedLeafStyle.state;
            if(selectedStyle) _.merge(style, this.selectedLeafStyle.state);
            if(active){
                var activeStyle = this.activeLeafStyle.state;
                return activeStyle ? _.merge(style, activeStyle) : style;            
            }
        }
        return style;
    }

    changeActiveNode(nodeComponent:SimpleNode) {
        if (this.activeNode) {
            this.activeNode.active.value = false;
        }
        this.activeNode = nodeComponent;
        this.activeNode.active.value = true;
    }
}

export default SimpleTreeConfig;