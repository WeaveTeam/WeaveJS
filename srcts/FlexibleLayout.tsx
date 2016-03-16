import StandardLib = weavejs.util.StandardLib;
import LinkableVariable = weavejs.core.LinkableVariable;

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as WeaveUI from "./WeaveUI";
import Layout from "./react-flexible-layout/Layout";
import {HBox, VBox} from "./react-ui/FlexBox";
import ResizingDiv from "./react-ui/ResizingDiv";
import {HORIZONTAL, VERTICAL, LayoutState} from "./react-flexible-layout/Layout";

import WeaveTool from "./WeaveTool";
import ToolOverlay from "./ToolOverlay";
import MiscUtils from "./utils/MiscUtils";
import DOMUtils from "./utils/DOMUtils";

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

export declare type WeavePathArray = string[];

export interface IFlexibleLayoutProps extends React.HTMLProps<FlexibleLayout>
{
}

export interface IFlexibleLayoutState extends LayoutState
{
}

export default class FlexibleLayout extends React.Component<IFlexibleLayoutProps, IFlexibleLayoutState> implements weavejs.api.core.ILinkableVariable
{
	private linkableState = Weave.linkableChild(this, LinkableVariable, this.forceUpdate, true);
	private nextState:Object;
	private reactLayout:Layout;
	private layoutRect:ClientRect;
	private overlay:ToolOverlay;
	private toolDragged:WeavePathArray;
	private toolOver:WeavePathArray;
	private dropZone:string; //todo - change to enum
	private prevClientWidth:number;
	private prevClientHeight:number;
	
	constructor(props:IFlexibleLayoutProps)
	{
		super(props);
		weavejs.WeaveAPI.Scheduler.frameCallbacks.addGroupedCallback(this, this.frameHandler, true);
	}
	
	getSessionState():LayoutState
	{
		return this.linkableState.state;
	}
	
