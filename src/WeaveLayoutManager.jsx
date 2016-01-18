import React from "react";
import ReactDOM from "react-dom";
import Layout from "../outts/react-flexible-layout/Layout.jsx";
import _ from "lodash";
import WeavePanel from "./WeavePanel.js";
import * as WeavePanelManager from "./WeavePanelManager.js";
import WeaveC3Barchart from "../outts/tools/weave-c3-barchart.jsx";
import WeaveC3ScatterPlot from "../outts/tools/weave-c3-scatterplot.jsx";
import WeaveC3ColorLegend from "../outts/tools/weave-c3-colorlegend.jsx";
import WeaveC3LineChart from "./tools/weave-c3-linechart.jsx";
import WeaveC3PieChart from "../outts/tools/weave-c3-piechart.jsx";
import WeaveC3Histogram from "../outts/tools/weave-c3-histogram.jsx";
import Barchart from "./tools/weave-barchart.jsx";
import WeaveOpenLayersMap from "../outts/tools/OpenLayersMapTool.js";
import WeaveReactTable from "./tools/weave-react-table.jsx";
import SessionStateMenuTool from "./tools/weave-session-state-menu.jsx";
import CustomSearchTool from "./CustomSearchTool.jsx";
/* global Weave, weavejs */
import {WeaveTool, getToolImplementation} from "../outts/WeaveTool.jsx";
import ToolOverlay from "../outts/ToolOverlay.jsx";
import StandardLib from "../outts/utils/StandardLib.js";

const LAYOUT = "Layout";

const LEFT = "left";
const RIGHT = "right";
const TOP = "top";
const BOTTOM = "bottom";
const VERTICAL = "vertical";
const HORIZONTAL = "horizontal";

const TOOLOVERLAY = "tooloverlay";

class WeaveLayoutManager extends React.Component {

    constructor(props) {
        super(props);
        this.weave = this.props.weave || new Weave();
        this.weave.path(LAYOUT).request("FlexibleLayout");
        this.margin = 8;
    }

