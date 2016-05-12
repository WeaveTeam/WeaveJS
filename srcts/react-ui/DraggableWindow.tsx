import * as ReactDOM from "react-dom";
import * as React from "react";
import {HBox, VBox} from "./FlexBox";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "./VendorPrefixer";
import CenteredIcon from "./CenteredIcon";
import Button from "../semantic-ui/Button";
import MouseUtils from "../utils/MouseUtils";

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

export interface PopupWindowProps extends React.Props<PopupWindow>
{
	title:string|JSX.Element;
	content?:JSX.Element;
	modal?:boolean;
	resizable?:boolean;
	top?:number;
	left?:number;
	width?:number;
	height?:number;
	onResize?:(width:number, height:number)=>void;
	onDrag?:(top:number, left:number)=>void;
	footerContent?:JSX.Element;
	onOk?:Function;
	onCancel?:Function;
	onClose?:Function;
}

export interface PopupWindowState
{
	content?:JSX.Element;
	top?:number;
	left?:number;
	width?: number;
	height?: number;
	zIndex?: number;
}

export default class PopupWindow extends SmartComponent<PopupWindowProps, PopupWindowState>
{
	private minWidth:number = 320;
	private minHeight:number = 240;
	private element:HTMLElement;
	private mouseDownOffset: {
		x: number,
		y: number
	}
	private dragging:boolean;
	private activeResizeHandle:Handle;

	static windowSet = new Set<PopupWindow>(); 
	
	constructor(props:PopupWindowProps)
	{
		super(props);
		this.state = {
			zIndex: 0,
			width: props.width,
			height: props.height
		};
	}
	
	static defaultProps = {
		resizable: true
	};

	static open(props:PopupWindowProps):PopupWindow
	{
		// set active window to non active
		var popupWindow = ReactUtils.openPopup(<PopupWindow {...props}/>) as PopupWindow;
		PopupWindow.windowSet.add(popupWindow);
		PopupWindow.alignWindows();
		return popupWindow;
	}
	
	static close(popupWindow:PopupWindow)
	{
		PopupWindow.windowSet.delete(popupWindow);
		ReactUtils.closePopup(popupWindow);
	}
	
	static alignWindows()
	{
		var index = 0;
		for (var popupWindow of PopupWindow.windowSet)
		{
			popupWindow.setState({ zIndex: index});
			index++;
		}
	}
	
	componentDidMount()
	{
		var top = this.props.top || (window.innerHeight - this.element.clientHeight) / 2;
		var left = this.props.left || (window.innerWidth - this.element.clientWidth) / 2;
		this.setState({
			top: top,
			left: left,
			width: this.element.clientWidth,
			height: this.element.clientHeight
		});
		document.addEventListener("mouseup", this.onDragEnd, true);
		document.addEventListener("mousemove", this.onDrag, true);
		document.addEventListener("keyup", this.onKeyPress);
	}

	private onOk()
	{
		this.props.onOk && this.props.onOk();
		this.onClose();
	}
	
	private onCancel()
	{
		this.props.onCancel && this.props.onCancel();
		this.onClose();
	}
	
	private onClose()
	{
		this.props.onClose && this.props.onClose();
		PopupWindow.close(this);
	}

	private onDragStart(event:MouseEvent)
	{
		this.dragging = true;
		this.mouseDownOffset = MouseUtils.getOffsetPoint(this.element, event as any);
	}
	
	private onResizeStart(event:React.MouseEvent, handle:Handle)
	{
		this.activeResizeHandle = handle;
		this.mouseDownOffset = MouseUtils.getOffsetPoint(this.element, event as any);
	}
	
	private handleClickOnWindow()
	{
		PopupWindow.windowSet.delete(this);
		PopupWindow.windowSet.add(this);
		PopupWindow.alignWindows();
	}
	
	onKeyPress =(event:KeyboardEvent)=>
	{
		var code = event.keyCode;
		
		if (code == ENTER_KEYCODE && this.props.modal && ReactUtils.hasFocus(this))
			this.onOk();
		
		if (code == ESC_KEYCODE)
		{
			var activeWindow = Array.from(PopupWindow.windowSet.keys()).pop();
			if (this == activeWindow)
				this.onCancel();
		}
	}