	setSessionState=(state:LayoutState):void=>
	{
		state = _.pick(state, 'id', 'children', 'flex', 'direction');
		state = this.simplifyState(state);
		state.flex = 1;
		this.linkableState.state = state;
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

	frameHandler():void
	{
		// reposition on resize
		var rect:ClientRect = Object(this.getLayoutPosition(this.reactLayout));
		if (this.layoutRect.width != rect.width || this.layoutRect.height != rect.height)
			this.repositionTools();
	}

	onDragStart(toolDragged:WeavePathArray, event:React.MouseEvent):void
	{
		this.toolDragged = toolDragged;

		// hack because dataTransfer doesn't exist on type event
		(event as any).dataTransfer.setDragImage(this.reactLayout.getElementFromId(toolDragged), 0, 0);
		(event as any).dataTransfer.setData('text/html', null);
	}

	hideOverlay():void
	{
		var overlayStyle = _.clone(this.overlay.state.style);
		overlayStyle.visibility = "hidden";
		overlayStyle.left = overlayStyle.top = overlayStyle.width = overlayStyle.height = 0;
		this.overlay.setState({
			style: overlayStyle
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

	onDragOver(toolOver:WeavePathArray, event:React.MouseEvent):void
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
		
		var rect = this.getLayoutPosition(toolOver);
		var overlayStyle = _.clone(this.overlay.state.style);
		overlayStyle.visibility = rect ? "visible" : "hidden";
		if (rect)
		{
			overlayStyle.left = rect.left;
			overlayStyle.top = rect.top;
			overlayStyle.width = rect.width;
			overlayStyle.height = rect.height;
		}

		if (dropZone === LEFT)
		{
			overlayStyle.width = rect.width / 2;
		}
		else if (dropZone === RIGHT)
		{
			overlayStyle.left = rect.left + rect.width / 2;
			overlayStyle.width = rect.width / 2;
		}
		else if (dropZone === BOTTOM)
		{
			overlayStyle.top = rect.top + rect.height / 2;
			overlayStyle.height = rect.height / 2;
		}
		else if (dropZone === TOP)
		{
			overlayStyle.height = rect.height / 2;
		}

		this.overlay.setState({
			style: overlayStyle
		});
	}

	getDropZone(event:React.MouseEvent):string
	{
		if (!this.toolDragged || this.toolDragged === this.toolOver)
			return null;
		
		var toolNode = this.reactLayout.getElementFromId(this.toolOver);
		var rect = toolNode.getBoundingClientRect();

		var center:Point = {
			x: (rect.right - rect.left) / 2,
			y: (rect.bottom - rect.top) / 2
		};

		var mousePosRelativeToCenter:Point = {
			x: event.clientX - (rect.left + center.x),
			y: event.clientY - (rect.top + center.y)
		};

		var mouseNorm:Point = {
			x: (mousePosRelativeToCenter.x) / (rect.width / 2),
			y: (mousePosRelativeToCenter.y) / (rect.height / 2)
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

		var newState:LayoutState = _.cloneDeep(this.getSessionState());
		var src:LayoutState = MiscUtils.findDeep(newState, {id: this.toolDragged});
		var dest:LayoutState = MiscUtils.findDeep(newState, {id: this.toolOver});

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
					id: this.toolDragged,
					flex: 0.5
				},
				{
					id: this.toolOver,
					flex: 0.5
				}
			];
			
			if (this.dropZone === BOTTOM || this.dropZone === RIGHT)
				dest.children.reverse();
		}
		this.setSessionState(newState);
	}

	getLayoutIds(state:LayoutState, output?:WeavePathArray[]):WeavePathArray[]
	{
		if (!output)
			output = [];
		if (state && state.id)
			output.push(state.id as WeavePathArray);
		if (state && state.children)
			for (var child of state.children)
				this.getLayoutIds(child, output);
		return output;
	}

	generateLayoutState(ids:WeavePathArray[]):Object
	{
		// temporary solution - needs improvement
		return this.simplifyState({
			flex: 1,
			direction: HORIZONTAL,
			children: ids.map(id => { return {id: id, flex: 1} })
		});
	}
	
	getLayoutPosition(layoutOrId:Layout | WeavePathArray):ClientRect
	{
		var node = layoutOrId instanceof Layout ? ReactDOM.findDOMNode(layoutOrId) : this.reactLayout.getElementFromId(layoutOrId);
		return DOMUtils.getOffsetRect(ReactDOM.findDOMNode(this) as HTMLElement, node as HTMLElement);
	}
	
	repositionTools=(layout:Layout = null):void=>
	{
		if (!layout)
			layout = this.reactLayout;
		if (!layout)
			return;
		
		if (layout == this.reactLayout)
			this.layoutRect = Object(this.getLayoutPosition(layout));
		
		var tool:WeaveTool = this.refs[JSON.stringify(layout.state.id)] as WeaveTool;
		if (tool instanceof WeaveTool)
		{
			var rect = this.getLayoutPosition(layout);
			if (rect)
				tool.setState({
					style: {
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height,
						position: "absolute"
					}
				});
			else
				tool.setState({
					style: {
						display: "none"
					}
				});
		}
		for (var child of layout.children)
			if (child)
				this.repositionTools(child);
	}
	
	render():JSX.Element
	{
		var weave:Weave = Weave.getWeave(this);
		var newState:LayoutState = this.getSessionState();
		if (weave && !newState.id && !newState.children)
		{
			var ids:WeavePathArray[] = weave.root.getNames(weavejs.api.ui.IVisTool, true).map(name => [name]);
			newState = this.generateLayoutState(ids);
			this.setSessionState(newState);
		}
		
		var tools:JSX.Element[] = null;
		if (this.reactLayout)
			tools = this.getLayoutIds(newState).map(path => {
				var key = JSON.stringify(path);
				return (
					<WeaveTool
						key={key}
						ref={key}
						weave={weave}
						path={path}
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
			onStateChange: this.setSessionState
		});

		var style = _.merge({flex: 1}, this.props.style, {
			display: "flex", // layout fills the entire area
			position: "relative", // allows floating tools to position themselves properly
			overflow: "hidden" // don't let overflow expand the div size
		});
		return (
			<div {...this.props as React.HTMLAttributes} style={style}>
				{layout}
				{tools}
				<ToolOverlay ref={(overlay:ToolOverlay) => this.overlay = overlay}/>
			</div>
		);
	}
}

Weave.registerClass('weave.ui.FlexibleLayout', FlexibleLayout, [weavejs.api.core.ILinkableVariable]);
