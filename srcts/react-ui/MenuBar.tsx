import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox} from "./FlexBox";
import InteractiveTour from "./InteractiveTour";
import {MenuItemProps} from "./Menu";
import Dropdown from "../semantic-ui/Dropdown";
import classNames from "../modules/classnames";
import ReactUtils from "../utils/ReactUtils";
import {DropdownProps} from "../semantic-ui/Dropdown";

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
	activeMenu?:number;
	showMenu?:boolean;
}

export default class MenuBar extends React.Component<MenuBarProps, MenuBarState>
{
	element:Element;
	constructor(props:MenuBarProps)
	{
		super(props);
		this.state = {
			activeMenu: -1,
			showMenu:false
		};
	}


	onMenubarItemClick(index:number, event:React.MouseEvent)
	{
		let activeMenuIndex:number = this.state.activeMenu == index ? -1 : index;
		this.setState({
			activeMenu:activeMenuIndex
		});

		// this happens when same menuBar item is clicked
		// so we need to get back to initial mode where no menu item is not showed on mouseEnter,
		// till click event happens on one of the menubar item
		// so deactivate show menu
		if(activeMenuIndex == -1)
		{
			this.setState({
				showMenu:false
			});
		}
		else
		{
			// this happens when one of the menubar item is clicked for the first time
			if(!this.state.showMenu)
			{
				this.setState({
					showMenu:true
				});
			}
		}
	}

	onMenubarItemMouseEnter(index:number, event:React.MouseEvent)
	{
		// this happens , when you mouseEnter happens before click event
		// we dont want to show menu if click event not happened on one of the menubar Item
		if(this.state.activeMenu == -1)
		{
			this.setState({ // Show menu is activated for mouseEnter,only  when its clicked first time on one of the menubar items
				showMenu:false
			});
		}

		// this scenario will happene, when we do mouseenter and leave the menubar
		// while coming back to same menubar item we dont want to close it
		if(this.state.activeMenu != index)
		{
			this.setState({
				activeMenu: index
			});
		}

	}

	// fired when document mousedown event happens in a area not belongs to menubar items
	menuBarItemCloseListener=()=>
	{
		// reset all
		this.setState({
			showMenu:false,
			activeMenu:-1
		});
	};
	
	renderMenuBarItem(index:number, props:MenuBarItemProps):JSX.Element
	{
		var menuBarClass = classNames({
			"ui dropdown": true,
			"weave-menubar-item": true,
			"weave-menubar-item-bold": !!props.bold
		});


		let dropdownProps:DropdownProps = {
			className:menuBarClass,
			menu:this.props.config[index].menu,
			key:index,
			id:InteractiveTour.prefix + props.label,
			openOnMouseEnter:this.state.showMenu,
			ref:InteractiveTour.getMountedTargetComponent ,
			onClick:(event:React.MouseEvent) => {
				this.onMenubarItemClick(index,event);
				InteractiveTour.isEnabled() ? InteractiveTour.targetComponentOnClick(props.label) :null
			},
			open:this.state.activeMenu == index,
			onMouseEnter:this.onMenubarItemMouseEnter.bind(this, index),
			onClose:this.menuBarItemCloseListener
		};
		return (
			<Dropdown {...dropdownProps}>
				{props.label}
			</Dropdown>
		)
	}

	render():JSX.Element
	{
		var style = _.merge({alignItems: 'center'}, this.props.style);
		let menuBarItemsUI:JSX.Element[] = this.props.config.map((menuBarItemProps, index) => {
												return this.renderMenuBarItem(index, menuBarItemProps)
											});
		return (
			<HBox className="weave-menubar" {...this.props as React.HTMLAttributes} style={style}>
				{menuBarItemsUI}
				{this.props.children}
			</HBox>
		)
	}
}
