import * as React from "react";
import * as ReactDOM from 'react-dom';
import Menu from "./Menu";
import {MenuItemProps} from "./Menu";
import ReactUtils from "../utils/ReactUtils";
import Button from "../semantic-ui/Button";

export interface MenuButtonProps extends React.Props<MenuButton>
{
	menu:MenuItemProps[];
	showHamburgerIcon?:boolean;
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

	static defaultProps:MenuButtonProps = { showHamburgerIcon : true, menu:[] };

	componentDidMount (){
		this.element = ReactDOM.findDOMNode(this) as HTMLElement;
	}

	closeMenu=()=>
	{
		if(this.menu)
		{
			ReactUtils.closePopup(this.menu);
			this.menu = null;
		}
	}

	openMenu=()=>
	{
		var clientRect = this.element.getBoundingClientRect();
		// close the popup if it was already open
		if(this.menu)
		{
			this.closeMenu();
		}
		else
		{
			this.menu = ReactUtils.openPopup(
				<Menu menu={this.props.menu} 
					xPos={clientRect.left} 
					yPos={clientRect.top+this.element.clientHeight}
					onClick={this.closeMenu}
				/>,
				true
			) as Menu;
		}
	}
	
	render():JSX.Element
	{
		return (
			<Button onMouseDown={this.openMenu}>
				{ this.props.showHamburgerIcon ? <i className="fa fa-bars"/> : '' }
				{ this.props.children }
			</Button>
		);
	}
}
