///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/WeavePath.d.ts"/>

import FeatureLayer from "./FeatureLayer";
import * as lodash from "lodash";
import * as ol from "openlayers";

abstract class GlyphLayer extends FeatureLayer {

	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.projectionPath.addCallback(this, this.updateLocations);
		this.layerPath.push("sourceProjection").addCallback(this, this.updateLocations);

		this.layerPath.push("dataX").addCallback(this, this.updateLocations);
		this.layerPath.push("dataY").addCallback(this, this.updateLocations, true);

		(<any>this.filteredKeySet).setColumnKeySources([this.layerPath.push("dataX").getObject(), this.layerPath.push("dataY").getObject()]);
	}

	_getFeatureIds() {
		return lodash.map(this.source.getFeatures(), (item:ol.Feature) => item.getId());
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

		var rawProj = this.layerPath.getState("sourceProjection") || this.layerPath.getObject("dataX").getMetadata("projection") || "EPSG:4326";
		var mapProj = this.projectionPath.getState() || "EPSG:3857";

		for (let id of removedIds)
		{
			let feature = this.source.getFeatureById(id);
			this.source.removeFeature(feature);
		}

		for (let record of records)
		{
			let dataX, dataY;

			dataX = GlyphLayer._toPoint(record.dataX, "xMin", "xMax");
			dataY = GlyphLayer._toPoint(record.dataY, "yMin", "yMax");

			let point = new ol.geom.Point([dataX, dataY]);
			point.transform(rawProj, mapProj);
			
			var coords = point.getCoordinates();
			if (!isFinite(coords[0]) || !isFinite(coords[1]))
				continue;
			
			let feature = this.source.getFeatureById(record.id);
			if (!feature)
			{
				feature = new ol.Feature({});
				feature.setId(record.id);
				this.source.addFeature(feature);
			}
			feature.setGeometry(point);
		}
		this.updateStyleData();
		this.updateMetaStyles();
	}
}

export default GlyphLayer;
