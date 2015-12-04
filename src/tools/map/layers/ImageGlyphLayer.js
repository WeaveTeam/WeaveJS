import jquery from "jquery";
import ol from "openlayers";
import GlyphLayer from "./GlyphLayer.js";
import {registerLayerImplementation} from "./Layer.js";

class ImageGlyphLayer extends GlyphLayer {

	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.boundUpdateStyleData = this.updateStyleData.bind(this);

		this.layerPath.push("imageSize").addCallback(this.boundUpdateStyleData);
		this.layerPath.push("imageURL").addCallback(this.boundUpdateStyleData, true);
	}

	updateStyleData() {
		/* Update feature styles */

		var records = this.layerPath.retrieveRecords(["imageURL", "imageSize"], this.layerPath.push("dataX"));

		this.rawStyleRecords = records;

		function setScale(icon, imageSize)
		{
			var maxDim = Math.max(this.naturalHeight, this.naturalWidth);
			icon.setScale(imageSize / maxDim);
			//console.log(this, icon, imageSize);
		}

		for (let record of records)
		{
			let feature = this.source.getFeatureById(record.id);
			let src = record.imageURL;
			let imageSize = Number(record.imageSize);

			if (!feature)
			{
				continue;
			}

			if (!src)
			{
				feature.setStyle(null);
				continue;
			}

			let styles = {};
			let icons = {};

			for (let stylePrefix of ["normal", "selected", "probed", "unselected"])
			{

				let styleName = stylePrefix + "Style";
				icons[stylePrefix] = new ol.style.Icon({src});

				styles[styleName] = [new ol.style.Style({
					image: icons[stylePrefix]
				})];
			}

			icons.unselected.setOpacity(0.33);

			let img = icons.normal.getImage();

			if (!img.complete)
			{
				jquery(img).one("load", setScale.bind(img, icons.normal, imageSize))
					.one("load", setScale.bind(img, icons.selected, imageSize))
					.one("load", setScale.bind(img, icons.unselected, imageSize))
					.one("load", setScale.bind(img, icons.probed, imageSize * 2));
			}
			else
			{
				setScale.call(img, icons.normal, imageSize);
				setScale.call(img, icons.selected, imageSize);
				setScale.call(img, icons.unselected, imageSize);
				setScale.call(img, icons.probed, imageSize * 2);
			}

			icons.normal.load();

			styles.replace = true;

			feature.setProperties(styles);
		}
		this.updateMetaStyles();
	}
}

export default ImageGlyphLayer;

registerLayerImplementation("weave.visualization.plotters::ImageGlyphPlotter", ImageGlyphLayer);
