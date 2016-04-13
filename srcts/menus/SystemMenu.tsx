import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";

export interface SystemMenuProps extends React.HTMLProps<SystemMenu>
{
	weave:Weave
}

export interface SystemMenuState
{

}

export default class SystemMenu extends React.Component<SystemMenuProps, SystemMenuState>
{
	private weave:Weave;

	constructor(props:SystemMenuProps)
	{
		super();
		this.weave = props.weave;
	}

	render():JSX.Element {
		return (<div className="menu">
			<a className="item" onClick={() => window.open("http://www.iweave.com/")}>Visit iweave.com</a>
			<a className="item" onClick={() => window.open("http://github.com/WeaveTeam/WeaveJS/issues/new")}>Report a problem</a>
			<div className="ui divider"></div>
			<a className="disabled item">Version: 2.0</a>
		</div>)
	}
}