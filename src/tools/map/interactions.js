import ol from "openlayers";
import lodash from "lodash";
import FeatureLayer from "./layers/FeatureLayer.js";
import CustomDragBox from "./CustomDragBox.js";

function getProbeInteraction(mapTool)
{
	return new ol.interaction.Pointer({
		handleMoveEvent: function (event) {
			let keySetMap = new Map();
			/* We need to have sets for all the layers so that probing over an empty area correctly empties the keyset */
			mapTool.map.getLayers().forEach(
				function (layer)
				{
					let weaveLayerObject = layer.get("layerObject");

					if (weaveLayerObject.probeKeySet && !keySetMap.get(weaveLayerObject.probeKeySet))
					{
						keySetMap.set(weaveLayerObject.probeKeySet, new Map());
					}
				},
				mapTool);
			mapTool.map.forEachFeatureAtPixel(event.pixel,
				function (feature, layer)
				{
					let weaveLayerObject = layer.get("layerObject");

					let tmpKeySet = keySetMap.get(weaveLayerObject.probeKeySet);

					/* No need to check here, we created one for every probeKeySet in the prior forEach */

					tmpKeySet.set(feature.getId(), layer.getZIndex());
				},
				function (layer)
				{
					return layer.getSelectable() && layer instanceof FeatureLayer;
				});

			for (let weaveKeySet of keySetMap.keys())
			{
				let keySet = keySetMap.get(weaveKeySet);

				let top = {key: null, index: -Infinity};

				for (let key of keySet.keys())
				{
					let index = keySet.get(key);
					if (index > top.index)
					{
						top.index = index;
						top.key = key;
					}

				}
				if (top.key)
				{
					weaveKeySet.setKeys([top.key]);
				}
				else
				{
					weaveKeySet.setKeys([]);
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

	mapTool.interactionModePath.addCallback( () => {
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
