///<reference path="../../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import * as jquery from "jquery";
import * as ol from "openlayers";
import GlyphLayer from "./GlyphLayer";
import FeatureLayer from "./FeatureLayer";
import ImageGlyphCache from "./ImageGlyphCache";
import Layer from "./Layer";

import WeavePathData = weavejs.path.WeavePathData;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

export default class ImageGlyphLayer extends GlyphLayer {

	private imageGlyphCache:ImageGlyphCache;

	imageSize: AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
	imageURL: AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
	alpha: AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);
	color: AlwaysDefinedColumn = Weave.linkableChild(this, AlwaysDefinedColumn);

	constructor()
	{
		super();
		this.imageGlyphCache = new ImageGlyphCache(this);

		this.imageSize.addGroupedCallback(this, this.updateStyleData);
		this.imageURL.addGroupedCallback(this, this.updateStyleData);
		this.alpha.addGroupedCallback(this, this.updateStyleData);
		this.color.addGroupedCallback(this, this.updateStyleData, true);
	}

	getToolTipColumns(): IAttributeColumn[] {
		let additionalColumns: IAttributeColumn[] = [];

		for (let column of [this.imageSize, this.imageURL, this.alpha, this.color]) {
			let internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column);
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		return additionalColumns;
	}

	setIconStyle(feature:ol.Feature, img:any, iconSize: number)
	{
		let styles:any = {};

		if (!img.complete || !img.src)
		{
			jquery(img).one("load", this.setIconStyle.bind(this, feature, img, iconSize));
			return;
		}

		let maxDim: number = Math.max(img.naturalHeight, img.naturalWidth);
		let scale: number;
		if (isNaN(iconSize))
		{
			scale = 1;
		}
		else
		{
			scale = iconSize / maxDim;
		}

		let imgSize = [img.naturalWidth, img.naturalHeight];

		for (let stylePrefix of ["normal", "selected", "probed", "unselected"])
		{
			let icon:any;
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

		var recordIds:IQualifiedKey[] = this.dataX.keys;
		var records:any[] = weavejs.data.ColumnUtils.getRecords({
			"alpha": this.alpha,
			"color": this.color,
			"imageURL": this.imageURL,
			"imageSize": this.imageSize
		}, recordIds, {
			"alpha": Number,
			"color": Number,
			"imageURL": String,
			"imageSize": Number
		});

		for (let idx in records)
		{
			let record = records[idx];
			let feature = this.source.getFeatureById(recordIds[idx]);

			if (!feature)
			{
				continue;
			}

			let imageSize = Number(record.imageSize || NaN);
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

Weave.registerClass("weave.visualization.plotters::ImageGlyphPlotter", ImageGlyphLayer);
