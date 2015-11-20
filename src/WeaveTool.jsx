import _ from "lodash";
import React from "react";
import ui from "./react-ui/ui.jsx";
var toolRegistry = {};

const grabberStyle = {
    width: "16",
    height: "16",
    cursor: "move",
    background: "url(http://placehold.it/32x32)"
};
export function registerToolImplementation(asClassName, jsClass) {
    toolRegistry[asClassName] = jsClass;
}

export function getToolImplementation(asClassName) {
    return toolRegistry[asClassName];
}

export class WeaveTool extends React.Component {

    constructor(props) {
        super(props);
        this.toolPath = this.props.toolPath;
        this.toolProps = this.props.toolProps;
        this.state = {};
        var toolType = this.toolPath ? this.toolPath.getType() : this.props.toolClass;
        if(toolType === "weave.visualization.tools::ExternalTool" && this.toolPath && this.toolPath.getType("toolClass")) {
            toolType = this.toolPath.getState("toolClass");
        }
        this.ToolClass = getToolImplementation(toolType);
    }

    componentDidMount() {
        this.header = React.findDOMNode(this.refs.header);
        this.toolElt = React.findDOMNode(this.refs.tool);
    }

    render() {
        var props = {
          key: "tool",
          ref: "tool",
          toolPath: this.toolPath
        };

        if(this.toolElt) {
          props.width = this.toolElt.clientWidth;
          props.height = this.toolElt.clientHeight;
        }

        props = _.merge(props, this.toolProps);

        var chart = React.createElement(this.ToolClass, props);

        return (
            <ui.VBox style={this.props.style} onDragOver={this.props.onDragOver} onDragEnd={this.props.onDragEnd}>
                <div ref="header" style={{height: "25px", width: "100%"}}>
                    <div draggable={true} onDragStart={this.props.onDragStart} style={grabberStyle}/>
                </div>
                <div style={{flex: 1}} ref="tool">
                  {
                    chart
                  }
                </div>
            </ui.VBox>);
    }
}
