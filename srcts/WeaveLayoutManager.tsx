/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/lodash/lodash.d.ts"/>
/// <reference path="../typings/weave/Weave.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import Layout from "./react-flexible-layout/Layout";
import {LayoutState} from "./react-flexible-layout/Layout";
import CustomSearchTool from "./CustomSearchTool";
import WeaveC3Barchart from "./tools/weave-c3-barchart";
import WeaveC3ScatterPlot from "./tools/weave-c3-scatterplot";
import WeaveC3ColorLegend from "./tools/weave-c3-colorlegend";
import WeaveC3BarChartLegend from "./tools/weave-c3-barchartlegend"
import WeaveC3LineChart from "./tools/weave-c3-linechart";
import WeaveC3PieChart from "./tools/weave-c3-piechart";
import WeaveC3Histogram from "./tools/weave-c3-histogram";
import SessionStateMenuTool from "./tools/weave-session-state-menu";
import WeaveOpenLayersMap from "./tools/OpenLayersMapTool";
import WeaveReactTable from "./tools/weave-react-table";

// Temporary solution
// because typescript removes
// unused imports
var v1:any = [
	WeaveC3Barchart,
	WeaveC3ScatterPlot,
	WeaveC3ColorLegend,
    WeaveC3BarChartLegend,
	WeaveC3LineChart,
	WeaveC3PieChart,
	WeaveC3Histogram,
	SessionStateMenuTool,
	WeaveOpenLayersMap,
	WeaveReactTable
];
///////////////////////////////

//import CustomSearchTool from "./outts/CustomSearchTool.jsx";
import {WeaveTool, getToolImplementation} from "./WeaveTool";
import ToolOverlay from "./ToolOverlay";
import StandardLib from "./utils/StandardLib";
const LAYOUT:string = "Layout";

const LEFT:string = "left";
const RIGHT:string = "right";
const TOP:string = "top";
const BOTTOM:string = "bottom";
const VERTICAL:string = "vertical";
const HORIZONTAL:string = "horizontal";

const TOOLOVERLAY:string = "tooloverlay";

declare type Point = {
    x?: number;
    y?: number;
    r?: number;
    theta?: number;
};

declare type PolarPoint = {
    x: number;
    y: number;
};

interface IWeaveLayoutManagerProps extends React.Props<WeaveLayoutManager> {
    weave:Weave
}

interface IWeaveLayoutManagerState {

}

class WeaveLayoutManager extends React.Component<IWeaveLayoutManagerProps, IWeaveLayoutManagerState> {

    private element:HTMLElement;
    private weave:Weave;
    private margin:number;
    private _forceUpdate:() => void;
    private dirty:boolean;
    private toolDragged:string[];
    private toolOver:string[];
    private dropZone:string;
    private prevClientWidth:number;
    private prevClientHeight:number;
    
    constructor(props:IWeaveLayoutManagerProps) {
        super(props);
        this.weave = this.props.weave || new Weave();
        this.weave.path(LAYOUT).request("FlexibleLayout");
        this.margin = 8;
    }

    componentDidMount():void {
        window.addEventListener("resize", this._forceUpdate = _.throttle(() => { this.dirty = true; this.forceUpdate(); }, 30));
        this.weave.root.childListCallbacks.addGroupedCallback(this, _.debounce(this.forceUpdate.bind(this), 0), true);
        this.weave.path(LAYOUT).addCallback(this, _.debounce(this.forceUpdate.bind(this), 0), true);
        this.weave.path(LAYOUT).state(this.simplifyState(this.weave.path(LAYOUT).getState()));
        weavejs.WeaveAPI.Scheduler.frameCallbacks.addImmediateCallback(this, frameHandler, true);
    }

    componentWillUnmount():void {
        window.removeEventListener("resize", this._forceUpdate);
    }

    componentDidUpdate():void {
        if(Weave.detectChange(this, this.weave.getObject(LAYOUT)) || this.dirty) {
            // dirty flag to trigger render on window resize
            this.dirty = false;
            //_.debounce(this.forceUpdate.bind(this), 0)();
            this.forceUpdate();
        }
    }
    
    frameHandler()
    {
        var node:HTMLElement = ReactDOM.findDOMNode(this);
        if (this.prevClientWidth != node.clientWidth || this.prevClientHeight != node.clientHeight)
        {
            this.prevClientWidth = node.clientWidth;
            this.prevClientHeight = node.clientHeight;
            this.forceUpdate();
        }
    }

    saveState(newState:LayoutState):void {
        newState = this.simplifyState(newState);
        newState.flex = 1;
        this.weave.path(LAYOUT).state(newState);
        // temporary hack because weave
        // doesn't properly callback forceUpdate
        //this.forceUpdate();
    }

    onDragStart(id:string[], event:React.MouseEvent):void {
        this.toolDragged = id;
        var toolRef = id[0]; // toolName as used in the ref for the weave tool.
        var element = ReactDOM.findDOMNode(this.refs[toolRef]);

        // hack because dataTransfer doesn't exist on type event
        (event as any).dataTransfer.setDragImage(element, 0, 0);
        (event as any).dataTransfer.setData('text/html', null);
    }

    hideOverlay():void {
        var toolOverlayStyle = _.clone((this.refs[TOOLOVERLAY] as ToolOverlay).state.style);
        toolOverlayStyle.visibility = "hidden";
        toolOverlayStyle.left = toolOverlayStyle.top = toolOverlayStyle.width = toolOverlayStyle.height = 0;
        (this.refs[TOOLOVERLAY] as ToolOverlay).setState({
            style: toolOverlayStyle
        });
    }

    onDragEnd():void {
        if(this.toolDragged && this.toolOver) {
            this.updateLayout(this.toolDragged, this.toolOver, this.dropZone);
            this.toolDragged = null;
            this.dropZone = null;
            this.hideOverlay();
        }
    }

