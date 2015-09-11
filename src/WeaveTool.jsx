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
        this.tool = new ToolClass(React.findDOMNode(this), this.toolPath);
        this.updateContents = _.debounce(this.tool._updateContents.bind(this.tool), 50);
    }

    componentWillUnmount() {
        this.tool.destroy();
    }

    componentDidUpdate() {
        this.tool._updateContents();
    }

    render() {
        return <div style={this.props.style}/>;
    }
}
