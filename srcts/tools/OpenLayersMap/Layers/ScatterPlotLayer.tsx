import * as ol from "openlayers";
import * as _ from "lodash";

import {AbstractFeatureLayer, MetaStyleProperties} from "./AbstractFeatureLayer";
import AbstractGlyphLayer from "./AbstractGlyphLayer";
import AbstractLayer from "./AbstractLayer";

import IColumnWrapper = weavejs.api.data.IColumnWrapper;
import LinkableNumber = weavejs.core.LinkableNumber;
import DynamicColumn = weavejs.data.column.DynamicColumn;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;

export default class ScatterPlotLayer extends AbstractGlyphLayer
{
	get selectableAttributes()
	{
		return super.selectableAttributes
			.set("Fill Color", this.fill.color)
			//.set("Fill Alpha", this.fill.alpha)
			//.set("Line Color", this.line.color)
			//.set("Line Alpha", this.line.alpha)
			//.set("Line Thickness", this.line.normalizedWeightColumn)
			.set("Radius", this.radiusData);
	}

	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);
	radius = Weave.linkableChild(this, new AlwaysDefinedColumn(5));

	private get radiusNorm() { return this.radius.getInternalColumn() as NormalizedColumn; }
	private get radiusData() { return this.radiusNorm.internalDynamicColumn; }
	
	constructor()
	{
		super();
		this.fill.color.internalDynamicColumn.globalName = "defaultColorColumn";
		this.radius.internalDynamicColumn.requestLocalObject(NormalizedColumn, true);
		this.radiusNorm.min.value = 3;
		this.radiusNorm.max.value = 25;
	}

	onLayerReady()
	{
		super.onLayerReady();
		for (let obj of [this.fill, this.line, this.radius])
			Weave.getCallbacks(obj).addGroupedCallback(this, this.updateStyleData);
		this.updateStyleData();
	}

	get deprecatedStateMapping()
	{
		return _.merge(super.deprecatedStateMapping, {
			"sizeBy": this.radiusData,
			"minScreenRadius": this.radiusNorm.min,
			"maxScreenRadius": this.radiusNorm.max,
			"defaultScreenRadius": this.radius.defaultValue
		});
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

		styleRecords = _.sortByOrder(styleRecords, ["radius", "id"], ["desc", "asc"]);

		let zOrder = 0;

		for (let record of styleRecords)
		{
			let olStroke = AbstractFeatureLayer.olStrokeFromWeaveStroke(record.stroke);
			let olFill = AbstractFeatureLayer.olFillFromWeaveFill(record.fill);

			let olStrokeFaded = AbstractFeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
			let olFillFaded = AbstractFeatureLayer.olFillFromWeaveFill(record.fill, 0.5);

			let olSelectionStyle = AbstractFeatureLayer.getOlSelectionStyle(olStroke);
			let olProbedStyle = AbstractFeatureLayer.getOlProbedStyle(olStroke);

			let normalStyle = [new ol.style.Style({
				image: new ol.style.Circle({
					fill: fillEnabled ? olFill : undefined, stroke: strokeEnabled ? olStroke : undefined,
					radius: record.radius,
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
				feature.set("zOrder", zOrder);
			}

			zOrder++;
		}
	}
}

Weave.registerClass(
	ScatterPlotLayer,
	["weavejs.layer.ScatterPlotLayer", "weave.visualization.plotters::ScatterPlotPlotter"],
	[weavejs.api.core.ILinkableObjectWithNewProperties],
	"Bubbles"
);
