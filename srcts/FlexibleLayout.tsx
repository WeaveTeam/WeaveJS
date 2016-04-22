import StandardLib = weavejs.util.StandardLib;
import LinkableVariable = weavejs.core.LinkableVariable;

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import * as WeaveUI from "./WeaveUI";
import Layout from "./react-flexible-layout/Layout";
import {HBox, VBox} from "./react-ui/FlexBox";
import Div from "./react-ui/Div";
import {HORIZONTAL, VERTICAL, LayoutState} from "./react-flexible-layout/Layout";
import WeaveComponentRenderer from "./WeaveComponentRenderer";

import PanelOverlay from "./PanelOverlay";
import MiscUtils from "./utils/MiscUtils";
import DOMUtils from "./utils/DOMUtils";
import MouseUtils from "./utils/MouseUtils";

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

export type PanelProps = {
	onDragStart:React.DragEventHandler,
	onDragEnd:React.DragEventHandler,
	onDragOver:React.DragEventHandler
};

export interface IFlexibleLayoutProps extends React.HTMLProps<FlexibleLayout>
{
	itemRenderer: (id:WeavePathArray, panelProps?:PanelProps) => JSX.Element;
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
	private overlay:PanelOverlay;
	private panelDragged:WeavePathArray;
	private panelOver:WeavePathArray;
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
		state = _.pick(state, 'id', 'children', 'flex', 'direction', 'maximize');
		state = this.simplifyState(state);
		state.flex = 1;
		this.linkableState.state = state;
	}

	componentDidMount():void
	{
		this.repositionPanels();
	}

	componentDidUpdate():void
	{
		this.repositionPanels();
	}
	
	frameHandler():void
	{
		// reposition on resize
		var rect:ClientRect = Object(this.getLayoutPosition(this.reactLayout));
		if (this.layoutRect.width != rect.width || this.layoutRect.height != rect.height)
			this.repositionPanels();
	}

	onDragStart(panelDragged:WeavePathArray, event:React.MouseEvent):void
	{
		var layout = this.reactLayout.getComponentFromId(panelDragged);
		if (!layout || layout.state.maximized)
			return;
		
		this.panelDragged = panelDragged;

		// hack because dataTransfer doesn't exist on type event
		(event as any).dataTransfer.setDragImage(this.reactLayout.getElementFromId(panelDragged), 0, 0);
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
		if (this.panelDragged && this.panelOver)
		{
			this.updateLayout();
			this.panelDragged = null;
			this.dropZone = null;
			this.hideOverlay();
		}
	}

	onDragOver(panelOver:WeavePathArray, event:React.MouseEvent):void
	{
		if (!this.panelDragged)
			return;
		
		if (this.panelDragged === panelOver)
		{
			// hide the overlay if hovering over the panel being dragged
			this.panelOver = null;
			this.hideOverlay();
			return;
		}
		
		var panelOverChanged = this.panelOver === panelOver;
		
		this.panelOver = panelOver;
		
		var dropZone = this.getDropZone(event);
		
		if (!panelOverChanged && this.dropZone === dropZone)
			return;

		this.dropZone = dropZone;
		
		var rect = this.getLayoutPosition(panelOver);
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
		if (!this.panelDragged || this.panelDragged === this.panelOver)
			return null;
		
		var panelNode = this.reactLayout.getElementFromId(this.panelOver);
		var rect = panelNode.getBoundingClientRect();

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
		
		if (state.id === undefined)
			delete state.id;
		if (state.children === undefined)
			delete state.children;
		
		var children:LayoutState[] = state.children;

		if (!children)
			return state;

		if (children.length === 1)
			return this.simplifyState(children[0]);

		var simpleChildren:LayoutState[] = [];

		for (var i = 0; i < children.length; i++)
		{
			var child:LayoutState = this.simplifyState(children[i]);
			if (child.children && (child.direction === state.direction || !child.children.length))
			{
				var childChildren:LayoutState[] = child.children;
				for (var ii = 0; ii < childChildren.length; ii++)
				{
					var childChild:LayoutState = childChildren[ii];
					childChild.flex *= child.flex || 1;
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
			state.children[i].flex = StandardLib.normalize(state.children[i].flex || 1, 0, totalSizeChildren);

		return state;
	}

	updateLayout():void
	{
		if (!this.panelDragged || !this.panelOver || !this.dropZone || (this.panelDragged === this.panelOver))
			return;

		var newState:LayoutState = _.cloneDeep(this.getSessionState());
		var src:LayoutState = MiscUtils.findDeep(newState, {id: this.panelDragged});
		var dest:LayoutState = MiscUtils.findDeep(newState, {id: this.panelOver});

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
					id: this.panelDragged,
					flex: 0.5
				},
				{
					id: this.panelOver,
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
	
	repositionPanels=(layout:Layout = null):void=>
	{
		if (!layout)
			layout = this.reactLayout;
		if (!layout)
			return;
		
		if (layout == this.reactLayout)
			this.layoutRect = Object(this.getLayoutPosition(layout));
		
		var div:Div = this.refs[JSON.stringify(layout.state.id)] as Div;
		if (div instanceof Div)
		{
			var rect = layout.state.maximized ? this.layoutRect : this.getLayoutPosition(layout);
			if (rect)
				div.setState({
					style: {
						position: "absolute",
						display: "flex",
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height
					}
				});
			else
				div.setState({
					style: {
						display: "none"
					}
				});
		}
		for (var child of layout.children)
			if (child)
				this.repositionPanels(child);
	}
	
	private static _tempState:LayoutState;
	private static _tempObj:LayoutState = {};
	private static sortIds(id1:WeavePathArray, id2:WeavePathArray):number
	{
		FlexibleLayout._tempObj.id = id1;
		var obj1:LayoutState = MiscUtils.findDeep(FlexibleLayout._tempState, FlexibleLayout._tempObj);
		FlexibleLayout._tempObj.id = id2;
		var obj2:LayoutState = MiscUtils.findDeep(FlexibleLayout._tempState, FlexibleLayout._tempObj);
		var value1:number = obj1 && obj1.maximized ? 1 : 0;
		var value2:number = obj2 && obj2.maximized ? 1 : 0;
		if (value1 < value2)
			return -1;
		if (value1 > value2)
			return 1;
		return 0;
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
		
		var components:JSX.Element[] = null;
		if (this.reactLayout)
		{
			FlexibleLayout._tempState = newState;
			components = this.getLayoutIds(newState).sort(FlexibleLayout.sortIds).map(path => {
				var key = JSON.stringify(path);
				return (
					<Div
						key={key}
						ref={key}
						children={
							this.props.itemRenderer
							?	this.props.itemRenderer(path, {
									onDragOver: this.onDragOver.bind(this, path),
									onDragStart: this.onDragStart.bind(this, path),
									onDragEnd: this.onDragEnd.bind(this)
								})
							:	<WeaveComponentRenderer
									weave={weave}
									path={path}
									style={{width: "100%", height: "100%"}}/>
						}
					/>
				);
			});
		}
		
		var layout = Layout.renderLayout({
			key: "layout",
			ref: (layout:Layout) => {
				if (this.reactLayout = layout)
					this.repositionPanels();
			},
			state: newState,
			onStateChange: this.setSessionState
		});

		var style = _.merge({flex: 1}, this.props.style, {
			display: "flex", // layout fills the entire area
			position: "relative", // allows floating panels to position themselves properly
			overflow: "hidden" // don't let overflow expand the div size
		});
		return (
			<div {...this.props as React.HTMLAttributes} style={style}>
				{layout}
				{components}
				<PanelOverlay ref={(overlay:PanelOverlay) => this.overlay = overlay}/>
			</div>
		);
	}
}

Weave.registerClass(
	FlexibleLayout,
	'weave.ui.FlexibleLayout',
	[weavejs.api.core.ILinkableVariable]
);
