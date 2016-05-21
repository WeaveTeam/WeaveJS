import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import WindowLayout from "../layouts/WindowLayout";
import FlexibleLayout from "../layouts/FlexibleLayout";
import {AbstractLayout} from "../layouts/AbstractLayout";
import TabLayout from "../layouts/TabLayout";

export default class LayoutsMenu implements MenuBarItemProps
{
	layout_label_to_class:Map<string, AbstractLayout> = new Map()
		.set("Window", WindowLayout)
		.set("Flexible", FlexibleLayout as any)
		.set("Tab", TabLayout);

	addLayoutCallBack:Function;
	removeLayoutCallback:Function;
	constructor(weave:Weave, addLayoutCallBack:(layoutType:typeof AbstractLayout)=>void, removeLayoutCallback:() => void)
	{
		this.weave = weave;
		this.addLayoutCallBack = addLayoutCallBack;
		this.removeLayoutCallback = removeLayoutCallback;
	}

	weave:Weave;
	label = "Layouts";
	bold = false;

	get menu():MenuItemProps[] {
		return [
			{
				label: Weave.lang("New..."),
				menu: Array.from(this.layout_label_to_class.keys()).map((key) => {
					return {
						label: Weave.lang(key) + " " + "Layout",
						click: () => this.addLayoutCallBack(this.layout_label_to_class.get(key))
					}
				})
			},
			{
				label: Weave.lang("Close"),
				click: this.removeLayoutCallback
			},
			{}
		];
	}
}
