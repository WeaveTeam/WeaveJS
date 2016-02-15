///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import FeatureLayer from "./FeatureLayer";
import * as lodash from "lodash";
import * as ol from "openlayers";

import WeavePathData = weavejs.path.WeavePathData;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import LinkableString = weavejs.core.LinkableString;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

interface LocationRecord {
	dataX: Array<any>;
	dataY: Array<any>;
	id: IQualifiedKey;
}

abstract class GlyphLayer extends FeatureLayer {

	dataX: DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	dataY: DynamicColumn = Weave.linkableChild(this, DynamicColumn);
	sourceProjection: LinkableString = Weave.linkableChild(this, LinkableString);

	constructor()
	{
		super();

		/* TODO: Register a callback on the parent's projection. */
		// this.projectionPath.addCallback(this, this.updateGeometryData);

		this.sourceProjection.addGroupedCallback(this, this.updateLocations);

		this.dataX.addGroupedCallback(this, this.updateLocations);
		this.dataY.addGroupedCallback(this, this.updateLocations, true);

		(<any>this.filteredKeySet).setColumnKeySources([this.dataX, this.dataY]);
	}

	_getFeatureIds() {
		return lodash.map(this.source.getFeatures(), (item:ol.Feature) => item.getId());
	}

	static _toPoint(data:Array<any>, field1:any, field2:any):any {
		let firstDatum = data[0];
		if (typeof firstDatum === "object")
		{
			return (firstDatum.bounds[field1] + firstDatum.bounds[field2]) / 2;
		}
		else
		{
			return firstDatum;
		}
	}

	updateProjection():void {
		this.updateLocations();
	}

	updateLocations() {
		/* Update feature locations */
		var recordIds = this.dataX.keys;
		var records:Array<LocationRecord> = weavejs.data.ColumnUtils.getRecords({ "dataX": this.dataX, "dataY": this.dataY }, recordIds);
		var removedIds = lodash.difference(this._getFeatureIds(), recordIds);

		var rawProj = this.sourceProjection.value || this.dataX.getMetadata("projection") || "EPSG:4326";
		var mapProj = this.outputProjection;

		for (let id of removedIds)
		{
			let feature = this.source.getFeatureById(id);
			this.source.removeFeature(feature);
		}

		for (let i in records)
		{
			let record = records[i];
			let dataX:any, dataY:any;

			dataX = GlyphLayer._toPoint(record.dataX, "xMin", "xMax");
			dataY = GlyphLayer._toPoint(record.dataY, "yMin", "yMax");

			let point = new ol.geom.Point([dataX, dataY]);
			point.transform(rawProj, mapProj);

			var coords = point.getCoordinates();
			if (!isFinite(coords[0]) || !isFinite(coords[1]))
				continue;

			let feature = this.source.getFeatureById(recordIds[i]);
			if (!feature)
			{
				feature = new ol.Feature({});
				feature.setId(recordIds[i]);
				this.source.addFeature(feature);
			}
			feature.setGeometry(point);
		}
		this.updateStyleData();
		this.updateMetaStyles();
	}
}

export default GlyphLayer;
