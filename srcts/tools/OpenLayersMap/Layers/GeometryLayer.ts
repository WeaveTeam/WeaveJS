///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import {FeatureLayer, MetaStyleProperties} from "./FeatureLayer";
import Layer from "./Layer";

declare var weavejs:any;
declare var Weave:any;

import ILinkableHashMap = weavejs_fake.api.core.ILinkableHashMap;
import IAttributeColumn = weavejs_fake.api.data.IAttributeColumn;

class GeometryLayer extends FeatureLayer {

	geoJsonParser:any; //TODO ol.format.GeoJSON
	geoColumnPath: WeavePath;

	fillStylePath: WeavePath;
	fillColorColumn: IAttributeColumn;
	fillAlphaColumn: IAttributeColumn;
	fillImageURLColumn: IAttributeColumn;

	lineStylePath: WeavePath;
	lineColorColumn: IAttributeColumn;
	lineAlphaColumn: IAttributeColumn;
	lineWeightColumn: IAttributeColumn;
	lineCapColumn: IAttributeColumn;
	lineJoinColumn: IAttributeColumn;
	lineMiterColumn: IAttributeColumn;

	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.geoJsonParser = new ol.format.GeoJSON();

		this.geoColumnPath = this.layerPath.push("geometryColumn");
		this.fillStylePath = this.layerPath.push("fill");

		this.fillColorColumn = this.fillStylePath.getObject("color");
		this.fillAlphaColumn = this.fillStylePath.getObject("alpha");
		this.fillImageURLColumn = this.fillStylePath.getObject("imageURL");

		this.lineStylePath = this.layerPath.push("line");

		this.lineColorColumn = this.lineStylePath.getObject("color");
		this.lineAlphaColumn = this.lineStylePath.getObject("alpha");
		this.lineWeightColumn = this.lineStylePath.getObject("weight");
		this.lineCapColumn = this.lineStylePath.getObject("caps");
		this.lineJoinColumn = this.lineStylePath.getObject("joints");
		this.lineMiterColumn = this.lineStylePath.getObject("miterLimit");

		this.geoColumnPath.addCallback(this, this.updateGeometryData);
		this.projectionPath.addCallback(this, this.updateGeometryData);
		this.filteredKeySet.removeCallback(this, this.updateMetaStyles);

		this.fillStylePath.addCallback(this, this.updateStyleData);
		this.lineStylePath.addCallback(this, this.updateStyleData);
		(<any>this.filteredKeySet).setColumnKeySources([this.geoColumnPath.getObject("internalDynamicColumn")]);

		this.filteredKeySet.addGroupedCallback(this, this.updateGeometryData, true);
	}

	handleMissingSessionStateProperties(newState)
	{

	}
    
	get inputProjection()
	{
		var projectionSpec = this.geoColumnPath.getObject("internalDynamicColumn").getMetadata('projection');
		return projectionSpec || this.outputProjection;
	}
	
	updateGeometryData()
	{
		this.source.clear();

		var idc = this.geoColumnPath.getObject("internalDynamicColumn");
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

	getToolTipColumns(): Array<any> /* Array<IAttributeColumn> */
	{
		let additionalColumns: Array<any> = new Array<any>();

		for (let column of this.fillStylePath.getChildren().concat(this.lineStylePath.getChildren()))
		{
			let internalColumn = weavejs.data.ColumnUtils.hack_findInternalDynamicColumn(column.getObject());
			if (internalColumn)
				additionalColumns.push(internalColumn);
		}

		return additionalColumns;
	}

	getFillObjectFromKey(key:IQualifiedKey):Object
	{
		let color:number = this.fillColorColumn.getValueFromKey(key, Number);
		let alpha: number = this.fillAlphaColumn.getValueFromKey(key, Number);
		let imageURL: number = this.fillAlphaColumn.getValueFromKey(key, String);

		return { color, alpha, imageURL };
	}

	getStrokeObjectFromKey(key:IQualifiedKey):Object
	{
		let color: number = this.lineColorColumn.getValueFromKey(key, Number);
		let alpha: number = this.lineAlphaColumn.getValueFromKey(key, Number);
		let weight: number = this.lineWeightColumn.getValueFromKey(key, Number);
		let lineCap: number = this.lineCapColumn.getValueFromKey(key, String);
		let lineJoin: number = this.lineJoinColumn.getValueFromKey(key, String);
		let miterLimit: number = this.lineMiterColumn.getValueFromKey(key, Number);

		return { color, alpha, weight, lineCap, lineJoin, miterLimit };

	}

	updateStyleData()
	{
		let fillEnabled: boolean = this.fillStylePath.getObject("enable").state;
		let strokeEnabled: boolean = this.lineStylePath.getObject("enable").state;

		for (let key of this.filteredKeySet.keys)
		{
			let record: any = {};

			record.id = key;
			record.fill = this.getFillObjectFromKey(key);
			record.stroke = this.getStrokeObjectFromKey(key);

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

Layer.registerClass("weave.visualization.plotters::GeometryPlotter", GeometryLayer, [weavejs.api.core.ILinkableObjectWithNewProperties]);
export default GeometryLayer;
