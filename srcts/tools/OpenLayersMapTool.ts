///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import * as jquery from "jquery";

import AbstractWeaveTool from "./AbstractWeaveTool";
import {registerToolImplementation} from "../WeaveTool";
/* eslint-disable */
import Layer from "./OpenLayersMap/Layers/Layer";
import FeatureLayer from "./OpenLayersMap/Layers/FeatureLayer";
import GeometryLayer from "./OpenLayersMap/Layers/GeometryLayer";
import TileLayer from "./OpenLayersMap/Layers/TileLayer";
import ImageGlyphLayer from "./OpenLayersMap/Layers/ImageGlyphLayer";
import ScatterPlotLayer from "./OpenLayersMap/Layers/ScatterPlotLayer";
/* eslint-enable */

import {PanCluster, InteractionModeCluster} from "./OpenLayersMap/controls";
import weaveMapInteractions from "./OpenLayersMap/interactions";
/* global Weave, weavejs */

declare var Weave:any;
declare var weavejs:any;

class WeaveOpenLayersMap extends AbstractWeaveTool {

	layers:Map<string,Layer>;
	interactionModePath:WeavePath;
	map:ol.Map;
	zoomButtons:ol.control.Zoom;
	slider:ol.control.ZoomSlider;
	pan:PanCluster;
	mouseModeButtons:InteractionModeCluster;
	plotManager:WeavePath;
	plottersPath:WeavePath;
	layerSettingsPath:WeavePath;
	zoomBoundsPath:WeavePath;

	centerCallbackHandle:any;
	resolutionCallbackHandle:any;



	constructor(props)
	{
		super(props);

		this.layers = new Map<string,Layer>();
	}

	handleMissingSessionStateProperties(newState)
	{

	}

	componentDidMount()
	{
		super.componentDidMount();

		this.interactionModePath = this.toolPath.weave.path("WeaveProperties", "toolInteractions", "defaultDragMode");

		this.map = new ol.Map({
			interactions: weaveMapInteractions(this),
			controls: [],
			target: this.element
		});


		this.zoomButtons = new ol.control.Zoom();
		this.slider = new ol.control.ZoomSlider();
		this.pan = new PanCluster();

		this.toolPath.push("showZoomControls").addCallback(this, this.onZoomControlToggle, true);
		this.toolPath.push("showMouseModeControls").addCallback(this, this.onMouseModeControlToggle, true);

		this.mouseModeButtons = new InteractionModeCluster({interactionModePath: this.interactionModePath});

		this.plotManager = this.toolPath.push("children", "visualization", "plotManager");

		/* Todo replace override[X,Y][Min,Max] with a single overrideZoomBounds element; alternatively,
		 * make a set of parameters on zoombounds itself. */

		for (let extreme of ["Min", "Max"])
			for (let axis of ["X", "Y"])
				this.plotManager.push("override" + axis + extreme).addCallback(this, this.onViewParametersChanged);

		this.toolPath.push("projectionSRS").addCallback(this, this.onViewParametersChanged, true);


		this.plottersPath = this.plotManager.push("plotters");
		this.layerSettingsPath = this.plotManager.push("layerSettings");
		this.zoomBoundsPath = this.plotManager.push("zoomBounds");


		this.plottersPath.getObject().childListCallbacks.addImmediateCallback(this, this.plottersChanged, true);

		this.zoomBoundsPath.addCallback(this, this.getSessionCenter, true);
	}

	onViewParametersChanged()
	{
		let extent = [];

		for (let extreme of ["Min", "Max"])
			for (let axis of ["X", "Y"])
				extent.push(this.plotManager.push("override" + axis + extreme).getState());

		if (!lodash.every(extent, Number.isFinite))
		{
			extent = undefined;
		}

		let projection = this.toolPath.push("projectionSRS").getState() || "EPSG:3857";
		let view = new ol.View({projection, extent});
		view.set("extent", extent);

		this.centerCallbackHandle = view.on("change:center", this.setSessionCenter, this);
		this.resolutionCallbackHandle = view.on("change:resolution", this.setSessionZoom, this);
		this.map.setView(view);

		this.getSessionCenter();
	}

	resize()
	{
		this.map.updateSize();
		var viewport = this.map.getViewport();
		var screenBounds = new weavejs.geom.Bounds2D(0, 0, viewport.clientWidth, viewport.clientHeight);
		this.zoomBoundsPath.getObject().setScreenBounds(screenBounds, true);
	}

