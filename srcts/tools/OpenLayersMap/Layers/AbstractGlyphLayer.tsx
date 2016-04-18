import AbstractFeatureLayer from "./AbstractFeatureLayer";
import * as _ from "lodash";
import * as ol from "openlayers";

import OpenLayersMapTool from "../../OpenLayersMapTool";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import LinkableString = weavejs.core.LinkableString;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import GeneralizedGeometry = weavejs.geom.GeneralizedGeometry;

interface LocationRecord
{
	dataX: (number|GeneralizedGeometry)[];
	dataY: (number|GeneralizedGeometry)[];
	id: IQualifiedKey;
}

abstract class AbstractGlyphLayer extends AbstractFeatureLayer {

	dataX = Weave.linkableChild(this, DynamicColumn);
	dataY = Weave.linkableChild(this, DynamicColumn);
	sourceProjection = Weave.linkableChild(this, new LinkableString("EPSG:4326", OpenLayersMapTool.projectionVerifier));

	get editableFields()
	{
		return super.editableFields
			.set("Source Projection", this.sourceProjection);
	}

	get selectableAttributes()
	{
		return super.selectableAttributes
			.set("Latitude", this.dataY)
			.set("Longitude", this.dataX);
	}

	constructor()
	{
		super();

		/* TODO: Register a callback on the parent's projection. */
		// this.projectionPath.addCallback(this, this.updateGeometryData);

		this.sourceProjection.addGroupedCallback(this, this.updateLocations);

		this.dataX.addGroupedCallback(this, this.updateLocations);
		this.dataY.addGroupedCallback(this, this.updateLocations, true);

		this.filteredKeySet.setColumnKeySources([this.dataX, this.dataY]);
	}

	_getFeatureIds()
	{
		return _.map(this.source.getFeatures(), (item:ol.Feature) => item.getId());
	}

	updateProjection():void 
	{
		this.updateLocations();
	}

	updateLocations()
	{
		/* Update feature locations */
		var recordIds = this.dataX.keys;
		var records:Array<LocationRecord> = weavejs.data.ColumnUtils.getRecords({ "dataX": this.dataX, "dataY": this.dataY }, recordIds);
		var removedIds = _.difference(this._getFeatureIds(), recordIds);

		var rawProj = this.dataX.getMetadata("projection") || this.sourceProjection.value || "EPSG:4326";
		var mapProj = this.outputProjection;

		for (let id of removedIds)
		{
			let feature = this.source.getFeatureById(id);
			this.source.removeFeature(feature);
		}

		for (let i in records)
		{
			let record = records[i];
			
			let geom:GeneralizedGeometry;
			
			let dataX:Object = record.dataX && record.dataX[0];
			if (dataX instanceof GeneralizedGeometry)
			{
				geom = dataX as GeneralizedGeometry;
				dataX = (geom.bounds.xMin + geom.bounds.xMax) / 2;
			}
			
			let dataY:Object = record.dataY && record.dataY[0];
			if (dataY instanceof GeneralizedGeometry)
			{
				geom = dataY as GeneralizedGeometry;
				dataY = (geom.bounds.yMin + geom.bounds.yMax) / 2;
			}
			
			let point = new ol.geom.Point([dataX as number, dataY as number]);
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
export default AbstractGlyphLayer;
