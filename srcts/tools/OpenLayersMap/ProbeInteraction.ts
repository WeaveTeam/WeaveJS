///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import AbstractFeatureLayer from "./Layers/AbstractFeatureLayer";
import OpenLayersMapTool from "../OpenLayersMapTool";
import {IToolTipState} from "../ToolTip";
import ToolTip from "../ToolTip";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import KeySet = weavejs.data.key.KeySet;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;

export default class ProbeInteraction extends ol.interaction.Pointer
{
	private topKey: IQualifiedKey;
	private topZIndex: number;
	private topKeySet: KeySet;
	private topLayer: AbstractFeatureLayer;
	private tool: OpenLayersMapTool;

	constructor(tool:OpenLayersMapTool)
	{
		super({handleMoveEvent: ProbeInteraction.prototype.handleMoveEvent});
		this.tool = tool;
	}

	setMap(map:ol.Map)
	{
		super.setMap(map);
		let element: Element = map.getTargetElement();

		map.getTargetElement().addEventListener('mouseout', this.handleOutEvent.bind(this));
	}

	private onFeatureAtPixel(feature: ol.Feature, layer: ol.layer.Layer):void
	{
		let zIndex: number = layer.getZIndex();


		if (zIndex > this.topZIndex)
		{
			let weaveLayerObject = layer.get("layerObject") as AbstractFeatureLayer;
			if (!weaveLayerObject)
				return;
			this.topKeySet = weaveLayerObject.probeKeySet || this.topKeySet;
			this.topZIndex = zIndex;
			this.topKey = feature.getId();
			this.topLayer = weaveLayerObject;
		}
	}

	private pixelToKey(pixel:ol.Pixel):IQualifiedKey
	{
		let map: ol.Map = this.getMap();

		this.topKeySet = null;
		this.topZIndex = -Infinity;
		this.topLayer = null;
		this.topKey = null;
		
		map.forEachFeatureAtPixel(pixel, this.onFeatureAtPixel, this, OpenLayersMapTool.selectableLayerFilter);



		if (this.topKey && this.topKeySet)
		{
			this.topKeySet.replaceKeys([this.topKey]);
		}
		
		for (let layer of map.getLayers().getArray())
		{
			if (!OpenLayersMapTool.selectableLayerFilter(layer))
				continue;
			let weaveLayerObject: AbstractFeatureLayer = layer.get("layerObject");
			let keySet: KeySet = weaveLayerObject.probeKeySet;
			if (keySet && keySet != this.topKeySet)
			{
				keySet.clearKeys();
			}
		}

		return this.topKey;
	}

	private handleMoveEvent(event:ol.MapBrowserEvent)
	{
        if (!this.tool.props.toolTip)
            return;
        
		let key:IQualifiedKey = this.pixelToKey(event.pixel);
		if (key)
		{
			let browserEvent: MouseEvent = <MouseEvent>(event.originalEvent);
			this.tool.props.toolTip.show(this.tool, browserEvent, [key], this.topLayer.getToolTipColumns());
		}
		else
		{
			this.tool.props.toolTip.hide();
		}
	}

	handleOutEvent(event:MouseEvent)
	{
		for (let layer of this.getMap().getLayers().getArray())
		{
			if (!OpenLayersMapTool.selectableLayerFilter(layer))
				continue;
			let weaveLayerObject: AbstractFeatureLayer = layer.get("layerObject");
			let keySet: KeySet = weaveLayerObject.probeKeySet;
			if (keySet)
				keySet.clearKeys();
		}

		if (this.tool.props.toolTip)
			this.tool.props.toolTip.hide();
	}
}