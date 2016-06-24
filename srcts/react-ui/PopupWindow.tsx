import * as ReactDOM from "react-dom";
import * as React from "react";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
import SmartComponent from "../ui/SmartComponent";
import prefixer from "./VendorPrefixer";
import CenteredIcon from "./CenteredIcon";
import Button from "../semantic-ui/Button";
import MouseUtils from "../utils/MouseUtils";
import ReactUtils from "../utils/ReactUtils";
import DraggableDiv, {DraggableDivState} from "./DraggableDiv";
import Div from "./Div";
import Popup from "../ui/Popup";
import {KEYCODES} from "../utils/KeyboardUtils";

export interface PopupWindowProps extends React.Props<PopupWindow>
{
	context:React.ReactInstance;
	title?:React.ReactChild;
	content?:React.ReactChild;
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
}

export default class PopupWindow extends SmartComponent<PopupWindowProps, PopupWindowState>
{
	private minWidth:number = 320;
	private minHeight:number = 240;
	private element:HTMLElement;
	private popup:Popup;

	private mouseDownOffset: {
		x: number,
		y: number
	};

	constructor(props:PopupWindowProps)
	{
		super(props);
		this.state = {};
	}

	static defaultProps = {
		resizable: true,
		draggable: true,
		suspendEnter: false
	};

	static open(props:PopupWindowProps):PopupWindow
	{
		// set active window to non active
		var popupWindow:PopupWindow = null;
		var popup = Popup.open(props.context, <PopupWindow {...props} ref={(c:PopupWindow) => popupWindow = c}/>);
		popupWindow.popup = popup;
		return popupWindow;
	}

	static generateOpener(propsGetter:()=>PopupWindowProps):()=>PopupWindow
	{
		var popup:PopupWindow;
		return () => {
			if (popup)
				popup.bringToFront();
			else
			{
				var props = propsGetter();
				popup = PopupWindow.open(
					_.merge({}, props, {
						onClose: () => {
							if (props.onClose)
								props.onClose();
							popup = null;
						}
					}) as PopupWindowProps
				);
			}
			return popup;
		}
	}

	bringToFront()
	{
		Popup.bringToFront(this.popup);
	}

	componentDidMount()
	{
		ReactUtils.getDocument(this).addEventListener("keydown", this.onKeyDown);
	}

	componentWillUnmount()
	{
		ReactUtils.getDocument(this).removeEventListener("keydown", this.onKeyDown);
	}

	onKeyDown=(event:KeyboardEvent)=>
	{
		var code = event.keyCode;

		if (code == KEYCODES.ENTER && this.props.modal && !this.props.suspendEnter && ReactUtils.hasFocus(this))
			this.onOk();
	}

	private onOk()
	{
		if (this.props.onOk)
			this.props.onOk();
		this.close();
	}

	private onCancel()
	{
		if (this.props.onCancel)
			this.props.onCancel();
		this.close();
	}

	/**
	 * Given an Element or React Component, uses ReactUtils.findComponent() to find the enclosing PopupWindow and close it.
	 */
	static close(instance:React.ReactInstance)
	{
		var popup = ReactUtils.findComponent(instance, PopupWindow);
		if (popup)
			popup.close();
	}

	close()
	{
		if (this.props.onClose)
			this.props.onClose();
		Popup.close(this.popup);
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
				onMouseDown={() => {
					Popup.bringToFront(this.popup);
				}}
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
			<div ref={ReactUtils.registerComponentRef(this)}>
				{this.props.modal ? this.renderOverlay(this.props.modal) : null}
				{popupWindow}
			</div>
		);
	}
}
