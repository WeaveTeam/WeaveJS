import * as React from "react";
import MenuBar from "./react-ui/MenuBar/MenuBar";
import MenuBarItem from "./react-ui/MenuBar/MenuBarItem";

export interface WeaveMenuBarProps extends React.Props<WeaveMenuBar> {
	
}

export interface WeaveMenuBarState {
	
}

const WeaveMenuBarConfig = [
	{
		label: "File",
		menuItems: [
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
		menuItems: [
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
	}
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
			<MenuBar style={{height: 50, width: "100%"}} >
				{
					WeaveMenuBarConfig.map((menuBarItemConfig, index) => {
						return <MenuBarItem key={index} {...menuBarItemConfig}/>
					})
				}
			</MenuBar>
		)
	}
	
}
