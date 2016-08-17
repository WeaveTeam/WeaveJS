import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
import MenuItemProps = weavejs.ui.menu.MenuItemProps;
import PopupWindow = weavejs.ui.PopupWindow;

import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import LinkableHashMap = weavejs.core.LinkableHashMap;
import IWeaveMenus from "./IWeaveMenus";
import ColorController from "../editor/ColorController";
import MouseoverController from "../editor/MouseoverController";
import {WeaveAPI} from "weavejs";
import AttributeMenuTool from "../tool/AttributeMenuTool";
import DataFilterTool from "../tool/DataFilterTool";
import SessionStateMenuTool from "../tool/SessionStateMenuTool";
import IVisTool from "../api/ui/IVisTool";

export default class ControllersMenu implements MenuBarItemProps
{
	constructor(owner:IWeaveMenus)
	{
		this.owner = owner;
	}

	owner:IWeaveMenus;
	label:string = "Controllers";

	openColorController = PopupWindow.generateOpener(() => ({
		context: this.owner.context,
		title: Weave.lang("Color settings"),
		content: <ColorController colorColumn={this.owner.weave.getObject("defaultColorColumn") as ColorColumn}/>,
		resizable: true,
		width: 920,
		height: 675
	}));

	openMouseOverController = PopupWindow.generateOpener(() => ({
		context: this.owner.context,
		title: Weave.lang("Mouseover settings"),
		content: (
			<MouseoverController
				probedHeaderColumns={this.owner.weave.root.requestObject("Probe Header Columns", LinkableHashMap)}
				probedColumns={this.owner.weave.root.requestObject("Probed Columns", LinkableHashMap)}
			/>
		),
		resizable: true,
		width: 920,
		height: 675
	}));

	get menu():MenuItemProps[]
	{
		return [].concat(
			{
				label: Weave.lang("Color settings"),
				click: this.openColorController
			},
			{
				label: Weave.lang("Mouseover settings"),
				click: this.openMouseOverController
			},
			{},
			this.getCreateObjectItems()
		);
	}

	getCreateObjectItems()
	{
		var registry = WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IVisTool);

		// temporary solution - only include tools we want
		impls = [
			AttributeMenuTool,
			DataFilterTool,
			SessionStateMenuTool
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

	static isBeta(impl:Class):boolean
	{
		return impl == SessionStateMenuTool;
			//impl == DataFilterTool
//			|| impl == AttributeMenuTool
	}
}
