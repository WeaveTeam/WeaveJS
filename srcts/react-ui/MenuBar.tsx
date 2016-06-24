import * as React from "react";
import * as _ from "lodash";
import {HBox} from "./FlexBox";
import InteractiveTour from "./InteractiveTour";
import {MenuItemProps} from "./Menu";
import Dropdown from "../semantic-ui/Dropdown";
import classNames from "../modules/classnames";
import ReactUtils from "../utils/ReactUtils";
import {KEYCODES} from "../utils/KeyboardUtils";

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
		if (this.activeMenu)
			this.activeMenu.closeMenu();
		if (this.activeMenu != newMenu)
		{
			this.activeMenu = newMenu;
			this.activeMenu.openMenu();
		}
	}

	closeMenu()
	{
		if (this.activeMenu)
			this.activeMenu.closeMenu();
	}

	onMouseLeave=(event:React.MouseEvent)=>
	{
		// clear the hover style if no menu is open
		if (!this.activeMenu)
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
		this.activeMenu = this.menuItems[index]
	}

	onMenuClose=()=>
	{
		this.activeMenu = null;
	}

	handleKeyPress=(event:KeyboardEvent)=>
	{
		if (event.keyCode == KEYCODES.LEFT_ARROW)
		{
			if (this.activeMenu && this.state.activeIndex > 0)
				this.openNextMenu(this.state.activeIndex - 1);
			else if (this.state.activeIndex > 0 && this.state.activeIndex < this.menuItems.length)
			{
				this.setState({
					activeIndex: this.state.activeIndex - 1
				})
			}
		}
		else if(event.keyCode == KEYCODES.RIGHT_ARROW)
		{
			if (this.activeMenu && this.state.activeIndex < this.menuItems.length - 1)
				this.openNextMenu(this.state.activeIndex + 1);
			else if (this.state.activeIndex > -1 && this.state.activeIndex < this.menuItems.length - 1)
			{
				this.setState({
					activeIndex: this.state.activeIndex + 1
				})
			}
		}
		else if(event.keyCode == KEYCODES.ESC)
		{
			if(this.activeMenu)
				this.closeMenu();
		}
		else if(event.keyCode == KEYCODES.SPACE)
		{
			if(!this.activeMenu && this.state.activeIndex > -1)
				this.openNextMenu(this.state.activeIndex);
			else
				this.closeMenu();
		}
	}

	componentDidMount()
	{
		ReactUtils.getDocument(this).addEventListener("keydown", this.handleKeyPress);
	}

	componentWillUnmount()
	{
		ReactUtils.getDocument(this).removeEventListener("keydown", this.handleKeyPress);
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
				tabIndex={1}
				key={index}
				ref={(c:Dropdown) => {
					this.menuItems[index] = c;
					if(InteractiveTour.enable)
					{
						let func:any = InteractiveTour.getComponentRefCallback(props.label);
						func && func(c);
					}
				}}
				onMouseEnter={(event:React.MouseEvent) => this.onMouseEnter(index, event)}
				onMouseLeave={this.onMouseLeave}
				onMouseUp={() => this.onMouseUp(index)}
				onOpen={() => {this.onMenuOpen(index);InteractiveTour.targetComponentOnClick(props.label)} }
				onClose={this.onMenuClose}
			>
				{props.label}
			</Dropdown>
		);
	}

	render():JSX.Element
	{
		var style = _.merge({alignItems: 'center'}, this.props.style);
		return (
			<HBox overflow className="weave-menubar" {...this.props as React.HTMLAttributes} style={style}>
				{
					this.props.config.map((menuBarItemProps, index) => {
						return this.renderMenuBarItem(index, menuBarItemProps)
					})
				}
				{this.props.children}
			</HBox>
		);
	}
}
