import * as React from "react";
import * as _ from "lodash";
import Menu from "./react-ui/Menu/Menu";
import MenuItem from "./react-ui/Menu/MenuItem";
import {MenuItemProps} from "./react-ui/Menu/MenuItem";
import Divider from "./react-ui/Menu/Divider";

export interface ContextMenuProps extends React.Props<ContextMenu>
{
	config:MenuItemProps[]
	xPos: number;
	yPos: number;
}

export interface ContextMenuState
{
	
}

export const REACT_COMPONENT = "reactComponent";
export const GET_CONTEXT_MENU_ITEMS = "getContextMenuItems";

export interface IGetContextMenuItems
{
	getContextMenuItems():MenuItemProps[];
}

export default class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState>
{
	constructor(props:ContextMenuProps)
	{
		super(props);
	}	
	
	static getMenuItems(element:HTMLElement):MenuItemProps[]
	{
		//var elt = element as any;
		while(element != null)
		{
			let elt = element as any;
			if(elt[REACT_COMPONENT] && elt[REACT_COMPONENT][GET_CONTEXT_MENU_ITEMS])
			{
				return elt[REACT_COMPONENT][GET_CONTEXT_MENU_ITEMS]() as MenuItemProps[];
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
		return (
			<Menu xPos={this.props.xPos} yPos={this.props.yPos}>
				{
					this.props.config.map((menuItem, index) => {
							if(_.isEqual(menuItem, {}))
								return <Divider/>
							else
							{
								return <MenuItem key={index} {...menuItem}/>
							}
					})
				}
			</Menu>
		)
	}
}
