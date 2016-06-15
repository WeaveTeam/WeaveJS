import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import IVisTool = weavejs.api.ui.IVisTool;
import * as WeaveUI from "../WeaveUI";
import MouseoverController from "../editors/MouseoverController";
import WeaveMenus from "./WeaveMenus";

import ColorController from "../editors/ColorController";
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;

export default class ControllersMenu implements MenuBarItemProps
{
	constructor(owner:WeaveMenus)
	{
		this.owner = owner;
	}

	owner:WeaveMenus;
	label:string = "Controllers";
	
	get menu():MenuItemProps[]
	{
		return [].concat(
			{
				label: Weave.lang("Color settings"),
				click: () => ColorController.open(this.owner.context, this.owner.weave.getObject("defaultColorColumn") as ColorColumn)
			},
			{
				label: Weave.lang("Mouseover settings"),
				click: () => MouseoverController.open(
					this.owner.context,
					this.owner.weave,
					this.owner.weave.getObject("Probe Header Columns") as ILinkableHashMap,
					this.owner.weave.getObject("Probed Columns") as ILinkableHashMap
				)
			},
			{},
			this.getCreateObjectItems()
		);
	}
	
	getCreateObjectItems()
	{
		var registry = weavejs.WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IVisTool);
		
		// temporary solution - only include tools we want
		impls = [
			WeaveUI.AttributeMenuTool,
			WeaveUI.DataFilterTool,
			WeaveUI.SessionStateMenuTool
		];

		return impls.map(impl => {
			var label = Weave.lang(registry.getDisplayName(impl));
			if (ControllersMenu.isBeta(impl))
			{
				if (Weave.beta)
					label += " (beta)";
				else
					return null;
			}
			return {
				label: label,
				click: this.owner.createObject.bind(this, impl)
			};
		}).filter(item => !!item);
	}
	
	static isBeta(impl:new(..._:any[])=>any):boolean
	{
		return impl == WeaveUI.DataFilterTool
//			|| impl == WeaveUI.AttributeMenuTool
			|| impl == WeaveUI.SessionStateMenuTool;
	}
}
