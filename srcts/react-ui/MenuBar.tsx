import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import HBox from "./HBox";
import {MenuItemProps} from "./Menu";
import Menu from "./Menu";
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
	xPos?:number;
	yPos?:number;
	showMenu?:boolean;
	menu?:MenuItemProps[]
}

export default class MenuBar extends React.Component<MenuBarProps, MenuBarState>
{
	element:Element;
	constructor(props:any)
	{
		super(props);
		this.state = {
			xPos: 0,
			yPos: 0,
			showMenu: false,
			menu: []
		};
		this.hideMenu = this.hideMenu.bind(this);
	}
	
	componentDidMount()
	{
		document.addEventListener("mousedown", this.hideMenu);
		// TODO Add touch events for mobile
		this.element = ReactDOM.findDOMNode(this);
	}
	
	componentWillUnmount()
	{
		document.removeEventListener("mousedown", this.hideMenu);
	}
	
	hideMenu(event:MouseEvent)
	{
		var elt = event.target;
		
		while( elt != null)
		{
			if(elt == this.element) {
				return;
			}
			elt = (elt as HTMLElement).parentNode;
		}
		
		this.setState({
			showMenu: false
		})
	}
	
	onMenuClick()
	{
		this.setState({
			showMenu: false
		})
	}
	
	onClick(index:number, event:React.MouseEvent)
	{
		if(this.state.showMenu) 
		{
			// hide menu if click on menubaritem and the menu was already visible
			this.setState({
				showMenu: false
			});
		}
		else
		{
			var menuBarItemElt = this.refs[index] as HTMLElement;
			this.setState({
				showMenu: true,
				xPos: menuBarItemElt.offsetLeft,
				yPos: menuBarItemElt.offsetTop + menuBarItemElt.clientHeight,
				menu: this.props.config[index].menu
			});
		}
	}
	
	onMouseEnter(index:number, event:React.MouseEvent)
	{
		if(this.state.showMenu)
		{
			var menuBarItemElt = this.refs[index] as HTMLElement;
			this.setState({
				showMenu: true,
				xPos: menuBarItemElt.offsetLeft,
				yPos: menuBarItemElt.offsetTop + menuBarItemElt.clientHeight,
				menu: this.props.config[index].menu
			});
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
		return (
			<HBox className="weave-menubar" {...this.props}>
				{
					this.props.config.map((menuBarItemProps, index) => {
						return this.renderMenuBarItem(index, menuBarItemProps)
					})
				}
				{
					this.state.showMenu ?
					<Menu menu={this.state.menu} xPos={this.state.xPos} yPos={this.state.yPos} onClick={this.onMenuClick.bind(this)}/>
					:
					null
				}
			</HBox>
		)
	}
}
