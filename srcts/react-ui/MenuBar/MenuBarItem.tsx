import * as React from "react";
import {MenuItemProps} from "../Menu/MenuItem";

export interface MenuBarItemProps extends React.HTMLProps<MenuBarItem>
{
	label: string;
	menu: MenuItemProps[];
	onClick?:React.EventHandler<React.MouseEvent>;
	bold?: boolean;
}


export default class MenuBarItem extends React.Component<MenuBarItemProps, any>
{
	constructor(props:MenuBarItemProps)
	{
		super(props);
	}
	
	render():JSX.Element
	{
		return (
			<div className="weave-menubar-item" style={{fontWeight: this.props.bold ? "bold" : "normal"}} onClick={this.props.onClick.bind(this)} {...this.props as any}>
				{
					this.props.label
				}
			</div>
		)
	}
}
