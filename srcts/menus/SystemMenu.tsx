import * as _ from "lodash";
import * as React from "react";
import FileMenu from "./FileMenu";
import FileInput from "../react-ui/FileInput";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import ServiceLogin from "../ui/admin/ServiceLogin";
import PopupWindow from "../react-ui/PopupWindow";
import WeaveMenus from "./WeaveMenus";

export default class SystemMenu implements MenuBarItemProps
{
	constructor(owner:WeaveMenus)
	{
		this.owner = owner;
	}

	owner:WeaveMenus;
	label = "Weave";
	bold = true;
	
	get menu():MenuItemProps[]
	{
		var items:MenuItemProps[] = [];
		
		if (!this.owner.showFileMenu)
			items = items.concat(this.owner.fileMenu.getSessionItems(), {});
		
		items.push(
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
				label: Weave.beta ? "Disable beta features" : "Enable beta features",
				click: () => Weave.beta = !Weave.beta
			},
			{},
			{
				enabled: false,
				label: "Version: 2.1"
			},
			{},
			{
				label: weavejs.net.Admin.instance.userHasAuthenticated ? Weave.lang("Signed in as {0}", weavejs.net.Admin.instance.activeConnectionName) : Weave.lang("Sign in..."),
				click: this.owner.login.open,
				shown: weavejs.net.Admin.service.initialized
			},
			{
				enabled: weavejs.net.Admin.instance.userHasAuthenticated,
				label: Weave.lang("Sign out"),
				shown: weavejs.net.Admin.service.initialized,
				click: () => {
					let signedOutPopup = () => PopupWindow.open(
						{
							context: this.owner.context,
							title: "Confirmation",
							content: <div>{Weave.lang("Signed out successfully")}</div>
						}
					);
					/* Log in with invalid credentials to drop session */
					weavejs.net.Admin.service.authenticate("", "").then(signedOutPopup, signedOutPopup);
				}
			}
		);
		
		return items;
	}
}
