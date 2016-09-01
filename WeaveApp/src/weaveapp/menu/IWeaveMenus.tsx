import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import MenuItemProps = weavejs.ui.menu.MenuItemProps;
import {CreateObjectFunction} from "weaveapp/menu/WeaveMenus";
import ServiceLogin from "weaveapp/admin/ServiceLogin";

export interface IWeaveMenus
{
	context:React.ReactInstance;
	weave:Weave;
	createObject:CreateObjectFunction;
	onFileLoaded:()=>void;
	openDataManager:()=>void;
	enableDataManagerItem:()=>boolean;
	showFileMenu:boolean;
	login:ServiceLogin;
	fileMenu:{getSessionItems:()=>MenuItemProps[]}
	dataMenu:{getExportItems:()=>MenuItemProps[]}
	getMenuList:()=>MenuItemProps[];
}

export class IWeaveMenus { }
export default IWeaveMenus;
