import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import Menu from "../react-ui/Menu";
import {MenuProps} from "../react-ui/Menu";

export default class ContextMenu
{
	contextMenuContainer:HTMLElement;

	static open(event:React.MouseEvent)
	{
		event.preventDefault();
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		return Menu.open(event.clientX, event.clientY, contextMenuItems) as Menu;
	}
}
