import * as weavejs from "weavejs";
import * as _ from "lodash";
import * as ol from "openlayers";
import $ from "weaveapp/modules/jquery";
import {Weave} from "weavejs";

import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ColumnUtils = weavejs.data.ColumnUtils;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import AbstractGlyphLayer from "weaveapp/tool/oltool/layer/AbstractGlyphLayer";
import ImageGlyphCache from "weaveapp/tool/oltool/layer/ImageGlyphCache";
import AbstractFeatureLayer from "weaveapp/tool/oltool/layer/AbstractFeatureLayer";

export default class ImageGlyphLayer extends AbstractGlyphLayer
{
	static WEAVE_INFO = Weave.setClassInfo(ImageGlyphLayer, {
		id: "weavejs.tool.oltool.layer.ImageGlyphLayer",
		label: "Icons",
		interfaces: [ILinkableObjectWithNewProperties, ISelectableAttributes],
		deprecatedIds: ["weave.visualization.plotters::ImageGlyphPlotter"]
	});

	private imageGlyphCache:ImageGlyphCache;

	imageSize = Weave.linkableChild(this, AlwaysDefinedColumn);
	imageURL = Weave.linkableChild(this, AlwaysDefinedColumn);
	dataAlpha = Weave.linkableChild(this, new AlwaysDefinedColumn(1.0));
	dataColor = Weave.linkableChild(this, AlwaysDefinedColumn);

	get selectableAttributes()
	{
		return super.selectableAttributes
			.set("Image Size", this.imageSize)
			.set("Image URL", this.imageURL)
//			.set("Image Alpha", this.dataAlpha)
			.set("Image Tint", this.dataColor);
	}

	// protected getRequiredAttributes() {
	// 	return super.getRequiredAttributes().concat([this.imageURL]);
	// }

	constructor()
	{
		super();
		this.imageGlyphCache = new ImageGlyphCache(this);
		this.dataAlpha.defaultValue.state = 1.0;
	}

	onLayerReady()
	{
		super.onLayerReady();

		this.imageSize.addGroupedCallback(this, this.updateStyleData);
		this.imageURL.addGroupedCallback(this, this.updateStyleData);
		this.dataAlpha.addGroupedCallback(this, this.updateStyleData);
		this.dataColor.addGroupedCallback(this, this.updateStyleData, true);
	}

	getToolTipColumns(): IAttributeColumn[]
	{
		let additionalColumns: IAttributeColumn[] = [];

		for (let column of [this.imageSize, this.imageURL, this.dataAlpha, this.dataColor])
		{
			let internalColumn = ColumnUtils.hack_findInternalDynamicColumn(column);
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		return additionalColumns;
	}

	setIconStyle(feature:ol.Feature, img:any, iconSize: number, alpha:number)
	{
		let styles:any = {};

		if (!img.complete || !img.src)
		{
			$(img).one("load", this.setIconStyle.bind(this, feature, img, iconSize, alpha));
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
				icon = new ol.style.Icon({snapToPixel: true, img, imgSize, scale: scale * 2.0});
			}
			else
			{
				icon = new ol.style.Icon({snapToPixel: true, img, imgSize, scale});
			}

			if (stylePrefix === "unselected")
			{
				icon.setOpacity(alpha / 3);
			}
			else
			{
				icon.setOpacity(alpha);
			}

			styles[stylePrefix + "Style"] = new ol.style.Style({image: icon});
		}

		styles.replace = true;

		feature.setProperties(styles);
	}

	updateStyleData()
	{
		/* Update feature styles */

		var recordIds:IQualifiedKey[] = this.dataX.keys;
		var records:any[] = ColumnUtils.getRecords({
			"alpha": this.dataAlpha,
			"color": this.dataColor,
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

			if (!feature) {
				feature = new ol.Feature({});
				feature.setId(recordIds[idx]);
				this.source.addFeature(feature);
			}

			let imageSize = Number(record.imageSize || NaN);
			if (isNaN(record.alpha)) record.alpha = 1;
			let color = AbstractFeatureLayer.toColorRGBA(record.color, 1);

			if (!record.imageURL)
			{
				feature.setStyle(null);
				continue;
			}

			let img = this.imageGlyphCache.getImage(record.imageURL, color);

			this.setIconStyle(feature, img, imageSize, record.alpha);
		}
	}

	get deprecatedStateMapping()
	{
		return _.merge(super.deprecatedStateMapping, {
			alpha: (state:any) => Weave.setState(typeof state === 'number' ? this.opacity : this.dataAlpha, state),
			color: this.dataColor
		});
	}
}
