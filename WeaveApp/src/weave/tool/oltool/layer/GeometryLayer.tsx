import * as React from "react";
import * as weavejs from "weavejs";
import * as ol from "openlayers";
import * as _ from "lodash";
import {Weave} from "weavejs";
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableBoolean = weavejs.core.LinkableBoolean;

import DynamicColumn = weavejs.data.column.DynamicColumn;
import ColumnMetadata = weavejs.api.data.ColumnMetadata;
import DataType = weavejs.api.data.DataType;
import AlwaysDefinedColumn = weavejs.data.column.AlwaysDefinedColumn;
import NormalizedColumn = weavejs.data.column.NormalizedColumn;
import ColumnUtils = weavejs.data.ColumnUtils;
import ILinkableObjectWithNewProperties = weavejs.api.core.ILinkableObjectWithNewProperties;
import ISelectableAttributes = weavejs.api.data.ISelectableAttributes;
import {AbstractFeatureLayer} from "weave/tool/oltool/layer/AbstractFeatureLayer";
import {EditableField} from "weave/tool/oltool/layer/AbstractLayer";
import SolidFillStyle from "weave/plot/SolidFillStyle";
import SolidLineStyle from "weave/plot/SolidLineStyle";
import Projections from "weave/tool/oltool/Projections";
import ScatterPlotLayer from "weave/tool/oltool/layer/ScatterPlotLayer";

export default class GeometryLayer extends AbstractFeatureLayer
{
	private geoJsonParser:ol.format.GeoJSON;

	fill = Weave.linkableChild(this, SolidFillStyle);
	line = Weave.linkableChild(this, SolidLineStyle);
	geometryColumn = Weave.linkableChild(this, DynamicColumn);
	radius = Weave.linkableChild(this, new AlwaysDefinedColumn(5));

	protected getRequiredAttributes() {
		return super.getRequiredAttributes().concat([this.geometryColumn]);
	}

	get selectableAttributes()
	{
		return super.selectableAttributes
			.set("Geometries", this.geometryColumn)
			.set("Fill Color", this.fill.color)
			.set("Fill Alpha", this.fill.alpha)
			.set("Line Color", this.line.color)
			.set("Line Alpha", this.line.alpha)
			.set("Line Thickness", this.line.normalizedWeightColumn);
	}

	get editableFields()
	{
		return super.editableFields.set("Ignore subset", this.filteredKeySet);
	}

	private get radiusNorm() { return this.radius.getInternalColumn() as NormalizedColumn; }
	private get radiusData() { return this.radiusNorm.internalDynamicColumn; }

	constructor()
	{
		super();
		this.fill.color.internalDynamicColumn.targetPath = ["defaultColorColumn"];
		this.radius.internalDynamicColumn.requestLocalObject(NormalizedColumn, true);
		this.radiusNorm.min.value = 3;
		this.radiusNorm.max.value = 25;

		this.filteredKeySet.setColumnKeySources([this.geometryColumn]);

		this.geoJsonParser = new ol.format.GeoJSON();
	}

	onLayerReady()
	{
		super.onLayerReady();

		this.geometryColumn.addGroupedCallback(this, this.updateGeometryData);


		Weave.getCallbacks(this.filteredKeySet).removeCallback(this, this.updateMetaStyles);

		Weave.getCallbacks(this.fill).addGroupedCallback(this, this.updateStyleData);
		Weave.getCallbacks(this.line).addGroupedCallback(this, this.updateStyleData);
		Weave.getCallbacks(this.radius).addGroupedCallback(this, this.updateStyleData);


		Weave.getCallbacks(this.filteredKeySet).addGroupedCallback(this, this.updateGeometryData, true);
	}

	updateProjection():void
	{
		this.updateGeometryData();
	}

	get deprecatedStateMapping()
	{
		return _.merge(super.deprecatedStateMapping,{
			geometryColumn: {
				internalDynamicColumn: this.geometryColumn
			},
			alpha: this.opacity
		});
	}

	get inputProjection():any
	{
		return this.geometryColumn.getMetadata('projection') || this.outputProjection;
	}

