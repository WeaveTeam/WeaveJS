/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/lodash/lodash.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

import WeavePath = weavejs.path.WeavePath;
import StandardLib = weavejs.util.StandardLib;
import LinkableVariable = weavejs.core.LinkableVariable;

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as WeaveUI from "./WeaveUI";
import Layout from "./react-flexible-layout/Layout";
import {HORIZONTAL, VERTICAL, LayoutState} from "./react-flexible-layout/Layout";

import WeaveTool from "./WeaveTool";
import ToolOverlay from "./ToolOverlay";
import MiscUtils from "./utils/MiscUtils";

const LEFT:string = "left";
const RIGHT:string = "right";
const TOP:string = "top";
const BOTTOM:string = "bottom";

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

export interface IWeaveLayoutManagerProps extends React.Props<WeaveLayoutManager>
{
	layout: LinkableVariable,
	style?: any
}

export interface IWeaveLayoutManagerState
{
}

export default class WeaveLayoutManager extends React.Component<IWeaveLayoutManagerProps, IWeaveLayoutManagerState>
{
	private weave:Weave;
	private layout:LinkableVariable;
	private reactLayout:Layout;
	private layoutRect:ClientRect;
	private overlay:ToolOverlay;
	private toolDragged:WeavePath;
	private toolOver:WeavePath;
	private dropZone:string;
	private prevClientWidth:number;
	private prevClientHeight:number;
	private throttledForceUpdate:() => void;
	private throttledForceUpdateTwice:() => void;

	constructor(props:IWeaveLayoutManagerProps)
	{
		super(props);
		this.componentWillReceiveProps(props);
	}
	
	componentWillReceiveProps(props:IWeaveLayoutManagerProps):void
	{
		if (!props.layout)
			throw new Error("layout is a required prop");
		
		if (this.layout && props.layout != this.layout)
			throw new Error("Can't change layout prop");
		
		this.layout = props.layout;
		this.weave = Weave.getWeave(this.layout);
		if (!this.weave)
			throw new Error("layout is not registered with an instance of Weave");
		
		this.layout.state = this.simplifyState(this.layout.state as LayoutState);
		this.layout.addGroupedCallback(this, this.forceUpdate, true);
		
		//TODO - this assumes all tools are at the top level. Instead, WeaveTool should use a LinkableWatcher for a path.
		this.weave.root.childListCallbacks.addGroupedCallback(this, this.forceUpdate, true);
		
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addGroupedCallback(this, this.frameHandler, true);
	}

	componentDidMount():void
	{
		this.repositionTools();
	}

	componentDidUpdate():void
	{
		this.repositionTools();
	}
	
	componentWillUnmount():void
	{
		Weave.dispose(this);
	}

	getElementFromToolPath(toolPath:WeavePath):Element
	{
		return this.reactLayout.getElementFromId(toolPath.getPath());
	}
	
	frameHandler():void
	{
		// reposition on resize
		var rect:ClientRect = ReactDOM.findDOMNode(this.reactLayout).getBoundingClientRect();
		if (this.layoutRect.width != rect.width || this.layoutRect.height != rect.height)
			this.repositionTools();
	}

	saveState=(newState:LayoutState):void=>
	{
		newState = this.simplifyState(newState);
		newState.flex = 1;
		this.layout.state = newState;
		this.repositionTools(this.reactLayout);
	}

	onDragStart(toolDragged:WeavePath, event:React.MouseEvent):void
	{
		this.toolDragged = toolDragged;

		// hack because dataTransfer doesn't exist on type event
		(event as any).dataTransfer.setDragImage(this.getElementFromToolPath(toolDragged), 0, 0);
		(event as any).dataTransfer.setData('text/html', null);
	}

	hideOverlay():void
	{
		var toolOverlayStyle = _.clone(this.overlay.state.style);
		toolOverlayStyle.visibility = "hidden";
		toolOverlayStyle.left = toolOverlayStyle.top = toolOverlayStyle.width = toolOverlayStyle.height = 0;
		this.overlay.setState({
			style: toolOverlayStyle
		});
	}

