import ol from "openlayers";
import lodash from "lodash";
import FeatureLayer from "./layers/FeatureLayer.js";
import CustomDragBox from "./CustomDragBox.js";
/*global Weave*/

function getProbeInteraction(mapTool)
{
	return new ol.interaction.Pointer({
		handleMoveEvent: function (event) {
			// weavepath -> keystring -> zindex
			let d2d_keySet_keyString_zIndex = new Map();
			/* We need to have sets for all the layers so that probing over an empty area correctly empties the keyset */
			mapTool.map.getLayers().forEach(
				function (layer)
				{
					let weaveLayerObject = layer.get("layerObject");

					if (weaveLayerObject.probeKeySet && !d2d_keySet_keyString_zIndex.get(weaveLayerObject.probeKeySet))
					{
						d2d_keySet_keyString_zIndex.set(weaveLayerObject.probeKeySet.getObject(), new Map());
					}
				},
				mapTool);
			mapTool.map.forEachFeatureAtPixel(event.pixel,
				function (feature, layer)
				{
					let weaveLayerObject = layer.get("layerObject");

					let map_keyString_zIndex = d2d_keySet_keyString_zIndex.get(weaveLayerObject.probeKeySet.getObject());

					/* No need to check here, we created one for every probeKeySet in the prior forEach */

					map_keyString_zIndex.set(feature.getId(), layer.getZIndex());
				},
				function (layer)
				{
					return layer.getSelectable() && layer instanceof FeatureLayer;
				});

			for (let weaveKeySet of d2d_keySet_keyString_zIndex.keys())
			{
				let map_keyString_zIndex = d2d_keySet_keyString_zIndex.get(weaveKeySet);

				let top = {key: null, index: -Infinity};

				for (let key of map_keyString_zIndex.keys())
				{
					let index = map_keyString_zIndex.get(key);
					if (index > top.index)
					{
						top.index = index;
						top.key = key;
					}

				}
				if (top.key)
				{
					Weave.getPath(weaveKeySet).setKeys([top.key]);
				}
				else
				{
					Weave.getPath(weaveKeySet).setKeys([]);
				}
			}
		}
	});
}

function getDragSelect(mapTool, probeInteraction)
{
	let ADD = "+";
	let SUBTRACT = "-";
	let SET = "=";
	let dragSelect = new CustomDragBox();
	let mode = SET;

	function updateSelection(extent) {
		let selectedFeatures = new Set();
		let selectFeature = (feature) => { selectedFeatures.add(feature.getId()); };

		for (let weaveLayerName of lodash.keys(mapTool.layers))
		{
			let weaveLayer = mapTool.layers[weaveLayerName];
			let olLayer = weaveLayer.layer;
			let selectable = olLayer.get("selectable");

			if (weaveLayer instanceof FeatureLayer && selectable)
			{
				let keySet = weaveLayer.selectionKeySet;
				let source = olLayer.getSource();

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

	dragSelect.on('boxstart', function (dragBoxEvent) {
		probeInteraction.setActive(false);

		let event = dragBoxEvent.innerEvent.originalEvent;
		if (event.ctrlKey)
		{
			mode = ADD;
			if (event.shiftKey)
			{
				mode = SUBTRACT;
			}
		}
		else
		{
			mode = SET;
		}
	});

	dragSelect.on('boxend', function () {
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
