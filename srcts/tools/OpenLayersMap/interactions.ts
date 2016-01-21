///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import FeatureLayer from "./Layers/FeatureLayer";
import Layer from "./Layers/Layer";
import {IToolTipState} from "../tooltip";
/*global Weave*/

declare var Weave:any;
declare var weavejs:any;

function getProbeInteraction(mapTool)
{
	return new ol.interaction.Pointer({
		handleMoveEvent: function (event:ol.MapBrowserEvent) {
			// weavepath -> keystring -> zindex
			let d2d_keySet_keyString_layer:Map<any,Map<string,ol.layer.Layer>> = new Map<any,Map<string,ol.layer.Layer>>();
			/* We need to have sets for all the layers so that probing over an empty area correctly empties the keyset */
			mapTool.map.getLayers().forEach(
				function (layer)
				{
					let weaveLayerObject = layer.get("layerObject");

					if (weaveLayerObject.probeKeySet && !d2d_keySet_keyString_layer.get(weaveLayerObject.probeKeySet))
					{
						d2d_keySet_keyString_layer.set(weaveLayerObject.probeKeySet.getObject(), new Map<string,ol.layer.Layer>());
					}
				},
				mapTool);
			mapTool.map.forEachFeatureAtPixel(event.pixel,
				function (feature, layer)
				{
					let weaveLayerObject = layer.get("layerObject");

					let map_keyString_layer:Map<string,ol.layer.Layer> = d2d_keySet_keyString_layer.get(weaveLayerObject.probeKeySet.getObject());

					/* No need to check here, we created one for every probeKeySet in the prior forEach */

					map_keyString_layer.set(feature.getId(), layer);
				},
				function (layer)
				{
					return layer.getSelectable() && layer instanceof FeatureLayer;
				});

			for (let weaveKeySet of d2d_keySet_keyString_layer.keys())
			{
				let map_keyString_layer:Map<string,ol.layer.Layer> = d2d_keySet_keyString_layer.get(weaveKeySet);

				let top = {key: null, index: -Infinity, layer: null};

				for (let key of map_keyString_layer.keys())
				{
					let layer:ol.layer.Layer = map_keyString_layer.get(key);
					let index = layer.getZIndex();
					if (index > top.index)
					{
						top.index = index;
						top.key = key;
						top.layer = layer;
					}
				}
				let toolTipState: IToolTipState = {};
				if (top.key)
				{
					weaveKeySet.replaceKeys([top.key]);

					toolTipState.showTooltip = true;
					[toolTipState.x, toolTipState.y] = event.pixel;
					toolTipState.title = FeatureLayer.getToolTipTitle(top.key);
					toolTipState.columnNamesToValue = FeatureLayer.getToolTipData(top.key);
				}
				else
				{
					toolTipState.showTooltip = false;
					weaveKeySet.replaceKeys([]);
				}
				mapTool.toolTip.setState(toolTipState);
			}
		}
	});
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

		if (ol.events.condition.platformModifierKeyOnly(dragBoxEvent.mapBrowserEvent))
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

function weaveMapInteractions(mapTool)
{

	let probeInteraction = getProbeInteraction(mapTool);
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
