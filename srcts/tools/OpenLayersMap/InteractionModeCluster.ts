///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import jquery from "jquery";

export default class InteractionModeCluster extends ol.control.Control {
	constructor(optOptions) {
		var interactionModePath = optOptions.interactionModePath;
		var options = optOptions || {};
		var buttonTable = jquery(`
			<table class="ol-unselectable ol-control iModeCluster">
				<tr style="font-size: 80%">
					<td><button class="iModeCluster pan fa fa-hand-grab-o"></button></td>
					<td><button class="iModeCluster select fa fa-mouse-pointer"></button></td>
					<td><button class="iModeCluster zoom fa fa-search-plus"></button></td>
				</tr>
			</table>
		`);

		buttonTable.find("button.iModeCluster.pan").click(() => interactionModePath.state("pan"));
		buttonTable.find("button.iModeCluster.select").click(() => interactionModePath.state("select"));
		buttonTable.find("button.iModeCluster.zoom").click(() => interactionModePath.state("zoom"));

		super({ element: buttonTable[0], target: options.target });

		interactionModePath.addCallback(this, () => {
			buttonTable.find("button.iModeCluster").removeClass("active");
			buttonTable.find("button.iModeCluster." + interactionModePath.getState()).addClass("active");
		}, true);
	}
}