///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import OpenLayersMapTool from "../../OpenLayersMapTool";
import * as lodash from "lodash";

abstract class Layer {
	static layerRegistry:Map<string,any>;
	static registerClass(asClassName:string, jsClass:any, interfaces?:Array<any>)
	{
		if (!Layer.layerRegistry)
		{
			Layer.layerRegistry = new Map<string,any>();
		}
		Layer.layerRegistry.set(asClassName, jsClass);
	}

	static newLayer(parent:OpenLayersMapTool, layerName:string)
	{
		let path:WeavePath = parent.plottersPath.push(layerName);
		let layerType:string = path.getType();
		let LayerClass:any = Layer.layerRegistry.get(layerType);
		if (LayerClass)
		{
			return new LayerClass(parent, layerName);
		}
		return null;
	}

	handleMissingSessionStateProperties(newState)
	{

	}

	layerPath:WeavePath;
	settingsPath:WeavePath;
	projectionPath:WeavePath;
	layerName:string;
	parent:OpenLayersMapTool;

	_olLayer:ol.layer.Layer;
	_layerReadyCallbacks:Map<string,Function>;


	constructor(parent, layerName)
	{
		this.layerPath = parent.plottersPath.push(layerName);
		this.settingsPath = parent.layerSettingsPath.push(layerName);
		this.projectionPath = parent.toolPath.push("projectionSRS");
		this.parent = parent;
		this.layerName = layerName;
		this._olLayer = null;
		this._layerReadyCallbacks = new Map<string,Function>();

		this.linkProperty(this.settingsPath.push("alpha"), "opacity");
		this.linkProperty(this.settingsPath.push("visible"), "visible");
		this.linkProperty(this.settingsPath.push("selectable"), "selectable");
		/* TODO max and minvisiblescale, map to min/max resolution. */
	}

	get source() {
		return this.olLayer && this.olLayer.getSource();
	}

	set source(value) {
		this.olLayer.setSource(value);
	}

	/* Handles initial apply of linked properties, adding/removing from map */
	set olLayer(value) {
		this._olLayer = value;

		if (value) {
			this.parent.map.addLayer(value);

			value.set("layerObject", this); /* Need to store this backref */

			if (value) {
				for (let name of this._layerReadyCallbacks.keys()) {
					this._layerReadyCallbacks.get(name)();
				}
			}
		}
	}

	get olLayer() {
		return this._olLayer;
	}
	
	get inputProjection()
	{
		return null;
	}
	
	get outputProjection()
	{
		return this.projectionPath.getState() || "EPSG:3857";
	}

	linkProperty(propertyPath:WeavePath, propertyName:string, inTransform?:Function)
	{
		/* change in path modifying propertyName */
		inTransform = inTransform || lodash.identity;

		var callback = () => {
				if (this.olLayer) {
					this.olLayer.set(propertyName, inTransform(propertyPath.getState()));
				}
			};

		this._layerReadyCallbacks.set(propertyName, callback);

		propertyPath.addCallback(this, callback, false, false);
	}

	dispose()
	{
		if (this._olLayer != null) {
			this.parent.map.removeLayer(this._olLayer);
		}
	}
}
export default Layer;
