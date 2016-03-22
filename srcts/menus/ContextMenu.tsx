import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import Menu from "../react-ui/Menu";
import {MenuProps} from "../react-ui/Menu";

export default class ContextMenu extends Menu
{
	contextMenuContainer:HTMLElement;

	static open(event:React.MouseEvent)
	{
		event.preventDefault();
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		return ReactUtils.openPopup(<ContextMenu xPos={event.clientX} yPos={event.clientY} menu={contextMenuItems}/>, true) as Menu;
	}
	
	render():JSX.Element
	{
		return <Menu {...this.props} onClick={() => ReactUtils.closePopup(this)}/>;
	}
}
	
