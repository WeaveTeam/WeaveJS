///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import jquery from "jquery";

import {IVisTool, IVisToolProps, IVisToolState} from "./IVisTool";
/* eslint-disable */
import Layer from "./OpenLayersMap/Layers/Layer";
import FeatureLayer from "./OpenLayersMap/Layers/FeatureLayer";
import GeometryLayer from "./OpenLayersMap/Layers/GeometryLayer";
import TileLayer from "./OpenLayersMap/Layers/TileLayer";
import ImageGlyphLayer from "./OpenLayersMap/Layers/ImageGlyphLayer";
import ScatterPlotLayer from "./OpenLayersMap/Layers/ScatterPlotLayer";
import LabelLayer from "./OpenLayersMap/Layers/LabelLayer";
/* eslint-enable */

import PanCluster from "./OpenLayersMap/PanCluster";
import InteractionModeCluster from "./OpenLayersMap/InteractionModeCluster";
import ProbeInteraction from "./OpenLayersMap/ProbeInteraction";
import DragSelection from "./OpenLayersMap/DragSelection";
import CustomZoomToExtent from "./OpenLayersMap/CustomZoomToExtent";

import WeavePath = weavejs.path.WeavePath;
import ZoomBounds = weavejs.geom.ZoomBounds;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import DynamicState = weavejs.api.core.DynamicState;

import LinkableString = weavejs.core.LinkableString;
import LinkableVariable = weavejs.core.LinkableVariable;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableHashMap = weavejs.core.LinkableHashMap;

import Bounds2D = weavejs.geom.Bounds2D;

interface Bounds {
	xMin: number;
	xMax: number;
	yMin: number;
	yMax: number;
}

function isBounds(obj:any):boolean {
	return lodash.every(["xMin", "xMax", "yMin", "yMax"], (item) => typeof obj[item] === "number");
}

export default class OpenLayersMapTool extends React.Component<IVisToolProps, IVisToolState> {

	static DEFAULT_PROJECTION: string = "EPSG:4326";

	map:ol.Map;
	zoomButtons:ol.control.Zoom;
	slider:ol.control.ZoomSlider;
	zoomExtent: ol.control.ZoomToExtent;
	pan:PanCluster;
	mouseModeButtons:InteractionModeCluster;

	centerCallbackHandle:any;
	resolutionCallbackHandle:any;
	private element:Element;

	zoomBounds: ZoomBounds = Weave.linkableChild(this, ZoomBounds);
	extentOverride: LinkableVariable = Weave.linkableChild(this, new LinkableVariable(null, isBounds, [NaN, NaN, NaN, NaN]));
	projectionSRS: LinkableString = Weave.linkableChild(this, LinkableString);
	showZoomControls: LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
	showMouseModeControls: LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
	interactionMode: LinkableString = Weave.linkableChild(this, LinkableString);
	layers: LinkableHashMap = Weave.linkableChild(this, new LinkableHashMap(Layer));

	constructor(props:IVisToolProps)
	{
		super(props);

		/* Force the inclusion of the layers. */
		GeometryLayer; TileLayer; ImageGlyphLayer; ScatterPlotLayer; LabelLayer;
		
		Weave.detectChange(this.interactionMode, this.interactionMode);
	}

	get deprecatedStateMapping():Object
	{
		return {
			children: {
				visualization: {
					plotManager: (pm:any, removeMissingDynamicObjects:boolean) => {
						if (!pm)
							return;
						
						if (pm.zoomBounds)
							Weave.setState(this.zoomBounds, pm.zoomBounds);
						
						this.extentOverride.state = {xMin: pm.overrideXMin, yMin: pm.overrideYMin, xMax: pm.overrideXMax, yMax: pm.overrideYMax};
						
						Weave.setState(this.layers, pm.plotters, removeMissingDynamicObjects);
						Weave.setState(this.layers, DynamicState.removeTypeFromState(pm.layerSettings), removeMissingDynamicObjects);
					}
				}
			}
		};
	}

