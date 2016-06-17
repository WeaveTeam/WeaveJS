import * as ReactDOM from "react-dom";
import * as React from "react";
import {HBox, VBox} from "./FlexBox";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "./VendorPrefixer";
import CenteredIcon from "./CenteredIcon";
import Button from "../semantic-ui/Button";
import MouseUtils from "../utils/MouseUtils";
import ReactUtils from "../utils/ReactUtils";
import DraggableDiv, {DraggableDivState} from "./DraggableDiv";

const ENTER_KEYCODE = 13;
const ESC_KEYCODE = 27;

export interface PopupWindowProps extends React.HTMLProps<PopupWindow>
{
	title?:string /*|JSX.Element*/;
	content?:any/*JSX.Element*/;
	modal?:boolean;
	resizable?:boolean;
	draggable?:boolean;
	top?:number;
	left?:number;
	width?:number|string;
	height?:number|string;
	footerContent?:JSX.Element;
	onOk?:Function;
	onCancel?:Function;
	onClose?:Function;
	suspendEnter?:boolean;
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
	}

	static defaultProps = {
		resizable: true,
		draggable: true,
		suspendEnter: false
	};

	static open(context:React.ReactInstance, props:PopupWindowProps):PopupWindow
	{
		// set active window to non active
		var popupWindow = ReactUtils.openPopup(context, <PopupWindow {...props}/>) as PopupWindow;
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
		ReactUtils.getDocument(this).addEventListener("keydown", this.onKeyDown);
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

	onKeyDown =(event:KeyboardEvent)=>
	{
		var code = event.keyCode;

		if (code == ENTER_KEYCODE && this.props.modal && !this.props.suspendEnter && ReactUtils.hasFocus(this))
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
		ReactUtils.getDocument(this).removeEventListener("keydown", this.onKeyDown);
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
				resizable={this.props.resizable}
				onMouseDown={() => this.handleClickOnWindow()}
				ref={(c:DraggableDiv) => this.element = ReactDOM.findDOMNode(c) as HTMLElement}
			>
				{
					this.props.title
					?	<HBox className="weave-header weave-window-header" draggable={this.props.draggable}>
							<div style={{flex: 1}}>
								{
									this.props.title
								}
							</div>
							<i className="ui close icon" onClick={this.onCancel.bind(this)}/>
						</HBox>
					:	null
				}
				<VBox className="weave-padded-vbox weave-window-content" style={{flex: 1}}>
					<VBox style={{flex: 1, overflow: "auto"}}>
						{ this.state.content || this.props.content }
						{ this.props.children }
					</VBox>
					{
						this.props.footerContent
						?	<HBox className="weave-window-footer">
								{this.props.footerContent}
							</HBox>
						:	<HBox className="weave-window-footer">
								<HBox className="weave-padded-hbox" style={prefixer({flex: 1, justifyContent: "flex-end"})}>
									<Button colorClass="primary" onClick={this.onOk.bind(this)}>{Weave.lang(this.props.modal ? "Ok" : "Done")}</Button>
									{
										this.props.modal
											?	<Button colorClass="secondary" onClick={this.onCancel.bind(this)} style={{marginLeft: 8}}>{Weave.lang("Cancel")}</Button>
											:	null
									}
								</HBox>
							</HBox>
					}
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
