import * as React from "react";
import {MenuItemProps} from "../Menu/MenuItem";
import classNames from "../../modules/classnames";

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
		var menuBarClass = classNames({
			"weave-menubar-item": true,
			"weave-menubar-item-bold": !!this.props.bold
		});

		return (
			<div className={menuBarClass} onClick={this.props.onClick.bind(this)} {...this.props as any}>
				{
					this.props.label
				}
			</div>
		)
	}
}
