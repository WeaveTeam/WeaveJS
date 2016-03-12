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
			<div style="display: flex; flexDirection: column" class="iModeCluster ol-control ol-unselectable">
				<button class="activeInteractionMode fa"></button>
				<span style="width: 1px; border-left: 1px solid white; margin-left: 0.25em; margin-right: 0.25em;" class="modeButton"></span>
				<button class="modeButton pan fa"></button>
				<button class="modeButton select fa"></button>
				<button class="modeButton zoom fa"></button>
			</div>
		`);

		let activeButton: JQuery = div.find("button.activeInteractionMode");
		let clusterButtons: JQuery = div.find("button.modeButton");
		let divider: JQuery = div.find("span.modeButton");

		let oldPosition: JQueryCoordinates;
		function toggleMenuOpen(isOpen:boolean)
		{
			activeButton.off("click");
			activeButton.click(toggleMenuOpen.bind(null, !isOpen));
			activeButton.css({ "display": isOpen ? "inline" : "inline"});
			clusterButtons.css({ "display": isOpen ? "inline" : "none"});
			divider.css({ "display": isOpen ? "inline" : "none" });
		}

		toggleMenuOpen(false);


		super({ element: div[0], target: options.target });

		let self = this;
		function setupButton(mode:string)
		{
			div.find("button." + mode)
				.addClass(iconMapping[mode])
				.click(() => { if (self.interactionMode) self.interactionMode.value = mode; toggleMenuOpen(false); });
		}

		for (let key in iconMapping) setupButton(key);

		this.updateInteractionMode_weaveToControl = (() => {
			let mode = self.interactionMode.value;

			div.find("button.modeButton").removeClass("active");
			div.find("button.modeButton." + mode).addClass("active");

			activeButton.removeClass(lodash.values(iconMapping).join(" "));
			activeButton.addClass(iconMapping[mode]);
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
