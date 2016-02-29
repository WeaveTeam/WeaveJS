import * as React from "react";
import MenuBar from "./react-ui/MenuBar/MenuBar";
import MenuBarItem from "./react-ui/MenuBar/MenuBarItem";

export interface WeaveMenuBarProps extends React.Props<WeaveMenuBar> {
	
}

export interface WeaveMenuBarState {
	
}

const WeaveMenuBarConfig = [
	{
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
				click: () => {}
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
	},
	{
		label: "File",
		menu: [
			{
				label: "Open a file...",
				click: () => { console.log("clicked on open a file") }
			},
			{
				label: "Save as...",
				click: () => { console.log("clicked onSave as..") }
			},
			{
				label: "Export CSV",
				click: () => { console.log("clicked on Export CSV") }
			}
		]
	},
	{
		label: "Data",
		menu: [
			{
				label: "Manage or browse data",
				click: () => { console.log("Manage or browse data") }
			},
			{
			},
			{
				label: "Add CSV DataSource",
				click: () => { console.log("Add CSV DataSource") }
			}
		]
	},
]

export default class WeaveMenuBar extends React.Component<WeaveMenuBarProps, WeaveMenuBarState>
{
	constructor(props:WeaveMenuBarProps)
	{
		super(props);
	}
	
	render():JSX.Element
	{
		return (
			<MenuBar className="weave-menubar" style={{width: "100%"}} >
				{
					WeaveMenuBarConfig.map((menuBarItemConfig, index) => {
						return <MenuBarItem className="weave-menubar-item" key={index} {...menuBarItemConfig}/>
					})
				}
			</MenuBar>
		)
	}
	
}
