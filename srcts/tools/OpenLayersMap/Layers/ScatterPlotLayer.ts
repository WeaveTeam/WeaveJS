///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";

import StandardLib from "../../../utils/StandardLib";
import {FeatureLayer, MetaStyleProperties} from "./FeatureLayer";
import GlyphLayer from "./GlyphLayer";
import Layer from "./Layer";

import WeavePath = weavejs.path.WeavePath;
import WeavePathData = weavejs.path.WeavePathData;
import IColumnWrapper = weavejs.api.data.IColumnWrapper;

class ScatterPlotLayer extends GlyphLayer {

	sizeBy:WeavePath;
	fillStylePath:WeavePath;
	lineStylePath:WeavePath;
	maxRadiusPath:WeavePath;
	minRadiusPath:WeavePath;
	defaultRadiusPath:WeavePath;

	constructor(parent:any, layerName:any)
	{
		super(parent, layerName);

		this.sizeBy = this.layerPath.push("sizeBy").addCallback(this, this.updateStyleData, true);

		this.fillStylePath = this.layerPath.push("fill").addCallback(this, this.updateStyleData);
		this.lineStylePath = this.layerPath.push("line").addCallback(this, this.updateStyleData);
		this.maxRadiusPath = this.layerPath.push("maxScreenRadius").addCallback(this, this.updateStyleData);
		this.minRadiusPath = this.layerPath.push("minScreenRadius").addCallback(this, this.updateStyleData);

		this.defaultRadiusPath = this.layerPath.push("defaultScreenRadius").addCallback(this, this.updateStyleData, true);
	}

	handleMissingSessionStateProperties(newState:any)
	{

	}

	getToolTipColumns(): Array<any> /* Array<IAttributeColumn> */ {
		let additionalColumns: Array<any> = new Array<any>();
		let internalColumn: any;

		for (let column of this.fillStylePath.getChildren().concat(this.lineStylePath.getChildren())) {
			internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(this.sizeBy.getObject() as IColumnWrapper);
		if (internalColumn)
			additionalColumns.push(internalColumn);

		return additionalColumns;
	}

	updateStyleData()
	{

		let fillEnabled = this.fillStylePath.push("enable").getState();
		let strokeEnabled = this.lineStylePath.push("enable").getState();

		var styleRecords:any = (this.layerPath as WeavePathData).retrieveRecords({
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

		var sizeByNumeric = (this.layerPath as WeavePathData).retrieveRecords({sizeBy: this.sizeBy}, {dataType: "number"});

		for (let record of sizeByNumeric)
		{
			let id = record.id;
			let fullRecord:any = styleRecordsIndex[id];
			if (fullRecord)
			{
				fullRecord.sizeBy = record.sizeBy;
			}
		}

		let sizeBy = lodash.pluck(styleRecords, "sizeBy");
		let sizeByMax = lodash.max(sizeBy);
		let sizeByMin = lodash.min(sizeBy);
		let absMax = Math.max(Math.abs(sizeByMax), Math.abs(sizeByMin));
		let minScreenRadius = this.minRadiusPath.getState() as number;
		let maxScreenRadius = this.maxRadiusPath.getState() as number;
		let defaultScreenRadius = this.defaultRadiusPath.getState() as number;

		styleRecords = lodash.sortByOrder(styleRecords, ["sizeBy", "id"], ["desc", "asc"]);

		let zOrder = 0;

		for (let record of styleRecords)
		{
			let screenRadius:any;

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
					fill: fillEnabled ? olFill : undefined, stroke: strokeEnabled ? olStroke : undefined,
					radius: screenRadius
				})
			})];

			let unselectedStyle = [new ol.style.Style({
				image: new ol.style.Circle({
					fill: fillEnabled ? olFillFaded : undefined, stroke: strokeEnabled ? olStrokeFaded : undefined,
					radius: screenRadius
				})
			})];

			let selectedStyle = (strokeEnabled || fillEnabled) && [
				new ol.style.Style({
					image: new ol.style.Circle({
						stroke: olSelectionStyle[0].getStroke(),
						radius: screenRadius
					}),
					zIndex: olSelectionStyle[0].getZIndex()
				})
			];

			let probedStyle = (strokeEnabled || fillEnabled) && [
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
				let metaStyle:any = {};

				metaStyle.normalStyle = normalStyle;
				metaStyle.unselectedStyle = unselectedStyle;
				metaStyle.selectedStyle = selectedStyle;
				metaStyle.probedStyle = probedStyle;

				feature.setProperties(metaStyle);
			}

			zOrder++;
		}
	}
}
Layer.registerClass("weave.visualization.plotters::ScatterPlotPlotter", ScatterPlotLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default ScatterPlotLayer;
