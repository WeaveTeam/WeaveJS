import ol from "openlayers";
import StandardLib from "../../../Utils/StandardLib.js";
import FeatureLayer from "./FeatureLayer.js";
import {registerLayerImplementation} from "./Layer.js";
import GlyphLayer from "./GlyphLayer.js";
import lodash from "lodash";

class ScatterPlotLayer extends GlyphLayer {
	constructor(parent, layerName)
	{
		super(parent, layerName);

		let boundUpdateStyleData = this.updateStyleData.bind(this);

		this.sizeBy = this.layerPath.push("sizeBy").addCallback(boundUpdateStyleData, true);

		this.fillStylePath = this.layerPath.push("fill").addCallback(boundUpdateStyleData);
		this.lineStylePath = this.layerPath.push("line").addCallback(boundUpdateStyleData);
		this.maxRadiusPath = this.layerPath.push("maxScreenRadius").addCallback(boundUpdateStyleData);
		this.minRadiusPath = this.layerPath.push("minScreenRadius").addCallback(boundUpdateStyleData);

		this.defaultRadiusPath = this.layerPath.push("defaultScreenRadius").addCallback(boundUpdateStyleData, true);
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
				feature.setProperties({normalStyle, unselectedStyle, selectedStyle, probedStyle});
			}
		}
	}
}

export default ScatterPlotLayer;

registerLayerImplementation("weave.visualization.plotters::ScatterPlotPlotter", ScatterPlotLayer);