	componentDidMount():void
	{
		if (Weave.detectChange(this.interactionMode, this.interactionMode))
		{
			/* use global interaction mode as default local mode */
			var defaultDragMode = Weave.getWeave(this).getObject("WeaveProperties", "toolInteractions", "defaultDragMode") as LinkableString;
			if (defaultDragMode instanceof LinkableString)
				this.interactionMode.value = defaultDragMode.value;
		}
		
		this.map = new ol.Map({
			interactions: ol.interaction.defaults({ dragPan: false }),
			controls: [],
			target: this.element
		});

		/* Setup custom interactions */

		let dragPan: ol.interaction.DragPan = new ol.interaction.DragPan();
		let dragSelect: DragSelection = new DragSelection();
		let probeInteraction: ProbeInteraction = new ProbeInteraction(this);
		let dragZoom: ol.interaction.DragZoom = new ol.interaction.DragZoom({ condition: ol.events.condition.always });

		this.map.addInteraction(dragPan);
		this.map.addInteraction(dragSelect);
		this.map.addInteraction(probeInteraction);
		this.map.addInteraction(dragZoom);

		this.interactionMode.addGroupedCallback(this, () => {
			let interactionMode = this.interactionMode.value || "select";
			dragPan.setActive(interactionMode === "pan");
			dragSelect.setActive(interactionMode === "select");
			dragZoom.setActive(interactionMode === "zoom");
		}, true);

		/* Setup custom controls */

		this.zoomButtons = new ol.control.Zoom();
		this.slider = new ol.control.ZoomSlider();
		this.pan = new PanCluster();
		this.zoomExtent = new CustomZoomToExtent({ label: jquery("<span>").addClass("fa fa-arrows-alt").css({ "font-weight": "normal" })[0]});

		jquery(this.element).find("canvas.ol-unselectable").attr("tabIndex", 1024); /* Hack to make the canvas focusable. */

		this.map.addControl(this.zoomButtons);

		this.showZoomControls.addGroupedCallback(this, this.updateEnableZoomControl_weaveToOl, true);
		this.showMouseModeControls.addGroupedCallback(this, this.updateEnableMouseModeControl_weaveToOl, true);

		this.mouseModeButtons = new InteractionModeCluster({mapTool: this});

		/* Todo replace override[X,Y][Min,Max] with a single overrideZoomBounds element; alternatively,
		 * make a set of parameters on zoombounds itself. */

		this.extentOverride.addGroupedCallback(this, this.updateViewParameters_weaveToOl);

		this.projectionSRS.addGroupedCallback(this, this.updateViewParameters_weaveToOl, true);

		this.layers.addGroupedCallback(this, this.requestDetail, true);

		this.layers.childListCallbacks.addImmediateCallback(this, this.updatePlotters_weaveToOl, true);
		Weave.getCallbacks(this.zoomBounds).addGroupedCallback(this, this.updateZoomAndCenter_weaveToOl, true);
	}

	updateViewParameters_weaveToOl():void
	{
		let extent:ol.Extent = [NaN,NaN,NaN,NaN];
		let rawExtent: Bounds = this.extentOverride.state as Bounds;

		if (rawExtent) {
			extent[0] = rawExtent.xMin;
			extent[1] = rawExtent.yMin;
			extent[2] = rawExtent.xMax;
			extent[3] = rawExtent.yMax;
		}

		if (!lodash.every(extent, Number.isFinite))
		{
			extent = undefined;
		}

		let projection = this.projectionSRS.value || this.getDefaultProjection();
		let view = new ol.View({projection, extent});
		view.set("extent", extent);

		this.centerCallbackHandle = view.on("change:center", this.updateCenter_olToWeave, this);
		this.resolutionCallbackHandle = view.on("change:resolution", this.updateZoom_olToWeave, this);
		this.map.setView(view);

		this.updateZoomAndCenter_weaveToOl();
	}

	componentDidUpdate():void
	{
		this.map.updateSize();
		var viewport = this.map.getViewport();
		var screenBounds = new Bounds2D(0, 0, viewport.clientWidth, viewport.clientHeight);
		this.zoomBounds.setScreenBounds(screenBounds, true);
	}

	updateControlPositions():void
	{
		if (this.showZoomControls.value)
		{
			jquery(this.element).find(".ol-control.panCluster").css({top: "0.5em", left: "0.5em"});
			jquery(this.element).find(".ol-control.ol-zoom").css({top: "5.5em", left: "2.075em"});
			jquery(this.element).find(".ol-control.ol-zoomslider").css({top: "9.25em", left: "2.075em"});
			jquery(this.element).find(".ol-control.iModeCluster").css({top: "20.75em", left: "0.6em"});
		}
		else
		{
			jquery(this.element).find(".ol-control.ol-zoom-extent").css({top: "0.5em", left: "0.5em"});
			jquery(this.element).find(".ol-control.ol-zoom").css({ top: "2.625em", left: "0.5em" });
			jquery(this.element).find(".ol-control.iModeCluster").css({ top: "5.6em", left: "0.5em" });
		}
	}


	updateEnableMouseModeControl_weaveToOl():void
	{		
		if (this.showMouseModeControls.value)
		{
			this.map.addControl(this.mouseModeButtons);
		}
		else
		{
			this.map.removeControl(this.mouseModeButtons);
		}
		this.updateControlPositions();
	}


