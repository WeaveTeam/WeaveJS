import * as ReactDOM from "react-dom";
import * as React from "react";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "./VendorPrefixer";
import CenteredIcon from "./CenteredIcon";
import Button from "../semantic-ui/Button";
import MouseUtils from "../utils/MouseUtils";
import Div from "./Div";

const mouseevents:string[] = ["mouseover", "mouseout", "mouseleave"];
const LEFT:"left" = "left";
const RIGHT:"right" = "right";
const TOP:"top" = "top";
const BOTTOM:"bottom" = "bottom";
const TOP_LEFT:"top-left" = "top-left";
const TOP_RIGHT:"top-right" = "top-right";
const BOTTOM_RIGHT:"bottom-right" = "bottom-right";
const BOTTOM_LEFT:"bottom-left" = "bottom-left";
const ENTER_KEYCODE = 13;
const ESC_KEYCODE = 27;

type Handle = (
	typeof LEFT | typeof RIGHT |
	typeof TOP | typeof BOTTOM |
	typeof TOP_LEFT | typeof TOP_RIGHT |
	typeof BOTTOM_RIGHT | typeof BOTTOM_LEFT
);

export interface DraggableDivProps extends React.HTMLProps<DraggableDiv>
{
	onReposition?:(position:DraggableDivState)=>void;
	liveMoving?:boolean;
	liveResizing?:boolean;
	getExternalOverlay?:()=>Div;
	resizable?:boolean;
	movable?:boolean;
}

export interface DraggableDivState
{
	top?:number;
	left?:number;
	width?:number;
	height?:number;
}

// return a new style object 
// each time because react doesn't
// allow mutating style
function getOverlayStyle()
{
	return {
		visibility: "hidden",
		position: "absolute",
		backgroundColor: "rgba(0, 0, 0, 0.2)"
	}
}

export default class DraggableDiv extends SmartComponent<DraggableDivProps, DraggableDivState>
{
	private element:HTMLElement;
	private internalOverlay:Div;
	private overlayStyle:React.CSSProperties = getOverlayStyle();

	private mouseDownOffset: {
		x: number,
		y: number
	}
	private moving:boolean;
	private activeResizeHandle:Handle;

	constructor(props:DraggableDivProps)
	{
		super(props);
		var style = props.style || {};
		this.setState({
			top: style.top,
			left: style.left,
			width: style.width,
			height: style.height
		});
		
	}
	
	static defaultProps:DraggableDivProps =	{
		resizable: true,
		movable: true,
		liveMoving: true,
		liveResizing: true
	}

	componentDidMount()
	{
		// if initial width height are provided
		// use it otherwise default to element position
		var style = this.props.style || {};
		var newState = {
			top: style.top !== undefined ? this.element.offsetTop : (window.innerHeight - this.element.offsetHeight) / 2,
			left: style.left !== undefined ? this.element.offsetLeft : (window.innerWidth - this.element.offsetWidth) / 2,
			width: this.element.offsetWidth,
			height: this.element.offsetHeight
		};
		if (this.props.onReposition)
			this.props.onReposition(newState);
		this.setState(newState);
		document.addEventListener("mouseup", this.onDragEnd, true);
		document.addEventListener("mousemove", this.onDrag, true);
	}
	
	get externalOverlay():Div
	{
		return this.props.getExternalOverlay ? this.props.getExternalOverlay() : null;
	}
	
	get overlay():Div
	{
		return this.externalOverlay || this.internalOverlay;
	}
	
	updateOverlayStyle(...styles:React.CSSProperties[])
	{
		this.overlayStyle = _.merge.apply(_, [{}, this.overlayStyle].concat(styles));
		this.overlay.setState({ style: this.overlayStyle });
	}
	
	private onDragStart=(event:React.DragEvent)=>
	{
		if (this.props.movable)
		{
			if (!this.props.liveMoving)
				this.updateOverlayStyle(this.state);
			
			event.preventDefault();
			event.stopPropagation();
			
			this.moving = true;
			this.mouseDownOffset = MouseUtils.getOffsetPoint(this.element, event as any);
		}
		
		if (this.props.onDragStart)
			this.props.onDragStart(event);
	}
	
	private onResizeStart(event:React.MouseEvent, handle:Handle)
	{
		if (!this.props.liveResizing)
			this.updateOverlayStyle(this.state);
		this.activeResizeHandle = handle;
		this.mouseDownOffset = MouseUtils.getOffsetPoint(this.element, event as any);
	}
	
	private shouldLiveUpdate():boolean
	{
		return (this.activeResizeHandle && this.props.liveResizing) || (this.moving && this.props.liveMoving);
	}
	
