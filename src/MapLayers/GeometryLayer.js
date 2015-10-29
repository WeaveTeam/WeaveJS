import ol from "openlayers";
import StandardLib from "../Utils/StandardLib.js";
import {registerLayerImplementation} from "./Layer.js";
import FeatureLayer from "./FeatureLayer.js";


export default class GeometryLayer extends FeatureLayer {
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

		this.subsetFilter = this.layerPath.push("filteredKeySet");

		this.subsetFilter.addCallback(this.boundUpdateGeo);
		this.geoColumnPath.addCallback(this.boundUpdateGeo, true);

		this.fillStylePath.addCallback(this.boundUpdateStyleData);
		this.lineStylePath.addCallback(this.boundUpdateStyleData);

		this.boundUpdateStyleData();
	}

	updateGeometryData()
	{
		var dataProjection = this.geoColumnPath.getState("projectionSRS");
		var featureProjection = this.parent.map.getView().getProjection();
		var keys = this.geoColumnPath.vars({filter: this.subsetFilter}).getValue("filter.keys");
		var rawGeometries = this.geoColumnPath.vars({filter: this.subsetFilter}).getValue("ColumnUtils.getGeoJsonGeometries(this, filter.keys)");

		this.source.clear();

		for (let idx = 0; idx < keys.length; idx++)
		{
			let id = this.geoColumnPath.qkeyToString(keys[idx]);

			let geometry = this.geoJsonParser.readGeometry(rawGeometries[idx], {dataProjection, featureProjection});

			let feature = new ol.Feature({geometry});
			feature.setId(id);

			this.source.addFeature(feature);
		}

		this.updateStyleData();
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
		}, this.subsetFilter);

		this.rawStyles = styleRecords;

		for (let record of styleRecords)
		{
			let weight = Number(record.stroke.weight);
			let SELECT_WIDTH = 5;
			let PROBE_WIDTH = 4;
			let PROBE_LINE = 1;

			let normalFill = new ol.style.Fill({
				color: (record.fill.color && GeometryLayer._toColorArray(record.fill.color, record.fill.alpha)) || [0, 0, 0, 0]
			});

			let normalStyle = [new ol.style.Style({
				fill: new ol.style.Fill({
					color: (record.fill.color && GeometryLayer._toColorArray(record.fill.color, record.fill.alpha)) || [0, 0, 0, 0]
				}),
				stroke: new ol.style.Stroke({
					color: GeometryLayer._toColorArray(record.stroke.color, record.stroke.alpha) || [0, 0, 0, 0.5],
					width: weight,
					lineCap: record.stroke.lineCap === "none" ? "butt" : record.stroke.lineCap || "round",
					lineJoin: record.stroke.lineJoin === null ? "round" : record.stroke.lineJoin || "round",
					miterLimit: Number(record.stroke.miterLimit)
				}),
				zIndex: 0
			})];

			let unselectedStyle = [new ol.style.Style({
				fill: new ol.style.Fill({
					color: (record.fill.color && GeometryLayer._toColorArray(record.fill.color, record.fill.alpha * 0.5)) || [0, 0, 0, 0]
				}),
				stroke: new ol.style.Stroke({
					color: GeometryLayer._toColorArray(record.stroke.color, record.stroke.alpha * 0.5) || [0, 0, 0, 0.5],
					width: weight,
					lineCap: record.stroke.lineCap === "none" ? "butt" : record.stroke.lineCap || "round",
					lineJoin: record.stroke.lineJoin === null ? "round" : record.stroke.lineJoin || "round",
					miterLimit: Number(record.stroke.miterLimit)
				}),
				zIndex: 0
			})];

			let selectedStyle = [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: [0, 0, 0, 0.5],
					width: weight + SELECT_WIDTH,
					lineCap: record.stroke.lineCap === "none" ? "butt" : record.stroke.lineCap || "round",
					lineJoin: record.stroke.lineJoin === null ? "round" : record.stroke.lineJoin || "round",
					miterLimit: Number(record.stroke.miterLimit)
				}),
				zIndex: Number.MAX_SAFE_INTEGER - 4
			})];

			let probedStyle = [
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: [0, 0, 0, 1],
						width: weight + PROBE_WIDTH + PROBE_LINE
					}),
					zIndex: Number.MAX_SAFE_INTEGER - 2
				}),
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: [255, 255, 255, 1],
						width: weight + PROBE_WIDTH
					}),
					zIndex: Number.MAX_SAFE_INTEGER - 1
				})
			];

			let feature = this.source.getFeatureById(record.id);

			if (feature)
			{
				feature.setProperties({normalStyle, unselectedStyle, selectedStyle, probedStyle, normalFill});
			}
		}
		this.updateMetaStyles();
	}
}

registerLayerImplementation("weave.visualization.plotters::GeometryPlotter", GeometryLayer);
