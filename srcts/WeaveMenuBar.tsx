import * as React from "react";
import MenuBar from "./react-ui/MenuBar";
import * as FileSaver from "filesaver.js";
import FileInput from "./react-ui/FileInput";
import PopupWindow from "./react-ui/PopupWindow";
import {HBox, VBox} from "./react-ui/FlexBox";
import SystemMenu from "./menus/SystemMenu";
import DataMenu from './menus/DataMenu';
import ToolsMenu from './menus/ToolsMenu';
import SessionHistorySlider from "./editors/SessionHistorySlider";

export interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar>
{
	style:React.CSSProperties,
	weave:Weave,
	createObject:(type:new(..._:any[])=>any)=>void
}

export interface WeaveMenuBarState
{
	
}

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	systemMenu:SystemMenu;
	dataMenu:DataMenu;
	toolsMenu:ToolsMenu;
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
		this.systemMenu = new SystemMenu(props.weave);
		this.dataMenu = new DataMenu(props.weave, props.createObject);
		this.toolsMenu = new ToolsMenu(props.weave, props.createObject);
	}
	
	render():JSX.Element
	{
		return (
			<MenuBar
				style={this.props.style}
				config={[
					this.systemMenu,
					this.dataMenu,
					this.toolsMenu
				]}
				children={<SessionHistorySlider stateLog={this.props.weave.history}/>}
			/>
		);
	}
}
