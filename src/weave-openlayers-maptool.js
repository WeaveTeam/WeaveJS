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
			//case "weave.visualization.plotters::GeometryPlotter":
			//	return new GeometryLayer(parent, layerName);
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
		this.source = new ol.source.Vector();
		this.layer.setSource(this.source);

		/* Build a new set of point geometries and style them based on the properties in question */

		this.boundUpdateLocations = this.updateLocations.bind(this);
		this.boundUpdateImages = this.updateImages.bind(this);

		this.layerPath.push("dataX").addCallback(this.boundUpdateLocations, true);
		this.layerPath.push("dataY").addCallback(this.boundUpdateLocations, true);
		this.layerPath.push("imageSize").addCallback(this.boundUpdateImages, true);
		this.layerPath.push("imageURL").addCallback(this.boundUpdateImages, true);
	}

	_getFeatureIds() {
		return lodash.map(this.source.getFeatures(), (item) => item.getId());
	}

	static _toPoint(datum, field1, field2) {
		if (typeof datum === "object")
		{
			let firstPoly = datum[0];
			return (firstPoly.bounds[field1] + firstPoly.bounds[field2]) / 2;
		}
		else
		{
			return datum;
		}
	}

	updateLocations() {
		/* Update feature locations */
		var records = this.layerPath.retrieveRecords(["dataX", "dataY"], this.layerPath.push("dataX"));

		var recordIds = lodash.pluck(records, "id");

		var removedIds = lodash.difference(this._getFeatureIds(), recordIds);

		var rawProj = ol.proj.get("EPSG:4326");
		var mapProj = this.parent.map.getView().getProjection();

		console.log({recordIds, removedIds, records});

		for (let id of removedIds)
		{
			let feature = this.source.getFeatureById(id);
			this.source.removeFeature(feature);
		}

		for (let record of records)
		{
			let feature = this.source.getFeatureById(record.id);

			if (!feature)
			{
				feature = new ol.Feature({});
				feature.setId(record.id);
				this.source.addFeature(feature);
			}

			let dataX, dataY;

			dataX = GlyphLayer._toPoint(record.dataX, "xMin", "xMax");
			dataY = GlyphLayer._toPoint(record.dataY, "yMin", "yMax");

			let point = new ol.geom.Point([dataX, dataY]);
			point.transform(rawProj, mapProj);
			feature.setGeometry(point);
		}
	}

	updateImages() {
		/* Update feature styles */
		console.log("updateImages()");
		var records = this.layerPath.retrieveRecords(["imageURL", "imageSize"], this.layerPath.push("dataX"));

		var recordIds = lodash.pluck(records, "id");

		var removedIds = lodash.difference(this._getFeatureIds(), recordIds);

		console.log({records, recordIds, removedIds});

		/* Unset style for missing points */
		for (let id of removedIds)
		{
			if (!id)
			{
				continue;
			}
			let feature = this.source.getFeatureById(id);

			if (!feature)
			{
				continue;
			}

			feature.setStyle(null);
		}

		console.log("hello");

		/* Update style for everyone else */

		for (let record of records)
		{
			let feature = this.source.getFeatureById(record.id);
			let id = record.id;
			let imageURL = record.imageURL;
			let imageSize = record.imageSize;
			console.log({id, imageURL, imageSize});

			if (!feature)
			{
				feature = new ol.Feature({});
				feature.setId(id);
				this.source.addFeature(feature);
			}

			if (!imageURL)
			{
				feature.setStyle(null);
				continue;
			}

			let style = new ol.style.Style({
				image: new ol.style.Icon({
					src: imageURL,
					opacity: 1
				})
			});

			console.log(style);

			feature.setStyle(style);
		}
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
		this.getSessionCenterBound = this.getSessionCenter.bind(this);

		this.zoomBoundsPath.addCallback(this.getSessionCenterBound, true);

		this.centerCallbackHandle = this.map.getView().on("change:center", this.setSessionCenter, this);
		this.resolutionCallbackHandle = this.map.getView().on("change:resolution", this.setSessionZoom, this);

		this.plottersPath.getValue("childListCallbacks.addGroupedCallback")(null, this.plottersChanged.bind(this), true);
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
