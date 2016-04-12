import * as ReactDOM from "react-dom";
import * as React from "react";
import {HBox, VBox} from "./FlexBox";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "./VendorPrefixer";
import CenteredIcon from "./CenteredIcon";
import Button from "../semantic-ui/Button";

const mouseevents:string[] = ["mouseover", "mouseout", "mouseleave"];
const LEFT = "left";
const RIGHT = "right";
const TOP = "top";
const BOTTOM = "bottom";
const TOP_LEFT = "top-left";
const TOP_RIGHT = "top-right";
const BOTTOM_RIGHT = "bottom-right";
const BOTTOM_LEFT = "bottom-left";

type Handle = typeof LEFT | typeof RIGHT |
				 typeof TOP | typeof BOTTOM |
				 typeof TOP_LEFT | typeof TOP_RIGHT |
				 typeof BOTTOM_RIGHT | typeof BOTTOM_LEFT;

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
	private container:VBox;
	private oldMousePos: {
		x: number,
		y: number
	}
	private dragging:boolean;
	private activeResizeHandle:Handle;

	static windowRegistry = new Set<PopupWindow>(); 
	
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
	}

	static open(props:PopupWindowProps):PopupWindow
	{
		// set active window to non active
		var popupWindow = ReactUtils.openPopup(<PopupWindow {...props}/>) as PopupWindow;
		PopupWindow.windowRegistry.add(popupWindow);
		PopupWindow.alignWindows();
		return popupWindow;
	}
	
	static close(popupWindow:PopupWindow)
	{
		PopupWindow.windowRegistry.delete(popupWindow);
		ReactUtils.closePopup(popupWindow);
	}
	
	static alignWindows()
	{
		var index = 0;
		for( var popupWindow of PopupWindow.windowRegistry)
		{
			popupWindow.setState({ zIndex: index});
			index++;
		}
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this.container) as HTMLElement;
		var top = this.props.top || (window.innerHeight - this.element.clientHeight) / 2;
		var left = this.props.left || (window.innerWidth - this.element.clientWidth) / 2; 
		this.setState({
			top: top,
			left: left,
		});
		document.addEventListener("mouseup", this.onDragEnd, true);
		document.addEventListener("mousemove", this.onDrag, true);
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

	private onDragStart(event:React.MouseEvent)
	{
		this.dragging = true;
		this.oldMousePos = {
			x: event.clientX,
			y: event.clientY
		}
	}
	
	private onResizeStart(event:React.MouseEvent, handle:Handle)
	{
		this.activeResizeHandle = handle;
		this.oldMousePos = {
			x: event.clientX,
			y: event.clientY
		}
	}
	
	private handleClickOnWindow()
	{
		PopupWindow.windowRegistry.delete(this);
		PopupWindow.windowRegistry.add(this);
		PopupWindow.alignWindows();
	}
	
	private onDrag=(event:MouseEvent)=>
	{
		if(!this.activeResizeHandle && !this.dragging)
			return;

		// TODO: correctly handle the page offsets
		var mouseDeltaX = event.clientX - this.oldMousePos.x;
		var mouseDeltaY = event.clientY - this.oldMousePos.y;
		this.oldMousePos.x = event.clientX;
		this.oldMousePos.y = event.clientY;
		var newState:PopupWindowState = {};
		var newLeft:number;
		var newRight:number;
		var newTop:number;
		var newBottom:number;
		var newWidth:number;
		var newHeight:number;
		
		// don't resize if mouse goes out of screen

		if(this.activeResizeHandle)
		{
			if(this.activeResizeHandle.indexOf(LEFT) >= 0 && event.clientX > 0)
			{
				newState.left = this.state.left + mouseDeltaX;
				newState.width = this.state.width - mouseDeltaX;
			}
			
			if(this.activeResizeHandle.indexOf(RIGHT) >= 0 && event.clientX < window.innerWidth)
			{
				newState.width = this.state.width + mouseDeltaX;
			}
			
			if(this.activeResizeHandle.indexOf(TOP) >= 0 && event.clientY > 25)
			{
				newState.top = this.state.top + mouseDeltaY;
				newState.height = this.state.height - mouseDeltaY;
			}
			
			if(this.activeResizeHandle.indexOf(BOTTOM) >= 0 && event.clientY < window.innerHeight)
			{
				newState.height = this.state.height + mouseDeltaY;
			}
			
			if((!newState.width || newState.width > this.minWidth) && (!newState.height || newState.height > this.minHeight))
				this.setState(newState);
			
			return;
		}

		if (this.dragging)
		{
			var right = this.state.left + this.element.clientWidth;
			var bottom = this.state.top + this.element.clientHeight;
			
			var newState:PopupWindowState = {};

			var newLeft:number = this.state.left + mouseDeltaX;
			var newTop:number = this.state.top + mouseDeltaY;

			// check overflow left and right
			if (newLeft < window.innerWidth - 25 && newLeft+this.element.clientWidth > 25)
				newState.left = newLeft;

			// check overflow left and right
			if (newTop < window.innerHeight - 25 && newTop > 25)
				newState.top = newTop;
			
			if(Object.keys(newState).length)
				this.setState(newState);
		}
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
		if(modal)
		{
			className = "weave-dialog-overlay";
		}
		return <div style={style} className={className}/>;
	}
	
	renderResizers():JSX.Element[]
	{
		return [
			<div key={LEFT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, LEFT)} style={{position: "absolute", left: 0, top: 0, width: 4, height: "100%", cursor: "ew-resize"}}/>,
			<div key={RIGHT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, RIGHT)} style={{position: "absolute", right: 0, top: 0, width: 4, height: "100%", cursor: "ew-resize"}}/>,
			<div key={TOP} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, TOP)} style={{position: "absolute", left: 0, top: 0, width: "100%", height: 4, cursor: "ns-resize"}}/>,
			<div key={BOTTOM} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, BOTTOM)} style={{position: "absolute", left: 0, bottom: 0, width: "100%", height: 4, cursor: "ns-resize"}}/>,
			<div key={TOP_LEFT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, TOP_LEFT)} style={{position: "absolute", left: 0, top: 0, width: 4, height: 4, cursor: "nwse-resize"}}/>,
			<div key={TOP_RIGHT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event,  TOP_RIGHT)} style={{position: "absolute", right: 0, top: 0, width: 4, height: 4, cursor: "nesw-resize"}}/>,
			<div key={BOTTOM_LEFT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event,  BOTTOM_LEFT)} style={{position: "absolute", left: 0, bottom: 0, width: 4, height: 4, cursor: "nesw-resize"}}/>,
			<div key={BOTTOM_RIGHT} onMouseDown={(event:React.MouseEvent) => this.onResizeStart(event, BOTTOM_RIGHT)} style={{position: "absolute", bottom: 0, right: 0, width: 4, height: 4, cursor: "nwse-resize"}}/>
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
			<VBox className="weave-app weave-window" onMouseDown={() => this.handleClickOnWindow()} ref={(c:VBox) => this.container = c} style={windowStyle}>
				<HBox className="weave-header weave-window-header" onMouseDown={this.onDragStart.bind(this)}>
					<div style={{flex: 1}}>
					{
						this.props.title
					}
					</div>
					{
						!this.props.modal
						? 
							<CenteredIcon onClick={this.onClose.bind(this)} iconProps={{className: "fa fa-times fa-fw"}}/>
						:
							''
					}
				</HBox>
				<HBox className="weave-window-content" style={{flex: 1, overflow: "auto"}}>
					{ this.state.content || this.props.content }
					{ this.props.children }
				</HBox>
				{
					this.props.modal
					?
						<HBox className="weave-window-footer">
						{
							this.props.footerContent
							?
								this.props.footerContent
							:
								<HBox style={prefixer({flex: 1, justifyContent: "flex-end"})}>
									<Button onClick={this.onOk.bind(this)}>{Weave.lang("Ok")}</Button>
									<Button onClick={this.onCancel.bind(this)}>{Weave.lang("Cancel")}</Button>
								</HBox>
						}
						</HBox>
					:
						null
				}
				{
					this.props.resizable && this.renderResizers()
				}
			</VBox>
		);
		
		return (
			<div style={{zIndex: this.state.zIndex}}>
				{(this.dragging ||this.activeResizeHandle || this.props.modal) ? this.renderOverlay(this.props.modal) : null}
				{popupWindow}
			</div>
		);
	}
}