	private onDrag=(event:MouseEvent)=>
	{
		if (!this.activeResizeHandle && !this.moving)
			return;
		
		var element = this.shouldLiveUpdate() ? this.element : ReactDOM.findDOMNode(this.overlay) as HTMLElement;
		var oldState = this.shouldLiveUpdate() ? this.state : this.overlayStyle as DraggableDivState;
		var mouseOffset = MouseUtils.getOffsetPoint(element)
		var parentMouseOffset = MouseUtils.getOffsetPoint(element.parentElement);
		var parentWidth = (element.offsetParent as HTMLElement).offsetWidth;
		var parentHeight = (element.offsetParent as HTMLElement).offsetHeight;
		var oldRight:number = oldState.left + oldState.width;
		var oldBottom:number = oldState.top + oldState.height;
		var edgeBuffer = 25;
		
		var mouseDeltaX = mouseOffset.x - this.mouseDownOffset.x;
		var mouseDeltaY = mouseOffset.y - this.mouseDownOffset.y;
		var newState:DraggableDivState = _.clone(oldState);
		var style = this.props.style || {};
		var minWidth:number = Number(style.minWidth) || 0;
		var minHeight:number = Number(style.minHeight) || 0;

		if (this.activeResizeHandle)
		{
			if (this.activeResizeHandle.indexOf(LEFT) >= 0)
			{
				newState.left = oldState.left + mouseDeltaX;
				newState.left = Math.max(newState.left, oldRight - parentWidth);
				newState.left = Math.min(newState.left, oldRight - minWidth, parentWidth - edgeBuffer);
				newState.width = oldRight - newState.left;
			}
			
			if (this.activeResizeHandle.indexOf(TOP) >= 0)
			{
				newState.top = oldState.top + mouseDeltaY;
				newState.top = Math.max(newState.top, oldBottom - parentHeight, 0);
				newState.top = Math.min(newState.top, oldBottom - minHeight, parentHeight - edgeBuffer);
				newState.height = oldBottom - newState.top;
			}
			
			if (this.activeResizeHandle.indexOf(RIGHT) >= 0)
			{
				newState.width = oldState.width + mouseDeltaX;
				newState.width = Math.max(newState.width, minWidth, edgeBuffer - oldState.left);
				newState.width = Math.min(newState.width, parentWidth);
				this.mouseDownOffset.x += newState.width - oldState.width;
			}
			
			if (this.activeResizeHandle.indexOf(BOTTOM) >= 0)
			{
				newState.height = oldState.height + mouseDeltaY;
				newState.height = Math.max(newState.height, minHeight);
				newState.height = Math.min(newState.height, parentHeight);
				this.mouseDownOffset.y += newState.height - oldState.height;
			}
		}
		else if (this.moving)
		{
			// code below makes sure the top of the div always appears on-screen
			
			newState.left = oldState.left + mouseDeltaX;
			newState.left = Math.max(newState.left, edgeBuffer - (oldState.width || 0));
			newState.left = Math.min(newState.left, parentWidth - edgeBuffer);
			
			newState.top = oldState.top + mouseDeltaY;
			newState.top = Math.max(newState.top, 0);
			newState.top = Math.min(newState.top, parentHeight - edgeBuffer);
		}
		
		if (this.shouldLiveUpdate())
		{
			this.setState(newState);
			
			if (this.props.onReposition)
				this.props.onReposition(newState);
		}
		else
		{
			this.updateOverlayStyle(newState, {visibility: "visible"});
		}
	}
	
	private onDragEnd=(event:MouseEvent)=>
	{
		// if live update is disabled, we reposition when drag ends
		if ((this.moving || this.activeResizeHandle) && !this.shouldLiveUpdate())
		{
			var newState = _.pick(this.overlayStyle, "left", "top", "width", "height") as DraggableDivState;
			this.setState(newState);
			
			this.updateOverlayStyle({visibility: "hidden"});
			
			if (this.props.onReposition)
				this.props.onReposition(newState);
		}
		
		this.moving = false;
		this.activeResizeHandle = null;
	}

	componentWillUnmount()
	{
		document.removeEventListener("mouseup", this.onDragEnd, true);
		document.removeEventListener("mousemove", this.onDrag, true);
	}

	renderResizers():JSX.Element[]
	{
		return [
			<div key={LEFT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, LEFT)} style={{position: "absolute", left: 0, top: 0, width: 8, height: "100%", cursor: "ew-resize"}}/>,
			<div key={RIGHT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, RIGHT)} style={{position: "absolute", right: 0, top: 0, width: 8, height: "100%", cursor: "ew-resize"}}/>,
			<div key={TOP} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, TOP)} style={{position: "absolute", left: 0, top: 0, width: "100%", height: 8, cursor: "ns-resize"}}/>,
			<div key={BOTTOM} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, BOTTOM)} style={{position: "absolute", left: 0, bottom: 0, width: "100%", height: 8, cursor: "ns-resize"}}/>,
			<div key={TOP_LEFT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, TOP_LEFT)} style={{position: "absolute", left: 0, top: 0, width: 16, height: 16, cursor: "nwse-resize"}}/>,
			<div key={TOP_RIGHT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, TOP_RIGHT)} style={{position: "absolute", right: 0, top: 0, width: 16, height: 16, cursor: "nesw-resize"}}/>,
			<div key={BOTTOM_LEFT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, BOTTOM_LEFT)} style={{position: "absolute", left: 0, bottom: 0, width: 16, height: 16, cursor: "nesw-resize"}}/>,
			<div key={BOTTOM_RIGHT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, BOTTOM_RIGHT)} style={{position: "absolute", bottom: 0, right: 0, width: 16, height: 16, cursor: "nwse-resize"}}/>
		];
	}

	render():JSX.Element
	{
		var content = (
			<VBox
				draggable={true}
				{...this.props}
				onDragStart={this.onDragStart}
				style={_.merge({position: "absolute"}, this.props.style, this.state)}
				ref={(c:VBox) => this.element = ReactDOM.findDOMNode(c) as HTMLElement}
			>
				{this.props.children}
				{this.props.resizable ? this.renderResizers() : null}
			</VBox>
		);

		if (!this.props.getExternalOverlay && (this.props.liveMoving || this.props.liveResizing))
			return (
				<div>
					{ content }
					<Div ref={(c:Div) => { this.internalOverlay = c; }} style={this.overlayStyle}/>
				</div>
			);

		return content;
	}
}
