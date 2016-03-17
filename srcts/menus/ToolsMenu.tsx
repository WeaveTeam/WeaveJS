import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import IVisTool = weavejs.api.ui.IVisTool;

export default class ToolsMenu implements MenuBarItemProps
{
	constructor(weave:Weave, createObject:(type:new(..._:any[])=>any)=>void)
	{
		this.weave = weave;
		this.createObject = createObject;
		
		var registry = weavejs.WeaveAPI.ClassRegistry;
		this.menu = registry.getImplementations(IVisTool).map(impl => {
			var name = registry.getDisplayName(impl);
			return {
				label: Weave.lang('+ {0}', name),
				click: this.createObject.bind(this, impl)
			};
		});
		this.createObject = createObject;
	}

	label:string = "Tools";
	weave:Weave;
	menu:MenuItemProps[];
	createObject:(type:new(..._:any[])=>any)=>void;
}
