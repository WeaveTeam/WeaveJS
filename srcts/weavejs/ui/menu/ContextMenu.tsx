import * as React from "react";
import Menu from "./Menu";
import ReactUtils from "../../util/ReactUtils";
import Popup from "../Popup";

export default class ContextMenu extends Menu
{
	static open(event:React.MouseEvent)
	{
		event.preventDefault();
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		if (!contextMenuItems.length)
			return;
		var contextMenu:ContextMenu = null;
		var popup = Popup.open(
			event.target as Element,
			<ContextMenu
				menu={contextMenuItems}
				ref={(c:ContextMenu) => contextMenu = c}
				style={{
					top: event.clientY,
					left: event.clientX
				}}
			/>,
			true
		);
		contextMenu.popup = popup;
	}

	popup:Popup;
	handleClick=()=>
	{
		Popup.close(this.popup);
	}

	render()
	{
		return <Menu ref={ReactUtils.registerComponentRef} {...this.props} onClick={this.handleClick} />
	}
}
