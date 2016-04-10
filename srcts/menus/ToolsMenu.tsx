import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import IVisTool = weavejs.api.ui.IVisTool;
import * as WeaveUI from "../WeaveUI";

import ColorController from "../editors/ColorController";
import ColorColumn = weavejs.data.column.ColorColumn;

export default class ToolsMenu implements MenuBarItemProps
{
	constructor(weave:Weave, createObject:(type:new(..._:any[])=>any)=>void)
	{
		this.weave = weave;
		this.createObject = createObject;
		
		var registry = weavejs.WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IVisTool);
		
		// temporary solution - only include tools we want
		impls = [
			WeaveUI.C3BarChart,
			WeaveUI.ColorLegend,
			WeaveUI.C3Gauge,
			WeaveUI.C3Histogram,
			WeaveUI.C3LineChart,
			WeaveUI.OpenLayersMapTool,
			WeaveUI.C3PieChart,
			WeaveUI.C3ScatterPlot,
			WeaveUI.TableTool,
			WeaveUI.DataFilterTool
		];
		
		this.menu = [
			{
				label: Weave.lang("Color Controller"),
				click: () => ColorController.open(this.weave.getObject("defaultColorColumn") as ColorColumn)
			},
			{}
		];
		
		impls.forEach(impl => {
			var name = registry.getDisplayName(impl);
			this.menu.push({
				label: Weave.lang('+ {0}', name),
				click: this.createObject.bind(this, impl)
			});
		});
		this.createObject = createObject;
	}

	label:string = "Tools";
	weave:Weave;
	menu:MenuItemProps[];
	createObject:(type:new(..._:any[])=>any)=>void;
	
	openColorController()
	{
		
	}
}
