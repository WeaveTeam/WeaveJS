
import * as React from "react";
import SimpleNode from "./SimpleNode";
import SimpleTreeConfig from "./SimpleTreeConfig";

import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;

class SimpleTree extends React.Component<any,any> {

    settings: SimpleTreeConfig;
    constructor(props:any) {
        super(props);
        this.settings = this.props.settings ? this.props.settings:new SimpleTreeConfig();
        this.settings.labelAccessor = this.props.label;
        this.settings.childrenAccessor = this.props.children;
        this.addCallbacks = this.addCallbacks.bind(this);
        this.removeCallbacks = this.removeCallbacks.bind(this);
    }

    componentDidMount(){
       this.addCallbacks();
    }

    addCallbacks(){
        this.settings.nodePadding.addGroupedCallback(this, this.forceUpdate);
        this.settings.nodeStyle.addGroupedCallback(this, this.forceUpdate);
        this.settings.leafStyle.addGroupedCallback(this, this.forceUpdate);
        this.settings.selectedLeafStyle.addGroupedCallback(this, this.forceUpdate);
        this.settings.activeLeafStyle.addGroupedCallback(this, this.forceUpdate);
    }

    removeCallbacks(){
        this.settings.nodePadding.removeCallback(this, this.forceUpdate);
        this.settings.nodeStyle.removeCallback(this, this.forceUpdate);
        this.settings.leafStyle.removeCallback(this, this.forceUpdate);
        this.settings.selectedLeafStyle.removeCallback(this, this.forceUpdate);
        this.settings.activeLeafStyle.removeCallback(this, this.forceUpdate);
    }


    componentWillUnmount () {
        this.removeCallbacks()
    }


    render() {
        return ( <SimpleNode  data={this.props.data}
                    label={this.props.label}
                    children={this.props.children}
                    treeConfig={this.settings}
                    clickCallback={this.props.click}/>
               );
    }

}

export default SimpleTree;
