import * as React from "react";
import {MenuItemProps} from "../Menu/MenuItem";

export interface MenuBarItemProps extends React.Props<MenuBarItem>
{
	label: string|JSX.Element;
	menuItems: MenuItemProps[];
	key?:any;
	ref?:any;
	onClick?:(event:MouseEvent)=>void;
}


export interface MenuBarItemState
{
	
}

export default class MenuBarItem extends React.Component<MenuBarItemProps, MenuBarItemState>
{
	constructor(props:MenuBarItemProps)
	{
		super(props);
	}

	render():JSX.Element
	{
		return (
			<div onClick={this.props.onClick.bind(this)} {...this.props as any}>
				{
					this.props.label
				}
			</div>
		)
	}
}
