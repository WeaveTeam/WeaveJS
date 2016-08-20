import * as React from "react";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
import MenuItemProps = weavejs.ui.menu.MenuItemProps;
import ColorColumn = weavejs.data.column.ColorColumn;
import BinnedColumn = weavejs.data.column.BinnedColumn;
import FilteredColumn = weavejs.data.column.FilteredColumn;
import IWeaveMenus from "weave/menu/IWeaveMenus";
import {WeaveAPI} from "weavejs";
import C3BarChart from "weave/tool/c3tool/C3BarChart";
import ColorLegend from "weave/tool/ColorLegend";
import C3Gauge from "weave/tool/c3tool/C3Gauge";
import C3ColorHistogram from "weave/tool/c3tool/C3ColorHistogram";
import C3Histogram from "weave/tool/c3tool/C3Histogram";
import C3LineChart from "weave/tool/c3tool/C3LineChart";
import DataMessageTool from "weave/tool/DataMessageTool";
import C3PieChart from "weave/tool/c3tool/C3PieChart";
import C3ScatterPlot from "weave/tool/c3tool/C3ScatterPlot";
import Sparkline from "weave/tool/Sparkline";
import TableTool from "weave/tool/TableTool";
import TextTool from "weave/tool/TextTool";
import OpenLayersMapTool from "weave/tool/oltool/OpenLayersMapTool";

export default class ChartsMenu implements MenuBarItemProps
{
	constructor(owner:IWeaveMenus)
	{
		this.owner = owner;
	}

	owner:IWeaveMenus;
	label:string = "Charts";

	get menu():MenuItemProps[]
	{
		return [].concat(
			this.getCreateObjectItems()
		);
	}

	getCreateObjectItems()
	{
		var registry = WeaveAPI.ClassRegistry;

		// temporary solution - only include tools we want
		var impls = [
			C3BarChart,
			ColorLegend,
			C3Gauge,
			C3ColorHistogram,
			C3Histogram,
			C3LineChart,
			DataMessageTool,
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

	static isBeta(impl:Class):boolean
	{
		return impl == C3Gauge || impl == DataMessageTool;
	}
}
