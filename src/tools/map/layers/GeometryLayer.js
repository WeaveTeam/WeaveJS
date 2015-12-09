import ol from "openlayers";
import {registerLayerImplementation} from "./Layer.js";
import FeatureLayer from "./FeatureLayer.js";

class GeometryLayer extends FeatureLayer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.geoJsonParser = new ol.format.GeoJSON();

		this.geoColumnPath = this.layerPath.push("geometryColumn");
		this.fillStylePath = this.layerPath.push("fill");
		this.lineStylePath = this.layerPath.push("line");

		this.boundUpdateGeo = this.updateGeometryData.bind(this);
		this.boundUpdateStyleData = this.updateStyleData.bind(this);

		this.geoColumnPath.addCallback(this.boundUpdateGeo, true);

		this.fillStylePath.addCallback(this.boundUpdateStyleData);
		this.lineStylePath.addCallback(this.boundUpdateStyleData, true);
	}

	updateGeometryData()
	{
		var metadata = this.geoColumnPath.push("internalDynamicColumn", "ReferencedColumn", "metadata").getState();
		var dataProjection = metadata.projection || "EPSG:4326";
		var featureProjection = this.geoColumnPath.push("projectionSRS").getState() || "EPSG:4326";
		this.source.clear();

		var keys = this.geoColumnPath.getKeys();
		var rawGeometries = this.geoColumnPath.push("internalDynamicColumn").getValue("ColumnUtils.getGeoJsonGeometries(this, this.keys)");

		for (let idx = 0; idx < keys.length; idx++)
		{
			let id = keys[idx];

			let geometry = this.geoJsonParser.readGeometry(rawGeometries[idx], {dataProjection, featureProjection});

			let feature = new ol.Feature({geometry});
			feature.setId(id);

			this.source.addFeature(feature);
		}

		this.updateStyleData();
		this.updateFilteredKeySet();
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
			let olStroke = FeatureLayer.olStrokeFromWeaveStroke(record.stroke);
			let olFill = FeatureLayer.olFillFromWeaveFill(record.fill);

			let olStrokeFaded = FeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
			let olFillFaded = FeatureLayer.olFillFromWeaveFill(record.fill, 0.5);

			let normalStyle = [new ol.style.Style({
				fill: olFill,
				stroke: olStroke,
				zIndex: 0
			})];

			let unselectedStyle = [new ol.style.Style({
				fill: olFillFaded,
				stroke: olStrokeFaded,
				zIndex: 0
			})];

			let selectedStyle = FeatureLayer.getOlSelectionStyle(olStroke);
			let probedStyle = FeatureLayer.getOlProbedStyle(olStroke);

			let feature = this.source.getFeatureById(record.id);

			if (feature)
			{
				feature.setProperties({normalStyle, unselectedStyle, selectedStyle, probedStyle});
			}
		}
	}
}

export default GeometryLayer;

registerLayerImplementation("weave.visualization.plotters::GeometryPlotter", GeometryLayer);
