import {registerToolImplementation} from "../WeaveTool.jsx";
import ol from "openlayers";
import lodash from "lodash";
import jquery from "jquery";

import AbstractWeaveTool from "./AbstractWeaveTool.jsx";

/* eslint-disable */
import Layer from "./map/layers/Layer.js";
import FeatureLayer from "./map/layers/FeatureLayer.js";
import GeometryLayer from "./map/layers/GeometryLayer.js";
import TileLayer from "./map/layers/TileLayer.js";
import ImageGlyphLayer from "./map/layers/ImageGlyphLayer.js";
import ScatterPlotLayer from "./map/layers/ScatterPlotLayer.js";
/* eslint-enable */

import {PanCluster, InteractionModeCluster} from "./map/controls.js";
import weaveMapInteractions from "./map/interactions.js";

class WeaveOpenLayersMap extends AbstractWeaveTool {

	constructor(props)
	{
		super(props);

		this.layers = {};
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

		this.getSessionCenterBound = this.getSessionCenter.bind(this);

		this.toolPath.push("projectionSRS").addCallback(this.onProjectionChanged.bind(this), true);
		this.toolPath.push("showZoomControls").addCallback(this.onZoomControlToggle.bind(this), true);
		this.toolPath.push("showMouseModeControls").addCallback(this.onMouseModeControlToggle.bind(this), true);

		this.mouseModeButtons = new InteractionModeCluster({interactionModePath: this.interactionModePath});

		this.plottersPath = this.toolPath.push("children", "visualization", "plotManager", "plotters");
		this.layerSettingsPath = this.toolPath.push("children", "visualization", "plotManager", "layerSettings");
		this.zoomBoundsPath = this.toolPath.push("children", "visualization", "plotManager", "zoomBounds");

		this.plottersPath.getValue("childListCallbacks.addGroupedCallback")(null, this.plottersChanged.bind(this), true);

		this.zoomBoundsPath.addCallback(this.getSessionCenterBound, true);
	}

	onProjectionChanged()
	{
		let projectionSRS = this.toolPath.push("projectionSRS").getState() || "EPSG:3857";
		let view = new ol.View({projection: projectionSRS});

		this.centerCallbackHandle = view.on("change:center", this.setSessionCenter, this);
		this.resolutionCallbackHandle = view.on("change:resolution", this.setSessionZoom, this);
		this.map.setView(view);

		this.getSessionCenter();
	}

	resize() {this.map.updateSize(); }

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

		this.zoomBoundsPath.removeCallback(this.getSessionCenterBound);

		this.zoomBoundsPath
			.vars({xCenter, yCenter})
			.getValue(
				"var tmp_data_bounds = new Bounds2D();" +
				"getDataBounds(tmp_data_bounds);" +
				"tmp_data_bounds.setXCenter(xCenter);" +
				"tmp_data_bounds.setYCenter(yCenter);" +
				"setDataBounds(tmp_data_bounds);"
			);

		this.zoomBoundsPath.addCallback(this.getSessionCenterBound);
	}

	setSessionZoom()
	{
		var resolution = this.map.getView().getResolution();

		this.zoomBoundsPath.removeCallback(this.getSessionCenterBound);

		this.zoomBoundsPath
			.vars({resolution}).getValue(
				"tmp_data_bounds = new Bounds2D();" +
				"tmp_screen_bounds = new Bounds2D();" +
				"getDataBounds(tmp_data_bounds);" +
				"getScreenBounds(tmp_screen_bounds);" +
				"tmp_data_bounds.setWidth(tmp_screen_bounds.getWidth() * resolution);" +
				"tmp_data_bounds.setHeight(tmp_screen_bounds.getHeight() * resolution);" +
				"tmp_data_bounds.makeSizePositive();" +
				"setDataBounds(tmp_data_bounds);");

		this.zoomBoundsPath.addCallback(this.getSessionCenterBound);

	}

	getSessionCenter()
	{
		var center = this.zoomBoundsPath.getValue(
				"tmp_bounds = new Bounds2D();" +
				"getDataBounds(tmp_bounds);" +
				"[tmp_bounds.getXCenter(), tmp_bounds.getYCenter()];");

		var scale = this.zoomBoundsPath.getValue("getXScale()");

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
		var oldNames = lodash.keys(this.layers);
		var newNames = this.plottersPath.getNames();

		var removedNames = lodash.difference(oldNames, newNames);
		var addedNames = lodash.difference(newNames, oldNames);

		removedNames.forEach(function (name) {
			if (this.layers[name]) { this.layers[name].destroy(); }
			delete this.layers[name];
		}, this);

		addedNames.forEach(function (name) {
			this.layers[name] = Layer.newLayer(this, name);
		}, this);
		/* */
		for (let idx in newNames)
		{
			let layer = this.layers[newNames[idx]];

			if (!layer || !layer.layer) {
				continue;
			}

			layer.layer.setZIndex(idx + 2);
		}
	}

	destroy()
	{

	}
}

export default WeaveOpenLayersMap;

registerToolImplementation("weave.visualization.tools::MapTool", WeaveOpenLayersMap);
