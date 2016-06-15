import * as React from "react";
import MenuBar from "./react-ui/MenuBar";
import * as FileSaver from "filesaver.js";
import FileInput from "./react-ui/FileInput";
import PopupWindow from "./react-ui/PopupWindow";
import {HBox, VBox} from "./react-ui/FlexBox";
import SystemMenu from "./menus/SystemMenu";
import DataMenu from './menus/DataMenu';
import ChartsMenu from './menus/ChartsMenu';
import ControllersMenu from './menus/ControllersMenu';
import SessionHistorySlider from "./editors/SessionHistorySlider";
import FileDialog from "./ui/FileDialog";
import FileMenu from "./menus/FileMenu";
import WeaveMenus from "./menus/WeaveMenus";

export interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar>
{
	style:React.CSSProperties,
	weave:Weave,
	menus:WeaveMenus;
}

export interface WeaveMenuBarState
{
	
}

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
	}
	
	render():JSX.Element
	{
		return (
			<MenuBar
				style={this.props.style}
				config={this.props.menus.getMenuList()}
				children={
					[<SessionHistorySlider key="historySlider" stateLog={this.props.weave.history}/>]
				}
			/>
		);
	}
}
