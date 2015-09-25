import React from "react";
import Layout from "./react-flexible-layout/Layout.jsx";
import _ from "lodash";
import WeavePanel from "./WeavePanel.js";
import * as WeavePanelManager from "./WeavePanelManager.js";
import WeaveC3Barchart from "./weave-c3-barchart.js";
import WeaveD3Barchart from "./weave-d3-barchart.js";
import WeaveC3ScatterPlot from "./weave-c3-scatterplot.js";
import WeaveD3ScatterPlot from "./weave-d3-scatterplot.js";
import WeaveC3ColorLegend from "./weave-c3-colorlegend.js";
import WeaveC3LineChart from "./weave-c3-linechart.js";
import SimpleAxisPlotter from "./weave/visualization/plotters/SimpleAxisPlotter.js";
import WeaveTextFilter from "./weave-text-filter.js";
import WeaveC3PieChart from "./weave-c3-piechart.js";
import WeaveC3Histogram from "./weave-c3-histogram.js";
import CustomSearchTool from "./CustomSearchTool.jsx";
import {WeaveTool, getToolImplementation} from "./WeaveTool.jsx";
import Weave from "./Weave.jsx";

const LAYOUT = "Layout";

export default class WeaveLayoutManager extends React.Component {

    constructor(props) {
        super(props);

        if(this.props.weave) {
            this.weave = this.props.weave;
            this.state = {
                layout: this.weave.path(LAYOUT).request("FlexibleLayout").getState()
            };
        } else {
            this.state = {
                layout: {
                    id: ["Weave"],
                    flex: 1
                }
            };
        }
        this._boundHandleStateChange = this.handleStateChange.bind(this);

        this.margin = 8;
    }

    componentDidUpdate() {
        if(this.weave) {
            this.weave.path(LAYOUT).state(this.state.layout);
        }
    }

    componentDidMount() {
        if(this.weave) {
            this.weaveReady(this.weave);
        }
    }

    weaveReady(weave) {
        try {
            if (this.weave !== weave)
            {
                this.weave = weave;
                this.setState({
                    layout: this.weave.path(LAYOUT).request("FlexibleLayout").getState()
                });
            }
            window.addEventListener("resize", this._forceUpdate = () => { this.forceUpdate(); });
            this.element = React.findDOMNode(this);

            this.weave.path().getValue("childListCallbacks.addGroupedCallback")(null, _.debounce(this.forceUpdate.bind(this), 0), true);
            this.weave.path(LAYOUT).addCallback(_.debounce(this._layoutChanged.bind(this), 0));
        } catch(e) {
            console.error(e);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._forceUpdate);
    }

    _layoutChanged() {
        if(this.weave) {
            this.setState({
                layout: this.weave.path(LAYOUT).getState()
            });
        }
    }

    handleStateChange() {
        this.setState({
            layout: this.refs[LAYOUT].state
        });
    }

    onDragStart(id) {
        this.refs[LAYOUT].startDrag(id);
        console.log("drag start");
    }

    render () {

        var children = [];

        if(!this.weave) {
            // creates the weave flash instance as a WeaveTool React component
            children.push(<WeaveTool ref="Weave" key="Weave" toolClass="Weave" toolProps={{onWeaveReady: this.weaveReady.bind(this)}}/>);
        } else {
            // during the second render, creates the other tools including weave
            var paths = this.weave.path().getChildren();
            var rect;
            if(this.element) {
                rect = this.element.getBoundingClientRect();
            }

            for(var i = 0; i < paths.length; i++) {
                var path = paths[i];
                var impl = path.getType();
                if(impl === "weave.visualization.tools::ExternalTool" && path.getType("toolClass")) {
                    impl = path.getState("toolClass");
                }
                impl = getToolImplementation(impl);
                var toolName = path.getPath()[0];
                var node;
                var toolRect;
                var toolPosition;
                if(impl) {
                    if(this.refs[LAYOUT] && rect) {
                        node = this.refs[LAYOUT].getDOMNodeFromId(path.getPath());
                        if(node) {
                            toolRect = node.getBoundingClientRect();
                            if(toolName === "Weave") {
                                console.log(toolRect);
                            }
                            toolPosition = {
                                top: toolRect.top - rect.top,
                                left: toolRect.left - rect.left,
                                width: toolRect.right - toolRect.left,
                                height: toolRect.bottom - toolRect.top,
                                position: "absolute"
                            };
                            toolPosition.maxHeight = toolPosition.height;
                            toolPosition.maxWidth = toolPosition.width;
                        }
                    }
                    children.push(<WeaveTool ref={toolName} key={toolName} toolPath={path} onDragStart={this.onDragStart.bind(this, path.getPath())} style={toolPosition}/>);
                }
            }
        }

        return (
            <div style={{position: "absolute", width: "100%", height: "100%"}}>
                <Layout onStateChange={this._boundHandleStateChange} key={LAYOUT} ref={LAYOUT} state={this.state.layout} weave={this.weave}/>
                {children}
            </div>
        );
    }

}

