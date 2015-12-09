import jquery from "jquery";
import ol from "openlayers";
import GlyphLayer from "./GlyphLayer.js";
import FeatureLayer from "./FeatureLayer.js";
import ImageGlyphCache from "./ImageGlyphCache.js";
import {registerLayerImplementation} from "./Layer.js";

class ImageGlyphLayer extends GlyphLayer {

	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.boundUpdateStyleData = this.updateStyleData.bind(this);
		this.imageGlyphCache = new ImageGlyphCache();

		this.layerPath.push("imageSize").addCallback(this.boundUpdateStyleData);
		this.layerPath.push("imageURL").addCallback(this.boundUpdateStyleData, true);
	}

	setIconStyle(feature, img, iconSize)
	{
		let styles = {};

		if (!img.complete || !img.src)
		{
			jquery(img).one("load", this.setIconStyle.bind(this, feature, img, iconSize));
			return;
		}

		let maxDim = Math.max(img.naturalHeight, img.naturalWidth);

		let scale = iconSize / maxDim;
		console.log(scale, iconSize, maxDim);
		let imgSize = [img.naturalWidth, img.naturalHeight];

		for (let stylePrefix of ["normal", "selected", "probed", "unselected"])
		{
			let icon;
			if (stylePrefix === "probed")
			{
				icon = new ol.style.Icon({img, imgSize, scale: scale * 2.0});
			}
			else
			{
				icon = new ol.style.Icon({img, imgSize, scale});
			}

			if (stylePrefix === "unselected")
			{
				icon.setOpacity(1 / 3);
			}
			console.log(stylePrefix, icon.getOpacity(), icon.getScale());

			styles[stylePrefix + "Style"] = new ol.style.Style({image: icon});
		}

		styles.replace = true;

		feature.setProperties(styles);
	}

	updateStyleData() {
		/* Update feature styles */

		var records = this.layerPath.retrieveRecords(["alpha", "color", "imageURL", "imageSize"], this.layerPath.push("dataX"));

		this.rawStyleRecords = records;

		for (let record of records)
		{
			let feature = this.source.getFeatureById(record.id);

			if (!feature)
			{
				continue;
			}

			let imageSize = Number(record.imageSize);
			let color = FeatureLayer.toColorRGBA(record.color, record.alpha);

			if (!record.imageURL)
			{
				feature.setStyle(null);
				continue;
			}

			let img = this.imageGlyphCache.getImage(record.imageURL, color);

			this.setIconStyle(feature, img, imageSize);
		}
	}
}

export default ImageGlyphLayer;

registerLayerImplementation("weave.visualization.plotters::ImageGlyphPlotter", ImageGlyphLayer);
