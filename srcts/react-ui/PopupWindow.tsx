import * as _ from "lodash";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {HBox, VBox} from "./FlexBox";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "./VendorPrefixer";
import CenteredIcon from "./CenteredIcon";

const mouseevents:string[] = ["mouseover", "mouseout", "mouseleave"];

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
}

export interface PopupWindowState
{
	content?:JSX.Element;
	style?: React.CSSProperties;
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
	
	constructor(props:PopupWindowProps)
	{
		super(props);
		this.state = {};
	}
	
	static open(props:PopupWindowProps):PopupWindow
	{
		return ReactUtils.openPopup(<PopupWindow {...props}/>) as PopupWindow;
	}
	
	static close(popupWindow:PopupWindow)
	{
		ReactUtils.closePopup(popupWindow);
	}
	
	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this.container) as HTMLElement;
		this.setState({
			style: {
				top: this.props.top || (window.innerHeight - this.element.clientHeight) / 2,
				left: this.props.left || (window.innerWidth - this.element.clientWidth) / 2
			}
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
		if (this.dragging)
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
		if (this.dragging)
		{
			event.stopImmediatePropagation();
			var mouseDeltaX = event.clientX - this.oldMousePos.x;
			var mouseDeltaY = event.clientY - this.oldMousePos.y;
			this.oldMousePos.x = event.clientX;
			this.oldMousePos.y = event.clientY;
			
			var style = Object(this.state.style);
			this.setState({
				style: {
					top: style.top + mouseDeltaY,
					left: style.left + mouseDeltaX
				}
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
			top: 0,
			left: 0
		};
		return <div className="weave-dialog-overlay" style={overlayStyle}/>;
	}

	render():JSX.Element
	{

		var windowStyle:React.CSSProperties = _.merge({position: "absolute", width: this.props.width, height: this.props.height, minWidth: this.minWidth, minHeight: this.minHeight}, this.state.style);

		var popupWindow = (
			<VBox className="weave-app weave-window" ref={(c:VBox) => this.container = c} style={windowStyle}>
				<HBox className="weave-window-header" onMouseDown={this.onDragStart.bind(this)}>
					<div style={{flex: 1}}>
					{
						this.props.title
					}
					</div>
					{
						!this.props.modal
						? 
							<CenteredIcon onClick={this.onCancel.bind(this)} iconProps={{className: "fa fa-times fa-fw"}}/>
						:
							''
					}
				</HBox>
				<HBox className="weave-window-content" style={{flex: 1}}>
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
									<input className="weave-window-footer-input" type="button" value="Ok" onClick={this.onOk.bind(this)}/>
									<input className="weave-window-footer-input" type="button" value="Cancel" onClick={this.onCancel.bind(this)}/>
								</HBox>
						}
						</HBox>
					:
						null
				}
			</VBox>
		);
		
		if (this.props.modal)
			return (
				<div>
					<PopupWindow.Overlay/>
					{popupWindow}
				</div>
			);
		
		return popupWindow;
	}
}
