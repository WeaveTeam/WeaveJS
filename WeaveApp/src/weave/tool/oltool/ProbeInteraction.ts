import * as React from "react";
import * as weavejs from "weavejs";
import * as ol from "openlayers";

import IToolTipState = weavejs.ui.IToolTipState;
import ToolTip = weavejs.ui.ToolTip;
import ReactUtils = weavejs.util.ReactUtils;

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import KeySet = weavejs.data.key.KeySet;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;
import {AbstractFeatureLayer} from "weave/tool/oltool/layer/AbstractFeatureLayer";
import OpenLayersMapTool from "weave/tool/oltool/OpenLayersMapTool";

export default class ProbeInteraction extends ol.interaction.Pointer
{
	private topKey: IQualifiedKey;
	private topZIndex: number;
	private topKeySet: KeySet;
	private topLayer: AbstractFeatureLayer;
	private tool: OpenLayersMapTool;
	private toolTip: ToolTip;

	constructor(tool:OpenLayersMapTool)
	{
		super({handleMoveEvent: ProbeInteraction.prototype.handleMoveEvent});
		this.tool = tool;
		this.toolTip = ReactUtils.openPopup(tool, React.createElement(ToolTip)) as ToolTip;
		ReactUtils.onUnmount(this.tool, () => ReactUtils.closePopup(this.toolTip));
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

		map.forEachFeatureAtPixel(pixel, this.onFeatureAtPixel, this, AbstractFeatureLayer.selectableLayerFilter);



		if (this.topKey && this.topKeySet)
		{
			this.topKeySet.replaceKeys([this.topKey]);
		}

		for (let layer of map.getLayers().getArray())
		{
			if (!AbstractFeatureLayer.selectableLayerFilter(layer))
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
		let key:IQualifiedKey = this.pixelToKey(event.pixel);
		if (key)
		{
			let browserEvent = event.originalEvent as MouseEvent;
			this.toolTip.show(this.tool, browserEvent, [key], this.topLayer.getToolTipColumns());
		}
		else
		{
			this.toolTip.hide();
		}
	}

	handleOutEvent(event:MouseEvent)
	{
		for (let layer of this.getMap().getLayers().getArray())
		{
			if (!AbstractFeatureLayer.selectableLayerFilter(layer))
				continue;
			let weaveLayerObject: AbstractFeatureLayer = layer.get("layerObject");
			let keySet: KeySet = weaveLayerObject.probeKeySet;
			if (keySet)
				keySet.clearKeys();
		}

		this.toolTip.hide();
	}
}