	updateEnableZoomControl_weaveToOl():void
	{
		if (this.showZoomControls.value)
		{
			this.map.addControl(this.slider);
			this.map.addControl(this.pan);
			this.map.removeControl(this.zoomExtent);
		}
		else
		{
			this.map.removeControl(this.slider);
			this.map.removeControl(this.pan);
			this.map.addControl(this.zoomExtent);
		}
		this.updateControlPositions();
	}

	updateCenter_olToWeave():void
	{
		var [xCenter, yCenter] = this.map.getView().getCenter();

		var dataBounds = new weavejs.geom.Bounds2D();
		this.zoomBounds.getDataBounds(dataBounds);
		dataBounds.setXCenter(xCenter);
		dataBounds.setYCenter(yCenter);
		this.zoomBounds.setDataBounds(dataBounds);
	}

	updateZoom_olToWeave():void
	{
		let view = this.map.getView();
		var resolution = view.getResolution();

		/* If the resolution is being set between constrained levels,
		 * odds are good that this is the result of a slider manipulation.
		 * While the user is dragging the slider, we shouldn't update the
		 * session state, because this will trigger reconstraining the
		 * resolution, which will lead to it feeling "jerky" */
		if (resolution != view.constrainResolution(resolution))
		{
			return;
		}

		var dataBounds = new weavejs.geom.Bounds2D();
		var screenBounds = new weavejs.geom.Bounds2D();
		this.zoomBounds.getDataBounds(dataBounds);
		this.zoomBounds.getScreenBounds(screenBounds);
		dataBounds.setWidth(screenBounds.getWidth() * resolution);
		dataBounds.setHeight(screenBounds.getHeight() * resolution);
		dataBounds.makeSizePositive();
		this.zoomBounds.setDataBounds(dataBounds);
	}

	updateZoomAndCenter_weaveToOl():void
	{
		var dataBounds = new weavejs.geom.Bounds2D();
		this.zoomBounds.getDataBounds(dataBounds);
		var center = [dataBounds.getXCenter(), dataBounds.getYCenter()];
		var scale = this.zoomBounds.getXScale();
		let view = this.map.getView();

		view.un("change:center", this.updateCenter_olToWeave, this);
		view.un("change:resolution", this.updateZoom_olToWeave, this);

		view.setCenter(center);
		view.setResolution(view.constrainResolution(1 / scale));

		lodash.defer(() => {
			view.on("change:center", this.updateCenter_olToWeave, this);
			view.on("change:resolution", this.updateZoom_olToWeave, this);
		});
	}

	getDefaultProjection():string
	{
		for (let layerName of this.layers.getNames())
		{
			let layer: Layer = this.layers.getObject(layerName) as Layer;
			if (layer instanceof TileLayer)
				return "EPSG:3857";
		}
		return OpenLayersMapTool.DEFAULT_PROJECTION;
	}

	requestDetail():void
	{
		for (var name of this.layers.getNames())
		{
			var layer:GeometryLayer = this.layers.getObject(name) as GeometryLayer;
			if (!(layer instanceof GeometryLayer))
				continue;
			for (var sgc of Weave.getDescendants(this.layers.getObject(name), weavejs.data.column.StreamedGeometryColumn))
			{
				if (layer.inputProjection == layer.outputProjection)
				{
					weavejs.data.column.StreamedGeometryColumn.metadataRequestMode = 'xyz';
					sgc.requestGeometryDetailForZoomBounds(this.zoomBounds);
				}
				else
				{
					//TODO - don't request everything when reprojecting
					weavejs.data.column.StreamedGeometryColumn.metadataRequestMode = 'all';
					sgc.requestGeometryDetail(sgc.collectiveBounds, 0);
				}
			}
		}
	}

	updatePlotters_weaveToOl():void
	{
		var newNames:string[] = this.layers.getNames();

		for (let idx in newNames)
		{
			let layer:Layer = this.layers.getObject(newNames[idx]) as Layer;

			layer.parent = this;

			if (!layer || !layer.olLayer)
				continue;

			layer.olLayer.setZIndex(Number(idx) + 2);
		}
		/* This may impact the default projection, so trigger callbacks on it. */
		this.projectionSRS.triggerCallbacks();
	}

	dispose():void
	{

	}

	render():JSX.Element {
        return <div ref={(c:HTMLElement) => {this.element = c;}} style={{width: "100%", height: "100%"}}/>;
    }
}

Weave.registerClass("weavejs.tool.Map", OpenLayersMapTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
Weave.registerClass("weave.visualization.tools::MapTool", OpenLayersMapTool, [weavejs.api.ui.IVisTool, weavejs.api.core.ILinkableObjectWithNewProperties]);
