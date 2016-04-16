import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import IVisTool = weavejs.api.ui.IVisTool;
import * as WeaveUI from "../WeaveUI";

import ColorController from "../editors/ColorController";
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;

export default class ToolsMenu implements MenuBarItemProps
{
	constructor(weave:Weave, createObject:(type:new(..._:any[])=>any)=>void)
	{
		this.weave = weave;
		this.createObject = createObject;
	}

	label:string = "Visualizations";
	weave:Weave;
	createObject:(type:new(..._:any[])=>any)=>void;
	get menu():MenuItemProps[]
	{
		return [].concat(
			{
				label: Weave.lang("Color Controller"),
				click: () => ColorController.open(
					this.weave.getObject("defaultColorColumn") as ColorColumn, 
					this.weave.getObject("defaultColorBinColumn") as BinnedColumn,
					this.weave.getObject("defaultColorDataColumn") as FilteredColumn
				)
			},
			{},
			this.getVisualizationItems()
		);
	}
	
	getVisualizationItems()
	{
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
			WeaveUI.DataFilterTool,
			WeaveUI.AttributeMenuTool
		];

		return impls.map(impl => {
			var label = Weave.lang('+ {0}', registry.getDisplayName(impl));
			if (impl == WeaveUI.DataFilterTool)
			{
				if (Weave.experimental)
					label += " (experimental)";
				else
					return null;
			}
			return {
				label: label,
				click: this.createObject.bind(this, impl)
			};
		}).filter(item => !!item);
	}
}
