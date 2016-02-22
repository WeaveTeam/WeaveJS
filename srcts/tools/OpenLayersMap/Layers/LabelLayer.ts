///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";

import MiscUtils from "../../../utils/MiscUtils";
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

class LabelLayer extends AbstractGlyphLayer
{
	size = Weave.linkableChild(this, AlwaysDefinedColumn);
	text = Weave.linkableChild(this, DynamicColumn);
	color = Weave.linkableChild(this, AlwaysDefinedColumn);
	sortColumn = Weave.linkableChild(this, DynamicColumn);
	hideOverlappingText = Weave.linkableChild(this, LinkableBoolean);

	constructor()
	{
		super();

		this.styleResolutionDependent = true;

		this.size.addGroupedCallback(this, this.updateStyleData)
		this.text.addGroupedCallback(this, this.updateStyleData)
		this.color.addGroupedCallback(this, this.updateStyleData);
		this.hideOverlappingText.addGroupedCallback(this, this.updateStyleData, true);
	}

	updateStyleData():void 
	{
		let map = this.parent.map;

		let records: Array<LabelRecord> = [];
		let renderedRecords: Array<LabelRecord> = [];

		for (let key of this.text.keys)
		{
			let feature: ol.Feature = this.source.getFeatureById(key.toString());

			if (!feature)
			{
				continue;
			}

			let text: string = this.text.getValueFromKey(key, String);
			let size: number = this.size.getValueFromKey(key, Number);
			let color: string = this.color.getValueFromKey(key, String);
			let sort: number = this.sortColumn.getValueFromKey(key, Number);
			let font: string = `${size}px sans-serif`;

			let width: number = MiscUtils.getTextWidth(text, font);
			let height: number = MiscUtils.getTextHeight(text, font);

			let point = feature.getGeometry() as ol.geom.Point;
			let pixel = map.getPixelFromCoordinate(point.getCoordinates());

			let bounds: Bounds2D = feature.get("Bounds2D") as Bounds2D;
			if (!bounds)
			{
				bounds = new Bounds2D();
				feature.set("Bounds2D", bounds);
			}

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
		records = lodash.sortByOrder(records, ["sort"], ["desc"]);
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

Weave.registerClass("weave.visualization.plotters::TextGlyphPlotter", LabelLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default LabelLayer;
