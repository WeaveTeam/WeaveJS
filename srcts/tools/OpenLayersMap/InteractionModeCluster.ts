///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/weavejs.d.ts"/>

import * as ol from "openlayers";
import jquery from "jquery";
import OpenLayersMapTool from "../OpenLayersMapTool";

export default class InteractionModeCluster extends ol.control.Control {
	constructor(optOptions: any) {
		var map: OpenLayersMapTool = optOptions.mapTool as OpenLayersMapTool;

		var options: any = optOptions || {};
		var buttonTable: any = jquery(`
			<table class="ol-unselectable ol-control iModeCluster">
				<tr style="font-size: 80%">
					<td><button class="iModeCluster pan fa fa-hand-grab-o"></button></td>
					<td><button class="iModeCluster select fa fa-mouse-pointer"></button></td>
					<td><button class="iModeCluster zoom fa fa-search-plus"></button></td>
				</tr>
			</table>
		`);

		buttonTable.find("button.iModeCluster.pan").click(() => { map.interactionMode.value = "pan"; }).css({ "font-weight": "normal" });
		buttonTable.find("button.iModeCluster.select").click(() => { map.interactionMode.value = "select"; }).css({ "font-weight": "normal" });
		buttonTable.find("button.iModeCluster.zoom").click(() => { map.interactionMode.value = "zoom"; }).css({"font-weight": "normal"});

		super({ element: buttonTable[0], target: options.target });

		map.interactionMode.addGroupedCallback(map, () => {
			buttonTable.find("button.iModeCluster").removeClass("active");
			buttonTable.find("button.iModeCluster." + map.interactionMode.value).addClass("active");
		}, true);
	}
}
