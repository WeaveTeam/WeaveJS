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

class GeometryLayer extends FeatureLayer {

	geoJsonParser:any; //TODO ol.format.GeoJSON
	geoColumnPath: WeavePath;

	fillStylePath: WeavePath;

	lineStylePath: WeavePath;

	constructor(parent:any, layerName:any)
	{
		super(parent, layerName);

		this.geoJsonParser = new ol.format.GeoJSON();

		this.geoColumnPath = this.layerPath.push("geometryColumn");
		this.fillStylePath = this.layerPath.push("fill");

		this.lineStylePath = this.layerPath.push("line");

		this.geoColumnPath.addCallback(this, this.updateGeometryData);
		this.projectionPath.addCallback(this, this.updateGeometryData);
		Weave.getCallbacks(this.filteredKeySet).removeCallback(this, this.updateMetaStyles);

		this.fillStylePath.addCallback(this, this.updateStyleData);
		this.lineStylePath.addCallback(this, this.updateStyleData);
		this.filteredKeySet.setColumnKeySources([this.geoColumnPath.getObject("internalDynamicColumn")]);

		Weave.getCallbacks(this.filteredKeySet).addGroupedCallback(this, this.updateGeometryData, true);
	}

	handleMissingSessionStateProperties(newState:any)
	{

	}

	get inputProjection():any
	{
		var projectionSpec = (this.geoColumnPath.getObject("internalDynamicColumn") as IAttributeColumn).getMetadata('projection');
		return projectionSpec || this.outputProjection;
	}

	updateGeometryData()
	{
		this.source.clear();

		var idc = this.geoColumnPath.getObject("internalDynamicColumn") as IAttributeColumn;
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

		for (let column of this.fillStylePath.getChildren().concat(this.lineStylePath.getChildren()))
		{
			let internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		return additionalColumns;
	}

	updateStyleData()
	{
		let fillEnabled: boolean = (this.fillStylePath.getObject("enable") as LinkableBoolean).value;
		let strokeEnabled: boolean = (this.lineStylePath.getObject("enable") as LinkableBoolean).value;
		let fillStyle = this.fillStylePath.getObject() as SolidFillStyle;
		let strokeStyle = this.lineStylePath.getObject() as SolidLineStyle;

		for (let key of this.filteredKeySet.keys)
		{
			let record: any = {};

			record.id = key;
			record.fill = fillStyle.getStyle(key);
			record.stroke = strokeStyle.getStyle(key);

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

Layer.registerClass("weave.visualization.plotters::GeometryPlotter", GeometryLayer, ['ILinkableObjectWithNewProperties']);
export default GeometryLayer;
