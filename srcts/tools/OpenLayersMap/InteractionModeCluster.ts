///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import * as jquery from "jquery";
import OpenLayersMapTool from "../OpenLayersMapTool";

// loads jquery from the es6 default module.
var $:JQueryStatic = (jquery as any)["default"];

export default class InteractionModeCluster extends ol.control.Control
{
	constructor(optOptions: any)
	{
		var map: OpenLayersMapTool = optOptions.mapTool as OpenLayersMapTool;
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

		activeDiv.find("button").click(toggleMenuOpen.bind(null, true));
		toggleMenuOpen(false);

		function setupButton(mode:string)
		{
			clusterDiv.find("button." + mode)
				.css({ "font-weight": "normal", "display": "inline" })
				.addClass(iconMapping[mode])
				.click(() => { map.interactionMode.value = mode; toggleMenuOpen(false); });
			console.log(mode, iconMapping[mode]);
		}

		for (let key in iconMapping) setupButton(key);

		super({ element: div[0], target: options.target });

		map.interactionMode.addGroupedCallback(map, () => {
			let mode = map.interactionMode.value;

			clusterDiv.find("button").removeClass("active");
			clusterDiv.find("button." + mode).addClass("active");

			activeDiv.find("button").removeClass(lodash.values(iconMapping).join(" "));
			activeDiv.find("button").addClass(iconMapping[mode]);
		}, true);
	}
}
