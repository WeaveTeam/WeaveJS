import * as React from "react";
import * as ReactDOM from "react-dom";
import * as weavejs from "weavejs";
import {Weave} from "weavejs";

import Bounds2D = weavejs.geom.Bounds2D;
import DynamicComponent = weavejs.ui.DynamicComponent;
import DOMUtils = weavejs.util.DOMUtils;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import AbstractVisTool from "weaveapp/tool/AbstractVisTool";
import ScatterPlotPlotter from "weaveapp/plot/ScatterPlotPlotter";
import IVisTool, {IVisToolProps, IVisToolState} from "weaveapp/api/ui/IVisTool";

export interface PIXIScatterPlotProps extends IVisToolProps
{

}

export interface PIXIScatterPlotState extends IVisToolState
{

}

export default class PIXIScatterPlot extends AbstractVisTool<PIXIScatterPlotProps, PIXIScatterPlotState>
{
	static WEAVE_INFO = Weave.classInfo(PIXIScatterPlot, {
		id: "weavejs.tool.PIXIScatterPlot",
		label: "Scatter Plot",
		interfaces: [
			IVisTool,
			ILinkableObjectWithNewProperties,
			ISelectableAttributes,
		]//,
		//deprecatedIds: ["weave.visualization.tools::ScatterPlotTool"]
	});

	element:HTMLDivElement;
	renderer:PIXI.WebGLRenderer | PIXI.CanvasRenderer;
	graphics:PIXI.Graphics = new PIXI.Graphics();
	stage:PIXI.Container = new PIXI.Container();
	plotter:ScatterPlotPlotter = Weave.linkableChild(this, ScatterPlotPlotter, this.forceUpdate, true);

	constructor(props:PIXIScatterPlotProps)
	{
		super(props);
		this.plotter.spatialCallbacks.addGroupedCallback(this, this.forceUpdate);
		this.plotter.filteredKeySet.keyFilter.targetPath = ['defaultSubsetKeyFilter'];
	}

	componentDidMount()
	{
		var canvas = ReactDOM.findDOMNode(this) as HTMLCanvasElement;
		this.renderer = PIXI.autoDetectRenderer(800, 600, {
			view: canvas,
			transparent: true,
			resolution: DOMUtils.getWindow(canvas).devicePixelRatio
		});
		this.renderer.autoResize = true;
		this.renderer.clearBeforeRender = true;
		this.stage.addChild(this.graphics);
	}

	componentDidUpdate()
	{
		var db = new Bounds2D();
		this.plotter.getBackgroundDataBounds(db);
		var task = {
			buffer: this.graphics,
			dataBounds: db,
			screenBounds: new Bounds2D(0, 600, 800, 0),
			recordKeys: this.plotter.filteredKeySet.keys,
			iteration: 0,
			iterationStopTime: Infinity,
			asyncState: {},
			progress: 0
		};
		while (task.progress < 1)
		{
			task.progress = this.plotter.drawPlotAsyncIteration(task);
			task.iteration++;
		}
		this.renderer.render(this.stage);
	}

	render()
	{
		return (
			<canvas style={{flex: 1}}/>
		);
	}
}
