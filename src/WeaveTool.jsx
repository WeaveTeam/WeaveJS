import React from "react";
import _ from "lodash";

var toolRegistry = null;

export function registerToolImplementation(asClassName, jsClass) {
    if (!toolRegistry)
    {
        toolRegistry = {};
    }
    toolRegistry[asClassName] = jsClass;
}

export function getToolImplementation(asClassName) {
    return toolRegistry[asClassName];
}

export class WeaveTool extends React.Component {

    constructor(props) {
        super(props);
        this.toolPath = this.props.toolPath;
        this.state = {};
    }

    componentDidMount() {
        var ToolClass = getToolImplementation(this.toolPath.getType());
        this.tool = new ToolClass(React.findDOMNode(this.refs.toolDiv), this.toolPath);
        this.updateContents = _.debounce(this.tool._updateContents.bind(this.tool), 50);
    }

    componentWillUnmount() {
        this.tool.destroy();
    }

    componentDidUpdate() {
        this.tool._updateContents();
    }

    render() {
        var grabber = {
            width: "16",
            height: "16",
            cursor: "move",
            background: "url(http://placehold.it/32x32)"
        };

        return (
            <div style={this.props.style}>
                <div>
                    <div onMouseDown={() => { this.props.onStartDrag(); } } style={grabber}/>
                </div>
                <div style={{padding: this.props.margin}}>
                    <div ref="toolDiv" style={{width: "100%", height: "100%"}}/>
                </div>
            </div>);
    }
}
