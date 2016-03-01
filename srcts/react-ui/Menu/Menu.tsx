import * as React from "react";
import * as _ from "lodash";
import VBox from "../VBox";
import MenuItem from "./MenuItem";
import {MenuItemProps} from "./MenuItem";
import Divider from "./Divider";

export interface MenuProps extends React.HTMLProps<Menu>
{
	xPos: number;
	yPos: number;
	menu:MenuItemProps[]
}

export interface MenuState
{
	
}

export const REACT_COMPONENT = "reactComponent";
export const GET_MENU_ITEMS = "getMenuItems";

export interface IGetMenuItems
{
	getMenuItems():MenuItemProps[];
}

export default class Menu extends React.Component<MenuProps, MenuState>
{
	constructor(props:MenuProps)
	{
		super(props);
	}	
	
	static getMenuItems(element:HTMLElement):MenuItemProps[]
	{
		//var elt = element as any;
		while(element != null)
		{
			let elt = element as any;
			if(elt[REACT_COMPONENT] && elt[REACT_COMPONENT][GET_MENU_ITEMS])
			{
				return elt[REACT_COMPONENT][GET_MENU_ITEMS]() as MenuItemProps[];
			}
			else
			{
				element = element.parentElement;
			}
		}
		return [];
	}

	render():JSX.Element 
	{
		
		var menuStyle:React.CSSProperties = {
			top: this.props.yPos,
			left: this.props.xPos,
		};
	
		return (
			<VBox className="weave-menu" style={menuStyle}>
				{
					this.props.menu ? this.props.menu.map((menuItem, index) => {
							if(_.isEqual(menuItem, {}))
								return <Divider key={index}/>
							else
							{
								return <MenuItem key={index} {...menuItem}/>
							}
					})
					:
					this.props.children
				}
			</VBox>
		)
	}
}
