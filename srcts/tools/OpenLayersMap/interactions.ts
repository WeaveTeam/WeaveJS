///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import FeatureLayer from "./Layers/FeatureLayer";
import OpenLayersMapTool from "../OpenLayersMapTool";
import Layer from "./Layers/Layer";
import {IToolTipState} from "../tooltip";
/*global Weave*/

declare var Weave:any;
declare var weavejs:any;

class ProbeInteraction extends ol.interaction.Pointer
{
	private topKeyString: string;
	private topZIndex: number;
	private topKeySet: any;
	private toolTip: any;

	constructor(toolTip:any)
	{
		super({handleMoveEvent: ProbeInteraction.prototype.handleMoveEvent});
		this.toolTip = toolTip;
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
			let weaveLayerObject: FeatureLayer = layer.get("layerObject");
			this.topKeySet = weaveLayerObject.probeKeySet && weaveLayerObject.probeKeySet.getObject() || this.topKeySet;
			this.topZIndex = zIndex;
			this.topKeyString = feature.getId().toString();
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
		this.topKeyString = null;
		let topKey: any /*IQualifiedKey */;
		
		map.forEachFeatureAtPixel(pixel, this.onFeatureAtPixel, this, ProbeInteraction.layerFilter);



		if (this.topKeyString && this.topKeySet)
		{
			topKey = weavejs.WeaveAPI.QKeyManager.stringToQKey(this.topKeyString);
			this.topKeySet.replaceKeys([topKey]);
		}
		
		for (let layer of map.getLayers().getArray())
		{
			if (!ProbeInteraction.layerFilter(layer)) continue;
			let weaveLayerObject: FeatureLayer = layer.get("layerObject");
			let keySet:any = weaveLayerObject.probeKeySet && weaveLayerObject.probeKeySet.getObject();
			if (keySet && keySet != this.topKeySet)
			{
				keySet.clearKeys();
			}
		}

		return topKey;
	}

	private handleMoveEvent(event:ol.MapBrowserEvent)
	{
		let key:any /*IQualifiedKey*/ = this.pixelToKey(event.pixel);
		console.log(key);
		let toolTipState: IToolTipState = {};

		if (key) {
			let browserEvent: MouseEvent = <MouseEvent>(event.originalEvent);

			toolTipState.showTooltip = true;
			toolTipState.title = FeatureLayer.getToolTipTitle(key);
			toolTipState.columnNamesToValue = FeatureLayer.getToolTipData(key);
			[toolTipState.x, toolTipState.y] = [browserEvent.clientX, browserEvent.clientY];
		}
		else
		{
			toolTipState.showTooltip = false;
		}

		this.toolTip.setState(toolTipState);
	}

	handleOutEvent(event:MouseEvent)
	{
		for (let layer of this.getMap().getLayers().getArray()) {
			if (!ProbeInteraction.layerFilter(layer)) continue;
			let weaveLayerObject: FeatureLayer = layer.get("layerObject");
			let keySet: any = weaveLayerObject.probeKeySet && weaveLayerObject.probeKeySet.getObject();
			if (keySet) {
				keySet.clearKeys();
			}
		}

		let toolTipState: IToolTipState = {};
		toolTipState.showTooltip = false;
		this.toolTip.setState(toolTipState);
	}
}

function getDragSelect(mapTool, probeInteraction)
{
	let ADD = "+";
	let SUBTRACT = "-";
	let SET = "=";
	let dragSelect:ol.interaction.DragBox = new ol.interaction.DragBox({ boxEndCondition: () => true });
	let mode = SET;

	function updateSelection(extent) {
		let selectedFeatures:Set<string> = new Set();
		let selectFeature:Function = (feature) => { selectedFeatures.add(feature.getId()); };

		for (let weaveLayerName of mapTool.layers.keys())
		{
			let weaveLayer:Layer = mapTool.layers.get(weaveLayerName);
			let olLayer:ol.layer.Layer = weaveLayer.olLayer;
			let selectable:boolean = <boolean>olLayer.get("selectable");

			if (weaveLayer instanceof FeatureLayer && selectable)
			{
				let keySet = weaveLayer.selectionKeySet;
				let source:ol.source.Vector = <ol.source.Vector>olLayer.getSource();

				source.forEachFeatureIntersectingExtent(extent, selectFeature);

				let keys = Array.from(selectedFeatures);

				switch (mode)
				{
					case SET:
						keySet.setKeys(keys);
						break;
					case ADD:
						keySet.addKeys(keys);
						break;
					case SUBTRACT:
						keySet.removeKeys(keys);
						break;
				}
			}
		}
	}

	dragSelect.on('boxstart', function (event:any) {
		probeInteraction.setActive(false);

		let dragBoxEvent: ol.DragBoxEvent = <ol.DragBoxEvent>event;

		let browserEvent: MouseEvent = <MouseEvent>dragBoxEvent.mapBrowserEvent.originalEvent;

		if (browserEvent.ctrlKey && browserEvent.shiftKey)
		{
			mode = SUBTRACT
		}
		else if (browserEvent.ctrlKey)
		{
			mode = ADD;
		}
		else
		{
			mode = SET;
		}
	});

	dragSelect.on('boxend', function (event:any) {

		let extent = dragSelect.getGeometry().getExtent();
		updateSelection(extent);

		probeInteraction.setActive(true);
		mode = SET;
	});

	dragSelect.on('boxdrag', lodash.debounce(function() {
		let extent = dragSelect.getGeometry().getExtent();
		updateSelection(extent);
	}));

	return dragSelect;
}

function weaveMapInteractions(mapTool, toolTip)
{

	let probeInteraction = new ProbeInteraction(toolTip);
	let dragSelect = getDragSelect(mapTool, probeInteraction);
	let dragPan = new ol.interaction.DragPan({});
	let dragZoom = new ol.interaction.DragZoom({condition: ol.events.condition.always});

	mapTool.interactionModePath.addCallback(mapTool, () => {
		let interactionMode = mapTool.interactionModePath.getState();
		dragPan.setActive(interactionMode === "pan");
		dragSelect.setActive(interactionMode === "select");
		dragZoom.setActive(interactionMode === "zoom");
	}, true);

	let interactionCollection = ol.interaction.defaults({dragPan: false});
	for (let interaction of [dragPan, dragZoom, dragSelect, probeInteraction])
		interactionCollection.push(interaction);

	return interactionCollection;
}

export default weaveMapInteractions;
