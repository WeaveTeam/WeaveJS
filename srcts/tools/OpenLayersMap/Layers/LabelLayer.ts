///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";

import StandardLib from "../../../utils/StandardLib";
import {FeatureLayer, MetaStyleProperties} from "./FeatureLayer";
import GlyphLayer from "./GlyphLayer";
import Layer from "./Layer";
import OpenLayersMapTool from "../../OpenLayersMapTool";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;

class LabelLayer extends GlyphLayer
{
	public angle: IAttributeColumn;
	public bold: IAttributeColumn;
	public color: IAttributeColumn;
	public font: IAttributeColumn;
	public hAlign: IAttributeColumn;
	public vAlign: IAttributeColumn;
	public italic: IAttributeColumn;
	public size: IAttributeColumn;
	public text: IAttributeColumn;
	public underline: IAttributeColumn;

	private columns: Map<string,any>;

	constructor(parent:OpenLayersMapTool, layerName:string)
	{
		super(parent, layerName);

		this.size = this.layerPath.getObject("size") as IAttributeColumn;
		this.text = this.layerPath.getObject("text") as IAttributeColumn;
		this.color = this.layerPath.getObject("color") as IAttributeColumn;

		this.size.addGroupedCallback(this, this.updateStyleData)
		this.text.addGroupedCallback(this, this.updateStyleData)
		this.color.addGroupedCallback(this, this.updateStyleData, true);
	}

	updateStyleData():void 
	{
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
			let font: string = `${size}px sans-serif`;

			let textColor: string = FeatureLayer.toColorRGBA(color, 1);
			let fadedTextColor: string = FeatureLayer.toColorRGBA(color, 0.5);

			let selectedStroke: ol.style.Stroke = new ol.style.Stroke({
				color: "rgba(128,128,128,0.75)", width: 3
			});

			let probeStroke:ol.style.Stroke = new ol.style.Stroke({color: "white", width: 2});

			let normalFill: ol.style.Fill = new ol.style.Fill({ color: textColor });
			let fadedFill: ol.style.Fill = new ol.style.Fill({ color: fadedTextColor });
	
			let normalText = new ol.style.Text({ text, font, fill: normalFill });
			let probedText = new ol.style.Text({ text, font, fill: normalFill, stroke: probeStroke });
			let selectedText = new ol.style.Text({ text, font, fill: normalFill, stroke: selectedStroke });
			let unselectedText = new ol.style.Text({ text, font, fill: fadedFill });

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

Layer.registerClass("weave.visualization.plotters::TextGlyphPlotter", LabelLayer, ['ILinkableObjectWithNewProperties']);
export default LabelLayer;
