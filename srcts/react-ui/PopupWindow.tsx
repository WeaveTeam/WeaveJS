import * as ReactDOM from "react-dom";
import * as React from "react";
import {HBox, VBox} from "./FlexBox";
import ReactUtils from "../utils/ReactUtils";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "./VendorPrefixer";
import CenteredIcon from "./CenteredIcon";
import Button from "../semantic-ui/Button";
import MouseUtils from "../utils/MouseUtils";
import DraggableDiv from "./DraggableDiv";
import {DraggableDivState} from "./DraggableDiv";

const ENTER_KEYCODE = 13;
const ESC_KEYCODE = 27;

export interface PopupWindowProps extends React.HTMLProps<PopupWindow>
{
	title:string /*|JSX.Element*/;
	content?:any/*JSX.Element*/;
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

	static windowSet = new Set<PopupWindow>(); 

	constructor(props:PopupWindowProps)
	{
		super(props);
		this.state = {
			zIndex: 0,
		};
		document.addEventListener("keyup", this.onKeyPress);
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
		// re-render now that this.element has been set in the ref callback function
		this.forceUpdate();
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

	componentWillUnmount()
	{
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
			className = "weave-dialog-overlay";
		return <div style={style} className={className}/>;
	}
	
	render():JSX.Element
	{

		var windowStyle:React.CSSProperties = {	
			zIndex: this.state.zIndex,
			top: this.props.top,
			left: this.props.left,
			width: this.props.width,
			height: this.props.height,
			minWidth: this.minWidth,
			minHeight: this.minHeight
		}
	
		var popupWindow = (
			<DraggableDiv 
				style={windowStyle} 
				className="weave-app weave-window"
				draggable={false}
				onMouseDown={() => this.handleClickOnWindow()}
				ref={(c:DraggableDiv) => this.element = ReactDOM.findDOMNode(c) as HTMLElement}
			>
				<HBox className="weave-header weave-window-header" draggable={true}>
					<div style={{flex: 1}}>
						{
							this.props.title
						}
					</div>
				</HBox>
				<VBox style={{flex: 1}}>
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
			</DraggableDiv>
		);
		
		return (
			<div>
				{this.props.modal ? this.renderOverlay(this.props.modal) : null}
				{popupWindow}
			</div>
		);
	}
}
