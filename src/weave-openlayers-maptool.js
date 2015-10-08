import {registerToolImplementation} from "./WeaveTool.jsx";
import ol from "openlayers";
import lodash from "lodash";

/* Use ol.FeatureOverlay for probing */

class Layer {


	constructor(parent, layerName)
	{
		this.layerPath = parent.plottersPath.push(layerName);
		this.settingsPath = parent.layerSettingsPath.push(layerName);
		this.parent = parent;
		this.layerName = layerName;
		this.layer = null;
		this._layerReadyCallbacks = {};

		this.linkProperty(this.settingsPath.push("alpha"), "opacity");
		this.linkProperty(this.settingsPath.push("visible"), "visible");
		/* TODO max and minvisiblescale, map to min/max resolution. */
	}

	/* Handles initial apply of linked properties, adding/removing from map */
	set layer(value) {
		if (this._layer != null) {
			this.parent.map.removeLayer(this._layer);
		}

		this._layer = value;

		if (value) {
			this.parent.map.addLayer(value);

			if (value) {
				for (let name in this._layerReadyCallbacks) {
					this._layerReadyCallbacks[name]();
				}
			}
		}
	}

	get layer() {
		return this._layer;
	}

	linkProperty(propertyPath, propertyName, inTransform)
	{
		/* change in path modifying propertyName */
		inTransform = inTransform || lodash.identity;

		var callback = () => {
				if (this.layer) {
					this.layer.set(propertyName, inTransform(propertyPath.getState()));
				}
			};

		this._layerReadyCallbacks[propertyName] = callback;

		propertyPath.addCallback(callback, false, false);
	}

	static newLayer(parent, layerName)
	{
		var layerType = parent.plottersPath.push(layerName).getType();
		switch (layerType)
		{
			case "weave.visualization.plotters::GeometryPlotter":
				return new GeometryLayer(parent, layerName);
			case "weave.visualization.plotters::ImageGlyphPlotter":
				return new GlyphLayer(parent, layerName);
			case "weave.visualization.plotters::WMSPlotter":
				return new TileLayer(parent, layerName);
			default:
				return null;
		}
	}

	destroy()
	{
		this.layer = undefined;
	}
}

class GlyphLayer extends Layer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.layer = new ol.layer.Vector();
		/* Build a new set of point geometries and style them based on the properties in question */
	}
}

class TileLayer extends Layer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.layer = new ol.layer.Tile();
		this.servicePath = this.layerPath.push("service", null);
		this.oldProviderName = null;

		this.servicePath.addCallback(this.updateTileSource.bind(this), true);
	}


	getCustomWMSSource()
	{
		var customWMSPath = this.servicePath;

		if (customWMSPath.push("wmsURL").getType()) {
			let url = customWMSPath.getState("wmsURL");
			let attributions = customWMSPath.getState("creditInfo");
			let projection = customWMSPath.getState("tileProjectionSRS");

			return new ol.source.XYZ({
				url, attributions, projection
			});
		}
	}

	getModestMapsSource()
	{
		var providerNamePath = this.servicePath.push("providerName");

		if (providerNamePath.getType()) {
			let providerName = providerNamePath.getState();

			if (providerName === this.oldProviderName) {
				return undefined;
			}

			switch (providerName)
			{
				case "Stamen WaterColor":
					return new ol.source.Stamen({layer: "watercolor", wrapX: false});
				case "Stamen Toner":
					return new ol.source.Stamen({layer: "toner", wrapX: false});
				case "Open MapQuest Aerial":
					return new ol.source.MapQuest({layer: "sat", wrapX: false});
				case "Open MapQuest":
					return new ol.source.MapQuest({layer: "osm", wrapX: false});
				case "Open Street Map":
					return new ol.source.OSM({wrapX: false});
				case "Blue Marble Map":
					return new ol.source.TileWMS({url: "http://neowms.sci.gsfc.nasa.gov/wms/wms", wrapX: false});
				default:
					return null;
			}
		}
	}



	updateTileSource()
	{
		var serviceDriverName = this.servicePath.getType();
		var newLayer = null;
		switch (serviceDriverName)
		{
			case "weave.services.wms::ModestMapsWMS":
				newLayer = this.getModestMapsSource();
				break;
			case "weave.services.wms::CustomWMS":
				newLayer = this.getCustomWMSSource();
				break;
			default:
				newLayer = null;
		}

		if (newLayer !== undefined)
		{
			this.layer.setSource(newLayer);
		}
	}
}

class GeometryLayer extends Layer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.layer = new ol.layer.Vector();

		this.geoColumnPath = this.layerPath.push("geometryColumn", "internalDynamicColumn");
		this.colorColumnPath = this.layerPath.push("fill", "color");

		var boundUpdateGeo = this.updateGeometryData.bind(this);

		this.geoColumnPath.addCallback(boundUpdateGeo);
		this.colorColumnPath.addCallback(boundUpdateGeo);
	}

	updateGeometryData()
	{
		var geoJson = this.geoColumnPath.getValue("ColumnUtils.getGeoJson()");
	}
}

export default class WeaveOpenLayersMap {
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

		this.plottersPath = this.toolPath.push("children", "visualization", "plotManager", "plotters");
		this.layerSettingsPath = this.toolPath.push("children", "visualization", "plotManager", "layerSettings");
		this.zoomBoundsPath = this.toolPath.push("children", "visualization", "plotManager", "zoomBounds");


		/* Register layer changes */

		this.layers = {};
		this.zoomBoundsPath.addCallback(this.getSessionCenter.bind(this), true);

		this.map.getView().on("change:center", this.setSessionCenter, this);

		this.plottersPath.getValue("childListCallbacks.addGroupedCallback")(null, this.plottersChanged.bind(this), true);
	}

	setSessionCenter()
	{
		var extents = this.map.getView().calculateExtent(this.map.getSize());

		this.zoomBoundsPath
			.vars({xMin: extents[0], yMin: extents[1],
					xMax: extents[2], yMax: extents[3]})
			.getValue(
				"setBounds(new Bounds2D(xMin, yMin, xMax, yMax));"
			);
	}

	getSessionCenter()
	{
		var rect = this.zoomBoundsPath.getValue(
				"tmp_bounds = new Bounds2D();" +
				"getDataBounds(tmp_bounds);" +
				"tmp_bounds.getRectangle(null, true)");
		var extents = [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height];
		this.map.getView().fit(extents, this.map.getSize());
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

		for (let idx in newNames)
		{
			let layer = this.layers[newNames[idx]];

			if (!layer || !layer.layer) {
				continue;
			}

			layer.layer.setZIndex(idx);
		}
	}

	destroy()
	{

	}
}

registerToolImplementation("weave.visualization.tools::MapTool", WeaveOpenLayersMap);
