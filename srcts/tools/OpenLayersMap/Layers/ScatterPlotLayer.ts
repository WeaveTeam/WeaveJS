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
import LinkableNumber = weavejs.core.LinkableNumber;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;

export default class ScatterPlotLayer extends GlyphLayer {

	minScreenRadius: LinkableNumber = Weave.linkableChild(this, LinkableNumber);
	maxScreenRadius: LinkableNumber = Weave.linkableChild(this, LinkableNumber);
	defaultScreenRadius: LinkableNumber = Weave.linkableChild(this, LinkableNumber);

	fill: SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
	line: SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
	sizeBy: DynamicColumn = Weave.linkableChild(this, DynamicColumn);

	constructor()
	{
		super();

		Weave.getCallbacks(this.fill).addGroupedCallback(this, this.updateStyleData);
		Weave.getCallbacks(this.line).addGroupedCallback(this, this.updateStyleData);
		this.sizeBy.addGroupedCallback(this, this.updateStyleData);
		
		this.maxScreenRadius.addGroupedCallback(this, this.updateStyleData);
		this.minScreenRadius.addGroupedCallback(this, this.updateStyleData);
		this.defaultScreenRadius.addGroupedCallback(this, this.updateStyleData, true);
	}

	getToolTipColumns(): Array<any> /* Array<IAttributeColumn> */ {
		let additionalColumns: Array<any> = new Array<any>();
		let internalColumn: any;

		for (let column of Weave.getPath(this.fill).getChildren().concat(Weave.getPath(this.line).getChildren())) {
			internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(this.sizeBy as IColumnWrapper);
		if (internalColumn)
			additionalColumns.push(internalColumn);

		return additionalColumns;
	}

	updateStyleData()
	{

		let fillEnabled = this.fill.enable.value;
		let strokeEnabled = this.line.enable.value;

		let styleRecords: Array<any> = new Array<any>();

		for (let key of this.dataX.keys as Array<IQualifiedKey>)
		{
			let record: any = {};
			record.id = key;
			record.fill = this.fill.getStyle(key);
			record.stroke = this.line.getStyle(key);
			styleRecords.push(record);
		}

		var styleRecordsIndex = lodash.indexBy(styleRecords, "id");

		var sizeByNumeric = weavejs.data.ColumnUtils.getRecords({sizeBy: this.sizeBy}, this.sizeBy.keys, Number);

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
		let minScreenRadius = this.minScreenRadius.value;
		let maxScreenRadius = this.maxScreenRadius.value;
		let defaultScreenRadius = this.defaultScreenRadius.value;

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

Weave.registerClass("weave.visualization.plotters::ScatterPlotPlotter", ScatterPlotLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
