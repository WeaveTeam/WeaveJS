///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import FeatureLayer from "./Layers/FeatureLayer";
import Layer from "./Layers/Layer";
import ProbeInteraction from "./ProbeInteraction";

declare var Weave: any;
declare var weavejs: any;

enum DragSelectionMode {
	SUBTRACT = -1,
	SET = 0,
	ADD = 1
};

export default class DragSelection extends ol.interaction.DragBox
{
	private mode: DragSelectionMode;
	private _probeInteraction: ProbeInteraction;
	private debouncedUpdateSelection: Function;

	constructor()
	{
		super({ boxEndCondition: () => true });

		this.debouncedUpdateSelection = lodash.debounce(DragSelection.prototype.updateSelection, 25);
		this.on('boxstart', DragSelection.prototype.onBoxStart, this);
		this.on('boxdrag', DragSelection.prototype.onBoxDrag, this);
		this.on('boxend', DragSelection.prototype.onBoxEnd, this);
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

		this.debouncedUpdateSelection(extent);
	}

	onBoxEnd(event:any)
	{
		let extent = this.getGeometry().getExtent();

		this.debouncedUpdateSelection(extent);
		if (this.probeInteraction)
			this.probeInteraction.setActive(true);
	}
}