	onDragEnd():void
	{
		if (this.toolDragged && this.toolOver)
		{
			this.updateLayout();
			this.toolDragged = null;
			this.dropZone = null;
			this.hideOverlay();
		}
	}

	onDragOver(toolOver:WeavePath, event:React.MouseEvent):void
	{
		if (!this.toolDragged)
			return;
		
		if (this.toolDragged === toolOver)
		{
			// hide the overlay if hovering over the tool being dragged
			this.toolOver = null;
			this.hideOverlay();
			return;
		}
		
		var toolOverChanged = this.toolOver === toolOver;
		
		this.toolOver = toolOver;
		
		var dropZone = this.getDropZone(event);
		
		if (!toolOverChanged && this.dropZone === dropZone)
			return;

		this.dropZone = dropZone;
		
		var toolNode = this.getElementFromToolPath(toolOver);
		var toolNodePosition = toolNode.getBoundingClientRect();
		var toolOverlayStyle = _.clone(this.overlay.state.style);
		toolOverlayStyle.left = toolNodePosition.left;
		toolOverlayStyle.top = toolNodePosition.top;
		toolOverlayStyle.width = toolNodePosition.width;
		toolOverlayStyle.height = toolNodePosition.height;
		toolOverlayStyle.visibility = "visible";

		if (dropZone === LEFT)
		{
			toolOverlayStyle.width = toolNodePosition.width / 2;
		}
		else if (dropZone === RIGHT)
		{
			toolOverlayStyle.left = toolNodePosition.left + toolNodePosition.width / 2;
			toolOverlayStyle.width = toolNodePosition.width / 2;
		}
		else if (dropZone === BOTTOM)
		{
			toolOverlayStyle.top = toolNodePosition.top + toolNodePosition.height / 2;
			toolOverlayStyle.height = toolNodePosition.height / 2;
		}
		else if (dropZone === TOP)
		{
			toolOverlayStyle.height = toolNodePosition.height / 2;
		}

		this.overlay.setState({
			style: toolOverlayStyle
		});
	}

	getDropZone(event:React.MouseEvent):string
	{
		if (!this.toolDragged || this.toolDragged === this.toolOver)
			return null;
		
		var toolNode = this.getElementFromToolPath(this.toolOver);
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

		if (mousePolarCoord.r < 0.34)
			return "center";
		else
			return zones[zoneIndex];
	}

	simplifyState(state:LayoutState):LayoutState
	{
		if (!state)
			return {};
		var children:LayoutState[] = state.children;

		if (!children)
			return state;

		if (children.length === 1)
			return this.simplifyState(children[0]);

		var simpleChildren:LayoutState[] = [];

		for (var i = 0; i < children.length; i++)
		{
			var child:LayoutState = this.simplifyState(children[i]);
			if (child.children && child.direction === state.direction)
			{
				var childChildren:LayoutState[] = child.children;
				for (var ii = 0; ii < childChildren.length; ii++)
				{
					var childChild:LayoutState = childChildren[ii];
					childChild.flex *= child.flex;
					simpleChildren.push(childChild);
				}
			}
			else
			{
				simpleChildren.push(child);
			}
		}
		state.children = simpleChildren;
		var totalSizeChildren:number = _.sum(_.map(state.children, "flex"));

		//Scale flex values between 0 and 1 so they sum to 1, avoiding an apparent
		//flex bug where space is lost if sum of flex values is less than 1.
		for (var i = 0; i < state.children.length; i++)
			state.children[i].flex = StandardLib.normalize(state.children[i].flex, 0, totalSizeChildren);

		return state;
	}