	updateGeometryData()
	{
		this.source.clear();

		var idc = this.geometryColumn;
		var keys:Array<IQualifiedKey> = this.filteredKeySet.keys;
		if (idc.getMetadata(ColumnMetadata.DATA_TYPE) != DataType.GEOMETRY)
			return;
		var rawGeometries = ColumnUtils.getGeoJsonGeometries(idc, keys);

		for (let idx = 0; idx < keys.length; idx++)
		{
			let rawGeom = rawGeometries[idx];
			if (!rawGeom)
				continue;

			let id = keys[idx];

			let geometry = this.geoJsonParser.readGeometry(rawGeom,
				{ dataProjection: Projections.getProjection(this.inputProjection),
				featureProjection: Projections.getProjection(this.outputProjection)});

			if ((geometry.getExtent() as number[]).some(_.isNaN))
			{
				console.error("Dropping feature", id, "due to containing NaN coordinates. Possibly misconfigured projection?");
				continue;
			}

			let feature = new ol.Feature({geometry});
			feature.setId(id);

			this.source.addFeature(feature);
		}

		this.updateStyleData();
		this.updateMetaStyles();
	}

	getToolTipColumns():IAttributeColumn[]
	{
		let additionalColumns:IAttributeColumn[] = [];

		for (let column of Weave.getPath(this.fill).getChildren().concat(Weave.getPath(this.line).getChildren()))
		{
			let internalColumn = ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		return additionalColumns;
	}

	updateStyleData()
	{
		let fillEnabled: boolean = this.fill.enable.value;
		let strokeEnabled: boolean = this.line.enable.value;

		for (let key of this.filteredKeySet.keys)
		{
			let record: any = {};

			record.id = key;
			record.fill = this.fill.getStyle(key);
			record.stroke = this.line.getStyle(key);
			record.radius = this.radius.getValueFromKey(key);

			let olStroke = AbstractFeatureLayer.olStrokeFromWeaveStroke(record.stroke);

			let olFill = AbstractFeatureLayer.olFillFromWeaveFill(record.fill);

			let olStrokeFaded = AbstractFeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
			let olFillFaded = AbstractFeatureLayer.olFillFromWeaveFill(record.fill, 0.5);

			let olSelectionStyle = AbstractFeatureLayer.getOlSelectionStyle(olStroke);
			let olProbedStyle = AbstractFeatureLayer.getOlProbedStyle(olStroke);

			let normalStyle = [new ol.style.Style({
				fill: fillEnabled ? olFill : undefined,
				stroke: strokeEnabled ? olStroke : undefined,
				zIndex: 0
			})];

			let unselectedStyle = [new ol.style.Style({
				fill: fillEnabled ? olFill : undefined,
				stroke: strokeEnabled ? olStrokeFaded : undefined,
				zIndex: 0
			})];

			let selectedStyle = (strokeEnabled || fillEnabled) && AbstractFeatureLayer.getOlSelectionStyle(olStroke);
			let probedStyle = (strokeEnabled || fillEnabled) && AbstractFeatureLayer.getOlProbedStyle(olStroke);

			let feature = this.source.getFeatureById(record.id);

			if (feature)
			{
				//checking for point data
				if (feature.getGeometry() instanceof ol.geom.MultiPoint) {
					normalStyle = ScatterPlotLayer.getNormalStyle(record,strokeEnabled,fillEnabled,olStroke,olFill);
					unselectedStyle = ScatterPlotLayer.getUnselectedStyle(record,strokeEnabled,fillEnabled,olStrokeFaded,olFillFaded);
					selectedStyle = ScatterPlotLayer.getSelectedStyle(record,strokeEnabled,fillEnabled,olSelectionStyle);
					probedStyle = ScatterPlotLayer.getProbedStyle(record,strokeEnabled,fillEnabled,olProbedStyle);
				}

				let metaStyle:any = {};
				metaStyle.normalStyle = normalStyle;
				metaStyle.unselectedStyle = unselectedStyle;
				metaStyle.selectedStyle = selectedStyle;
				metaStyle.probedStyle = probedStyle;
				feature.setProperties(metaStyle);
			}
		}
	}
}

Weave.registerClass(
	GeometryLayer,
	["weavejs.tool.oltool.layer.GeometryLayer", "weave.visualization.plotters::GeometryPlotter"],
	[ILinkableObjectWithNewProperties, ISelectableAttributes],
	"Geometries"
);
