import Layer from "./Layer.js";
import StandardLib from "../../../Utils/StandardLib.js";
import ol from "openlayers";

export default class FeatureLayer extends Layer {
	/* A FeatureLayer assumes that each feature will have multiple custom style properties on each feature, which are managed based on selection. */
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.layer = new ol.layer.Vector();
		this.source = new ol.source.Vector({wrapX: false});

		this.probedSet = new Set();
		this.selectedSet = new Set();
		this.filteredSet = new Set();

		this.selectionKeySet = this.layerPath.selection_keyset;
		this.probeKeySet = this.layerPath.probe_keyset;
		this.subsetFilter = this.layerPath.push("filteredKeySet");

		let boundUpdateMetaStyles = this.updateMetaStyles.bind(this);

		let selectionKeyHandler = this.updateSetFromKeySet.bind(this, this.selectionKeySet, this.selectedSet);
		let probeKeyHandler = this.updateSetFromKeySet.bind(this, this.probeKeySet, this.probedSet);

		this.selectionKeySet.addKeySetCallback(selectionKeyHandler);
		this.probeKeySet.addKeySetCallback(probeKeyHandler);

		this.subsetFilter.addCallback(this.updateFilteredKeySet.bind(this), true);
		this.settingsPath.push("selectable").addCallback(boundUpdateMetaStyles);
	}

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


	updateSetFromKeySet(keySet, set, diff)
	{
		for (let key of diff.added)
		{
			set.add(key);
		}

		for (let key of diff.removed)
		{
			set.delete(key);
		}

		this.updateMetaStyles();
	}

	updateFilteredKeySet()
	{
		let sourceKeys = this.source.getFeatures().map(feature => feature.getId());


		this.filteredSet.clear();

		for (let key of this.subsetFilter.filterKeys(sourceKeys))
		{
			this.filteredSet.add(key);
		}

		this.updateMetaStyles();
	}

	updateMetaStyles()
	{
		this.tempSelectable = this.settingsPath.push("selectable").getState();

		this.source.forEachFeature(this.updateMetaStyle, this);
	}

	updateMetaStyle(feature)
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
			newStyle = [].concat(unselectedStyle);
		}
		else
		{
			newStyle = [].concat(normalStyle);
		}

		newStyle[0].setZIndex(zOrder);

		if (this.selectedSet.has(id))
		{
			if (replace)
			{
				newStyle = selectedStyle;
			}
			else
			{
				newStyle = newStyle.concat(selectedStyle);
			}

			newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER - 3);
		}

		if (this.probedSet.has(id))
		{
			if (replace)
			{
				newStyle = probedStyle;
			}
			else
			{
				newStyle = newStyle.concat(probedStyle);
			}

			newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER);
		}

		feature.setStyle(newStyle);
	}

	static olFillFromWeaveFill(fill, fade)
	{
		if (fade === undefined) fade = 1;

		let color = fill.color && FeatureLayer.toColorArray(fill.color, fill.alpha * fade) || [0, 0, 0, 0];
		return new ol.style.Fill({color});
	}

	static olStrokeFromWeaveStroke(stroke, fade)
	{
		if (fade === undefined) fade = 1;

		let color = stroke.color && FeatureLayer.toColorArray(stroke.color, stroke.alpha * fade) || [0, 0, 0, 1];

		let lineCap = stroke.lineCap === "none" ? "butt" : stroke.lineCap || "round";
		let lineJoin = stroke.lineJoin === null ? "round" : stroke.lineJoin || "round";
		let miterLimit = Number(stroke.miterLimit);
		let width = Number(stroke.weight);

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
}

FeatureLayer.SELECT_WIDTH = 5;
FeatureLayer.PROBE_HALO_WIDTH = 4;
FeatureLayer.PROBE_LINE_WIDTH = 1;

FeatureLayer.Styles = {
	NORMAL: "normalStyle",
	UNSELECTED: "unselectedStyle", /* For the case where a selection has been made in the layer but the element is not one of them. */
	SELECTED: "selectedStyle",
	PROBED: "probedStyle"
};

export default FeatureLayer;
