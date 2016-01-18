///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";

import StandardLib from "../../utils/StandardLib";
import FeatureLayer from "./FeatureLayer";
import GlyphLayer from "./GlyphLayer";

declare var Weave:any;
declare var weavejs:any;

class ScatterPlotLayer extends GlyphLayer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.sizeBy = this.layerPath.push("sizeBy").addCallback(this, this.updateStyleData, true);

		this.fillStylePath = this.layerPath.push("fill").addCallback(this, this.updateStyleData);
		this.lineStylePath = this.layerPath.push("line").addCallback(this, this.updateStyleData);
		this.maxRadiusPath = this.layerPath.push("maxScreenRadius").addCallback(this, this.updateStyleData);
		this.minRadiusPath = this.layerPath.push("minScreenRadius").addCallback(this, this.updateStyleData);

		this.defaultRadiusPath = this.layerPath.push("defaultScreenRadius").addCallback(this, this.updateStyleData, true);
	}

	handleMissingSessionStateProperties(newState)
	{

	}

	updateStyleData()
	{
		var styleRecords = this.layerPath.retrieveRecords({
			fill: {
				color: this.fillStylePath.push("color"),
				alpha: this.fillStylePath.push("alpha"),
				imageURL: this.fillStylePath.push("imageURL")
			},
			stroke: {
				color: this.lineStylePath.push("color"),
				alpha: this.lineStylePath.push("alpha"),
				weight: this.lineStylePath.push("weight"),
				lineCap: this.lineStylePath.push("caps"),
				lineJoin: this.lineStylePath.push("joints"),
				miterLimit: this.lineStylePath.push("miterLimit")
			}
		});

		var styleRecordsIndex = lodash.indexBy(styleRecords, "id");

		var sizeByNumeric = this.layerPath.retrieveRecords({sizeBy: this.sizeBy}, {dataType: "number"});

		for (let record of sizeByNumeric)
		{
			let id = record.id;
			let fullRecord = styleRecordsIndex[id];
			if (fullRecord)
			{
				fullRecord.sizeBy = record.sizeBy;
			}
		}

		this.rawStyles = styleRecords;

		let sizeBy = lodash.pluck(styleRecords, "sizeBy");
		let sizeByMax = lodash.max(sizeBy);
		let sizeByMin = lodash.min(sizeBy);
		let absMax = Math.max(sizeByMax, sizeByMin);
		let minScreenRadius = this.minRadiusPath.getState();
		let maxScreenRadius = this.maxRadiusPath.getState();
		let defaultScreenRadius = this.defaultRadiusPath.getState();

		styleRecords = lodash.sortByOrder(styleRecords, ["sizeBy", "id"], ["desc", "asc"]);

		let zOrder = 0;

		for (let record of styleRecords)
		{
			let screenRadius;

			let normSize = StandardLib.normalize(Math.abs(record.sizeBy), 0, absMax);

			if (isNaN(normSize) || record.sizeBy === null)
			{
				screenRadius = defaultScreenRadius;
			}
			else
			{
				screenRadius = minScreenRadius + (normSize * (maxScreenRadius - minScreenRadius));
			}

			let olStroke = FeatureLayer.olStrokeFromWeaveStroke(record.stroke);
			let olFill = FeatureLayer.olFillFromWeaveFill(record.fill);

			let olStrokeFaded = FeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
			let olFillFaded = FeatureLayer.olFillFromWeaveFill(record.fill, 0.5);

			let olSelectionStyle = FeatureLayer.getOlSelectionStyle(olStroke);
			let olProbedStyle = FeatureLayer.getOlProbedStyle(olStroke);

			let normalStyle = [new ol.style.Style({
				image: new ol.style.Circle({
					fill: olFill, stroke: olStroke,
					radius: screenRadius
				})
			})];

			let unselectedStyle = [new ol.style.Style({
				image: new ol.style.Circle({
					fill: olFillFaded, stroke: olStrokeFaded,
					radius: screenRadius
				})
			})];

			let selectedStyle = [
				new ol.style.Style({
					image: new ol.style.Circle({
						stroke: olSelectionStyle[0].getStroke(),
						radius: screenRadius
					}),
					zIndex: olSelectionStyle[0].getZIndex()
				})
			];

			let probedStyle = [
				new ol.style.Style({
					image: new ol.style.Circle({
						stroke: olProbedStyle[0].getStroke(),
						radius: screenRadius
					}),
					zIndex: olProbedStyle[0].getZIndex()
				}),
				new ol.style.Style({
					image: new ol.style.Circle({
						stroke: olProbedStyle[1].getStroke(),
						radius: screenRadius
					}),
					zIndex: olProbedStyle[1].getZIndex()
				})
			];

			let feature = this.source.getFeatureById(record.id);

			if (feature)
			{
				feature.setProperties({normalStyle, unselectedStyle, selectedStyle, probedStyle, zOrder});
			}

			zOrder++;
		}
	}
}

export default ScatterPlotLayer;

Weave.registerClass("weave.visualization.plotters::ScatterPlotPlotter", ScatterPlotLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
