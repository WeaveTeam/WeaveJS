import * as React from "react";
import * as _ from "lodash";
import {HBox} from "./FlexBox";
import InteractiveTour from "./InteractiveTour";
import {MenuItemProps} from "./Menu";
import Dropdown from "../semantic-ui/Dropdown";
import classNames from "../modules/classnames";
import SmartComponent from "../ui/SmartComponent";

export interface MenuBarItemProps
{
	label: string;
	menu: MenuItemProps[];
	bold?: boolean;
}

export interface MenuBarProps extends React.HTMLProps<MenuBar>
{
	config?:MenuBarItemProps[];
}

export interface MenuBarState
{
	activeIndex?:number;
	clickedIndex?:number;
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
		this.state = {
			activeIndex: -1,
			clickedIndex: -1
		}
	}

	onMouseEnter(index:number, event:React.MouseEvent)
	{
		// allow toggling between menus once the menubar has been clicked on
		this.openNextMenu(index);
	}

	openNextMenu(index:number)
	{
		var newMenu = this.menuItems[index];
		this.openMenu(newMenu);
		this.setState({activeIndex: index});
	}

	openMenu(newMenu:Dropdown)
	{
		if(this.activeMenu && this.activeMenu != newMenu)
		{
			this.activeMenu.closeMenu();
			this.activeMenu = newMenu;
			this.activeMenu.openMenu();
		}
	}

	onMouseLeave=(event:React.MouseEvent)=>
	{
		// clear the hover style if no menu is open
		if(!this.activeMenu)
			this.setState({activeIndex: -1});
	}

	onMouseUp=(index:number)=>
	{
		this.flickerItem(index);
	}

	flickerItem=(index:number)=>
	{
		this.setState({
			clickedIndex: index
		}, () => {
			// small delay and disable active style
			setTimeout(() => {
				this.setState({
					clickedIndex: -1
				})
			}, 100);
		})
	}

	onMenuOpen(index:number)
	{
		this.activeMenu = this.menuItems[index];
	}

	onMenuClose=()=>
	{
		this.setState({activeIndex: -1});
		this.activeMenu = null;
	}
	
	renderMenuBarItem(index:number, props:MenuBarItemProps):JSX.Element
	{
		var menuBarClass = classNames({
			"weave-menubar-item": true,
			"weave-menubar-item-hovered": this.state.activeIndex == index,
			"weave-menubar-item-clicked": this.state.clickedIndex == index,
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
				onMouseLeave={this.onMouseLeave}
				onMouseUp={() => this.onMouseUp(index)}
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
