import * as _ from "lodash";
import * as React from "react";
import FileMenu from "./FileMenu";
import FileInput from "../react-ui/FileInput";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import FileDialog from "../ui/FileDialog";
import ServiceLogin from "../ui/admin/ServiceLogin";
import PopupWindow from "../react-ui/PopupWindow";
export default class SystemMenu implements MenuBarItemProps
{
	constructor(weave:Weave, fileMenu:FileMenu)
	{
		this.weave = weave;
		this.fileMenu = fileMenu;

		/* Forces the initialization of the service. */
		/* Hopefully the init flag gets set before our first 'get menu'. */
		weavejs.net.Admin.service.getAuthenticatedUser().then(_.noop, _.noop);
		this.login = new ServiceLogin(fileMenu.context, weavejs.net.Admin.service)
	}

	login: ServiceLogin;
	weave:Weave;
	fileMenu:FileMenu; // temp solution
	label = "Weave";
	bold = true;
	
	get menu():MenuItemProps[]
	{
		
		return [
			{
				/*label: <FileInput onChange={this.fileMenu.openFile} accept={this.fileMenu.getSupportedFileTypes().join(',')}><span className="weave-menuitem-padding">{Weave.lang("Open session...")}</span></FileInput>,*/
				label: "Open Session...",
				click: () => FileDialog.open(this.fileMenu.context, this.fileMenu.loadUrl, this.fileMenu.handleOpenedFile)
			},
			{
				label: Weave.lang("Save session as..."),
				click: this.fileMenu.saveFile
			},
			{
				label: Weave.lang("Save to server"),
				click: () => {
					this.login.conditionalOpen(this.fileMenu.saveToServer);
				},
				shown: weavejs.net.Admin.service.initialized
			},
			{},
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
				label: "Version: 2.0"
			},
			{},
			{
				label: weavejs.net.Admin.instance.userHasAuthenticated ? Weave.lang("Signed in as {0}", weavejs.net.Admin.instance.activeConnectionName) : Weave.lang("Not signed in"),
				click: () => {
					this.login.open();
				},
				shown: weavejs.net.Admin.service.initialized
			},
			{
				enabled: weavejs.net.Admin.instance.userHasAuthenticated,
				label: Weave.lang("Sign out"),
				shown: weavejs.net.Admin.service.initialized,
				click: () => {
					let signedOutPopup = () => PopupWindow.open(
						this.fileMenu.context,
						{
							title: "Confirmation",
							content: <div>{Weave.lang("Signed out successfully")}</div>
						}
					);
					/* Log in with invalid credentials to drop session */
					weavejs.net.Admin.service.authenticate("", "").then(signedOutPopup, signedOutPopup);
				}
			}
		];
	}
}
