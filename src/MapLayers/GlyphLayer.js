import jquery from "jquery";
import Layer from "./Layer.js";
import lodash from "lodash";
import ol from "openlayers";
import {registerLayerImplementation} from "./Layer.js";

export default class GlyphLayer extends Layer {

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

registerLayerImplementation("weave.visualization.plotters::ImageGlyphPlotter", GlyphLayer);
