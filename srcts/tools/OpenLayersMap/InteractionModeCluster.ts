import * as ol from "openlayers";
import * as lodash from "lodash";
import * as jquery from "jquery";
import OpenLayersMapTool from "../OpenLayersMapTool";
import LinkableString = weavejs.core.LinkableString;

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

export default class InteractionModeCluster extends ol.control.Control
{
	constructor(optOptions: any)
	{
		var iconMapping: {[mode: string]: string} = {
			"pan": "fa-hand-grab-o",
			"select": "fa-mouse-pointer",
			"zoom": "fa-search-plus"
		};

		var options: any = optOptions || {};
		var div = $(`
			<div style="display: flex; flex-direction: column" class="iModeCluster ol-control ol-unselectable">
				<button class="modeButton pan fa" style="border-radius: 2px 2px 0 0"></button>
				<button class="modeButton select fa" style="border-radius: 0"></button>
				<button class="modeButton zoom fa" style="border-radius: 0 0 2px 2px"></button>
			</div>
		`);

		let activeButton: JQuery = div.find("button.activeInteractionMode");
		let clusterButtons: JQuery = div.find("button.modeButton");
		let divider: JQuery = div.find("span.modeButton");

		let oldPosition: JQueryCoordinates;


		super({ element: div[0], target: options.target });

		let self = this;
		function setupButton(mode:string)
		{
			div.find("button." + mode)
				.addClass(iconMapping[mode])
				.click(() => { if (self.interactionMode) self.interactionMode.value = mode; });
		}

		for (let key in iconMapping) setupButton(key);

		this.updateInteractionMode_weaveToControl = (() => {
			let mode = self.interactionMode.value;

			div.find("button.modeButton").removeClass("active");
			div.find("button.modeButton." + mode).addClass("active");
		});
	}

	private interactionMode: LinkableString;
	private updateInteractionMode_weaveToControl: Function;

	setMap(map:ol.Map):void
	{
		super.setMap(map)

		if (!map) return;

		let mapTool: OpenLayersMapTool = map.get("mapTool") as OpenLayersMapTool;
		this.interactionMode = mapTool.interactionMode;

		this.interactionMode.addGroupedCallback(mapTool, this.updateInteractionMode_weaveToControl, true);
	}
}
