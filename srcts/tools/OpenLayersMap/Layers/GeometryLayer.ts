import * as ol from "openlayers";
import FeatureLayer from "./FeatureLayer";

declare var weavejs:any;
declare var Weave:any;

class GeometryLayer extends FeatureLayer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.geoJsonParser = new ol.format.GeoJSON();

		this.geoColumnPath = this.layerPath.push("geometryColumn");
		this.fillStylePath = this.layerPath.push("fill");
		this.lineStylePath = this.layerPath.push("line");

		this.geoColumnPath.addCallback(this, this.updateGeometryData, true);
		this.projectionPath.addCallback(this, this.updateGeometryData, true);

		this.fillStylePath.addCallback(this, this.updateStyleData);
		this.lineStylePath.addCallback(this, this.updateStyleData, true);
	}

	handleMissingSessionStateProperties(newState)
	{

	}

	updateGeometryData()
	{
		var projectionSpec = this.geoColumnPath.getObject("internalDynamicColumn", null).getMetadata('projection');
	
		var outputProjection = this.projectionPath.getState() || "EPSG:3857";
		var inputProjection = projectionSpec || outputProjection;

		this.source.clear();

		var keys = this.geoColumnPath.push('internalDynamicColumn').getKeys();
		var idc = this.geoColumnPath.getObject("internalDynamicColumn");
		var rawGeometries = weavejs.data.ColumnUtils.getGeoJsonGeometries(idc, idc.keys);

		for (let idx = 0; idx < keys.length; idx++)
		{
			let id = keys[idx];

			let geometry = this.geoJsonParser.readGeometry(rawGeometries[idx], {dataProjection: inputProjection, featureProjection: outputProjection});

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

Weave.registerClass("weave.visualization.plotters::GeometryPlotter", GeometryLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
