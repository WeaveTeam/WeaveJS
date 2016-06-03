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
	systemMenu:SystemMenu;
	fileMenu:FileMenu;
	chartsMenu:ChartsMenu;
	dataMenu:DataMenu;
	controllersMenu:ControllersMenu;
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
		this.systemMenu = props.menus.systemMenu;
		this.fileMenu = props.menus.fileMenu;
		this.chartsMenu = props.menus.chartsMenu;
		this.dataMenu = props.menus.dataMenu;
		this.controllersMenu = props.menus.controllersMenu;
	}
	
	render():JSX.Element
	{
		return (
			<MenuBar
				style={this.props.style}
				config={[
					this.systemMenu,
					this.dataMenu,
					this.chartsMenu,
					this.controllersMenu
				]}
				children={
					[<SessionHistorySlider key="historySlider" stateLog={this.props.weave.history}/>,
					<FileDialog key="fileDialog" openUrlHandler={this.fileMenu.loadUrl} openFileHandler={this.fileMenu.handleOpenedFile}/>]
				}
			/>
		);
	}
}
