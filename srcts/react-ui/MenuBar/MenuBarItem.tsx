import * as React from "react";
import {MenuItemProps} from "../Menu/MenuItem";

export interface MenuBarItemProps extends React.HTMLProps<MenuBarItem>
{
	label: string;
	menu: MenuItemProps[];
	onClick?:React.EventHandler<React.MouseEvent>;
	bold?: boolean;
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
			<div style={{fontWeight: this.props.bold ? "bold" : "normal"}} onClick={this.props.onClick.bind(this)} {...this.props as any}>
				{
					this.props.label
				}
			</div>
		)
	}
}
