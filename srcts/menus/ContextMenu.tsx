import * as React from "react";
import * as ReactDOM from "react-dom";
import ReactUtils from "../utils/ReactUtils";
import Menu from "../react-ui/Menu";
import {MenuProps} from "../react-ui/Menu";
import Dropdown from "../semantic-ui/Dropdown";
import Popup from "../ui/Popup";

export default class ContextMenu extends Menu
{
	contextMenuContainer:HTMLElement;

	static open(event:React.MouseEvent)
	{
		event.preventDefault();
		var contextMenuItems = Menu.getMenuItems(event.target as HTMLElement);
		return Popup.open(
			event.target as Element,
			<div style={{top:event.clientY, left: event.clientX, position: 'absolute'}}>
				<Dropdown menu={contextMenuItems} open={true}/>
			</div>,
			true
		);
	}
	
	render():JSX.Element
	{
		return <Menu {...this.props} onClick={() => ReactUtils.closePopup(this)}/>;
	}
}
