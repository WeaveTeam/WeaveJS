import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";
import FileInput = weavejs.ui.FileInput;
import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
import MenuItemProps = weavejs.ui.menu.MenuItemProps;
import PopupWindow = weavejs.ui.PopupWindow;
import Admin = weavejs.net.Admin;
import IWeaveMenus from "./IWeaveMenus";

export default class SystemMenu implements MenuBarItemProps
{
	constructor(owner:IWeaveMenus)
	{
		this.owner = owner;
	}

	owner:IWeaveMenus;
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
				label: Admin.instance.userHasAuthenticated ? Weave.lang("Signed in as {0}", Admin.instance.activeConnectionName) : Weave.lang("Sign in..."),
				click: this.owner.login.open,
				shown: Admin.service.initialized
			},
			{
				enabled: Admin.instance.userHasAuthenticated,
				label: Weave.lang("Sign out"),
				shown: Admin.service.initialized,
				click: () => {
					let signedOutPopup = () => PopupWindow.open(
						{
							context: this.owner.context,
							title: "Confirmation",
							content: <div>{Weave.lang("Signed out successfully")}</div>
						}
					);
					/* Log in with invalid credentials to drop session */
					Admin.service.authenticate("", "").then(signedOutPopup, signedOutPopup);
				}
			}
		);

		return items;
	}
}
