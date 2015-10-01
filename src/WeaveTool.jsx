import _ from "lodash";
import React from "react";
var toolRegistry = {};

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
        this.element = React.findDOMNode(this);
        this.header = React.findDOMNode(this.refs.header);
        if(React.Component.isPrototypeOf(this.ToolClass)) {
            this.tool = this.refs.tool;
        } else {
            this.tool = new this.ToolClass(_.merge({element: React.findDOMNode(this.refs.toolDiv), toolPath: this.toolPath}));
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
        var grabber = {
            width: "16",
            height: "16",
            cursor: "move",
            background: "url(http://placehold.it/32x32)"
        };

        var reactTool = "";
        if (React.Component.isPrototypeOf(this.ToolClass)) {
            reactTool = React.createElement(this.ToolClass, _.merge({key: "tool", ref: "tool", toolPath: this.toolPath}, this.toolProps));
        }

        var toolHeight = "100%";

        if(this.element) {
            toolHeight = this.element.clientHeight - this.header.clientHeight;
        }

        return (
            <div style={this.props.style}>
                <div ref="header" style={{height: "25px", width: "100%"}}>
                    <div onMouseDown={() => { this.props.onStartDrag(); } } style={grabber}/>
                </div>
                <div style={{position: "relative", width: "100%", height: toolHeight, padding: 16}}>
                    <div ref="toolDiv" style={{width: "100%", height: "100%", maxHeight: toolHeight}}/>
                </div>
            </div>);
    }
}
