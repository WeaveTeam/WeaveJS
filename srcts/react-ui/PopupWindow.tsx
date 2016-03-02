import * as ReactDOM from "react-dom";
import * as React from "react";
import HBox from "./HBox";
import VBox from "./VBox";
import * as Prefixer from "react-vendor-prefix";

export interface PopupWindowProps extends React.Props<PopupWindow>
{
	title:string|JSX.Element;
	content?:JSX.Element;
	dialog?:boolean;
	draggable?:boolean;
	resizable?:boolean;
	position?: {
		top:number;
		left:number;
		width:number;
		height:number;
	};
	footerContent?:JSX.Element;
	onClose?:Function;
	onOk?:Function;
	onCancel?:Function;
}

export interface PopupWindowState
{
	top: number;
	left: number;
	width: number;
	height: number;
}

export default class PopupWindow extends React.Component<PopupWindowProps, PopupWindowState>
{
	constructor(props:PopupWindowProps)
	{
		super(props);
		this.state = props.position;
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
	
	componentWillReceiveProps(nextProps:PopupWindowProps)
	{
		this.setState(nextProps.position)
	}

	onOk()
	{
		this.props.onOk && this.props.onOk();
		PopupWindow.close(this);
	}
	
	onCancel()
	{
		this.props.onCancel && this.props.onCancel();
		PopupWindow.close(this);
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
		return (
			<div>
				{
					this.props.dialog ? <PopupWindow.Overlay/> : null
				}
				<VBox className="weave-window" style={{position: "absolute", top: 300, left: 300, width: 300, height: 300, zIndex: 50}}>
					<HBox className="weave-window-header">
						<div style={{flex: 1}}>
							{
								this.props.title
							}
						</div>
						<div onClick={() => PopupWindow.close(this)}>
							×
						</div>
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
						this.props.dialog ?
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
			</div>
		)
	}
}
