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
				label: <FileInput onChange={this.fileMenu.openFile} accept={this.fileMenu.getSupportedFileTypes().join(',')}>{Weave.lang("Open...")}</FileInput>
			},
			{
				label: Weave.lang("Save as..."),
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
				enabled: !Weave.experimental,
				label: Weave.experimental ? "Experimental features enabled" : "Enable experimental features",
				click: () => Weave.experimental = true
			},
			{},
			{
				enabled: false,
				label: "Version: 2.0"
			}, 
		];
	}
}
