import lodash from "lodash";

export var layerRegistry = {};

export function registerLayerImplementation(asClassName, jsClass)
{
	if (!layerRegistry)
	{
		layerRegistry = {};
	}
	layerRegistry[asClassName] = jsClass;
}

export function newLayer(parent, layerName)
{
	let layerType = parent.plottersPath.push(layerName).getType();
	let LayerClass = layerRegistry[layerType];
	if (!LayerClass)
	{
		return null;
	}
	else
	{
		return new LayerClass(parent, layerName);
	}
}

class Layer {

	static newLayer(parent, layerName)
	{
		return newLayer(parent, layerName);
	}

	constructor(parent, layerName)
	{
		this.layerPath = parent.plottersPath.push(layerName);
		this.settingsPath = parent.layerSettingsPath.push(layerName);
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
		return this.layer && this.layer.getSource();
	}

	set source(value) {
		this.layer.setSource(value);
	}

	/* Handles initial apply of linked properties, adding/removing from map */
	set layer(value) {
		if (this._layer != null) {
			this.parent.map.removeLayer(this._layer);
		}

		this._layer = value;

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

	get layer() {
		return this._layer;
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

		propertyPath.addCallback(callback, false, false);
	}

	destroy()
	{
		this.layer = undefined;
	}
}
export default Layer;