    componentDidMount() {
        window.addEventListener("resize", this._forceUpdate = _.throttle(() => { this.dirty = true; this.forceUpdate(); }, 30));
        this.weave.root.childListCallbacks.addGroupedCallback(this, _.debounce(this.forceUpdate.bind(this), 0), true);
        this.weave.root.childListCallbacks.addGroupedCallback(this, function() {
            console.log("test child list callback");
        });
        this.weave.path(LAYOUT).addCallback(this, _.debounce(this.forceUpdate.bind(this), 0), true);
        this.weave.path(LAYOUT).state(this.simplifyState(this.weave.path(LAYOUT).getState()));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._forceUpdate);
    }

    componentDidUpdate() {
        if(Weave.detectChange(this, this.weave.getObject(LAYOUT)) || this.dirty) {
            // dirty flag to trigger render on window resize
            this.dirty = false;
            //_.debounce(this.forceUpdate.bind(this), 0)();
            this.forceUpdate();
        }
    }

    saveState(newState) {
        newState = this.simplifyState(newState);
        newState.flex = 1;
        this.weave.path(LAYOUT).state(newState);
        // temporary hack because weave
        // doesn't properly callback forceUpdate
        //this.forceUpdate();
    }

    onDragStart(id, event) {
        this.toolDragged = id;
        var toolRef = id[0]; // toolName as used in the ref for the weave tool.
        var element = ReactDOM.findDOMNode(this.refs[toolRef]);
        event.dataTransfer.setDragImage(element, 0, 0);
        event.dataTransfer.setData('text/html', null);
    }

    hideOverlay() {
        var toolOverlayStyle = _.clone(this.refs[TOOLOVERLAY].state.style);
        toolOverlayStyle.visibility = "hidden";
        toolOverlayStyle.left = toolOverlayStyle.top = toolOverlayStyle.width = toolOverlayStyle.height = 0;
        this.refs[TOOLOVERLAY].setState({
            style: toolOverlayStyle
        });
    }

    onDragEnd() {
        if(this.toolDragged && this.toolOver) {
            this.updateLayout(this.toolDragged, this.toolOver, this.dropZone);
            this.toolDragged = null;
            this.dropZone = null;
            this.hideOverlay();
        }
    }

    onDragOver(toolOver, event) {
        if(!this.toolDragged) {
            return;
        }
        if(_.isEqual(this.toolDragged, toolOver)) {
            // hide the overlay if hovering over the tool being dragged
            this.toolOver = null;
            this.hideOverlay();
            return;
        }

        var toolNode = this.refs[LAYOUT].getDOMNodeFromId(toolOver);
        var toolNodePosition = toolNode.getBoundingClientRect();

        var toolOverlayStyle = _.clone(this.refs[TOOLOVERLAY].state.style);
        var dropZone = this.getDropZone(toolOver, event);
        toolOverlayStyle.left = toolNodePosition.left;
        toolOverlayStyle.top = toolNodePosition.top;
        toolOverlayStyle.width = toolNodePosition.width;
        toolOverlayStyle.height = toolNodePosition.height;
        toolOverlayStyle.visibility = "visible";

        if(dropZone === LEFT) {
            toolOverlayStyle.width = toolNodePosition.width / 2;
        } else if(dropZone === RIGHT) {
            toolOverlayStyle.left = toolNodePosition.left + toolNodePosition.width / 2;
            toolOverlayStyle.width = toolNodePosition.width / 2;
        } else if(dropZone === BOTTOM) {
            toolOverlayStyle.top = toolNodePosition.top + toolNodePosition.height / 2;
            toolOverlayStyle.height = toolNodePosition.height / 2;
        } else if(dropZone === TOP) {
            toolOverlayStyle.height = toolNodePosition.height / 2;
        }

        if (dropZone !== this.dropZone || !_.isEqual(toolOver, this.toolOver)) {
            this.refs[TOOLOVERLAY].setState({
                style: toolOverlayStyle
            });
        }

        this.dropZone = dropZone;
        this.toolOver = toolOver;
    }

    getDropZone(id, event) {
        if(this.toolDragged) {
            if(!_.isEqual(this.toolDragged, id)) {
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

                var zones = [RIGHT, BOTTOM, LEFT, TOP];

                var zoneIndex = Math.round((mousePolarCoord.theta / (2 * Math.PI) * 4) + 4) % 4;

                if(mousePolarCoord.r < 0.34) {
                    return "center";
                } else {
                    return zones[zoneIndex];
                }
            }
        }
    }

    simplifyState(state) {
    	if (!state)
    		return {};
        var children = state.children;

        if (!children) {
            return state;
        }

        if (children.length === 1) {
            return this.simplifyState(children[0]);
        }

        var simpleChildren = [];

        for (var i = 0; i < children.length; i++) {
            var child = this.simplifyState(children[i]);
            if (child.children && child.direction === state.direction) {
                var childChildren = child.children;
                for (var ii = 0; ii < childChildren.length; ii++) {
                    var childChild = childChildren[ii];
                    childChild.flex *= child.flex;
                    simpleChildren.push(childChild);
                }
            }
            else {
                simpleChildren.push(child);
            }
        }
        state.children = simpleChildren;
        var totalSizeChildren = _.sum(_.map(children, "flex"));

        //Scale flex values between 0 and 1 so they sum to 1, avoiding an apparent
        //flex bug where space is lost if sum of flex values is less than 1.
        for (var i = 0; i < state.children.length; i++) {
            state.children[i].flex = StandardLib.normalize(state.children[i].flex, 0, totalSizeChildren);
        }

        return state;
    }

    updateLayout(toolDragged, toolDroppedOn, dropZone) {

        if(!this.toolDragged || !this.toolOver || !this.dropZone) {
            return;
        }

        var newState = _.cloneDeep(this.weave.path(LAYOUT).getState());
        var src = StandardLib.findDeep(newState, {id: toolDragged});
        var dest = StandardLib.findDeep(newState, {id: toolDroppedOn});
        if(_.isEqual(src.id, dest.id)) {
            return;
        }

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
        this.saveState(newState);
    }

    render () {
        var children = [];
        var newState = this.weave.path(LAYOUT).getState();

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
            if (impl === "weavejs.core.LinkableHashMap" && path.getType("class"))
            impl = path.getState("class");
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
                    }
                }
                children.push(<WeaveTool ref={toolName} key={toolName} toolPath={path} style={toolPosition}
                    onDragOver={this.onDragOver.bind(this, path.getPath())} onDragStart={this.onDragStart.bind(this, path.getPath())} onDragEnd={this.onDragEnd.bind(this)}
                    />);
                }
            }

            return (
                <div ref={(elt) => { this.element = elt; }} style={{width: "100%", height: "100%", display: "flex", position: "relative"}}>
                    <Layout key={LAYOUT} ref={LAYOUT} state={_.cloneDeep(newState)} onStateChange={this.saveState.bind(this)}/>
                    {children}
                    <ToolOverlay ref={TOOLOVERLAY}/>
                </div>
            );
        }
    }
    export default WeaveLayoutManager;
