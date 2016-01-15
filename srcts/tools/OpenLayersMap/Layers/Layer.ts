import * as lodash from "lodash";
declare var weavejs:any;
declare var Weave:any;

class Layer {

	handleMissingSessionStateProperties(newState)
	{

	}

	constructor(parent, layerName)
	{
		this.layerPath = parent.plottersPath.push(layerName);
		this.settingsPath = parent.layerSettingsPath.push(layerName);
		this.projectionPath = parent.toolPath.push("projectionSRS");
		this.parent = parent;
		this.layerName = layerName;
		this.layer = null;
		this._layerReadyCallbacks = {};

		this.linkProperty(this.settingsPath.push("alpha"), "opacity");
		this.linkProperty(this.settingsPath.push("visible"), "visible");
		this.linkProperty(this.settingsPath.push("selectable"), "selectable");
		/* TODO max and minvisiblescale, map to min/max resolution. */
	}

	get source() {
		return this.internalLayer && this.layer.getSource();
	}

	set source(value) {
		this.layer.setSource(value);
	}

	/* Handles initial apply of linked properties, adding/removing from map */
	set olLayer(value) {
		this._olLayer = value;

		if (value) {
			this.parent.map.addLayer(value);

			value.set("layerObject", this); /* Need to store this backref */

			if (value) {
				for (let name in this._layerReadyCallbacks) {
					this._layerReadyCallbacks[name]();
				}
			}
		}
	}

	get olLayer() {
		return this._olLayer;
	}

	linkProperty(propertyPath, propertyName, inTransform)
	{
		/* change in path modifying propertyName */
		inTransform = inTransform || lodash.identity;

		var callback = () => {
				if (this.layer) {
					this.layer.set(propertyName, inTransform(propertyPath.getState()));
				}
			};

		this._layerReadyCallbacks[propertyName] = callback;

		propertyPath.addCallback(this, callback, false, false);
	}

	dispose()
	{
		if (this._layer != null) {
			this.parent.map.removeLayer(this._layer);
		}
	}
}
export default Layer;
Weave.registerClass("weavejs.tools.AbstractLayer", Layer, [weavejs.api.core.ILinkableObjectWithNewProperties]);