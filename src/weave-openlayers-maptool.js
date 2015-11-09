import {registerToolImplementation} from "./WeaveTool.jsx";
import ol from "openlayers";
import lodash from "lodash";

/* eslint-disable */
import Layer from "./MapLayers/Layer.js";
import FeatureLayer from "./MapLayers/FeatureLayer.js";
import GeometryLayer from "./MapLayers/GeometryLayer.js"; 
import TileLayer from "./MapLayers/TileLayer.js";
import GlyphLayer from "./MapLayers/GlyphLayer.js";
/* eslint-enable */



class WeaveOpenLayersMap {

	constructor(props)
	{
		window.debugMapTool = this;
		this.element = props.element;
		this.toolPath = props.toolPath;

		this.map = new ol.Map({
			target: this.element,
			view: new ol.View({
				center: [0, 0],
				zoom: 0
			})
		});

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
		/* TODO: Make sure this doesn't actually overfill the element */
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
