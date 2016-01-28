///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/WeavePath.d.ts"/>

import jquery from "jquery";
import * as ol from "openlayers";
import GlyphLayer from "./GlyphLayer";
import FeatureLayer from "./FeatureLayer";
import ImageGlyphCache from "./ImageGlyphCache";
import Layer from "./Layer";

declare var weavejs:any;
declare var Weave:any;

class ImageGlyphLayer extends GlyphLayer {

	private imageGlyphCache:ImageGlyphCache;
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.imageGlyphCache = new ImageGlyphCache();

		this.layerPath.push("imageSize").addCallback(this, this.updateStyleData);
		this.layerPath.push("imageURL").addCallback(this, this.updateStyleData);
		this.layerPath.push("alpha").addCallback(this, this.updateStyleData);
		this.layerPath.push("color").addCallback(this, this.updateStyleData, true);
	}

	handleMissingSessionStateProperties(newState) 
	{

	}

	setIconStyle(feature, img, iconSize)
	{
		let styles:any = {};

		if (!img.complete || !img.src)
		{
			jquery(img).one("load", this.setIconStyle.bind(this, feature, img, iconSize));
			return;
		}

		let maxDim = Math.max(img.naturalHeight, img.naturalWidth);

		let scale = iconSize / maxDim;

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

			styles[stylePrefix + "Style"] = new ol.style.Style({image: icon});
		}

		styles.replace = true;

		feature.setProperties(styles);
	}

	updateStyleData() {
		/* Update feature styles */

		var records = this.layerPath.retrieveRecords(["alpha", "color", "imageURL", "imageSize"], this.layerPath.push("dataX"));

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

Layer.registerClass("weave.visualization.plotters::ImageGlyphPlotter", ImageGlyphLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default ImageGlyphLayer;
