namespace weavejs.menu
{
	import MenuBarItemProps = weavejs.ui.menu.MenuBarItemProps;
	import MenuItemProps = weavejs.ui.menu.MenuItemProps;
	import IVisTool = weavejs.api.ui.IVisTool;
	import C3BarChart = weavejs.tool.c3tool.C3BarChart;
	import ColorLegend = weavejs.tool.ColorLegend;
	import C3ColorHistogram = weavejs.tool.c3tool.C3ColorHistogram;
	import C3Histogram = weavejs.tool.c3tool.C3Histogram;
	import C3LineChart = weavejs.tool.c3tool.C3LineChart;
	import OpenLayersMapTool = weavejs.tool.oltool.OpenLayersMapTool;
	import C3PieChart = weavejs.tool.c3tool.C3PieChart;
	import C3ScatterPlot = weavejs.tool.c3tool.C3ScatterPlot;
	import TableTool = weavejs.tool.TableTool;
	import TextTool = weavejs.tool.TextTool;
	import Sparkline = weavejs.tool.Sparkline;
	import ColorColumn = weavejs.data.column.ColorColumn;
	import BinnedColumn = weavejs.data.column.BinnedColumn;
	import FilteredColumn = weavejs.data.column.FilteredColumn;
	import C3Gauge = weavejs.tool.c3tool.C3Gauge;
	import DataMessageTool = weavejs.tool.DataMessageTool;

	export class ChartsMenu implements MenuBarItemProps
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
}