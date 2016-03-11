///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";

import AbstractLayer from "./AbstractLayer";

import StandardLib = weavejs.util.StandardLib;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import KeySet = weavejs.data.key.KeySet;
import FilteredKeySet = weavejs.data.key.FilteredKeySet;
import DynamicKeyFilter = weavejs.data.key.DynamicKeyFilter;
import IKeySet = weavejs.api.data.IKeySet;

export abstract class AbstractFeatureLayer extends AbstractLayer
{
	/* A FeatureLayer assumes that each feature will have multiple custom style properties on each feature, which are managed based on selection. */
	private updateMetaStyle:Function;
	private debounced_updateMetaStyles:Function;

	private changedItems:Set<IQualifiedKey>;

	filteredKeySet = Weave.linkableChild(this, FilteredKeySet);
	selectionFilter = Weave.linkableChild(this, DynamicKeyFilter);
	probeFilter = Weave.linkableChild(this, DynamicKeyFilter);

	get selectionKeySet()
	{
		var keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}
	isSelected(key:IQualifiedKey):boolean
	{
		var keySet = this.selectionFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	}
	 
	get probeKeySet()
	{
		var keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet ? keySet : null;
	}
	isProbed(key:IQualifiedKey):boolean
	{
		var keySet = this.probeFilter.target as KeySet;
		return keySet instanceof KeySet && keySet.containsKey(key);
	} 

	styleResolutionDependent: boolean = false;

	source:ol.source.Vector;

	constructor()
	{
		super();

		this.selectionFilter.targetPath = ["defaultSelectionKeySet"];
		this.probeFilter.targetPath = ["defaultProbeKeySet"];
	
		this.updateMetaStyle = this.updateMetaStyle_unbound.bind(this);
		this.debounced_updateMetaStyles = lodash.debounce(this.updateMetaStyles.bind(this), 0);

		this.olLayer = new ol.layer.Vector();
		this.source = new ol.source.Vector({wrapX: false});

		/* Every feature that is added should register a handler to automatically recompute the metastyles when the styles change. */
		this.source.on("addfeature", this.onFeatureAdd, this);

		this.changedItems = new Set();

		let selectionKeyHandler = this.updateSetFromKeySet.bind(this, this.selectionFilter, new Set<IQualifiedKey>());
		let probeKeyHandler = this.updateSetFromKeySet.bind(this, this.probeFilter, new Set<IQualifiedKey>());

		this.selectionFilter.addGroupedCallback(this, selectionKeyHandler, true);
		this.probeFilter.addGroupedCallback(this, probeKeyHandler, true);
		Weave.getCallbacks(this.filteredKeySet).addGroupedCallback(this, this.updateMetaStyles, true);

		this.selectable.addGroupedCallback(this, this.updateMetaStyles);
	}

	onFeatureAdd(vectorEvent:any)
	{
		vectorEvent.feature.on("propertychange", this.onFeaturePropertyChange, this);
	}

