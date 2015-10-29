import Layer from "./Layer.js";

export default class FeatureLayer extends Layer {
	/* A FeatureLayer assumes that each feature will have multiple custom style properties on each feature, which are managed based on selection. */
	constructor(parent, layerName)
	{
		super(parent, layerName);

		this.probedSet = new Set();
		this.selectedSet = new Set();

		let selectionKeySet = this.layerPath.selection_keyset;
		let probeKeySet = this.layerPath.probe_keyset;

		let selectionKeyHandler = this.updateSetFromKeySet.bind(this, selectionKeySet, this.selectedSet);
		let probeKeyHandler = this.updateSetFromKeySet.bind(this, probeKeySet, this.probedSet);

		selectionKeySet.addKeySetCallback(selectionKeyHandler);
		probeKeySet.addKeySetCallback(probeKeyHandler);

		this.settingsPath.push("selectable").addCallback(this.updateMetaStyles.bind(this));
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

	updateMetaStyles()
	{
		this.tempSelectable = this.settingsPath.push("selectable").getState();
		this.source.forEachFeature(this.updateMetaStyle, this);
	}

	updateMetaStyle(feature)
	{
		let id = feature.getId();

		let unselectedStyle = feature.get("unselectedStyle");
		let normalStyle = feature.get("normalStyle");
		let selectedStyle = feature.get("selectedStyle");
		let probedStyle = feature.get("probedStyle");
		let newStyle;

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

		newStyle[0].setZIndex(0);

		if (this.selectedSet.has(id))
		{
			newStyle = newStyle.concat(selectedStyle);
			newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER - 3);
		}

		if (this.probedSet.has(id))
		{
			newStyle = newStyle.concat(probedStyle);
			newStyle[0].setZIndex(Number.MAX_SAFE_INTEGER);
		}

		feature.setStyle(newStyle);
	}

}