	updateControlPositions()
	{
		if (this.toolPath.push("showZoomControls").getState())
		{
			jquery(this.element).find(".ol-control.panCluster").css({top: "0.5em", left: "0.5em"});
			jquery(this.element).find(".ol-control.ol-zoom").css({top: "5.5em", left: "2.075em"});
			jquery(this.element).find(".ol-control.ol-zoomslider").css({top: "9.25em", left: "2.075em"});
			jquery(this.element).find(".ol-control.iModeCluster").css({top: "20.75em", left: "0.6em"});
		}
		else
		{
			jquery(this.element).find(".ol-control");
		}
	}


	onMouseModeControlToggle()
	{
		let showMouseModeControls = this.toolPath.push("showMouseModeControls").getState();
		if (showMouseModeControls)
		{
			this.map.addControl(this.mouseModeButtons);
		}
		else
		{
			this.map.removeControl(this.mouseModeButtons);
		}
		this.updateControlPositions();
	}


	onZoomControlToggle()
	{
		let showZoomControls = this.toolPath.push("showZoomControls").getState();
		if (showZoomControls)
		{
			this.map.addControl(this.slider);
			this.map.addControl(this.pan);
			this.map.addControl(this.zoomButtons);
		}
		else
		{
			this.map.removeControl(this.slider);
			this.map.removeControl(this.pan);
			this.map.removeControl(this.zoomButtons);
		}
		this.updateControlPositions();
	}

	setSessionCenter()
	{
		var [xCenter, yCenter] = this.map.getView().getCenter();

		var zoomBounds = this.zoomBoundsPath.getObject();
		// remove callback temporarily to avoid triggering due to rounding error?
		// TODO - avoid rounding error
		this.zoomBoundsPath.removeCallback(this, this.getSessionCenter);

		var dataBounds = new weavejs.geom.Bounds2D();
		zoomBounds.getDataBounds(dataBounds);
		dataBounds.setXCenter(xCenter);
		dataBounds.setYCenter(yCenter);
		zoomBounds.setDataBounds(dataBounds);

		this.zoomBoundsPath.addCallback(this, this.getSessionCenter);
	}

	setSessionZoom()
	{
		var resolution = this.map.getView().getResolution();

		var zoomBounds = this.zoomBoundsPath.getObject();
		// remove callback temporarily to avoid triggering due to rounding error?
		// TODO - avoid rounding error
		this.zoomBoundsPath.removeCallback(this, this.getSessionCenter);

		var dataBounds = new weavejs.geom.Bounds2D();
		var screenBounds = new weavejs.geom.Bounds2D();
		zoomBounds.getDataBounds(dataBounds);
		zoomBounds.getScreenBounds(screenBounds);
		dataBounds.setWidth(screenBounds.getWidth() * resolution);
		dataBounds.setHeight(screenBounds.getHeight() * resolution);
		dataBounds.makeSizePositive();
		zoomBounds.setDataBounds(dataBounds);

		this.zoomBoundsPath.addCallback(this, this.getSessionCenter);
	}

	getSessionCenter()
	{
		var zoomBounds = this.zoomBoundsPath.getObject();
		var dataBounds = new weavejs.geom.Bounds2D();
		zoomBounds.getDataBounds(dataBounds);
		var center = [dataBounds.getXCenter(), dataBounds.getYCenter()];
		var scale = zoomBounds.getXScale();

		this.map.getView().un("change:center", this.setSessionCenter, this);
		this.map.getView().un("change:resolution", this.setSessionZoom, this);

		this.map.getView().setCenter(center);
		this.map.getView().setResolution(1 / scale);

		lodash.defer(() => {
			this.map.getView().on("change:center", this.setSessionCenter, this);
			this.map.getView().on("change:resolution", this.setSessionZoom, this);
		});
	}

	plottersChanged()
	{
		var oldNames = Array.from(this.layers.keys());
		var newNames = this.plottersPath.getNames();

		var removedNames = lodash.difference(oldNames, newNames);
		var addedNames = lodash.difference(newNames, oldNames);

		removedNames.forEach(function (name) {
			if (this.layers.get(name)) {
				this.layers.get(name).dispose();
			}
			this.layers.delete(name);
		}, this);

		addedNames.forEach(function (name) {
			// ???
		}, this);
		/* */
		for (let idx in newNames)
		{
			let layer:Layer = this.layers.get(newNames[idx]);

			if (!layer || !layer.olLayer) {
				continue;
			}

			layer.olLayer.setZIndex(idx + 2);
		}
	}

	destroy()
	{

	}
}

export default WeaveOpenLayersMap;
registerToolImplementation("weave.visualization.tools::MapTool", WeaveOpenLayersMap);
//Weave.registerClass("weave.visualization.tools::MapTool", WeaveOpenLayersMap, [weavejs.api.core.ILinkableObjectWithNewProperties]);
