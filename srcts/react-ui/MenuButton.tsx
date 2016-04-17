import * as React from "react";
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import Menu from "./Menu";
import {MenuItemProps} from "./Menu";
import ReactUtils from "../utils/ReactUtils";
import Button from "../semantic-ui/Button";

export interface MenuButtonProps extends React.HTMLProps<MenuButton>
{
	menu:MenuItemProps[];
	showIcon?:boolean;
}

export interface MenuButtonState
{
	
}

export default class MenuButton extends React.Component<MenuButtonProps, MenuButtonState>
{
	element:HTMLElement;
	menu:Menu;
	constructor(props:MenuButtonProps)
	{
		super(props)
	}

	static defaultProps:MenuButtonProps = {
		showIcon: true,
		menu: []
	};

	componentDidMount()
	{
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
	}

	closeMenu=()=>
	{
		if (this.menu)
		{
			ReactUtils.closePopup(this.menu);
			this.menu = null;
		}
	}

	openMenu=()=>
	{
		var clientRect = this.element.getBoundingClientRect();
		// close the popup if it is already open
		if (this.menu && this.menu.element && this.menu.element.parentNode)
		{
			this.closeMenu();
		}
		else
		{
			this.menu = ReactUtils.openPopup(
				<Menu menu={this.props.menu}
					xPos={clientRect.left} 
					yPos={clientRect.top + this.element.clientHeight}
					onClick={this.closeMenu}
				/>,
				true
			) as Menu;
		}
	}
	
	render():JSX.Element
	{
		var props = _.clone(this.props);
		delete props.menu;
		delete props.showIcon;
		return (
			<Button {...props as any} onMouseDown={this.openMenu}>
				{ this.props.showIcon ? <i className="fa fa-bars"/> : '' }
				{ ' ' }
				{ this.props.children }
			</Button>
		);
	}
}