	private onDrag=(event:MouseEvent)=>
	{
		if (!this.activeResizeHandle && !this.dragging)
			return;
		
		var mouseOffset = MouseUtils.getOffsetPoint(this.element, event)
		var parentMouseOffset = MouseUtils.getOffsetPoint(this.element.parentElement, event);
		var parentWidth = (this.element.offsetParent as HTMLElement).offsetWidth;
		var parentHeight = (this.element.offsetParent as HTMLElement).offsetHeight;
		var oldRight:number = this.state.left + this.state.width;
		var oldBottom:number = this.state.top + this.state.height;
		var edgeBuffer = 25;
		
		var mouseDeltaX = mouseOffset.x - this.mouseDownOffset.x;
		var mouseDeltaY = mouseOffset.y - this.mouseDownOffset.y;
		var newState:PopupWindowState = {};
		
		// don't resize if mouse goes out of screen

		if (this.activeResizeHandle)
		{
			if (this.activeResizeHandle.indexOf(LEFT) >= 0)
			{
				newState.left = this.state.left + mouseDeltaX;
				newState.left = Math.max(newState.left, oldRight - parentWidth);
				newState.left = Math.min(newState.left, oldRight - this.minWidth, parentWidth - edgeBuffer);
				newState.width = oldRight - newState.left;
			}
			
			if (this.activeResizeHandle.indexOf(TOP) >= 0)
			{
				newState.top = this.state.top + mouseDeltaY;
				newState.top = Math.max(newState.top, 0);
				newState.top = Math.min(newState.top, oldBottom - this.minHeight, parentHeight - edgeBuffer);
				newState.height = oldBottom - newState.top;
			}
			
			if (this.activeResizeHandle.indexOf(RIGHT) >= 0)
			{
				newState.width = this.state.width + mouseDeltaX;
				newState.width = Math.max(newState.width, this.minWidth, edgeBuffer - this.state.left);
				newState.width = Math.min(newState.width, parentWidth);
				this.mouseDownOffset.x += newState.width - this.state.width;
			}
			
			if (this.activeResizeHandle.indexOf(BOTTOM) >= 0 && event.clientY < window.innerHeight)
			{
				newState.height = this.state.height + mouseDeltaY;
				newState.height = Math.max(newState.height, this.minHeight);
				newState.height = Math.min(newState.height, parentHeight);
				this.mouseDownOffset.y += newState.height - this.state.height;
			}
			this.props.onResize && this.props.onResize(newState.width, newState.height);
		}
		else if (this.dragging)
		{
			newState.left = this.state.left + mouseDeltaX;
			newState.left = Math.max(newState.left, edgeBuffer - (this.state.width || 0));
			newState.left = Math.min(newState.left, parentWidth - edgeBuffer);
			
			newState.top = this.state.top + mouseDeltaY;
			newState.top = Math.max(newState.top, 0);
			newState.top = Math.min(newState.top, parentHeight - edgeBuffer);
			this.props.onDrag && this.props.onDrag(newState.top, newState.left);
		}
		this.setState(newState);
	}
	
	private onDragEnd=(event:MouseEvent)=>
	{
		this.dragging = false;
		this.activeResizeHandle = null;
		this.forceUpdate(); // removes the overlay
	}

	componentWillUnmount()
	{
		document.removeEventListener("mouseup", this.onDragEnd, true);
		document.removeEventListener("mousemove", this.onDrag, true);
		document.removeEventListener("keyup", this.onKeyPress);
	}

	renderOverlay(modal:boolean)
	{
		var style:React.CSSProperties = {
			position: "fixed",
			width: "100%",
			height: "100%",
			top: 0,
			left: 0
		};
		var className:string;
		if (modal)
		{
			className = "weave-dialog-overlay";
		}
		return <div style={style} className={className}/>;
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

		var windowStyle:React.CSSProperties = {	
			position: "absolute", 
			top: this.state.top,
			left: this.state.left,
			width: this.state.width,
			height: this.state.height,
			zIndex: this.state.zIndex
		};

		var popupWindow = (
			<div style={windowStyle} ref={(div:HTMLDivElement) => this.element = div} >
				<VBox className="weave-app weave-window" onMouseDown={() => this.handleClickOnWindow()} style={{width: "100%", height: "100%"}}>
					<HBox className="weave-header weave-window-header" onMouseDown={this.onDragStart.bind(this)}>
						<div style={{flex: 1}}>
						{
							this.props.title
						}
						</div>
						{/*
							!this.props.modal
							?	<CenteredIcon onClick={this.onClose.bind(this)} iconProps={{className: "fa fa-times fa-fw"}}/>
							:	null
						*/}
					</HBox>
					<VBox className="weave-padded-vbox weave-window-content" style={{display: 'block', flex: 1}}>
						<VBox style={{flex: 1, overflow: "auto"}}>
							{ this.state.content || this.props.content }
							{ this.props.children }
						</VBox>
						{
							this.props.footerContent
							?	<HBox className="weave-window-footer">
									this.props.footerContent
								</HBox>
							:	<HBox className="weave-window-footer">
									<HBox className="weave-padded-hbox" style={prefixer({flex: 1, justifyContent: "flex-end"})}>
										<Button onClick={this.onOk.bind(this)}>{Weave.lang(this.props.modal ? "Ok" : "Done")}</Button>
										{
											this.props.modal
											?	<Button onClick={this.onCancel.bind(this)} style={{marginLeft: 8}}>{Weave.lang("Cancel")}</Button>
											:	null
										}
									</HBox>
								</HBox>
						}
					</VBox>
				</VBox>
				{ this.props.resizable && this.renderResizers() }
			</div>
		);
		
		return (
			<div style={{zIndex: this.state.zIndex}}>
				{(this.dragging ||this.activeResizeHandle || this.props.modal) ? this.renderOverlay(this.props.modal) : null}
				{popupWindow}
			</div>
		);
	}
}
