import _ from "lodash";
import React from "react";
var toolRegistry = {};
import ui from "./react-ui/ui.jsx";

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

        if(this.toolPath) {
          this.toolPath.push("panelTitle").addCallback(this.forceUpdate.bind(this));
        }
    }

    componentDidMount() {
        this.element = React.findDOMNode(this.refs.toolDiv);
        if(React.Component.isPrototypeOf(this.ToolClass)) {
            this.tool = this.refs.tool;
        } else {
            this.tool = new this.ToolClass(_.merge({element: React.findDOMNode(this.refs.toolDiv), toolPath: this.toolPath}, this.toolProps));
        }
    }

    componentWillUnmount() {
        if(this.tool.destroy) {
            this.tool.destroy();
        }
    }

    componentDidUpdate() {
        if(this.tool.resize) {
            this.tool.resize();
        }
    }

    render() {
        var windowBar = {
            width: "100%",
            height: 25,
            cursor: "move",
            backgroundColor: "#4D5258"
        };

        var toolHeight = this.props.style ? this.props.style.height - 50 : "100%";

        var reactTool = "";
        if (React.Component.isPrototypeOf(this.ToolClass)) {
            reactTool = React.createElement(this.ToolClass, _.merge({key: "tool", ref: "tool", toolPath: this.toolPath, height: toolHeight}, this.toolProps));
        }


        return (
          <ui.VBox style={this.props.style} onDragOver={this.props.onDragOver} onDragEnd={this.props.onDragEnd}>
              <div ref="header" style={windowBar} draggable={true} onDragStart={this.props.onDragStart}/>
              <span style={{height: 25, textAlign: "center"}}>{this.toolPath.getState("panelTitle")}</span>
              {
                reactTool ?
                  reactTool
                          :
                  <div ref="toolDiv" style={{width: "100%", height: toolHeight}}></div>
              }
          </ui.VBox>);
    }
}
