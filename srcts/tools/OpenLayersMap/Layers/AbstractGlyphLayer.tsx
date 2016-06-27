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
			.set("Latitude / Y", this.dataY)
			.set("Longitude / X", this.dataX);
	}

	protected getRequiredAttributes()
	{
		return super.getRequiredAttributes().concat([this.dataX, this.dataY]);
	}

	constructor()
	{
		super();
		this.filteredKeySet.setColumnKeySources([this.dataX, this.dataY]);
	}

	get inputProjection(): any {
		return this.dataX.getMetadata('projection') || this.sourceProjection.value || this.outputProjection;
	}

	onLayerReady()
	{
		super.onLayerReady();

		this.sourceProjection.addGroupedCallback(this, this.updateLocations);

		/* Use requiredattributes instead of dataX/dataY directly, so we don't add features. */
		this.requiredAttributes.forEach(
			(attr) => {
				attr.addGroupedCallback(this, this.updateLocations);
			}
		);
		
		this.updateLocations();
	}

	_getFeatureIds()
	{
		return _.map(this.source.getFeatures(), (item:ol.Feature) => item.getId());
	}

	updateProjection():void 
	{
		this.updateLocations();
	}

	static _projectionErrorsShown= new Set<string>();
	updateLocations()
	{
		/* Update feature locations */
		var recordIds = _.intersection.apply(null, this.requiredAttributes.map((attr) => attr.keys));
		var records:Array<LocationRecord> = weavejs.data.ColumnUtils.getRecords({ "dataX": this.dataX, "dataY": this.dataY }, recordIds);
		var removedIds = _.difference(this._getFeatureIds(), recordIds);

		var rawProj = OpenLayersMapTool.getProjection(this.inputProjection);
		var mapProj = OpenLayersMapTool.getProjection(this.outputProjection);

		if (!rawProj)
		{
			if (!AbstractGlyphLayer._projectionErrorsShown.has(this.inputProjection))
			{
				AbstractGlyphLayer._projectionErrorsShown.add(this.inputProjection);
				console.error(`${Weave.className(this)}: Projection ${this.inputProjection} does not exist; check your data configuration. Falling back to EPSG:4326 (Lat/Long)`);
			}
			rawProj = OpenLayersMapTool.getProjection("EPSG:4326");
		}

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
			{
				point = null; /* Clear the geometry so the feature doesn't render anymore. */
			}

			let feature = this.source.getFeatureById(recordIds[i]);
			if (!feature)
			{
				feature = new ol.Feature({});
				feature.setId(recordIds[i]);
				this.source.addFeature(feature);
			}
			feature.setGeometry(point);
		}
	}
}
export default AbstractGlyphLayer;
