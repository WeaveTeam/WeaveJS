import * as ReactDOM from "react-dom";
import * as React from "react";
import HBox from "./HBox";
import VBox from "./VBox";
import * as Prefixer from "react-vendor-prefix";

const mouseevents:string[] = ["mouseover", "mouseout", "mouseleave"];

export interface PopupWindowProps extends React.Props<PopupWindow>
{
	title:string|JSX.Element;
	content?:JSX.Element;
	modal?:boolean;
	resizable?:boolean;
	top?:number;
	left?:number;
	footerContent?:JSX.Element;
	onClose?:Function;
	onOk?:Function;
	onCancel?:Function;
}

export interface PopupWindowState
{
	top?: number;
	left?: number;
	width?: number;
	height?: number;
}

export default class PopupWindow extends React.Component<PopupWindowProps, PopupWindowState>
{
	private minWidth:number = 320;
	private minHeight:number = 240;
	private element:HTMLElement;
	private popupWindow:PopupWindow;
	private oldMousePos: {
		x: number,
		y: number
	}
	private dragging:boolean;
	
	constructor(props:PopupWindowProps)
	{
		super(props);
	}
	
	static nodeCache = new WeakMap<PopupWindow, Element>();
	static open(props:PopupWindowProps):PopupWindow
	{
		var node = document.body.appendChild(document.createElement("div")) as Element;
		var popupWindow:PopupWindow = ReactDOM.render(<PopupWindow {...props}></PopupWindow>, node) as PopupWindow;
		PopupWindow.nodeCache.set(popupWindow, node);
		return popupWindow;
	}
	
	static close(popupWindow:PopupWindow)
	{
		var node = PopupWindow.nodeCache.get(popupWindow);
		// only if popupWindow was created from open
		if(node)
		{
			ReactDOM.unmountComponentAtNode(node);
			document.body.removeChild(node);
		}
		else {
			// otherwise the parent container should handle the close event
			// TODO throw error telling the developer that he needs
			// to add an onclose event
			popupWindow.props.onClose && popupWindow.props.onClose();
		}
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this.popupWindow) as HTMLElement;
		this.setState({
			top: this.props.top || 1/2*window.innerHeight - 1/2*this.element.clientHeight,
			left: this.props.left || 1/2*window.innerWidth - 1/2*this.element.clientWidth,
			height: Math.max(this.minHeight, this.element.clientHeight),
			width: Math.max(this.minWidth, this.element.clientWidth)
		});
		document.addEventListener("mouseup", this.onDragEnd, true);
		document.addEventListener("mousemove", this.onDrag, true);
		mouseevents.forEach((mouseevent: string) => document.addEventListener(mouseevent, this.stopEventPropagation, true));
	}
	
	componentWillUnmount()
	{
		document.removeEventListener("mouseup", this.onDragEnd);
		document.removeEventListener("mousemove", this.onDrag);
		mouseevents.forEach((mouseevent) => document.removeEventListener(mouseevent, this.stopEventPropagation));
	}
	
	stopEventPropagation=()=>
	{
		if(this.dragging)
		{
			event.stopImmediatePropagation();
		}
	}

	private onOk()
	{
		this.props.onOk && this.props.onOk();
		PopupWindow.close(this);
	}
	
	private onCancel()
	{
		this.props.onCancel && this.props.onCancel();
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
	
	private onDrag=(event:MouseEvent)=>
	{
		if(this.dragging) {
			event.stopImmediatePropagation();
			var mouseDeltaX = event.clientX - this.oldMousePos.x;
			var mouseDeltaY = event.clientY - this.oldMousePos.y;
			this.oldMousePos.x = event.clientX;
			this.oldMousePos.y = event.clientY;
			
			this.setState({
				top: this.state.top + mouseDeltaY,
				left: this.state.left + mouseDeltaX
			});
		}
	}
	
	private onDragEnd=(event:MouseEvent)=>
	{
		this.dragging = false;
	}

	static Overlay():JSX.Element
	{
		var overlayStyle:React.CSSProperties = {
			position: "fixed",
			width: "100%",
			height: "100%",
			zIndex: 48,
			top: 0,
			left: 0
		};
		return <div className="weave-dialog-overlay" style={overlayStyle}/>;
	}

	render():JSX.Element
	{

		var windowStyle:React.CSSProperties = this.state || {};
		windowStyle.position = "absolute";
		windowStyle.zIndex = 50;

		var popupWindow = (
			<VBox className="weave-window" ref={(c:PopupWindow) => this.popupWindow = c} style={windowStyle}>
				<HBox className="weave-window-header" onMouseDown={this.onDragStart.bind(this)}>
					<div style={{flex: 1}}>
					{
						this.props.title
					}
					</div>
					{
						!this.props.modal ? 
							<div onClick={() => PopupWindow.close(this)}>
							×
							</div>
						: null
					}
				</HBox>
				<HBox className="weave-window-content" style={{flex: 1}}>
				{
					this.props.content
				}
				{
					this.props.children
				}
				</HBox>
				{
					this.props.modal ?
					<HBox className="weave-window-footer">
					{
						this.props.footerContent ? this.props.footerContent
						:
						<HBox style={Prefixer.prefix({style: {flex: 1, justifyContent: "flex-end"}}).style}>
							<input className="weave-window-footer-input" type="button" value="Ok" onClick={this.onOk.bind(this)}/>
							<input className="weave-window-footer-input" type="button" value="Cancel" onClick={this.onCancel.bind(this)}/>
						</HBox>
					}
					</HBox>
					: null
				}
			</VBox>
		);
		
		if(this.props.modal)
			return (
				<div>
					<PopupWindow.Overlay/>
					{popupWindow}
				</div>
			);
		else
			return popupWindow;
	}
}
