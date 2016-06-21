import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import IVisTool = weavejs.api.ui.IVisTool;
import WeaveMenus from "./WeaveMenus";

import C3BarChart from "../tools/C3BarChart";
import ColorLegend from "../tools/ColorLegend";
import C3Gauge from "../tools/C3Gauge";
import C3ColorHistogram from "../tools/C3ColorHistogram";
import C3Histogram from "../tools/C3Histogram";
import C3LineChart from "../tools/C3LineChart";
import OpenLayersMapTool from "../tools/OpenLayersMapTool";
import C3PieChart from "../tools/C3PieChart";
import C3ScatterPlot from "../tools/C3ScatterPlot";
import TableTool from "../tools/TableTool";
import TextTool from "../tools/TextTool";
import Sparkline from "../tools/Sparkline";

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
			C3BarChart,
			ColorLegend,
			C3Gauge,
			C3ColorHistogram,
			C3Histogram,
			C3LineChart,
			OpenLayersMapTool,
			C3PieChart,
			C3ScatterPlot,
			Sparkline,
			TableTool,
			TextTool
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
		return impl == C3Gauge;
	}
}
