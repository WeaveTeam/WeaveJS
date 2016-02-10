///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import FeatureLayer from "./Layers/FeatureLayer";
import OpenLayersMapTool from "../OpenLayersMapTool";
import {IToolTipState} from "../tooltip";

import IAttributeColumn = weavejs.api.data.IAttributeColumn;
import IQualifiedKey = weavejs.api.data.IQualifiedKey;
import KeySet = weavejs.data.key.KeySet;
import ILinkableHashMap = weavejs.api.core.ILinkableHashMap;

export default class ProbeInteraction extends ol.interaction.Pointer
{
	private topKey: IQualifiedKey;
	private topZIndex: number;
	private topKeySet: KeySet;
	private topLayer: FeatureLayer;
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
			let weaveLayerObject: FeatureLayer = layer.get("layerObject") as FeatureLayer;
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
			if (!ProbeInteraction.layerFilter(layer)) continue;
			let weaveLayerObject: FeatureLayer = layer.get("layerObject");
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

		if (key) {
			let browserEvent: MouseEvent = <MouseEvent>(event.originalEvent);

			toolTipState.showToolTip = true;
			toolTipState.title = this.getToolTipTitle(key);
			toolTipState.columnNamesToValue = this.getToolTipData(key, this.topLayer.getToolTipColumns());
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
		for (let layer of this.getMap().getLayers().getArray()) {
			if (!ProbeInteraction.layerFilter(layer)) continue;
			let weaveLayerObject: FeatureLayer = layer.get("layerObject");
			let keySet: KeySet = weaveLayerObject.probeKeySet.getInternalKeySet() as KeySet;
			if (keySet) {
				keySet.clearKeys();
			}
		}

		let toolTipState: IToolTipState = {};
		toolTipState.showToolTip = false;
		this.tool.props.toolTip.setState(toolTipState);
	}
	
	/* TODO: Move this into WeaveTool */
	getToolTipData(key:IQualifiedKey, additionalColumns:IAttributeColumn[] = []): { [columnName: string]: string | number } 
	{
		let columnHashMap = Weave.getRoot(this.tool).getObject("Probed Columns") as ILinkableHashMap;

		var result: { [columnName: string]: string | number } = {};

		for (let child of columnHashMap.getObjects().concat(additionalColumns))
		{
			let title:string = child.getMetadata("title");
			let value:string = child.getValueFromKey(key, String);
			if (value)
			{
				result[title] = value;
			}
		}

		return result;
	}
	
	/* TODO: Move this into WeaveTool */
	getToolTipTitle(key:any /* IQualifiedKey */): string
	{
		let titleHashMap = Weave.getRoot(this.tool).getObject("Probe Header Columns") as ILinkableHashMap;

		return lodash.map(titleHashMap.getObjects(), (d:any) => d.getValueFromKey(key, String)).join(", ");
	}
}