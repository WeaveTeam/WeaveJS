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
import LinkableString = weavejs.core.LinkableString;
import WeaveAPI = weavejs.WeaveAPI;

abstract class Layer implements ILinkableObject {

	handleMissingSessionStateProperties(newState:any)
	{

	}

	opacity: LinkableNumber = Weave.linkableChild(this, LinkableNumber);
	visible: LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);
	selectable: LinkableBoolean = Weave.linkableChild(this, LinkableBoolean);

	private projectionSRS: LinkableString; /* A reference to the parent's projectionSRS LinkableString */

	constructor()
	{
		WeaveAPI.Scheduler.callLater(this, this.registerUpdateProjection);
	}

	registerUpdateProjection():void
	{
		let parent: OpenLayersMapTool = Weave.getAncestor(this, OpenLayersMapTool) as OpenLayersMapTool;
		if (!parent)
		{
			WeaveAPI.Scheduler.callLater(this, this.registerUpdateProjection);
			return;
		}

		this.projectionSRS = parent.projectionSRS;
		this.projectionSRS.addGroupedCallback(this, this.updateProjection, true);
	}

	abstract updateProjection(): void;

	private _parent: OpenLayersMapTool = null;

	get parent(): OpenLayersMapTool {
		return this._parent;
	}

	set parent(mapTool: OpenLayersMapTool) {
		this._parent = mapTool;
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

	set olLayer(value:ol.layer.Layer) {
		if (!this.parent) {
			WeaveAPI.Scheduler.callLater(this, () => { this.olLayer = value });
			return;
		}
		if (value) {
			this._olLayer = value;
			this.parent.map.addLayer(value);

			this.opacity.addGroupedCallback(this, () => value.set("opacity", this.opacity.value), true);
			this.visible.addGroupedCallback(this, () => value.set("visible", this.visible.value), true);
			this.selectable.addGroupedCallback(this, () => value.set("selectable", this.selectable.value), true);

			value.set("layerObject", this); /* Need to store this backref */
		}
	}

	get olLayer():ol.layer.Layer {
		return this._olLayer;
	}

	get outputProjection():string
	{
		return (this.projectionSRS && this.projectionSRS.value) || (this.parent && this.parent.getDefaultProjection()) || OpenLayersMapTool.DEFAULT_PROJECTION;
	}

	dispose()
	{
		if (this._olLayer != null) {
			this.parent.map.removeLayer(this._olLayer);
		}
	}
}
export default Layer;