	onFeaturePropertyChange(objectEvent:any)
	{
		let propertyName = objectEvent.key;

		if (!lodash.contains(AbstractFeatureLayer.Styles, propertyName))
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

	getToolTipColumns(): Array<any> /* Array<IAttributeColumn> */
	{
		return [];
	}

	static toColorArray(color: string|number, alpha:any)
	{
		var colorArray:any;

		if (typeof color == "number")
		{
			var hexColor = StandardLib.getHexColor(color as number);
			if (!hexColor)
				return null;
			colorArray = ol.color.asArray(hexColor);
		}
		else /* if typeof color is string */
		{
			if ((color as string)[0] === "#")
			{
				colorArray = ol.color.asArray(color as string);
			}
			else
			{
				colorArray = ol.color.asArray(StandardLib.getHexColor(Number(color)));
			}
		}

		colorArray = [].concat(colorArray); /* Should not be modified since it is cached in ol.color.asArray */

		if (!colorArray)
		{
			return null;
		}

		colorArray[3] = Number(alpha);
		return colorArray;
	}

	static toColorRGBA(colorString:any, alpha:any)
	{
		var colorArray = AbstractFeatureLayer.toColorArray(colorString, alpha);
		if (!colorArray)
			colorArray = [0, 0, 0, 0];
		return ol.color.asString(colorArray);
	}

	updateSetFromKeySet(keyFilter:DynamicKeyFilter, previousContents:Set<IQualifiedKey>):void
	{
		let keySet: KeySet = keyFilter.getInternalKeyFilter() as KeySet;
		if (!keySet)
			return; //HACK
		if (!this.source)
			return; //HACK

		let wasEmpty:boolean = previousContents.size === 0;
		let isEmpty:boolean = keySet.keys.length === 0;

		/* If the selection keyset becomes empty or nonempty, we should recompute all the styles. Otherwise, only recompute the styles of the features which changed. */
		if (keyFilter === this.selectionFilter && isEmpty !== wasEmpty)
		{
			this.updateMetaStyles();
		}
		else
		{
			this.changedItems.clear();

			for (let key of keySet.keys)
			{
				if (!previousContents.has(key))
					this.changedItems.add(key);
			}

			for (let key of previousContents)
			{
				if (!keySet.containsKey(key))
					this.changedItems.add(key);
			}

			this.changedItems.forEach(function (featureId)
			{
				let feature = this.source.getFeatureById(featureId);
				if (feature)
				{
					this.updateMetaStyle(feature);
				}
			}, this);
		}

		previousContents.clear();
		for (let key of keySet.keys) previousContents.add(key);
	}

	updateMetaStyles():void
	{
		if (!this.source)
			return; //HACK

		this.source.forEachFeature(this.updateMetaStyle, this);
	}

	updateMetaStyle_unbound(feature:any):void
	{
		let id:IQualifiedKey = <IQualifiedKey>feature.getId();
		let nullStyle:any = new ol.style.Style({});
		let unselectedStyle:any = feature.get("unselectedStyle") || nullStyle;
		let normalStyle:any = feature.get("normalStyle") || nullStyle;
		let selectedStyle:any = feature.get("selectedStyle") || nullStyle;
		let probedStyle:any = feature.get("probedStyle") || nullStyle;
		let zOrder:any = feature.get("zOrder") || 0;
		let replace:any = feature.get("replace");
		let newStyle:any;

		let isInFilter: boolean = this.filteredKeySet.containsKey(id);
		let isSelected: boolean = this.isSelected(id);
		let isProbed: boolean = this.isProbed(id);

		if (!isInFilter)
		{
			feature.setStyle(nullStyle);
			return;
		}

		if (!this.selectable.state)
		{
			feature.setStyle(normalStyle);
			return;
		}

		if (!isSelected &&
			!isProbed &&
			this.selectionKeySet.keys.length > 0)
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

		if (isSelected)
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

		if (isProbed)
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

	static olFillFromWeaveFill(fill:any, fade?:any):ol.style.Fill
	{
		if (fade === undefined) fade = 1;

		let color = fill.color && AbstractFeatureLayer.toColorArray(fill.color, fill.alpha * fade) || [0, 0, 0, 0];
		return new ol.style.Fill({color});
	}

	static olStrokeFromWeaveStroke(stroke:any, fade?:number):ol.style.Stroke
	{
		if (fade === undefined) fade = 1;

		let color:Array<number> = (stroke.color !== undefined && stroke.color !== null) && AbstractFeatureLayer.toColorArray(stroke.color, stroke.alpha * fade) || [0, 0, 0, 1];

		let lineCap:string = stroke.lineCap === "none" ? "butt" : stroke.lineCap || "round";
		let lineJoin:string = stroke.lineJoin === null ? "round" : stroke.lineJoin || "round";
		let miterLimit:number = Number(stroke.miterLimit);
		let width:number = Number(stroke.weight);
		if (width == 0) color[3] = 0; /* If the width is 0, set alpha to 0 to avoid rendering; canvas context would ignore setting width to 0 */

		return new ol.style.Stroke({color, lineCap, lineJoin, miterLimit, width});
	}

	static getOlProbedStyle(baseStrokeStyle:any):Array<ol.style.Style>
	{
		let width = baseStrokeStyle.getWidth();

		return [
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: [0, 0, 0, 1],
						width: width + AbstractFeatureLayer.PROBE_HALO_WIDTH + AbstractFeatureLayer.PROBE_LINE_WIDTH
					}),
					zIndex: Number.MAX_SAFE_INTEGER - 2
				}),
				new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: [255, 255, 255, 1],
						width: width + AbstractFeatureLayer.PROBE_HALO_WIDTH
					}),
					zIndex: Number.MAX_SAFE_INTEGER - 1
				})
		];
	}

	static getOlSelectionStyle(baseStrokeStyle:any):Array<ol.style.Style>
	{
		let width = baseStrokeStyle.getWidth();
		let lineCap = baseStrokeStyle.getLineCap();
		let lineJoin = baseStrokeStyle.getLineJoin();
		let miterLimit = baseStrokeStyle.getMiterLimit();

		return [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: [0, 0, 0, 0.5],
					width: width + AbstractFeatureLayer.SELECT_WIDTH,
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

export interface MetaStyleProperties
{
	normalStyle: ol.style.Style|Array<ol.style.Style>;
	unselectedStyle: ol.style.Style|Array<ol.style.Style>;
	selectedStyle: ol.style.Style|Array<ol.style.Style>;
	probedStyle: ol.style.Style|Array<ol.style.Style>;
};

export default AbstractFeatureLayer;
