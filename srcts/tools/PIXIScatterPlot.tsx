import * as React from "react";
import * as ReactDOM from "react-dom";
import AbstractVisTool from "./AbstractVisTool";
import {IVisToolProps, IVisToolState} from "./IVisTool";
import * as PIXI from "pixi.js";

export interface PIXIScatterPlotProps extends IVisToolProps
{

}

export interface PIXIScatterPlotState extends IVisToolState
{

}

export default class PIXIScatterPlot extends AbstractVisTool<IVisToolProps, IVisToolState>
{
	element:HTMLDivElement;
	renderer:PIXI.WebGLRenderer = new PIXI.WebGLRenderer(800, 600);
	graphics:PIXI.Graphics = new PIXI.Graphics();
	stage:PIXI.Container = new PIXI.Container();

	constructor(props:PIXIScatterPlotProps)
	{
		super(props);
	}

	componentDidMount()
	{
		ReactDOM.findDOMNode(this).appendChild(this.renderer.view);
		this.stage.addChild(this.graphics);
	}

	componentDidUpdate()
	{
		this.renderer.render(this.stage);
	}

	draw()
	{
		this.graphics.clear();
		this.graphics.lineStyle(1, 0, 0.5);
		this.graphics.moveTo(0, 0);
		this.graphics.lineTo(100, 100);
		this.forceUpdate();
	}

	render()
	{
		return (
			<div style={{flex: 1}}/>
		);
	}
}

Weave.registerClass(
	PIXIScatterPlot,
	["weavejs.tool.PIXIScatterPlot", "weave.visualization.tools::ScatterPlotTool"],
	[
		weavejs.api.ui.IVisTool_Basic,
		weavejs.api.core.ILinkableObjectWithNewProperties,
		weavejs.api.data.ISelectableAttributes,
	],
	"Scatter Plot"
);
