import {registerToolImplementation} from "./WeaveTool.jsx";
import ol from "openlayers";
import lodash from "lodash";
import jquery from "jquery";
import StandardLib from "./Utils/StandardLib.js";

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
		this.linkProperty(this.settingsPath.push("selectable"), "selectable");
		/* TODO max and minvisiblescale, map to min/max resolution. */
	}

	get source() {
		return this.layer && this.layer.getSource();
	}

	set source(value) {
		this.layer.setSource(value);
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
		this.source = new ol.source.Vector({wrapX: false});

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

		var rawProj = this.layerPath.getState("sourceProjection");
		var mapProj = this.parent.map.getView().getProjection();

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

		var records = this.layerPath.retrieveRecords(["imageURL", "imageSize"], this.layerPath.push("dataX"));

		var recordIds = lodash.pluck(records, "id");

		var removedIds = lodash.difference(this._getFeatureIds(), recordIds);

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

		/* Update style for everyone else */

		function setScale(icon, imageSize)
		{
			var maxDim = Math.max(this.naturalHeight, this.naturalWidth);
			icon.setScale(imageSize / maxDim);
		}

		for (let record of records)
		{
			let feature = this.source.getFeatureById(record.id);
			let id = record.id;
			let imageURL = record.imageURL;
			let imageSize = record.imageSize;

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

			let icon = new ol.style.Icon({
				src: imageURL
			});

			let img = icon.getImage();

			jquery(img).one("load", setScale.bind(img, icon, imageSize));

			let style = new ol.style.Style({
				image: icon
			});

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
			this.source = newLayer;
		}
	}
}

