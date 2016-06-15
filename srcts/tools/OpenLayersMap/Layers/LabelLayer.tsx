import * as ol from "openlayers";
import * as _ from "lodash";

import DOMUtils from "../../../utils/DOMUtils";
import {AbstractFeatureLayer, MetaStyleProperties} from "./AbstractFeatureLayer";
import AbstractGlyphLayer from "./AbstractGlyphLayer";
import AbstractLayer from "./AbstractLayer";
import OpenLayersMapTool from "../../OpenLayersMapTool";

import Bounds2D = weavejs.geom.Bounds2D;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import LinkableBoolean = weavejs.core.LinkableBoolean;

interface LabelRecord
{
	feature: ol.Feature;
	text: string;
	color: string;
	font: string;
	sort: number;
	bounds: weavejs.geom.Bounds2D;
}

export default class LabelLayer extends AbstractGlyphLayer
{
	size = Weave.linkableChild(this, AlwaysDefinedColumn);
	text = Weave.linkableChild(this, DynamicColumn);
	color = Weave.linkableChild(this, AlwaysDefinedColumn);
	sortColumn = Weave.linkableChild(this, DynamicColumn);
	hideOverlappingText = Weave.linkableChild(this, LinkableBoolean);

	get selectableAttributes() {
		return super.selectableAttributes
			.set("Text", this.text)
			.set("Text Size", this.size)
			.set("Text Color", this.color)
			.set("Display precedence", this.sortColumn);
	}

	get editableFields() {
		return super.editableFields
			.set("Hide overlapping text", this.hideOverlappingText);
	}

	get deprecatedStateMapping() {
		return _.merge(super.deprecatedStateMapping, {
			geometryColumn: [{ internalDynamicColumn: this.dataX }, { internalDynamicColumn: this.dataY }]
		});
	}

	protected getRequiredAttributes() {
		return super.getRequiredAttributes().concat([this.text]);
	}

	constructor()
	{
		super();

		this.styleResolutionDependent = true;

		//this.color.internalDynamicColumn.globalName = "defaultColorColumn";
	}

	onLayerReady()
	{
		super.onLayerReady();

		this.size.addGroupedCallback(this, this.updateStyleData)
		this.text.addGroupedCallback(this, this.updateStyleData)
		this.color.addGroupedCallback(this, this.updateStyleData);
		this.hideOverlappingText.addGroupedCallback(this, this.updateStyleData, true);
	}

	updateStyleData():void 
	{
		/* Do we actually need this check? */
		if (!this.parent || !this.parent.map)
		{
			weavejs.WeaveAPI.Scheduler.callLater(this, this.updateStyleData);
			return;
		}
		let map = this.parent.map;

		let records: Array<LabelRecord> = [];
		let renderedRecords: Array<LabelRecord> = [];

		for (let key of this.text.keys)
		{
			let feature: ol.Feature = this.source.getFeatureById(key.toString());

			if (!feature) {
				feature = new ol.Feature({});
				feature.setId(key);
				this.source.addFeature(feature);
			}

			let text: string = this.text.getValueFromKey(key, String);
			let size: number = this.size.getValueFromKey(key, Number);
			let color: string = this.color.getValueFromKey(key, String);
			let sort: number = this.sortColumn.getValueFromKey(key, Number);
			let font: string = `${size}px sans-serif`;

			let width: number = DOMUtils.getTextWidth(text, font);
			let height: number = DOMUtils.getTextHeight(text, font);

			let bounds: Bounds2D = feature.get("Bounds2D") as Bounds2D;
			if (!bounds)
			{
				bounds = new Bounds2D();
				feature.set("Bounds2D", bounds);
			}

			let point = feature.getGeometry() as ol.geom.Point;
			let pixel = point ? map.getPixelFromCoordinate(point.getCoordinates()) : null;
			if (pixel) 
			{
				bounds.setCenter(pixel[0], pixel[1]);
				bounds.setWidth(width);
				bounds.setHeight(height);
			}
			else
			{
				bounds.setCenter(NaN, NaN);
				bounds.setWidth(0);
				bounds.setHeight(0);
			}

			/* Debug */
			// let box: ol.render.Box;
			// box = feature.get("box") as ol.render.Box;

			// if (!box)
			// {
			// 	box = new ol.render.Box();
			// 	feature.set("box", box);
			// 	box.setMap(this.parent.map);
			// }
			// box.setPixels([bounds.getXMin(), bounds.getYMin()], [bounds.getXMax(), bounds.getYMax()]);
			/* End debug */

			records.push({
				text, color, sort, font, feature, bounds
			});
		}
		records = _.sortByOrder(records, ["sort"], ["desc"]);
		for (let record of records)
		{
			let doRender: boolean = true;
			if (this.hideOverlappingText.value) 
			{
				for (let otherRecord of renderedRecords) 
				{
					if (otherRecord.bounds.overlaps(record.bounds)) 
					{
						doRender = false;
					}
				}
			}

			if (doRender)
			{
				renderedRecords.push(record);
			}


			let text = record.text;
			let color = record.color;
			let font = record.font;
			let feature = record.feature;

			let textColor: string = AbstractFeatureLayer.toColorRGBA(color, 1);
			let fadedTextColor: string = AbstractFeatureLayer.toColorRGBA(color, 0.5);

			let selectedStroke: ol.style.Stroke = new ol.style.Stroke({
				color: "rgba(128,128,128,0.75)", width: 3
			});

			let probeStroke:ol.style.Stroke = new ol.style.Stroke({color: "white", width: 2});

			let normalFill: ol.style.Fill = new ol.style.Fill({ color: textColor });
			let fadedFill: ol.style.Fill = new ol.style.Fill({ color: fadedTextColor });
	
			let normalText = doRender ? new ol.style.Text({ text, font, fill: normalFill }) : null;
			let probedText = new ol.style.Text({ text, font, fill: normalFill, stroke: probeStroke });
			let selectedText = new ol.style.Text({ text, font, fill: normalFill, stroke: selectedStroke });
			let unselectedText = doRender ? new ol.style.Text({ text, font, fill: fadedFill }) : null;

			let metaStyle: any = {};

			metaStyle.normalStyle = new ol.style.Style({ text: normalText });
			metaStyle.unselectedStyle = new ol.style.Style({ text: unselectedText });
			metaStyle.selectedStyle = new ol.style.Style({text: selectedText});
			metaStyle.probedStyle = new ol.style.Style({ text: probedText });
			
			metaStyle.replace = true;

			feature.setProperties(metaStyle);
		}
	}
}

Weave.registerClass(
	LabelLayer,
	["weavejs.layer.LabelLayer", "weave.visualization.plotters::TextGlyphPlotter", "weave.visualization.plotters::GeometryLabelPlotter"],
	[weavejs.api.core.ILinkableObjectWithNewProperties, weavejs.api.data.ISelectableAttributes],
	"Labels"
);
