import * as React from "react";
import {MenuBarItemProps} from "../react-ui/MenuBar";
import {MenuItemProps} from "../react-ui/Menu";
import PopupWindow from "../react-ui/PopupWindow";
import IVisTool = weavejs.api.ui.IVisTool;
import * as WeaveUI from "../WeaveUI";

import ColorController from "../editors/ColorController";
import ColorColumn = weavejs.data.column.ColorColumn;

export interface ToolsMenuProps extends React.HTMLProps<ToolsMenu>
{
	weave:Weave,
	createObject:(type:new(..._:any[])=>any)=>void
}

export interface ToolsMenuState
{

}

export default class ToolsMenu extends React.Component<ToolsMenuProps,ToolsMenuState>
{
	private weave:Weave;
	private createObject:(type:new(..._:any[])=>any)=>void;
	private tools:JSX.Element[];

	constructor(props:ToolsMenuProps)
	{
		super();
		this.weave = props.weave;
		this.createObject = props.createObject;

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
			WeaveUI.TextTool
		];

		this.tools = impls.map( (impl,index) => {
			var name = registry.getDisplayName(impl);
			return (
				<a key={index} className="item" onClick={this.createObject.bind(this, impl)}>{Weave.lang('+ {0}', name)}</a>
			);
		});
	}

	render():JSX.Element {
		return (<div className="menu">
			<a className="item" onClick={() => ColorController.open(this.weave.getObject("defaultColorColumn") as ColorColumn)}>{Weave.lang("Color Controller")}</a>
			<div className="ui divider"></div>
			{this.tools}
		</div>)
	}

	openColorController()
	{

	}
}