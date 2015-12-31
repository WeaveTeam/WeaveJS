///<reference path="../typings/react/react.d.ts"/>
///<reference path="../typings/react/react-dom.d.ts"/>
///<reference path="../typings/lodash/lodash.d.ts"/>
///<reference path="../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
///<reference path="../typings/react-bootstrap/react-bootstrap.d.ts"/>

import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ui from "./react-ui/ui";
import * as VendorPrefix from "react-vendor-prefix";
import StandardLib from "./Utils/StandardLib";
import {Glyphicon} from "react-bootstrap";
import AbstractWeaveTool from "./tools/AbstractWeaveTool";
import {CSSProperties} from "react";
import {IAbstractWeaveToolProps} from "./tools/AbstractWeaveTool";
import {IAbstractWeaveToolState} from "./tools/AbstractWeaveTool";

const toolRegistry:{[name:string]: AbstractWeaveTool} = {};

const grabberStyle:CSSProperties = {
    width: "16",
    height: "16",
    cursor: "move",
    background: "url(http://placehold.it/32x32)"
};

export function registerToolImplementation(asClassName:string, jsClass:any) {
    toolRegistry[asClassName] = jsClass;
}

export function getToolImplementation(asClassName:string):any {
    return toolRegistry[asClassName];
}

interface IWeaveToolProps extends React.Props<WeaveTool> {
    toolPath:WeavePath;
    toolProps:IAbstractWeaveToolProps;
    toolClass:string;
    style:CSSProperties;
    onDragStart:React.MouseEvent;
    onDragEnd:React.MouseEvent;
    onDragOver:React.MouseEvent;
}

interface IWeaveToolState {
    showControls:boolean;
}

export class WeaveTool extends React.Component<IWeaveToolProps, IWeaveToolState> {

    private toolPath:WeavePath;
    private toolProps:IAbstractWeaveToolProps;
    private ToolClass:any;
    private element:Element;
    private tool:any;

    constructor(props:IWeaveToolProps) {
        super(props);
        this.toolPath = this.props.toolPath;
        this.toolProps = this.props.toolProps;

        this.state = {
            showControls: false
        };

        var toolType:string = this.toolPath ? this.toolPath.getType() : this.props.toolClass;
        if(toolType === "weave.visualization.tools::ExternalTool" && this.toolPath.getType("toolClass")) {
            toolType = this.toolPath.getState("toolClass");
        }
        if(toolType === "weavejs.core.LinkableHashMap" && this.toolPath.getType("class"))
            toolType = this.toolPath.getState("class");
        this.ToolClass = getToolImplementation(toolType);
    }

    componentDidMount():void {
        this.element = ReactDOM.findDOMNode(this.refs["toolDiv"]);
        if(React.Component.isPrototypeOf(this.ToolClass)) {
            this.tool = this.refs["tool"];
        } else {
            this.tool = new this.ToolClass(_.merge({element: ReactDOM.findDOMNode(this.refs["toolDiv"]), toolPath: this.toolPath}, this.toolProps));
        }
    }

    componentWillUnmount():void {
        if(this.tool.destroy) {
            this.tool.destroy();
        }
    }

    get title():string {
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
        var windowBar:CSSProperties = {
            width: "100%",
            height: 25,
            backgroundColor: this.state.showControls ? "#f8f8f8": ""
        };

        var titleStyle:CSSProperties = {
            cursor: "move",
            height: 25,
            textAlign: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            flex: 1,
            textOverflow: "ellipsis"
        };

        var transitions:CSSProperties = {
            visibility: this.state.showControls ? "visible" : "hidden",
            opacity: this.state.showControls ? 0.7 : 0,
            transition: this.state.showControls ? "visibiliy 0s 0.1s, opacity 0.1s linear" : "visibility 0s 0.1s, opacity 0.1s linear"
        };

        var leftControls:CSSProperties = {
            marginLeft: 5,
            marginTop: 2,
            width: 20
        };

        var rightControls:CSSProperties = {
            marginTop: 2,
            width: 38
        };

        StandardLib.merge(leftControls, transitions);
        StandardLib.merge(rightControls, transitions);

        var toolHeight:number = this.props.style ? this.props.style.height - 25 : 320;
        var toolWidth:number = this.props.style ? this.props.style.width : 320;

        var reactTool:any;
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