	updateLayout():void
	{
		if (!this.toolDragged || !this.toolOver || !this.dropZone || (this.toolDragged === this.toolOver))
			return;

		var newState:LayoutState = _.cloneDeep(this.layout.state);
		var src:LayoutState = MiscUtils.findDeep(newState, {id: this.toolDragged.getPath()});
		var dest:LayoutState = MiscUtils.findDeep(newState, {id: this.toolOver.getPath()});

		if (this.dropZone === "center")
		{
			var srcId = src.id;
			src.id = dest.id;
			dest.id = srcId;
		}
		else
		{
			if (weavejs.WeaveAPI.Locale.reverseLayout)
			{
				if (this.dropZone === LEFT)
					this.dropZone = RIGHT;
				else if (this.dropZone === RIGHT)
					this.dropZone = LEFT;
			}

			var srcParentArray:LayoutState[] = MiscUtils.findDeep(newState, (obj:LayoutState) => {
				return Array.isArray(obj) && obj.indexOf(src) >= 0;
			});

			srcParentArray.splice(srcParentArray.indexOf(src), 1);

			delete dest.id;
			dest.direction = (this.dropZone === TOP || this.dropZone === BOTTOM) ? VERTICAL : HORIZONTAL;
			dest.children = [
				{
					id: this.toolDragged.getPath(),
					flex: 0.5
				},
				{
					id: this.toolOver.getPath(),
					flex: 0.5
				}
			];
			
			if (this.dropZone === BOTTOM || this.dropZone === RIGHT)
				dest.children.reverse();
		}
		this.saveState(newState);
	}

	getIdPaths(state:LayoutState, output?:WeavePath[]):WeavePath[]
	{
		if (!output)
			output = [];
		if (state && state.id)
			output.push(this.weave.path(state.id));
		if (state && state.children)
			for (var child of state.children)
				this.getIdPaths(child, output);
		return output;
	}

	generateLayoutState(paths:WeavePath[]):Object
	{
		// temporary solution - needs improvement
		return this.simplifyState({
			flex: 1,
			direction: HORIZONTAL,
			children: paths.map(path => { return {id: path.getPath(), flex: 1} })
		});
	}
	
	repositionTools=(layout:Layout = null):void=>
	{
		if (!layout)
			layout = this.reactLayout;
		if (!layout)
			return;
		
		var rect:ClientRect = ReactDOM.findDOMNode(layout).getBoundingClientRect();
		if (layout == this.reactLayout)
			this.layoutRect = rect;
		
		var tool:WeaveTool = this.refs[JSON.stringify(layout.state.id)] as WeaveTool;
		if (tool instanceof WeaveTool)
		{
			tool.setState({
				style: {
					top: rect.top - this.layoutRect.top,
					left: rect.left - this.layoutRect.left,
					width: rect.right - rect.left,
					height: rect.bottom - rect.top,
					position: "absolute"
				}
			});
		}
		for (var child of layout.children)
			if (child)
				this.repositionTools(child);
	}
	
	render():JSX.Element
	{
		var newState:LayoutState = this.layout.state;
		if (!newState)
		{
			var filteredChildren:WeavePath[] = this.weave.root.getObjects(weavejs.api.ui.IVisTool, true).map(Weave.getPath);
			newState = this.generateLayoutState(filteredChildren);
			this.layout.state = newState;
		}
		
		var tools:JSX.Element[] = null;
		if (this.reactLayout)
			tools = this.getIdPaths(newState).map(path => {
				var key = JSON.stringify(path.getPath());
				return (
					<WeaveTool
						key={key}
						ref={key}
						layout={this.reactLayout}
						toolPath={path}
						onDragOver={this.onDragOver.bind(this, path)}
						onDragStart={this.onDragStart.bind(this, path)}
						onDragEnd={this.onDragEnd.bind(this)}
					/>
				);
			});
		
		var layout = Layout.renderLayout({
			key: "layout",
			ref: (layout:Layout) => {
				if (this.reactLayout = layout)
					this.repositionTools();
			},
			state: newState,
			onStateChange: this.saveState
		});
		return (
			<div style={_.merge({display: "flex", position: "relative", overflow: "hidden"}, this.props.style)}>
				{layout}
				{tools}
				<ToolOverlay ref={(overlay:ToolOverlay) => this.overlay = overlay}/>
			</div>
		);
	}
}
