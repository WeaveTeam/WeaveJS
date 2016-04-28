import * as React from "react";
import FileMenu from "./FileMenu";
import FileInput from "../react-ui/FileInput";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";

export default class SystemMenu implements MenuBarItemProps
{
	constructor(weave:Weave)
	{
		this.weave = weave;
		this.fileMenu = new FileMenu(weave);
	}

	weave:Weave;
	fileMenu:FileMenu; // temp solution
	label = "Weave";
	bold = true;
	
	get menu():MenuItemProps[]
	{
		return [
			{
				label: <FileInput onChange={this.fileMenu.openFile} accept={this.fileMenu.getSupportedFileTypes().join(',')}><span className="weave-menuitem-padding">{Weave.lang("Open session...")}</span></FileInput>,
				itemStyleOverride: {padding: "0!important"}
			},
			{
				label: Weave.lang("Save session as..."),
				click: this.fileMenu.saveFile
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
		];
	}
}
