import * as React from "react";
import * as ReactDOM from "react-dom";
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

export interface MenuBarProps extends React.Props<MenuBar>
{
	config?:MenuBarItemProps[];
	style?:React.CSSProperties;
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

	onMouseEnter(index:number)
	{
		var menu = ReactDOM.findDOMNode(this.menuItems[index]) as HTMLElement;
		if(menu && menu.focus)
			menu.focus();
	}

	onMouseLeave=(index:number)=>
	{
		var menu = ReactDOM.findDOMNode(this.menuItems[index]) as HTMLElement;
		if(menu && menu.blur)
			menu.blur();
	}

	onFocus(index:number)
	{
		// allow toggling between menus once the menubar has been clicked on
		if(this.activeMenu)
			this.openNextMenu(index);
		else
			this.selectNextMenu(index);
	}

	onBlur=()=>
	{
		// clear the hover style if no menu is open
		if (!this.activeMenu)
			this.setState({activeIndex: -1});
	}

	selectNextMenu(index:number)
	{
		this.setState({activeIndex: index});
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

	onMouseUp=(index:number)=>
	{
		this.flickerItem(index);
	}

	onKeyUp=(index:number, event:React.KeyboardEvent)=>
	{
		if(event.keyCode == KEYCODES.SPACE)
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
		this.flickerItem(index);
		this.activeMenu = this.menuItems[index]
	}

	onMenuClose=()=>
	{
		this.activeMenu = null;
	}

	handleKeyPress=(event:KeyboardEvent)=>
	{
		var nextIndex:number = -1;

		if (event.keyCode == KEYCODES.LEFT_ARROW)
		{
			nextIndex = this.state.activeIndex - 1;
		}
		else if(event.keyCode == KEYCODES.RIGHT_ARROW)
		{
			nextIndex = this.state.activeIndex + 1;
		}

		var nextItem = this.menuItems[nextIndex];
		var nextElt:HTMLElement = null;
		if(nextItem)
			nextElt = ReactDOM.findDOMNode(nextItem) as HTMLElement;
		if(nextElt)
			nextElt.focus();
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
				key={index}
				ref={(c:Dropdown) => {
					this.menuItems[index] = c;
					if(InteractiveTour.enable)
					{
						let func:any = InteractiveTour.getComponentRefCallback(props.label);
						func && func(c);
					}
				}}
				onMouseEnter={() => this.onMouseEnter(index)}
				onFocus={() => this.onFocus(index)}
				onBlur={this.onBlur}
				onMouseLeave={() => this.onMouseLeave(index)}
				onOpen={() => {this.onMenuOpen(index);InteractiveTour.targetComponentOnClick(props.label)} }
				onClose={this.onMenuClose}
			    onMouseUp={() => this.onMouseUp(index)}
			    onKeyUp={(event:React.KeyboardEvent) => this.onKeyUp(index, event)}
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
