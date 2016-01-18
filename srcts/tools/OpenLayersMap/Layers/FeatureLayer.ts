///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";

import Layer from "./Layer";
import StandardLib from "../../../utils/StandardLib";

export abstract class FeatureLayer extends Layer {
	/* A FeatureLayer assumes that each feature will have multiple custom style properties on each feature, which are managed based on selection. */
	private updateMetaStyle:Function;
	private debounced_updateMetaStyles:Function;

	private changedItems:Set<string>;
	private probedSet:Set<string>;
	private selectedSet:Set<string>;
	private filteredSet:Set<string>;

	public selectionKeySet:WeavePath;
	public probeKeySet:WeavePath;
	public subsetFilter:WeavePath;
	private tempSelectable:boolean;

	source:ol.source.Vector;

	constructor(parent, layerName)
	{
		super(parent, layerName);
		
		this.updateMetaStyle = this.updateMetaStyle_unbound.bind(this);
		this.debounced_updateMetaStyles = lodash.debounce(this.updateMetaStyles.bind(this), 0);

		this.olLayer = new ol.layer.Vector();
		this.source = new ol.source.Vector({wrapX: false});

		/* Every feature that is added should register a handler to automatically recompute the metastyles when the styles change. */
		this.source.on("addfeature", this.onFeatureAdd, this);

		this.changedItems = new Set();
		this.probedSet = new Set();
		this.selectedSet = new Set();
		this.filteredSet = new Set();

		this.selectionKeySet = this.layerPath.selection_keyset;
		this.probeKeySet = this.layerPath.probe_keyset;
		this.subsetFilter = this.layerPath.subset_filter;//push("filteredKeySet");

		let selectionKeyHandler = this.updateSetFromKeySet.bind(this, this.selectionKeySet, this.selectedSet);
		let probeKeyHandler = this.updateSetFromKeySet.bind(this, this.probeKeySet, this.probedSet);

		this.selectionKeySet.addKeySetCallback(selectionKeyHandler);
		this.probeKeySet.addKeySetCallback(probeKeyHandler);

		this.subsetFilter.addCallback(this, this.updateFilteredKeySet, true);
		this.settingsPath.push("selectable").addCallback(this, this.updateMetaStyles);
	}

	onFeatureAdd(vectorEvent)
	{
		vectorEvent.feature.on("propertychange", this.onFeaturePropertyChange, this);
	}

	onFeaturePropertyChange(objectEvent)
	{
		let propertyName = objectEvent.key;

		if (!lodash.contains(FeatureLayer.Styles, propertyName))
		{
			/* The property that changed isn't one of our metaStyle properties, so we don't care. */
			return;
		}
		else
		{
			/* The property that changed was a metastyle, and as such the styles should be recomputed */
			this.debounced_updateMetaStyles();
		}
	}

	abstract updateStyleData():void;

	static toColorArray(colorString, alpha)
	{
		var colorArray;
		if (colorString[0] === "#")
		{
			colorArray = ol.color.asArray(colorString);
		}
		else
		{
			colorArray = ol.color.asArray("#" + StandardLib.decimalToHex(Number(colorString)));
		}

		colorArray = [].concat(colorArray); /* Should not be modified since it is cached in ol.color.asArray */

		if (!colorArray) {
			return null;
		}

		colorArray[3] = Number(alpha);
		return colorArray;
	}

	static toColorRGBA(colorString, alpha)
	{
		var colorArray = FeatureLayer.toColorArray(colorString, alpha);
		return ol.color.asString(colorArray);
	}

	updateSetFromKeySet(keySet, set, diff)
	{
		if (!this.source) return; //HACK
		
		let wasEmpty = set.size === 0;

		this.changedItems.clear();

		for (let key of diff.added)
		{
			set.add(key);
			this.changedItems.add(key);
		}

		for (let key of diff.removed)
		{
			set.delete(key);
			this.changedItems.add(key);
		}

		let isEmpty = set.size === 0;

		/* If a set becomes empty or nonempty, we should recompute all the styles. Otherwise, only recompute the styles of the features which changed. */
		if (isEmpty !== wasEmpty)
		{
			this.updateMetaStyles();
		}
		else
		{
			this.changedItems.forEach(function (featureId)
			{
				let feature = this.source.getFeatureById(featureId);
				if (feature)
				{
					this.updateMetaStyle(feature);
				}
			}, this);
		}
	}

	updateFilteredKeySet()
	{
		if (!this.source) return; //HACK
		
		let sourceKeys = this.source.getFeatures().map(feature => feature.getId());

		this.filteredSet.clear();

		var filteredKeys = this.subsetFilter.filterKeys(sourceKeys);
		for (let key of filteredKeys)
		{
			this.filteredSet.add(key);
		}

		this.updateMetaStyles();
	}

