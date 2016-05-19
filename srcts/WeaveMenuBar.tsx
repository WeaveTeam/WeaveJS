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
import DataSourceManager from "./ui/DataSourceManager";
import LayoutsMenu from "./menus/LayoutsMenu";

export interface WeaveMenuBarProps extends React.HTMLProps<WeaveMenuBar>
{
	style:React.CSSProperties,
	weave:Weave,
	createObject:(type:new(..._:any[])=>any)=>void
	dataMenu:DataMenu;
	layoutsMenu:LayoutsMenu;
}

export interface WeaveMenuBarState
{
	
}

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	systemMenu:SystemMenu;
	chartsMenu:ChartsMenu;
	controllersMenu:ControllersMenu;
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
		this.systemMenu = new SystemMenu(props.weave);
		this.chartsMenu = new ChartsMenu(props.weave, props.createObject);
		this.controllersMenu = new ControllersMenu(props.weave, props.createObject);
	}
	
	render():JSX.Element
	{
		return (
			<MenuBar
				style={this.props.style}
				config={[
					this.systemMenu,
					this.props.dataMenu,
					this.chartsMenu,
					this.controllersMenu,
					this.props.layoutsMenu
				]}
				children={<SessionHistorySlider stateLog={this.props.weave.history}/>}
			/>
		);
	}
}
