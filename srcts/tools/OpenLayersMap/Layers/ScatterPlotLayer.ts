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
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;

export default class ScatterPlotLayer extends GlyphLayer {

	fill: SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
	line: SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
	radius: AlwaysDefinedColumn = Weave.linkableChild(this, new AlwaysDefinedColumn(5));

	private get radiusNorm() { return this.radius.getInternalColumn() as NormalizedColumn; }
	private get radiusData() { return this.radiusNorm.internalDynamicColumn; }
	
	constructor()
	{
		super();
		this.radius.internalDynamicColumn.requestLocalObject(NormalizedColumn, true);
		for (let obj of [this.fill, this.line, this.radius])
			Weave.getCallbacks(obj).addGroupedCallback(this, this.updateStyleData, true)
	}

	get deprecatedStateMapping()
	{
		return {
			"sizeBy": this.radiusData,
			"minScreenRadius": this.radiusNorm.min,
			"maxScreenRadius": this.radiusNorm.max,
			"defaultScreenRadius": this.radius.defaultValue
		};
	}
	
	getToolTipColumns():IAttributeColumn[]
	{
		let additionalColumns:IAttributeColumn[] = [];

		for (let column of Weave.getPath(this.fill).getChildren().concat(Weave.getPath(this.line).getChildren()))
		{
			let internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		additionalColumns.push(weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(this.radius as IColumnWrapper));

		return additionalColumns;
	}

	updateStyleData()
	{
		let fillEnabled = this.fill.enable.value;
		let strokeEnabled = this.line.enable.value;
		var styleRecords:any[] = weavejs.data.ColumnUtils.getRecords(
			{
				id: IQualifiedKey,
				fill: this.fill.recordFormat,
				stroke: this.line.recordFormat,
				radius: this.radius
			},
			this.dataX.keys,
			{
				fill: this.fill.recordType,
				stroke: this.line.recordType,
				radius: Number
			}
		);

		styleRecords = lodash.sortByOrder(styleRecords, ["radius", "id"], ["desc", "asc"]);

		let zOrder = 0;

		for (let record of styleRecords)
		{
			let olStroke = FeatureLayer.olStrokeFromWeaveStroke(record.stroke);
			let olFill = FeatureLayer.olFillFromWeaveFill(record.fill);

			let olStrokeFaded = FeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
			let olFillFaded = FeatureLayer.olFillFromWeaveFill(record.fill, 0.5);

			let olSelectionStyle = FeatureLayer.getOlSelectionStyle(olStroke);
			let olProbedStyle = FeatureLayer.getOlProbedStyle(olStroke);

			let normalStyle = [new ol.style.Style({
				image: new ol.style.Circle({
					fill: fillEnabled ? olFill : undefined, stroke: strokeEnabled ? olStroke : undefined,
					radius: record.radius
				})
			})];

			let unselectedStyle = [new ol.style.Style({
				image: new ol.style.Circle({
					fill: fillEnabled ? olFillFaded : undefined, stroke: strokeEnabled ? olStrokeFaded : undefined,
					radius: record.radius
				})
			})];

			let selectedStyle = (strokeEnabled || fillEnabled) && [
				new ol.style.Style({
					image: new ol.style.Circle({
						stroke: olSelectionStyle[0].getStroke(),
						radius: record.radius
					}),
					zIndex: olSelectionStyle[0].getZIndex()
				})
			];

			let probedStyle = (strokeEnabled || fillEnabled) && [
				new ol.style.Style({
					image: new ol.style.Circle({
						stroke: olProbedStyle[0].getStroke(),
						radius: record.radius
					}),
					zIndex: olProbedStyle[0].getZIndex()
				}),
				new ol.style.Style({
					image: new ol.style.Circle({
						stroke: olProbedStyle[1].getStroke(),
						radius: record.radius
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
