///<reference path="../../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../../typings/weave/weavejs.d.ts"/>

import WeavePath = weavejs.path.WeavePath;

import OpenLayersMapTool from "../../OpenLayersMapTool";
import * as lodash from "lodash";

import ILinkableObject = weavejs.api.core.ILinkableObject;
import LinkableNumber = weavejs.core.LinkableNumber;
import LinkableBoolean = weavejs.core.LinkableBoolean;
import LinkableVariable = weavejs.core.LinkableVariable;
import WeaveAPI = weavejs.WeaveAPI;



abstract class Layer implements ILinkableObject {
	get parent():OpenLayersMapTool
	{
		return this._parent;
	}

	set parent(mapTool:OpenLayersMapTool)
	{
		this._parent = mapTool;
	}

	handleMissingSessionStateProperties(newState:any)
	{

	}

	opacity: LinkableNumber = Weave.linkableChild(this, LinkableNumber);
	visible: LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
	selectable: LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);

	private _parent:OpenLayersMapTool = null;

	constructor()
	{
		this.opacity.addGroupedCallback(this, this.getSetter("opacity", this.opacity), true);
		this.visible.addGroupedCallback(this, this.getSetter("visible", this.visible), true);
		this.selectable.addGroupedCallback(this, this.getSetter("selectable", this.selectable), true);
	}

	getSetter(propName:string, linkableProperty:LinkableVariable):Function
	{
		let setter:Function = () => {
			if (this.olLayer) {
				this.olLayer.set(propName, linkableProperty.state);
			}
			else {
				WeaveAPI.Scheduler.callLater(this, setter);
			}
		};
		return setter;
	}

	private _source: ol.source.Source;

	get source():ol.source.Source {
		return this._source;
	}

	set source(value:ol.source.Source) {

		this._source = value;

		if (!this.olLayer)
		{
			WeaveAPI.Scheduler.callLater(this, () => { this.source = value });
			return;
		}

		this.olLayer.setSource(value);
	}

	private _olLayer: ol.layer.Layer = null;

	/* Handles initial apply of linked properties, adding/removing from map */
	set olLayer(value) {
		if (!this.parent) {
			WeaveAPI.Scheduler.callLater(this, () => { this.olLayer = value });
			return;
		}
		if (value) {
			this._olLayer = value;
			this.parent.map.addLayer(value);

			value.set("layerObject", this); /* Need to store this backref */
		}
	}

	get olLayer():any {
		return this._olLayer;
	}

	get inputProjection():any
	{
		return null;
	}

	get outputProjection():any
	{
		return (this.parent && this.parent.projectionSRS.value) || "EPSG:3857";
	}

	dispose()
	{
		if (this._olLayer != null) {
			this.parent.map.removeLayer(this._olLayer);
		}
	}
}
export default Layer;
