import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
import {MenuItemProps} from "./Menu";
import Menu from "./Menu";
import classNames from "../modules/classnames";
import ReactUtils from "../utils/ReactUtils";

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
	menu:Menu;
	
	constructor(props:MenuBarProps)
	{
		super(props);
	}
	
	componentDidMount()
	{
		// TODO Add touch events for mobile
		this.element = ReactDOM.findDOMNode(this);
	}
	
	showMenu(index:number)
	{
		var parent = this.refs[index] as HTMLElement;
		var menuConfig = this.props.config[index].menu;
		this.menu = Menu.open(parent.offsetLeft, parent.offsetTop + parent.clientHeight, menuConfig);
	}

	onClick(index:number, event:React.MouseEvent)
	{
		this.showMenu(index);
	}
	
	onMouseEnter(index:number, event:React.MouseEvent)
	{
		// allow toggling between menus once the menubar has been clicked on
		if(this.menu)
		{
			ReactUtils.closePopup(this.menu);
			this.showMenu(index);
		}
	}
	
	renderMenuBarItem(index:number, props:MenuBarItemProps):JSX.Element
	{
		var menuBarClass = classNames({
			"weave-menubar-item": true,
			"weave-menubar-item-bold": !!props.bold
		});

		return (
			<div ref={index as any} key={index} className={menuBarClass} {...props as any} onMouseDown={this.onClick.bind(this, index)} onMouseEnter={this.onMouseEnter.bind(this, index)}>
				{
					props.label
				}
			</div>
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
