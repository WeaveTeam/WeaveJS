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

class PanCluster {
	constructor(optOptions)
	{
		var options = optOptions || {};
		let parent = jquery(`
		<div style="background-color: rgba(0,0,0,0)" class="ol-unselectable ol-control panCluster">
			<table style="font-size:75%">
				<tr>
					<td></td><td class="ol-control" style="position:relative"><button class="panCluster N">N</button></td><td></td>
				</tr>
				<tr>
					<td class="ol-control" style="position:relative"><button class="panCluster W">W</button></td>
					<td class="ol-control" style="position:relative"><button class="panCluster X glyphicon glyphicon-fullscreen"></button></td>
					<td class="ol-control" style="position:relative"><button class="panCluster E">E</button></td>
				</tr>
				<tr>
					<td></td><td class="ol-control" style="position:relative"><button class="panCluster S">S</button></td><td></td>
				</tr>
			</table>
		</div>`);

		var directions = {
			N: [0, 1],
			E: [1, 0],
			S: [0, -1],
			W: [-1, 0],
			X: [null, null]
		};

		let self = this;

		let pan = function (xSign, ySign, event)
		{
			let panPercent = 0.3;
			let map = self.getMap();
			let view = map.getView();
			let extent = view.calculateExtent(map.getSize());

			let extentWidth = Math.abs(extent[0] - extent[2]);
			let extentHeight = Math.abs(extent[1] - extent[3]);

			let center = view.getCenter();

			center[0] += extentWidth * xSign * panPercent;
			center[1] += extentWidth * ySign * panPercent;

			view.setCenter(center);
		};

		let zoomExtent = function (event)
		{
			let map = self.getMap();
			let view = map.getView();
			let extent = view.getProjection().getExtent();
			let size = map.getSize();
			view.fit(extent, size);
		};

		for (let direction in directions)
		{
			let xSign = directions[direction][0];
			let ySign = directions[direction][1];

			let button = parent.find(".panCluster." + direction);

			if (xSign !== null)
			{
				button.click(pan.bind(this, xSign, ySign));
			}
			else
			{
				button.click(zoomExtent.bind(this));
			}

			console.log(direction);
		}

		ol.control.Control.call(this, {element: parent[0], target: options.target});
	}
}

ol.inherits(PanCluster, ol.control.Control);

class InteractionModeCluster {
	constructor (optOptions)
	{
		var options = optOptions || {};
		var buttonTable = jquery(`
			<table class="ol-unselectable ol-control iModeCluster">
				<tr style="font-size: 80%">
					<td><button class="iModeCluster pan fa fa-hand-grab-o"></button></td>
					<td><button class="iModeCluster select fa fa-mouse-pointer"></button></td>
					<td><button class="iModeCluster zoom fa fa-search-plus"></button></td>
				</tr>
			</table>
		`);

		buttonTable.find("button.iModeCluster.pan").click( () => this.getMap().setPanInteraction() );
		buttonTable.find("button.iModeCluster.select").click( () => this.getMap().setScaleInteraction() );
		buttonTable.find("button.iModeCluster.zoom").click( () => this.getMap().setZoomInteraction() );

		ol.control.Control.call(this, {element: buttonTable[0], target: options.target});
	}
}

ol.inherits(InteractionModeCluster, ol.control.Control);

class WeaveOpenLayersMap {

	constructor(props)
	{
		window.debugMapTool = this;
		this.element = props.element;
		this.toolPath = props.toolPath;

		this.zoomButtons = new ol.control.Zoom();
		this.slider = new ol.control.ZoomSlider();

		this.pan = new PanCluster();
		this.mouseModeButtons = new InteractionModeCluster();

		this.map = new ol.Map({
			controls: [],
			target: this.element,
			view: new ol.View({
				center: [0, 0],
				zoom: 0
			})
		});

		this.toolPath.push("showZoomControls").addCallback(this.onZoomControlToggle.bind(this), true);
		this.toolPath.push("showMouseModeControls").addCallback(this.onMouseModeControlToggle.bind(this), true);

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

	resize()
	{
		this.map.updateSize();
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
