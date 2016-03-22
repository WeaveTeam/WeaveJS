import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";

export default class SystemMenu implements MenuBarItemProps
{
	constructor(weave:Weave)
	{
		this.weave = weave;
	}

	weave:Weave;
	label = "Weave";
	bold = true;
	menu:MenuItemProps[] = [
		{
			label: "Visit iweave.com",
			click: () => window.open("http://www.iweave.com/")
		},
		{
			label: "Report a problem",
			click: () => window.open("http://github.com/WeaveTeam/WeaveJS/issues/new")
		},
		{},
		{
			enabled: false,
			label: "Version: 2.0"
		}, 
	];
}
