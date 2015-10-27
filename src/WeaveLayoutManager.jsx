import React from "react";
import Layout from "./react-flexible-layout/Layout.jsx";
import _ from "lodash";
import WeavePanel from "./WeavePanel.js";
import * as WeavePanelManager from "./WeavePanelManager.js";
import WeaveC3Barchart from "./weave-c3-barchart.js";
import WeaveC3ScatterPlot from "./weave-c3-scatterplot.js";
import WeaveC3ColorLegend from "./weave-c3-colorlegend.js";
import WeaveC3LineChart from "./weave-c3-linechart.js";
import WeaveTextFilter from "./weave-text-filter.js";
import WeaveC3PieChart from "./weave-c3-piechart.js";
import WeaveC3Histogram from "./weave-c3-histogram.js";
import WeaveOpenLayersMap from "./weave-openlayers-maptool.js";
import WeaveReactTable from "./weave-react-table.jsx";
import CustomSearchTool from "./CustomSearchTool.jsx";
import {WeaveTool, getToolImplementation} from "./WeaveTool.jsx";
import Weave from "./Weave.jsx";
import StandardLib from "./Utils/StandardLib";

const LAYOUT = "Layout";

const LEFT = "left";
const RIGHT = "right";
const TOP = "top";
const BOTTOM = "bottom";
const VERTICAL = "vertical";
const HORIZONTAL = "horizontal";

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

        this.margin = 8;
    }

    componentDidUpdate() {
        if(this.weave) {
            // console.log(JSON.stringify(this.state.layout, null, 3));
            
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
            this.weave.path(LAYOUT).addCallback(this._layoutChanged.bind(this));
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
        // this.weave.path(LAYOUT).state(newState);
        this.setState({}, () => {
            if(this.weave) {
                this.weave.path(LAYOUT).state(this.state.layout);
            }
        });
    }

    onDragStart(id) {
        this.toolDragged = id;
        this.isDragging = true;
    }

    onDragStop(id, event) {
        if(this.isDragging) {
            this.toolDroppedOn = id;
            if(this.toolDragged !== this.toolDroppedOn) {
                var toolNode = this.refs[LAYOUT].getDOMNodeFromId(id);
                var toolNodePosition = toolNode.getBoundingClientRect();

                var center = {
                    x: (toolNodePosition.right - toolNodePosition.left) / 2,
                    y: (toolNodePosition.bottom - toolNodePosition.top) / 2
                };

                var mousePosRelativeToCenter = {
                    x: event.clientX - (toolNodePosition.left + center.x),
                    y: event.clientY - (toolNodePosition.top + center.y)
                };

                var mouseNorm = {
                    x: (mousePosRelativeToCenter.x) / (toolNodePosition.width / 2),
                    y: (mousePosRelativeToCenter.y) / (toolNodePosition.height / 2)
                };

                var mousePolarCoord = {
                    r: Math.sqrt(mouseNorm.x * mouseNorm.x + mouseNorm.y * mouseNorm.y),
                    theta: Math.atan2(mouseNorm.y, mouseNorm.x)
                };

                var dropZone = "";
                var zones = [RIGHT, BOTTOM, LEFT, TOP];

                var zoneIndex = Math.round((mousePolarCoord.theta / (2 * Math.PI) * 4) + 4) % 4;

                if(mousePolarCoord.r < 0.34) {
                    dropZone = "center";
                } else {
                    dropZone = zones[zoneIndex];
                }

                this.updateLayout(this.toolDragged, this.toolDroppedOn, dropZone);
            }
            this.isDragging = false;
        }
    }

    updateLayout(toolDragged, toolDroppedOn, dropZone) {

        var newState = _.cloneDeep(this.state.layout);
        var src = StandardLib.findDeep(newState, {id: toolDragged});
        var dest = StandardLib.findDeep(newState, {id: toolDroppedOn});

        if(dropZone === "center") {
            var srcId = src.id;
            src.id = dest.id;
            dest.id = srcId;
        }
        else {
            var srcParentArray = StandardLib.findDeep(newState, (obj) => {
                return Array.isArray(obj) && obj.indexOf(src) >= 0;
            });

            srcParentArray.splice(srcParentArray.indexOf(src), 1);

            delete dest.id;
            dest.direction = (dropZone === TOP || dropZone === BOTTOM) ? VERTICAL : HORIZONTAL;

            dest.children = [
                {
                    id: toolDragged,
                    flex: 0.5
                },
                {
                    id: toolDroppedOn,
                    flex: 0.5
                }
           ];
            if(dropZone === BOTTOM || dropZone === RIGHT) {
                dest.children.reverse();
            }
        }
        console.log(JSON.stringify(newState, null, 3));
        this.weave.path(LAYOUT).state(newState);
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
                    children.push(<WeaveTool ref={toolName} key={toolName} toolPath={path} onDragStart={this.onDragStart.bind(this, path.getPath())} onDragStop={this.onDragStop.bind(this, path.getPath())} style={toolPosition}/>);
                }
            }
        }

        return (
            <div style={{position: "absolute", width: "100%", height: "100%"}}>
                <Layout onStateChange={this.handleStateChange.bind(this)} key={LAYOUT} ref={LAYOUT} state={this.state.layout} weave={this.weave}/>
                {children}
            </div>
        );
    }

}

