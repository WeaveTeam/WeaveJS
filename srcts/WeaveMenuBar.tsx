import * as React from "react";
import MenuBar from "./react-ui/MenuBar";
import * as FileSaver from "filesaver.js";
import FileInput from "./react-ui/FileInput";
import PopupWindow from "./react-ui/PopupWindow";
import {HBox, VBox} from "./react-ui/FlexBox";
import FileMenu from "./menus/FileMenu";
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

function weaveMenu(weave:Weave)
{
    return {
		label: "Weave",
		bold: true,
		menu: [
			{
				label: "Preferences...",
				click: () => {}
			},
			{
				label: "Edit Session State",
				click: () => {},
				menu: [
					{
						label: "Nested",
						click: () => { console.log("I'm a child") }
					}
				]
			},
			{
			},
			{
				label: "Report a problem",
				click: () => {},
				enabled: false
			},
			{
				label: "Visit iWeave.com",
				click: () => {}
			},
			{
				label: "Visit Weave Wiki",
				click: () => {}
			},
			{
			},
			{
				label: "Version: 2.0",
				click: () => {}
			}, 
			{
			},
			{
				label: "Restart",
				click: () => {}
			}
		]
	};
}

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	fileMenu:FileMenu;
	dataMenu:DataMenu;
	toolsMenu:ToolsMenu;
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
		this.fileMenu = new FileMenu(props.weave);
		this.dataMenu = new DataMenu(props.weave, props.createObject);
		this.toolsMenu = new ToolsMenu(props.weave, props.createObject);
	}
	
	render():JSX.Element
	{
		return (
			<MenuBar
				style={this.props.style}
				config={[
					weaveMenu(this.props.weave),
					this.fileMenu,
					this.dataMenu,
					this.toolsMenu
				]}
				children={<SessionHistorySlider stateLog={this.props.weave.history}/>}
			/>
		);
	}
}
