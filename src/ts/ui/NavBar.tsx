import * as React from "react";
import * as weavejs from "weavejs";

import VBox = weavejs.ui.flexbox.VBox;
import HBox = weavejs.ui.flexbox.HBox;
import MenuBar = weavejs.ui.menu.MenuBar;
import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
import CenteredIcon = weavejs.ui.CenteredIcon;

const DOCS = "Docs";
const CORE = "Core";
const DATA = "Data";
const UI = "UI";
const RESOURCES = "Resources";
const TUTORIAL = "Tutorial";

export interface NavBarProps
{
	onMenuItemClick:(route:string)=>void;
}

export interface NavBarState
{
}

function MenuLabel(props:{label:string})
{
	return (
		<HBox padded style={{alignItems: "center"}}>
			{props.label}
			<i className="fa fa-caret-down"/>
		</HBox>
	);
}

function MenuItem(props:{children?:React.ReactNode})
{
	return (
		<button style={{justifyContent: "center", alignItems: "center"}} className="weave-transparent-button weave-menubar-item">{props.children}</button>
	);
}

export default class NavBar extends React.Component<NavBarProps, NavBarState>
{
	menus:MenuBarItemProps[] = [
		{
			label: <MenuLabel label={DOCS}/> as any,
			menu: [
				{
					label: CORE,
					click: () => this.props.onMenuItemClick(CORE)
				},
				{
					label: DATA,
					click: () => this.props.onMenuItemClick(DATA)
				},
				{
					label: UI,
					click: () => this.setState({route: UI}),
				}
			]
		},
		{
			label:  <MenuLabel label={RESOURCES}/> as any,
			menu: [
				{
					label: TUTORIAL,
					click: () => this.props.onMenuItemClick(TUTORIAL),
				}
			]
		}
	];

	render()
	{
		return (
			<HBox className="weave-menubar" style={{flex: 1, overflow: "visible"}}>
				<MenuItem>
					<span className="nav-logo">WeaveJS</span>
				</MenuItem>
				<MenuItem>
					Introduction
				</MenuItem>
				<MenuBar config={this.menus}/>
				<HBox style={{flex: 1, justifyContent: "flex-end", marginRight: 100}}>
					<MenuItem>
						GitHub
					</MenuItem>
				</HBox>
			</HBox>
		);
	}
}
