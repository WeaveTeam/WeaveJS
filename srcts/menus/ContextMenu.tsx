import * as React from "react";
import * as ReactDOM from "react-dom";
import Menu from "../react-ui/Menu";
import ReactUtils from "../utils/ReactUtils";
import Popup from "../ui/Popup";

export default class ContextMenu extends Menu
{
	static open(event:React.MouseEvent)
	{
		event.preventDefault();
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		if(!contextMenuItems.length)
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