    onDragOver(toolOver:string[], event:React.MouseEvent):void {
        if(!this.toolDragged) {
            return;
        }
        if(_.isEqual(this.toolDragged, toolOver)) {
            // hide the overlay if hovering over the tool being dragged
            this.toolOver = null;
            this.hideOverlay();
            return;
        }

        var toolNode = (this.refs[LAYOUT] as Layout).getDOMNodeFromId(toolOver);
        var toolNodePosition = toolNode.getBoundingClientRect();

        var toolOverlayStyle = _.clone((this.refs[TOOLOVERLAY] as ToolOverlay).state.style);
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
            (this.refs[TOOLOVERLAY] as ToolOverlay).setState({
                style: toolOverlayStyle
            });
        }

        this.dropZone = dropZone;
        this.toolOver = toolOver;
    }

    getDropZone(id:string[], event:React.MouseEvent):string {
        if(this.toolDragged) {
            if(!_.isEqual(this.toolDragged, id)) {
                var toolNode = (this.refs[LAYOUT] as Layout).getDOMNodeFromId(id);
                var toolNodePosition = toolNode.getBoundingClientRect();

                var center:Point = {
                    x: (toolNodePosition.right - toolNodePosition.left) / 2,
                    y: (toolNodePosition.bottom - toolNodePosition.top) / 2
                };

                var mousePosRelativeToCenter:Point = {
                    x: event.clientX - (toolNodePosition.left + center.x),
                    y: event.clientY - (toolNodePosition.top + center.y)
                };

                var mouseNorm:Point = {
                    x: (mousePosRelativeToCenter.x) / (toolNodePosition.width / 2),
                    y: (mousePosRelativeToCenter.y) / (toolNodePosition.height / 2)
                };

                var mousePolarCoord:Point = {
                    r: Math.sqrt(mouseNorm.x * mouseNorm.x + mouseNorm.y * mouseNorm.y),
                    theta: Math.atan2(mouseNorm.y, mouseNorm.x)
                };

                var zones:string[] = [RIGHT, BOTTOM, LEFT, TOP];

                var zoneIndex:number = Math.round((mousePolarCoord.theta / (2 * Math.PI) * 4) + 4) % 4;

                if(mousePolarCoord.r < 0.34) {
                    return "center";
                } else {
                    return zones[zoneIndex];
                }
            }
        }
    }

    simplifyState(state:LayoutState):LayoutState {
    	if (!state)
    		return {};
        var children:LayoutState[] = state.children;

        if (!children) {
            return state;
        }

        if (children.length === 1) {
            return this.simplifyState(children[0]);
        }

        var simpleChildren:LayoutState[] = [];

        for (var i = 0; i < children.length; i++) {
            var child:LayoutState = this.simplifyState(children[i]);
            if (child.children && child.direction === state.direction) {
                var childChildren:LayoutState[] = child.children;
                for (var ii = 0; ii < childChildren.length; ii++) {
                    var childChild:LayoutState = childChildren[ii];
                    childChild.flex *= child.flex;
                    simpleChildren.push(childChild);
                }
            }
            else {
                simpleChildren.push(child);
            }
        }
        state.children = simpleChildren;
        var totalSizeChildren:number = _.sum(_.map(children, "flex"));

        //Scale flex values between 0 and 1 so they sum to 1, avoiding an apparent
        //flex bug where space is lost if sum of flex values is less than 1.
        for (var i = 0; i < state.children.length; i++) {
            state.children[i].flex = StandardLib.normalize(state.children[i].flex, 0, totalSizeChildren);
        }

        return state;
    }

    updateLayout(toolDragged:string[], toolDroppedOn:string[], dropZone:string) {

        if(!this.toolDragged || !this.toolOver || !this.dropZone) {
            return;
        }

        var newState:LayoutState = _.cloneDeep(this.weave.path(LAYOUT).getState());
        var src:LayoutState = StandardLib.findDeep(newState, {id: toolDragged});
        var dest:LayoutState = StandardLib.findDeep(newState, {id: toolDroppedOn});
        if(_.isEqual(src.id, dest.id)) {
            return;
        }

        if(dropZone === "center") {
            var srcId = src.id;
            src.id = dest.id;
            dest.id = srcId;
        }
        else {
            if (weavejs.WeaveAPI.Locale.reverseLayout)
            {
            	if (dropZone === LEFT)
            		dropZone = RIGHT;
            	else if (dropZone === RIGHT)
            		dropZone = LEFT;
            }

            var srcParentArray:LayoutState[] = StandardLib.findDeep(newState, (obj:LayoutState) => {
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
        var children:LayoutState[] = [];
        var newState:LayoutState = this.weave.path(LAYOUT).getState();

        var paths:WeavePath[] = this.weave.path().getChildren();
        var rect:ClientRect;
        if(this.element) {
            rect = this.element.getBoundingClientRect();
        }

        for(var i = 0; i < paths.length; i++) {
            var path:WeavePath = paths[i];
            var impl:string|Function = path.getType();
            if(impl === "weave.visualization.tools::ExternalTool" && path.getType("toolClass")) {
                impl = path.getState("toolClass");
            }
            if (impl === "weavejs.core.LinkableHashMap" && path.getType("class"))
            impl = path.getState("class");
            impl = getToolImplementation(impl as string);
            var toolName:string = path.getPath()[0];
            var node:Element;
            var toolRect:ClientRect;
            var toolPosition:React.CSSProperties;
            if(impl) {
                if(this.refs[LAYOUT] && rect) {
                    node = (this.refs[LAYOUT] as Layout).getDOMNodeFromId(path.getPath());
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