class GeometryLayer extends Layer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.layer = new ol.layer.Vector();
		this.source = new ol.source.Vector({wrapX: false});

		this.geoJsonParser = new ol.format.GeoJSON();

		this.geoColumnPath = this.layerPath.push("geometryColumn");
		this.fillStylePath = this.layerPath.push("fill");
		this.lineStylePath = this.layerPath.push("line");
		this.filteredKeySet = this.layerPath.push("filteredKeySet");

		this.boundUpdateGeo = this.updateGeometryData.bind(this);
		this.boundUpdateStyleData = this.updateStyleData.bind(this);

		this.styles = new Map();


		this.geoColumnPath.addCallback(this.boundUpdateGeo, true);
		this.fillStylePath.addCallback(this.boundUpdateStyleData);
		this.lineStylePath.addCallback(this.boundUpdateStyleData);
		this.boundUpdateStyleData();
	}

	updateGeometryData()
	{
		var dataProjection = this.geoColumnPath.getState("projectionSRS");
		var featureProjection = this.parent.map.getView().getProjection();
		var keys = this.geoColumnPath.getValue("this.keys");
		var rawGeometries = this.geoColumnPath.getValue("ColumnUtils.getGeoJsonGeometries(this, this.keys)");

		this.source.clear();

		for (let idx = 0; idx < keys.length; idx++)
		{
			let id = this.geoColumnPath.qkeyToString(keys[idx]);

			let geometry = this.geoJsonParser.readGeometry(rawGeometries[idx], {dataProjection, featureProjection});
			let style = this.styles.get(id);

			let feature = new ol.Feature({geometry});
			feature.setId(id);
			feature.setStyle(style);

			this.source.addFeature(feature);
		}
	}

	static _toColorArray(colorString, alpha)
	{
		var colorArray;
		if (colorString[0] === "#")
		{
			colorArray = ol.color.asArray(colorString);
		}
		else
		{
			colorArray = ol.color.asArray("#" + StandardLib.decimalToHex(Number(colorString)));
		}

		colorArray = [].concat(colorArray); /* Should not be modified since it is cached in ol.color.asArray */

		if (!colorArray) {
			console.error("Failed to convert color:", colorString, alpha);
			return null;
		}

		colorArray[3] = Number(alpha);
		return colorArray;
	}



	updateStyleData()
	{
		var styleRecords = this.layerPath.retrieveRecords({
			fill: {
				color: this.fillStylePath.push("color"),
				alpha: this.fillStylePath.push("alpha"),
				imageURL: this.fillStylePath.push("imageURL")
			},
			stroke: {
				color: this.lineStylePath.push("color"),
				alpha: this.lineStylePath.push("alpha"),
				weight: this.lineStylePath.push("weight"),
				lineCap: this.lineStylePath.push("caps"),
				lineJoin: this.lineStylePath.push("joints"),
				miterLimit: this.lineStylePath.push("miterLimit")
			}
		}, this.geoColumnPath);

		this.rawStyles = styleRecords;

		for (let record of styleRecords)
		{
			let style = new ol.style.Style({
				fill: new ol.style.Fill({
					color: (record.fill.color && GeometryLayer._toColorArray(record.fill.color, record.fill.alpha)) || [0, 0, 0, 0]
				}),
				stroke: new ol.style.Stroke({
					color: GeometryLayer._toColorArray(record.stroke.color, record.stroke.alpha) || [0, 0, 0, 0.5],
					width: Number(record.stroke.weight),
					lineCap: record.stroke.lineCap === "none" ? "butt" : record.stroke.lineCap || "round",
					lineJoin: record.stroke.lineJoin === null ? "round" : record.stroke.lineJoin || "round",
					miterLimit: Number(record.stroke.miterLimit)
				})
			});

			this.styles.set(record.id, style);

			let feature = this.source.getFeatureById(record.id);

			if (feature)
			{
				feature.setStyle(style);
			}
		}
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

		this.selectInteraction = new ol.interaction.Select({
			layers: (layer) => layer.get("selectable"),
			wrapX: false,
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({width: 10})
			})
		});

		this.probeInteraction = new ol.interaction.Select({
			condition: ol.events.condition.pointerMove,
			wrapX: false,
			layers: (layer) => layer.get("selectable")
//			style: WeaveOpenLayersMap.probeStyleFunction
		});

		this.map.addInteraction(this.selectInteraction);
		//this.map.addInteraction(this.probeInteraction);

		this.probeKeyset = this.toolPath.probe_keyset;
		this.selectionKeyset = this.toolPath.selection_keyset;
		this.subsetFilter = this.toolPath.subset_filter;

		this.selectionKeyset.addCallback(this.fromSessionKeysToInteraction.bind(this, this.selectionKeyset, this.selectInteraction));
		//this.probeKeyset.addKeySetCallback(this.fromSessionKeysToInteraction.bind(this, this.probeKeyset, this.probeInteraction));

		this.selectInteraction.on("select", this.fromInteractionToSessionKeys.bind(this, this.selectionKeyset));
		//this.probeInteraction.on("select", this.fromInteractionToSessionKeys.bind(this, this.probeKeyset));
	}

	static selectStyleFunction(feature, resolution) {

	}

	static probeStyleFunction(feature, resolution) {

	}

	getFeaturesById(ids) {
		let features = [];
		for (let layerName in this.layers)
		{
			let source = this.layers[layerName].source;
			if (!source || !source.getFeatureById)
			{
				console.log(layerName + " lacks a source, skipping.");
				continue;
			}
			for (let key of ids)
			{
				let feature = source.getFeatureById(key);
				if (feature)
				{
					features.push(feature);
				}
				else
				{
					console.log("no feature " + key + " found in layer " + layerName);
				}
			}
		}
		return features;
	}

	fromSessionKeysToInteraction(keySetPath, interaction)
	{
		let featureCollection = interaction.getFeatures();
		let keys = keySetPath.getKeys();
		let selectedFeatures;

		featureCollection.clear();

		selectedFeatures = this.getFeaturesById(keys);
		featureCollection.extend(selectedFeatures);
	}

	fromInteractionToSessionKeys(keySetPath, event)
	{

		let selectedKeys = lodash.map(event.selected, (feature) => feature.getId());
		let deselectedKeys = lodash.map(event.deselected, (feature) => feature.getId());

		keySetPath.addKeys(selectedKeys);
		keySetPath.removeKeys(deselectedKeys);
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
