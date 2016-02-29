///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

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
			<div class="iModeCluster ol-control ol-unselectable">
				<div class="activeInteractionMode">
					<button style="font-weight: normal" class="activeInteractionMode fa"></button>
				</div>
				<div class="iModeCluster">
					<button class="pan fa"></button>
					<button class="select fa"></button>
					<button class="zoom fa"></button>
				</div>
			</div>
		`);

		let activeDiv: JQuery = div.find("div.activeInteractionMode");
		let clusterDiv: JQuery = div.find("div.iModeCluster");

		function toggleMenuOpen(isOpen:boolean)
		{
			activeDiv.css({ "display": isOpen ? "none" : "inline"});
			clusterDiv.css({ "display": isOpen ? "inline" : "none"});
		}

		div.mouseenter(toggleMenuOpen.bind(null, true))
			.mouseleave(toggleMenuOpen.bind(null, false));
		toggleMenuOpen(false);


		super({ element: div[0], target: options.target });

		let self = this;
		function setupButton(mode:string)
		{
			clusterDiv.find("button." + mode)
				.css({ "font-weight": "normal", "display": "inline" })
				.addClass(iconMapping[mode])
				.click(() => { if (self.interactionMode) self.interactionMode.value = mode; toggleMenuOpen(false); });
		}

		for (let key in iconMapping) setupButton(key);

		this.updateInteractionMode_weaveToControl = (() => {
			let mode = self.interactionMode.value;

			clusterDiv.find("button").removeClass("active");
			clusterDiv.find("button." + mode).addClass("active");

			activeDiv.find("button").removeClass(lodash.values(iconMapping).join(" "));
			activeDiv.find("button").addClass(iconMapping[mode]);
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
