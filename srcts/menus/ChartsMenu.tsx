import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import IVisTool = weavejs.api.ui.IVisTool;
import * as WeaveUI from "../WeaveJS";
import WeaveMenus from "./WeaveMenus";

import ColorController from "../editors/ColorController";
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;

export default class ChartsMenu implements MenuBarItemProps
{
	constructor(owner:WeaveMenus)
	{
		this.owner = owner;
	}

	owner:WeaveMenus;
	label:string = "Charts";

	get menu():MenuItemProps[]
	{
		return [].concat(
			this.getCreateObjectItems()
		);
	}
	
	getCreateObjectItems()
	{
		var registry = weavejs.WeaveAPI.ClassRegistry;
		var impls = registry.getImplementations(IVisTool);
		
		// temporary solution - only include tools we want
		impls = [
			WeaveUI.C3BarChart,
			WeaveUI.ColorLegend,
			WeaveUI.C3Gauge,
			WeaveUI.C3ColorHistogram,
			WeaveUI.C3Histogram,
			WeaveUI.C3LineChart,
			WeaveUI.OpenLayersMapTool,
			WeaveUI.C3PieChart,
			WeaveUI.C3ScatterPlot,
			WeaveUI.TableTool,
			WeaveUI.TextTool
		];

		return impls.map(impl => {
			var label = Weave.lang(registry.getDisplayName(impl));
			if (ChartsMenu.isBeta(impl))
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
		return impl == WeaveUI.C3Gauge;
	}
}
