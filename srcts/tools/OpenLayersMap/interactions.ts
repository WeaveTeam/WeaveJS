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
	private tool: any;

	constructor(tool:any)
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
		let toolTipState: IToolTipState = {};

		if (key) {
			let browserEvent: MouseEvent = <MouseEvent>(event.originalEvent);

			toolTipState.showToolTip = true;
			toolTipState.title = FeatureLayer.getToolTipTitle(key);
			toolTipState.columnNamesToValue = FeatureLayer.getToolTipData(key);
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
			let keySet: any = weaveLayerObject.probeKeySet && weaveLayerObject.probeKeySet.getObject();
			if (keySet) {
				keySet.clearKeys();
			}
		}

		let toolTipState: IToolTipState = {};
		toolTipState.showToolTip = false;
		this.tool.props.toolTip.setState(toolTipState);
	}
}


enum DragSelectionMode {
	SUBTRACT = -1,
	SET = 0,
	ADD = 1
};

class WeaveDragSelection extends ol.interaction.DragBox
{
	private mapTool: OpenLayersMapTool;
	private mode: DragSelectionMode;
	private _probeInteraction: ProbeInteraction;

	constructor()
	{
		super({ boxEndCondition: () => true });

		this.on('boxstart', WeaveDragSelection.prototype.onBoxStart, this);
		this.on('boxdrag', WeaveDragSelection.prototype.onBoxDrag, this);
		this.on('boxend', WeaveDragSelection.prototype.onBoxEnd, this);
	}

	private get probeInteraction():ProbeInteraction
	{
		if (!this._probeInteraction) {
			for (let interaction of this.getMap().getInteractions().getArray()) {
				if (interaction instanceof ProbeInteraction) {
					this._probeInteraction = interaction;
					break;
				}
			}
		}

		return this._probeInteraction;
	}

	onBoxStart(event: any) {
		if (this.probeInteraction)
			this.probeInteraction.setActive(false);

		let dragBoxEvent: ol.DragBoxEvent = <ol.DragBoxEvent>event;

		let browserEvent: MouseEvent = <MouseEvent>dragBoxEvent.mapBrowserEvent.originalEvent;

		if (browserEvent.ctrlKey && browserEvent.shiftKey)
		{
			this.mode = DragSelectionMode.SUBTRACT;
		}
		else if (browserEvent.ctrlKey)
		{
			this.mode = DragSelectionMode.ADD;
		}
		else
		{
			this.mode = DragSelectionMode.SET;
		}
	}

	updateSelection(extent)
	{
		let selectedFeatures: Set<string> = new Set();
		let selectFeature: Function = (feature) => { selectedFeatures.add(feature.getId()); };
		let mapTool: OpenLayersMapTool = this.mapTool;

		for (let olLayer of this.getMap().getLayers().getArray()) {
			let selectable: boolean = <boolean>olLayer.get("selectable");
			let weaveLayer: Layer = olLayer.get("layerObject");

			if (weaveLayer instanceof FeatureLayer && selectable) {
				let keySet = weaveLayer.selectionKeySet;
				let source: ol.source.Vector = <ol.source.Vector>(<ol.layer.Vector>olLayer).getSource();

				source.forEachFeatureIntersectingExtent(extent, selectFeature);

				let keys = Array.from(selectedFeatures);

				switch (this.mode) {
					case DragSelectionMode.SET:
						keySet.setKeys(keys);
						break;
					case DragSelectionMode.ADD:
						keySet.addKeys(keys);
						break;
					case DragSelectionMode.SUBTRACT:
						keySet.removeKeys(keys);
						break;
				}
			}
		}
	}

	onBoxDrag(event:any)
	{
		let extent = this.getGeometry().getExtent();

		this.updateSelection(extent);
	}

	onBoxEnd(event:any)
	{
		let extent = this.getGeometry().getExtent();

		this.updateSelection(extent);
		if (this.probeInteraction)
			this.probeInteraction.setActive(true);
	}
}

function weaveMapInteractions(mapTool)
{

	let probeInteraction = new ProbeInteraction(mapTool);
	let dragSelect = new WeaveDragSelection();
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