	updateMetaStyles()
	{
		if (!this.source) return; //HACK
		
		this.tempSelectable = this.settingsPath.push("selectable").getState();

		this.source.forEachFeature(this.updateMetaStyle, this);
	}

	updateMetaStyle_unbound(feature)
	{
		let id = feature.getId();
		let nullStyle = new ol.style.Style({});
		let unselectedStyle = feature.get("unselectedStyle") || nullStyle;
		let normalStyle = feature.get("normalStyle") || nullStyle;
		let selectedStyle = feature.get("selectedStyle") || nullStyle;
		let probedStyle = feature.get("probedStyle") || nullStyle;
		let zOrder = feature.get("zOrder") || 0;
		let replace = feature.get("replace");
		let newStyle;

		if (!this.filteredSet.has(id))
		{
			feature.setStyle(nullStyle);
			return;
		}

		if (!this.tempSelectable)
		{
			feature.setStyle(normalStyle);
			return;
		}

		if (!this.selectedSet.has(id) && !this.probedSet.has(id) && this.selectedSet.size > 0)
		{
			if (replace)
			{
				newStyle = unselectedStyle;
				newStyle.setZIndex(zOrder);
			}
			else
			{
				newStyle = [].concat(unselectedStyle);
				newStyle[0].setZIndex(zOrder);
			}

		}
		else
		{
			newStyle = [].concat(normalStyle);
			newStyle[0].setZIndex(zOrder);
		}

		if (this.selectedSet.has(id))
		{
			if (replace)
			{
				newStyle = selectedStyle;
				newStyle.setZIndex(Number.MAX_SAFE_INTEGER - 3);
			}
			else
			{
				newStyle = newStyle.concat(selectedStyle);
				newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER - 3);
			}
		}

		if (this.probedSet.has(id))
		{
			if (replace)
			{
				newStyle = probedStyle;
				newStyle.setZIndex(Number.MAX_SAFE_INTEGER);
			}
			else
			{
				newStyle = newStyle.concat(probedStyle);
				newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER);
			}
		}

		feature.setStyle(newStyle);
	}

	static olFillFromWeaveFill(fill, fade?)
	{
		if (fade === undefined) fade = 1;

		let color = fill.color && FeatureLayer.toColorArray(fill.color, fill.alpha * fade) || [0, 0, 0, 0];
		return new ol.style.Fill({color});
	}

	static olStrokeFromWeaveStroke(stroke:any, fade?:number)
	{
		if (fade === undefined) fade = 1;

		let color:Array<number> = stroke.color && FeatureLayer.toColorArray(stroke.color, stroke.alpha * fade) || [0, 0, 0, 1];

		let lineCap:string = stroke.lineCap === "none" ? "butt" : stroke.lineCap || "round";
		let lineJoin:string = stroke.lineJoin === null ? "round" : stroke.lineJoin || "round";
		let miterLimit:number = Number(stroke.miterLimit);
		let width:number = Number(stroke.weight);

		return new ol.style.Stroke({color, lineCap, lineJoin, miterLimit, width});
	}

	static getOlProbedStyle(baseStrokeStyle)
	{
		let width = baseStrokeStyle.getWidth();

		return [
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: [0, 0, 0, 1],
						width: width + FeatureLayer.PROBE_HALO_WIDTH + FeatureLayer.PROBE_LINE_WIDTH
					}),
					zIndex: Number.MAX_SAFE_INTEGER - 2
				}),
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: [255, 255, 255, 1],
						width: width + FeatureLayer.PROBE_HALO_WIDTH
					}),
					zIndex: Number.MAX_SAFE_INTEGER - 1
				})
		];
	}

	static getOlSelectionStyle(baseStrokeStyle)
	{
		let width = baseStrokeStyle.getWidth();
		let lineCap = baseStrokeStyle.getLineCap();
		let lineJoin = baseStrokeStyle.getLineJoin();
		let miterLimit = baseStrokeStyle.getMiterLimit();

		return [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: [0, 0, 0, 0.5],
					width: width + FeatureLayer.SELECT_WIDTH,
					lineCap, lineJoin, miterLimit}),
				zIndex: Number.MAX_SAFE_INTEGER - 4
		})];
	}

	static SELECT_WIDTH:number = 5;
	static PROBE_HALO_WIDTH:number = 4;
	static PROBE_LINE_WIDTH:number = 1;
	static Styles:Object = {
		NORMAL: "normalStyle",
		UNSELECTED: "unselectedStyle", /* For the case where a selection has been made in the layer but the element is not one of them. */
		SELECTED: "selectedStyle",
		PROBED: "probedStyle"	
	}
};

export interface MetaStyleProperties {
	normalStyle: ol.style.Style|Array<ol.style.Style>;
	unselectedStyle: ol.style.Style|Array<ol.style.Style>;
	selectedStyle: ol.style.Style|Array<ol.style.Style>;
	probedStyle: ol.style.Style|Array<ol.style.Style>;
};

export default FeatureLayer;
