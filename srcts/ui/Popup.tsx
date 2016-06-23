import * as React from "react";
import ReactUtils from "../utils/ReactUtils";
import Div from "../react-ui/Div";
const ESC_KEYCODE = 27;

export default class Popup extends Div
{
	static popupSet = new Set<Popup>();

	static open(context:React.ReactInstance, jsx:JSX.Element, closeOnMouseDown:boolean = false, onClose?:(event:MouseEvent)=>void):Popup
	{
		var popup = ReactUtils.openPopup(context, <Popup style={{zIndex: 0}}>{jsx}</Popup>, closeOnMouseDown, onClose) as Popup;
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
		if (code == ESC_KEYCODE)
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
			popup.setState({ style: { zIndex: index } });
			index++;
		}
	}

	static bringToFront(popup:Popup)
	{
		Popup.popupSet.delete(popup);
		Popup.popupSet.add(popup);
		Popup.alignPopups();
	}
}
