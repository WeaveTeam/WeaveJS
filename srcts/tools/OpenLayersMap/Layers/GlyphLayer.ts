import FeatureLayer from "./FeatureLayer.js";
import lodash from "lodash";
import ol from "openlayers";

class GlyphLayer extends FeatureLayer {

	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.projectionPath.addCallback(this, this.updateLocations);
		this.layerPath.push("sourceProjection").addCallback(this, this.updateLocations);

		this.layerPath.push("dataX").addCallback(this, this.updateLocations);
		this.layerPath.push("dataY").addCallback(this, this.updateLocations, true);
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

		var rawProj = this.layerPath.getState("sourceProjection") || "EPSG:4326";
		var mapProj = this.projectionPath.getState() || "EPSG:3857";

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
		this.updateFilteredKeySet();
		this.updateStyleData();
	}
}

export default GlyphLayer;
