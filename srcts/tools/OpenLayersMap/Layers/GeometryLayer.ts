///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import {FeatureLayer, MetaStyleProperties} from "./FeatureLayer";
import Layer from "./Layer";

import WeavePath = weavejs.path.WeavePath;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import LinkableBoolean = weavejs.core.LinkableBoolean;

import SolidFillStyle = weavejs.geom.SolidFillStyle;
import SolidLineStyle = weavejs.geom.SolidLineStyle;
import DynamicColumn = weavejs.data.column.DynamicColumn;


class GeometryLayer extends FeatureLayer {

	geoJsonParser:ol.format.GeoJSON;

	fill: SolidFillStyle = Weave.linkableChild(this, SolidFillStyle);
	line: SolidLineStyle = Weave.linkableChild(this, SolidLineStyle);
	geometryColumn: DynamicColumn = Weave.linkableChild(this, DynamicColumn);

	constructor()
	{
		super();
		console.log("GeometryLayer");

		this.geoJsonParser = new ol.format.GeoJSON();

		this.geometryColumn.addGroupedCallback(this, this.updateGeometryData);

		/* TODO: Register a callback on the parent's projection. */
		// this.projectionPath.addCallback(this, this.updateGeometryData);

		Weave.getCallbacks(this.filteredKeySet).removeCallback(this, this.updateMetaStyles);

		Weave.getCallbacks(this.fill).addGroupedCallback(this, this.updateStyleData);
		Weave.getCallbacks(this.line).addGroupedCallback(this, this.updateStyleData);

		this.filteredKeySet.setColumnKeySources([this.geometryColumn]);

		Weave.getCallbacks(this.filteredKeySet).addGroupedCallback(this, this.updateGeometryData, true);
	}

	handleMissingSessionStateProperties(newState:any)
	{
		super.handleMissingSessionStateProperties(newState);
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
		var rawGeometries = weavejs.data.ColumnUtils.getGeoJsonGeometries(idc, keys);

		for (let idx = 0; idx < keys.length; idx++)
		{
            let rawGeom = rawGeometries[idx];
            if (!rawGeom)
                continue;

			let id = keys[idx];

			let geometry = this.geoJsonParser.readGeometry(rawGeom, {dataProjection: this.inputProjection, featureProjection: this.outputProjection});

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
			let internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
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

			let olStroke = FeatureLayer.olStrokeFromWeaveStroke(record.stroke);

			let olFill = FeatureLayer.olFillFromWeaveFill(record.fill);

			let olStrokeFaded = FeatureLayer.olStrokeFromWeaveStroke(record.stroke, 0.5);
			let olFillFaded = FeatureLayer.olFillFromWeaveFill(record.fill, 0.5);

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

			let selectedStyle = (strokeEnabled || fillEnabled) && FeatureLayer.getOlSelectionStyle(olStroke);
			let probedStyle = (strokeEnabled || fillEnabled) && FeatureLayer.getOlProbedStyle(olStroke);

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
		}
	}
}

Weave.registerClass("weave.visualization.plotters::GeometryPlotter", GeometryLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default GeometryLayer;
