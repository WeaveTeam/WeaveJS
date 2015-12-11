import ol from "openlayers";
import FeatureLayer from "./layers/FeatureLayer.js";

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
	let dragSelect = new ol.interaction.DragBox();

	dragSelect.on('boxstart', function () {
		probeInteraction.setActive(false);
	}, mapTool);

	dragSelect.on('boxend', function () {
		let extent = dragSelect.getGeometry().getExtent();
		let selectedFeatures = new Set();
		let alteredKeySets = new Set();
		let selectFeature = (feature) => { selectedFeatures.add(feature.getId()); };

		for (let weaveLayerName in this.layers)
		{
			let weaveLayer = this.layers[weaveLayerName];
			let olLayer = weaveLayer.layer;
			let selectable = olLayer.get("selectable");

			if (weaveLayer instanceof FeatureLayer && selectable)
			{
				let keySet = weaveLayer.selectionKeySet;
				let keySetString = JSON.stringify(keySet.getPath());
				let source = olLayer.getSource();

				if (!alteredKeySets.has(keySetString))
				{
					keySet.setKeys([]);
				}
				alteredKeySets.add(keySetString);

				source.forEachFeatureIntersectingExtent(extent, selectFeature);
				weaveLayer.selectionKeySet.addKeys(Array.from(selectedFeatures));
			}
		}

		probeInteraction.setActive(true);
	}, mapTool);

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
