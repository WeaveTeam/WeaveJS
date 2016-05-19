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
import MiscUtils from "../utils/MiscUtils";
import DOMUtils from "../utils/DOMUtils";
import Div from "./Div";

import Bounds2D = weavejs.geom.Bounds2D;

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

enum Handle {
	LEFT = 1,
	TOP = 2,
	RIGHT = 4,
	BOTTOM = 8
};

export interface DraggableDivProps extends React.HTMLProps<DraggableDiv>
{
	onReposition?:(position:DraggableDivState)=>void;
	liveMoving?:boolean;
	liveResizing?:boolean;
	getExternalOverlay?:()=>Div;
	resizable?:boolean;
	movable?:boolean;
	percentageMode?:boolean;
}

export interface DraggableDivState
{
	top:string|number;
	left:string|number;
	width:string|number;
	height:string|number;
}

export default class DraggableDiv extends SmartComponent<DraggableDivProps, DraggableDivState>
{
	private element:HTMLElement;
	private internalOverlay:Div;
	private overlayStyle:React.CSSProperties = {
		visibility: "hidden",
		position: "absolute",
		backgroundColor: "rgba(0, 0, 0, 0.2)"
	};

	private mouseDownBounds:Bounds2D;
	private mouseDownOffset:{x:number, y:number};
	private moving:boolean;
	private activeResizeHandle:Handle;

	constructor(props:DraggableDivProps)
	{
		super(props);
		this.setState(this.toDraggableDivState(props.style));
	}
	
	static defaultProps:DraggableDivProps =	{
		resizable: true,
		movable: true,
		liveMoving: true,
		liveResizing: true,
		percentageMode: true
	}

