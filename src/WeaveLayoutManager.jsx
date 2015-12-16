import React from "react";
import Layout from "./react-flexible-layout/Layout.jsx";
import _ from "lodash";
import WeavePanel from "./WeavePanel.js";
import * as WeavePanelManager from "./WeavePanelManager.js";
import WeaveC3Barchart from "./tools/weave-c3-barchart.jsx";
import WeaveC3ScatterPlot from "./tools/weave-c3-scatterplot.jsx";
import WeaveC3ColorLegend from "./tools/weave-c3-colorlegend.jsx";
import WeaveC3LineChart from "./tools/weave-c3-linechart.jsx";
import WeaveC3PieChart from "./tools/weave-c3-piechart.jsx";
import WeaveC3Histogram from "./tools/weave-c3-histogram.jsx";
import WeaveOpenLayersMap from "./tools/map.js";
import WeaveReactTable from "./tools/weave-react-table.jsx";
import SessionStateMenuTool from "./tools/weave-session-state-menu.jsx";
import CustomSearchTool from "./CustomSearchTool.jsx";
import {WeaveTool, getToolImplementation} from "./WeaveTool.jsx";
import ToolOverlay from "./ToolOverlay.jsx";
import Weave from "./Weave.jsx";
import StandardLib from "./Utils/StandardLib";

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

        this.weaveReady = this.weaveReady.bind(this);
        this.debouncedForceUpdate = _.debounce(this.forceUpdate.bind(this), 10);
        this.margin = 8;
    }

    componentDidMount() {
        React.findDOMNode(this);
        if(this.weave) {
            this.weaveReady(this.weave);
        }
        window.addEventListener("resize", this._forceUpdate = () => { this.forceUpdate(); });
    }

    weaveReady(weave) {
        if (this.weave !== weave)
        {
            this.weave = weave;
        }


        this.element = React.findDOMNode(this);

        this.weave.path().getValue("this.childListCallbacks.addGroupedCallback.bind(this.childListCallbacks)")(null, _.debounce(this.forceUpdate.bind(this), 0), true);
        this.weave.path(LAYOUT).addCallback(this._layoutChanged.bind(this), true);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._forceUpdate);
    }

    _layoutChanged() {
        var newState = this.simplifyState(this.weave.path(LAYOUT).getState());
        this.refs[LAYOUT].setState(newState, () => {
            this.setState({
                layout: newState
            });
        });
    }

    handleStateChange(newState) {
        if(this.weave) {
            this.weave.path(LAYOUT).state(newState);
        }
    }

    onDragStart(id, event) {
        this.toolDragged = id;
        var toolRef = id[0]; // toolName as used in the ref for the weave tool.
        var element = React.findDOMNode(this.refs[toolRef]);
        event.dataTransfer.setDragImage(element, 0, 0);
    }

    onDragEnd() {
        if(this.toolDragged && this.toolOver) {
            this.updateLayout(this.toolDragged, this.toolOver, this.dropZone);
            this.toolDragged = null;
            this.dropZone = null;
            var toolOverlayStyle = _.clone(this.refs[TOOLOVERLAY].state.style);

            toolOverlayStyle.visibility = "hidden";

            this.refs[TOOLOVERLAY].setState({
                style: toolOverlayStyle
            });
       }
    }

    onDragOver(toolOver, event) {

        if(!this.toolDragged) {
            return;
        }

        var toolOverlayStyle = _.clone(this.refs[TOOLOVERLAY].state.style);

        if(_.isEqual(this.toolDragged, toolOver)) {
            this.toolOver = null;
            if(toolOverlayStyle.visibility !== "hidden") {
                toolOverlayStyle.visibility = "hidden";
                this.refs[TOOLOVERLAY].setState({
                    style: toolOverlayStyle
                });
            }
            return;
        }

        var toolNode = this.refs[LAYOUT].getDOMNodeFromId(toolOver);
        var toolNodePosition = toolNode.getBoundingClientRect();

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
        var totalSize = _.sum(_.map(state.children, "flex"));
        if(totalSize < 1.0){
          for(var i = 0; i < state.children.length; i++) {
            state.children[i].flex = StandardLib.normalize(state.children[i].flex,0.0,totalSize);
          }
        }
        return state;
    }

    updateLayout(toolDragged, toolDroppedOn, dropZone) {

        if(!this.toolDragged || !this.toolOver || !this.dropZone) {
            return;
        }

        var newState = _.cloneDeep(this.state.layout);
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
        this.weave.path(LAYOUT).state(newState);
    }

    render () {

        var children = [];

        if(!this.weave) {
            // creates the weave flash instance as a WeaveTool React component
            children.push(<WeaveTool ref="Weave" key="Weave" toolClass="Weave" toolProps={{onWeaveReady: this.weaveReady}}/>);
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
        }

        return (
            <div style={{width: "100%", height: "100%", display: "flex"}}>
                <Layout onStateChange={this.handleStateChange.bind(this)} key={LAYOUT} ref={LAYOUT} state={this.state.layout} weave={this.weave}/>
                {children}
                <ToolOverlay ref={TOOLOVERLAY}/>
            </div>
        );
    }
}
export default WeaveLayoutManager;
