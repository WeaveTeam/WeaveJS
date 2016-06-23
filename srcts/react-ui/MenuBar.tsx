import * as React from "react";
import * as _ from "lodash";
import {HBox} from "./FlexBox";
import InteractiveTour from "./InteractiveTour";
import {MenuItemProps} from "./Menu";
import Dropdown from "../semantic-ui/Dropdown";
import classNames from "../modules/classnames";

export interface MenuBarItemProps
{
	label: string;
	menu: MenuItemProps[];
	bold?: boolean;
}

export interface MenuBarProps extends React.HTMLProps<MenuBar>
{
	config?:MenuBarItemProps[]
}

export interface MenuBarState
{

}

export default class MenuBar extends React.Component<MenuBarProps, MenuBarState>
{
	element:Element;
	menuItems:Dropdown[];
	activeMenu:Dropdown;

	constructor(props:MenuBarProps)
	{
		super(props);
		this.menuItems = [];
	}

	onMouseEnter(index:number, event:React.MouseEvent)
	{
		// allow toggling between menus once the menubar has been clicked on
		var newMenu = this.menuItems[index];
		if(this.activeMenu && this.activeMenu != newMenu)
		{
			this.activeMenu.closeMenu();
			this.activeMenu = newMenu;
			this.activeMenu.openMenu();
		}
	}

	onMenuOpen(index:number)
	{
		this.activeMenu = this.menuItems[index];
	}

	onMenuClose=()=>
	{
		this.activeMenu = null;
	}
	
	renderMenuBarItem(index:number, props:MenuBarItemProps):JSX.Element
	{
		var menuBarClass = classNames({
			"ui dropdown": true,
			"weave-menubar-item": true,
			"weave-menubar-item-bold": !!props.bold
		});

		return (
			<Dropdown
				className={menuBarClass}
				menuGetter={() => this.props.config[index].menu}
				key={index}
				ref={(c:Dropdown) => {
					this.menuItems[index] = c;
					return InteractiveTour.getComponentRefCallback(props.label) as any;
				}}
				onClick={(event:React.MouseEvent) => {
					InteractiveTour.enable ? InteractiveTour.targetComponentOnClick(props.label) :null
				}}
				onMouseEnter={(event:React.MouseEvent) => this.onMouseEnter(index, event)}
				onOpen={() => this.onMenuOpen(index)}
				onClose={this.onMenuClose}
			>
				{props.label}
			</Dropdown>
		)
	}

	render():JSX.Element
	{
		var style = _.merge({alignItems: 'center'}, this.props.style);
		return (
			<HBox className="weave-menubar" {...this.props as React.HTMLAttributes} style={style}>
				{
					this.props.config.map((menuBarItemProps, index) => {
						return this.renderMenuBarItem(index, menuBarItemProps)
					})
				}
				{this.props.children}
			</HBox>
		)
	}
}
