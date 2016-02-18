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
			if (!weaveLayerObject) return;
			this.topKeySet = weaveLayerObject.probeKeySet.getInternalKeySet() as KeySet || this.topKeySet;
			this.topZIndex = zIndex;
			this.topKey = feature.getId();
			this.topLayer = weaveLayerObject;
		}
	}

	private static layerFilter(layer:ol.layer.Base):boolean
	{
		return layer.get("selectable");
	}

	private pixelToKey(pixel:ol.Pixel):any
	{
		let map: ol.Map = this.getMap();

		this.topKeySet = null;
		this.topZIndex = -Infinity;
		this.topLayer = null;
		this.topKey = null;
		
		map.forEachFeatureAtPixel(pixel, this.onFeatureAtPixel, this, ProbeInteraction.layerFilter);



		if (this.topKey && this.topKeySet)
		{
			this.topKeySet.replaceKeys([this.topKey]);
		}
		
		for (let layer of map.getLayers().getArray())
		{
			if (!ProbeInteraction.layerFilter(layer))
				continue;
			let weaveLayerObject: AbstractFeatureLayer = layer.get("layerObject");
			let keySet: KeySet = weaveLayerObject.probeKeySet.getInternalKeySet() as KeySet;
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
        
		let key:any /*IQualifiedKey*/ = this.pixelToKey(event.pixel);
		let toolTipState: IToolTipState = {};

		if (key)
		{
			let browserEvent: MouseEvent = <MouseEvent>(event.originalEvent);

			toolTipState.showToolTip = true;
			toolTipState.title = ToolTip.getToolTipTitle(this, key);
			toolTipState.columnNamesToValue = ToolTip.getToolTipData(this, key, this.topLayer.getToolTipColumns());
			[toolTipState.x, toolTipState.y] = [browserEvent.clientX, browserEvent.clientY];
		}
		else
		{
			toolTipState.showToolTip = false;
		}

		this.tool.props.toolTip.setState(toolTipState);
	}

	handleOutEvent(event:MouseEvent)
	{
		for (let layer of this.getMap().getLayers().getArray())
		{
			if (!ProbeInteraction.layerFilter(layer))
				continue;
			let weaveLayerObject: AbstractFeatureLayer = layer.get("layerObject");
			let keySet: KeySet = weaveLayerObject.probeKeySet.getInternalKeySet() as KeySet;
			if (keySet)
				keySet.clearKeys();
		}

		let toolTipState: IToolTipState = {};
		toolTipState.showToolTip = false;
		this.tool.props.toolTip.setState(toolTipState);
	}
}