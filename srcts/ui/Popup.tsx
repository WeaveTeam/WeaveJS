import * as React from "react";
import ReactUtils from "../utils/ReactUtils";
import Div from "../react-ui/Div";
import {KEYCODES} from "../utils/KeyboardUtils";

export default class Popup extends React.Component<React.HTMLProps<Popup>, React.HTMLAttributes>
{
	static popupSet = new Set<Popup>();

	static open(context:React.ReactInstance, jsx:JSX.Element, closeOnMouseDown:boolean = false, onClose?:(popup:Popup)=>void):Popup
	{
		var popup = ReactUtils.openPopup(context, <Popup style={{zIndex: 0}}>{jsx}</Popup>, closeOnMouseDown, (popup:React.ReactInstance) => {
			Popup.close(popup as Popup);
			if(onClose) onClose(popup as Popup);
		}) as Popup;
		Popup.popupSet.add(popup);
		Popup.alignPopups();
		return popup;
	}

	componentDidMount()
	{
		ReactUtils.getDocument(this).addEventListener("keydown", this.onKeyDown);
	}

	componentWillUnmount()
	{
		ReactUtils.getDocument(this).addEventListener("keydown", this.onKeyDown);
	}

	onKeyDown(event:KeyboardEvent)
	{
		var code = event.keyCode;
		if (code == KEYCODES.ESC)
		{
			var activePopup = Array.from(Popup.popupSet.keys()).pop();
			if (this == activePopup)
				Popup.close(activePopup);
		}
	}

	static close(popup:Popup)
	{
		Popup.popupSet.delete(popup);
		ReactUtils.closePopup(popup);
	}

	static alignPopups()
	{
		var index = 0;
		for (var popup of Popup.popupSet)
		{
			popup.setState({
				style: {
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					zIndex: index
				}
			});
			index++;
		}
	}

	static bringToFront(popup:Popup)
	{
		Popup.popupSet.delete(popup);
		Popup.popupSet.add(popup);
		Popup.alignPopups();
	}

	onContextMenu=(event:React.MouseEvent)=>
	{
		// disable the context menu on all popups
		event.preventDefault();
		if(this.props.onContextMenu)
			this.props.onContextMenu(event);
	}

	render()
	{
		return (
			<div {...this.props as any} {...this.state} onContextMenu={this.onContextMenu}>
				<div style={{pointerEvents: "auto"}}>
					{this.props.children}
				</div>
			</div>
		);
	}
}
