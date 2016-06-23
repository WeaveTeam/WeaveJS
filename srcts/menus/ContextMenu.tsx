import * as React from "react";
import Menu from "../react-ui/Menu";
import Popup from "../ui/Popup";

export default class ContextMenu extends Menu
{
	static open(event:React.MouseEvent)
	{
		event.preventDefault();
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		if(!contextMenuItems.length)
			return;
		return Popup.open(
			event.target as Element,
			<Menu
				menu={contextMenuItems}
				style={{
					top: event.clientY,
					left: event.clientX
				}}
			/>,
			true
		);
	}
}