	componentDidMount()
	{
		// if initial width height are provided
		// use it otherwise default to element position
		var style = this.props.style || {};
		var newState:DraggableDivState = {
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
	
	toDraggableDivState(obj:any):DraggableDivState
	{
		return _.pick(obj, "left", "top", "width", "height") as DraggableDivState;
	}
	
	private getMouseOffset():{x:number, y:number}
	{
		return MouseUtils.getOffsetPoint(this.element.offsetParent as HTMLElement);
	}

	private getOffsetBounds():Bounds2D
	{
		var rect = DOMUtils.getOffsetRect(this.element.offsetParent as HTMLElement, this.element);
		var bounds = new Bounds2D();
		bounds.setRectangle(rect.left, rect.top, rect.width, rect.height);
		return bounds;
	}
	
	private onDragStart=(event:React.DragEvent)=>
	{
		if (this.props.movable)
		{
			if (!this.props.liveMoving)
				this.updateOverlayStyle(this.state);
			
			event.preventDefault();
			event.stopPropagation();
			
			this.mouseDownOffset = this.getMouseOffset();
			this.mouseDownBounds = this.getOffsetBounds();
			this.moving = true;
		}
		
		if (this.props.onDragStart)
			this.props.onDragStart(event);
	}
	
	private onResizeStart(event:React.MouseEvent, handle:Handle)
	{
		if (!this.props.liveResizing)
			this.updateOverlayStyle(this.state);
		
		this.mouseDownOffset = this.getMouseOffset();
		this.mouseDownBounds = this.getOffsetBounds();
		this.activeResizeHandle = handle;
	}
	
	private shouldLiveUpdate():boolean
	{
		return (this.activeResizeHandle && this.props.liveResizing) || (this.moving && this.props.liveMoving);
	}

	private getNumberFromStyleValue(part:number|string, whole:number):number
	{
		var str = String(part);
		if (str.substr(-1) == '%')
			part = Number(str.substr(0, str.length - 1)) * whole / 100;
		return Number(part) || 0;
	}
	
	private onDrag=(event:MouseEvent)=>
	{
		if (!this.activeResizeHandle && !this.moving)
			return;
		
		var parent = this.element.offsetParent as HTMLElement;
		var parentWidth = parent.offsetWidth;
		var parentHeight = parent.offsetHeight;
		var edgeBuffer = 25;
		
		var mouseOffset = this.getMouseOffset();
		var mouseDeltaX = mouseOffset.x - this.mouseDownOffset.x;
		var mouseDeltaY = mouseOffset.y - this.mouseDownOffset.y;
		
		var minWidth:number = this.getNumberFromStyleValue(this.props.style && this.props.style.minWidth, parentWidth);
		var minHeight:number = this.getNumberFromStyleValue(this.props.style && this.props.style.minHeight, parentHeight);

		var oldBounds = this.mouseDownBounds;
		var newBounds = oldBounds.cloneBounds();
		
		if (this.moving)
		{
			newBounds.xMin += mouseDeltaX;
			newBounds.xMin = Math.max(newBounds.xMin, edgeBuffer - (oldBounds.getWidth() || 0));
			newBounds.xMin = Math.min(newBounds.xMin, parentWidth - edgeBuffer);
			newBounds.xMax = newBounds.xMin + oldBounds.getWidth(); // preserve width
			
			newBounds.yMin += mouseDeltaY;
			newBounds.yMin = Math.max(newBounds.yMin, 0);
			newBounds.yMin = Math.min(newBounds.yMin, parentHeight - edgeBuffer);
			newBounds.yMax = newBounds.yMin + oldBounds.getHeight(); // preserve height
		}
		else if (this.activeResizeHandle)
		{
			if (this.activeResizeHandle & Handle.LEFT)
			{
				newBounds.xMin += mouseDeltaX;
				newBounds.xMin = Math.max(newBounds.xMin, oldBounds.xMax - parentWidth);
				newBounds.xMin = Math.min(newBounds.xMin, oldBounds.xMax - minWidth, parentWidth - edgeBuffer);
			}
			if (this.activeResizeHandle & Handle.TOP)
			{
				newBounds.yMin += mouseDeltaY;
				newBounds.yMin = Math.max(newBounds.yMin, oldBounds.yMax - parentHeight, 0);
				newBounds.yMin = Math.min(newBounds.yMin, oldBounds.yMax - minHeight, parentHeight - edgeBuffer);
			}
			if (this.activeResizeHandle & Handle.RIGHT)
			{
				newBounds.xMax += mouseDeltaX;
				newBounds.xMax = Math.max(newBounds.xMax, oldBounds.xMin + minWidth, edgeBuffer);
				newBounds.xMax = Math.min(newBounds.xMax, oldBounds.xMin + parentWidth);
			}
			if (this.activeResizeHandle & Handle.BOTTOM)
			{
				newBounds.yMax += mouseDeltaY;
				newBounds.yMax = Math.max(newBounds.yMax, oldBounds.yMin + minHeight);
				newBounds.yMax = Math.min(newBounds.yMax, oldBounds.yMin + parentHeight);
			}
		}
		
		var newState:DraggableDivState;
		if (this.props.percentageMode)
		{
			newBounds.xMin = Math.round(100 * newBounds.xMin / parentWidth);
			newBounds.yMin = Math.round(100 * newBounds.yMin / parentHeight);
			var width:number, height:number;
			
			if (this.moving)
			{
				// preserve original width and height while moving
				width = Math.round(100 * oldBounds.getWidth() / parentWidth);
				height = Math.round(100 * oldBounds.getHeight() / parentHeight);
			}
			else
			{
				newBounds.xMax = Math.round(100 * newBounds.xMax / parentWidth);
				newBounds.yMax = Math.round(100 * newBounds.yMax / parentHeight);
				width = newBounds.getWidth();
				height = newBounds.getHeight();
			}
			
			newState = {
				left: newBounds.xMin + '%',
				top: newBounds.yMin + '%',
				width: width + '%',
				height: height + '%'
			};
		}
		else
		{
			newState = {
				left: newBounds.xMin,
				top: newBounds.yMin,
				width: newBounds.getWidth(),
				height: newBounds.getHeight()
			};
		}
		
		if (this.shouldLiveUpdate())
		{
			this.setState(newState);
			
			if (this.props.onReposition)
				this.props.onReposition(newState);
		}
		else
		{
			this.updateOverlayStyle(newState, {visibility: "visible", minWidth, minHeight});
		}
	}
	
	private onDragEnd=(event:MouseEvent)=>
	{
		// if live update is disabled, we reposition when drag ends
		if ((this.moving || this.activeResizeHandle) && !this.shouldLiveUpdate())
		{
			var newState = this.toDraggableDivState(this.overlayStyle);
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
		var n = 5;
		var nnnn = n * 4;
		var items:[Handle, string, React.CSSProperties][] = [
			// sides
			[Handle.LEFT,   'ew-resize', {  left: 0,  width: n,  top: nnnn, bottom: nnnn}],
			[Handle.RIGHT,  'ew-resize', { right: 0,  width: n,  top: nnnn, bottom: nnnn}],
			[Handle.TOP,    'ns-resize', {   top: 0, height: n, left: nnnn,  right: nnnn}],
			[Handle.BOTTOM, 'ns-resize', {bottom: 0, height: n, left: nnnn,  right: nnnn}],
			
			// horizontal boxes in corners
			[Handle.TOP    | Handle.LEFT,  'nwse-resize', { left: 0, width: nnnn,    top: 0, height: n}],
			[Handle.TOP    | Handle.RIGHT, 'nesw-resize', {right: 0, width: nnnn,    top: 0, height: n}],
			[Handle.BOTTOM | Handle.LEFT,  'nesw-resize', { left: 0, width: nnnn, bottom: 0, height: n}],
			[Handle.BOTTOM | Handle.RIGHT, 'nwse-resize', {right: 0, width: nnnn, bottom: 0, height: n}],
			
			// vertical boxes in corners
			[Handle.TOP    | Handle.LEFT,  'nwse-resize', { left: 0, width: n,    top: 0, height: nnnn}],
			[Handle.TOP    | Handle.RIGHT, 'nesw-resize', {right: 0, width: n,    top: 0, height: nnnn}],
			[Handle.BOTTOM | Handle.LEFT,  'nesw-resize', { left: 0, width: n, bottom: 0, height: nnnn}],
			[Handle.BOTTOM | Handle.RIGHT, 'nwse-resize', {right: 0, width: n, bottom: 0, height: nnnn}]
		];
		return items.map(([handle, cursor, style], index) => (
			<div
				key={index}
				onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, handle)}
				style={_.merge({position: "absolute", cursor}, style)}
			/>
		));
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
