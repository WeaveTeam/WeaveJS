import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
var toolRegistry = {};
import ui from "../outts/react-ui/ui.jsx";
import VendorPrefix from "react-vendor-prefix";
import StandardLib from "./Utils/StandardLib";
import {Glyphicon} from "react-bootstrap";

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
        this.state = {
          showControls: false
        };
        var toolType = this.toolPath ? this.toolPath.getType() : this.props.toolClass;
        if(toolType === "weave.visualization.tools::ExternalTool" && this.toolPath.getType("toolClass")) {
            toolType = this.toolPath.getState("toolClass");
        }
        if (toolType === "weavejs.core.LinkableHashMap" && this.toolPath.getType("class"))
            toolType = this.toolPath.getState("class");
        this.ToolClass = getToolImplementation(toolType);
    }

    componentDidMount() {
        this.element = ReactDOM.findDOMNode(this.refs.toolDiv);
        if(React.Component.isPrototypeOf(this.ToolClass)) {
            this.tool = this.refs.tool;
        } else {
            this.tool = new this.ToolClass(_.merge({element: ReactDOM.findDOMNode(this.refs.toolDiv), toolPath: this.toolPath}, this.toolProps));
        }
    }

    componentWillUnmount() {
        if(this.tool.destroy) {
            this.tool.destroy();
        }
    }

    get title() {
      if(this.toolPath) {
        return this.toolPath.getValue("this.hasOwnProperty('title') ? this.title : ''")
          || (this.toolPath.getType('title') ? this.toolPath.getState('title') : '')
          || this.toolPath.getPath().pop();
      } else {
        return this.tool ? this.tool.title : "";
      }
    }

    componentDidUpdate() {
        this.toolPath = this.props.toolPath;
        this.toolProps = this.props.toolProps;
        if(this.toolPath) {
          this.toolPath.addCallback(this, this.forceUpdate);
        }

        if(this.tool && this.tool.resize) {
            this.tool.resize();
        }
    }

    render() {
        var windowBar = {
            width: "100%",
            height: 25,
            backgroundColor: this.state.showControls ? "#f8f8f8": ""
        };

        var titleStyle = {
            cursor: "move",
            height: 25,
            textAlign: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            flex: 1,
            textOverflow: "ellipsis"
        };

        var transitions = {
          visibility: this.state.showControls ? "visible" : "hidden",
          opacity: this.state.showControls ? 0.7 : 0,
          transition: this.state.showControls ? "visibiliy 0s 0.1s, opacity 0.1s linear" : "visibility 0s 0.1s, opacity 0.1s linear"
        };

        var leftControls = {
          marginLeft: 5,
          marginTop: 2,
          width: 20
        };

        var rightControls = {
          marginTop: 2,
          width: 38
        };

        StandardLib.merge(leftControls, transitions);
        StandardLib.merge(rightControls, transitions);

        var toolHeight = this.props.style ? this.props.style.height - 25 : 320;
        var toolWidth = this.props.style ? this.props.style.width : 320;

        var reactTool = "";
        if (React.Component.isPrototypeOf(this.ToolClass)) {
            reactTool = React.createElement(this.ToolClass, _.merge({key: "tool", ref: "tool", toolPath: this.toolPath, style: { height: toolHeight, width: toolWidth }}, this.toolProps));
        }

        return (
          <ui.VBox style={this.props.style} onMouseEnter={() => { this.setState({ showControls: true }); }} onMouseLeave={() => { this.setState({ showControls: false }); }} onDragOver={this.props.onDragOver} onDragEnd={this.props.onDragEnd}>
              <ui.HBox ref="header" style={windowBar} draggable={true} onDragStart={this.props.onDragStart}>
                <ui.HBox style={VendorPrefix.prefix({styles: leftControls}).styles}>
                     <Glyphicon glyph="cog"/>
                </ui.HBox>
                <p style={titleStyle}>{this.title}</p>
                <ui.HBox style={VendorPrefix.prefix({styles: rightControls}).styles}>
                    <div style={{marginRight: 5}}>
                        <Glyphicon glyph="unchecked"/>
                    </div>
                    <div style={{marginRight: 5}}>
                        <Glyphicon glyph="remove"/>
                    </div>
                </ui.HBox>
              </ui.HBox>
              {
                reactTool ?
                  reactTool
                          :
                  <div ref="toolDiv" style={{width: toolWidth, height: toolHeight}}></div>
              }
          </ui.VBox>);
    }
}
