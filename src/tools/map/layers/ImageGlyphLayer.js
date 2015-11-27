import jquery from "jquery";
import lodash from "lodash";
import ol from "openlayers";
import GlyphLayer from "./GlyphLayer.js";
import {registerLayerImplementation} from "./Layer.js";

class ImageGlyphLayer extends GlyphLayer {

	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.boundUpdateStyleData = this.updateStyleData.bind(this);

		this.layerPath.push("imageSize").addCallback(this.boundUpdateStyleData, true);
		this.layerPath.push("imageURL").addCallback(this.boundUpdateStyleData, true);
	}

	updateStyleData() {
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
			let imageURL = record.imageURL;
			let imageSize = record.imageSize;

			if (!feature)
			{
				continue;
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

			let normalStyle = [new ol.style.Style({
				image: icon
			})];

			feature.setProperties({normalStyle});
		}
		this.updateMetaStyles();
	}
}

export default ImageGlyphLayer;

registerLayerImplementation("weave.visualization.plotters::ImageGlyphPlotter", ImageGlyphLayer);
