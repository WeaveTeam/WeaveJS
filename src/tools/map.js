import {registerToolImplementation} from "../WeaveTool.jsx";
import ol from "openlayers";
import lodash from "lodash";
import jquery from "jquery";

/* eslint-disable */
import Layer from "./map/layers/Layer.js";
import FeatureLayer from "./map/layers/FeatureLayer.js";
import GeometryLayer from "./map/layers/GeometryLayer.js"; 
import TileLayer from "./map/layers/TileLayer.js";
import GlyphLayer from "./map/layers/GlyphLayer.js";
/* eslint-enable */

import {PanCluster, InteractionModeCluster} from "./map/controls.js";

class WeaveOpenLayersMap {

	constructor(props)
	{
		window.debugMapTool = this;
		this.element = props.element;
		this.toolPath = props.toolPath;

		this.zoomButtons = new ol.control.Zoom();
		this.slider = new ol.control.ZoomSlider();

		this.pan = new PanCluster();
		this.mouseModeButtons = new InteractionModeCluster({weaveMap: this});

		this.map = new ol.Map({
			interactions: ol.interaction.defaults({dragPan: false}),
			controls: [],
			target: this.element,
			view: new ol.View({
				center: [0, 0],
				zoom: 0
			})
		});

		this.dragPan = new ol.interaction.DragPan();
		this.dragZoom = new ol.interaction.DragZoom({condition: ol.events.condition.always});
		this.dragSelect = new ol.interaction.DragBox();

		this.dragSelect.on('boxstart', function (e) {

		}, this);
		this.dragSelect.on('boxend', function (e) {
			let extent = this.dragSelect.getGeometry().getExtent();
			let selectedFeatures = new Set();
			let alteredKeySets = new Set();
			let selectFeature = (feature) => { selectedFeatures.add(feature.getId()); };

			for (let weaveLayerName in this.layers)
			{
				let weaveLayer = this.layers[weaveLayerName];
				let olLayer = weaveLayer.layer;
				console.log(olLayer.getProperties());
				let selectable = olLayer.get("selectable");

				if (weaveLayer instanceof FeatureLayer && selectable)
				{
					let keySet = weaveLayer.selectionKeySet;
					let keySetString = JSON.stringify(keySet.getPath());
					let source = olLayer.getSource();

					if (!alteredKeySets.has(keySetString))
					{
						keySet.setKeys([]);	
					}
					alteredKeySets.add(keySetString);

					source.forEachFeatureIntersectingExtent(extent, selectFeature);
					weaveLayer.selectionKeySet.addKeys(Array.from(selectedFeatures));
				}
			}
		}, this);

		this.map.addInteraction(this.dragPan);
		this.map.addInteraction(this.dragZoom);
		this.map.addInteraction(this.dragSelect);

		this.toolPath.push("showZoomControls").addCallback(this.onZoomControlToggle.bind(this), true);
		this.toolPath.push("showMouseModeControls").addCallback(this.onMouseModeControlToggle.bind(this), true);
		this.interactionModePath = this.toolPath.weave.path("WeaveProperties", "toolInteractions", "defaultDragMode")
			.addCallback(this.onInteractionModeChange.bind(this), true);

		this.map.addInteraction(new ol.interaction.Pointer({
			handleMoveEvent: this.onMouseMove.bind(this)
		}));

		this.plottersPath = this.toolPath.push("children", "visualization", "plotManager", "plotters");
		this.layerSettingsPath = this.toolPath.push("children", "visualization", "plotManager", "layerSettings");
		this.zoomBoundsPath = this.toolPath.push("children", "visualization", "plotManager", "zoomBounds");

		/* Register layer changes */

		this.layers = {};
		this.getSessionCenterBound = this.getSessionCenter.bind(this);

		this.zoomBoundsPath.addCallback(this.getSessionCenterBound, true);

		this.centerCallbackHandle = this.map.getView().on("change:center", this.setSessionCenter, this);
		this.resolutionCallbackHandle = this.map.getView().on("change:resolution", this.setSessionZoom, this);

		this.plottersPath.getValue("childListCallbacks.addGroupedCallback")(null, this.plottersChanged.bind(this), true);
	}

	resize() {this.map.updateSize(); }

	setPanInteraction() {this.interactionModePath.state("pan"); }

	setSelectInteraction() {this.interactionModePath.state("select"); }

	setZoomInteraction() {this.interactionModePath.state("zoom"); }

	onInteractionModeChange()
	{
		console.log("onInteractionModeChange");
		let interactionMode = this.interactionModePath.getState();

		this.dragPan.setActive(interactionMode === "pan");
		this.dragSelect.setActive(interactionMode === "select");
		this.dragZoom.setActive(interactionMode === "zoom");

		console.log({
			dragPan: this.dragPan.getActive(),
			dragSelect: this.dragSelect.getActive(),
			dragZoom: this.dragZoom.getActive()
		});
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
		console.log("showZoomControls", showZoomControls);
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

	onMouseMove(event)
	{
		let keySetMap = new Map();
		this.map.forEachFeatureAtPixel(event.pixel,
			function (feature, layer)
			{
				let weaveLayerObject = layer.get("layerObject");
				let tmpKeySet = keySetMap.get(weaveLayerObject.probeKeySet);

				if (!tmpKeySet)
				{
					if (!weaveLayerObject.probeKeySet)
					{
						return;
					}
					tmpKeySet = new Set();
					keySetMap.set(weaveLayerObject.probeKeySet, tmpKeySet);
				}

				tmpKeySet.add(feature.getId());
			},
			function (layer)
			{
				return layer.getSelectable() && layer instanceof FeatureLayer;
			});

		for (let weaveKeySet of keySetMap.keys())
		{
			let keySet = keySetMap.get(weaveKeySet);
			weaveKeySet.setKeys(Array.from(keySet));
		}
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
