import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import IVisTool = weavejs.api.ui.IVisTool;
import * as WeaveUI from "../WeaveUI";

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
		
		this.menu = impls.map(impl => {
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
