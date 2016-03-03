import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {HBox, VBox} from "./FlexBox";
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
		this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
	}
	
	componentDidMount()
	{
		document.addEventListener("mousedown", this.onDocumentMouseDown);
		// TODO Add touch events for mobile
		this.element = ReactDOM.findDOMNode(this);
	}
	
	componentWillUnmount()
	{
		document.removeEventListener("mousedown", this.onDocumentMouseDown);
	}
	
	onDocumentMouseDown(event:MouseEvent)
	{
		var elt = event.target;
		
		while( elt != null)
		{
			if(elt == this.element) {
				return;
			}
			elt = (elt as HTMLElement).parentNode;
		}
		this.hideMenu();
	}
	
	hideMenu()
	{
		this.setState({
			showMenu: false
		})
	}
	
	showMenu(index:number)
	{
		var parent = this.refs[index] as HTMLElement;
		var menuConfig = this.props.config[index].menu;
		this.setState({
			showMenu: true,
			xPos: parent.offsetLeft,
			yPos: parent.offsetTop + parent.clientHeight,
			menu: menuConfig
		});
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
			this.showMenu(index);
		}
	}
	
	onMouseEnter(index:number, event:React.MouseEvent)
	{
		if(this.state.showMenu)
		{
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
		return (
			<HBox className="weave-menubar" {...this.props as React.HTMLAttributes}>
				{
					this.props.config.map((menuBarItemProps, index) => {
						return this.renderMenuBarItem(index, menuBarItemProps)
					})
				}
				{
					this.state.showMenu ?
					<Menu menu={this.state.menu} xPos={this.state.xPos} yPos={this.state.yPos} onClick={this.hideMenu.bind(this)}/>
					:
					null
				}
			</HBox>
		)
	}
}
