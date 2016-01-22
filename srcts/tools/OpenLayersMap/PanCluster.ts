///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/jquery/jquery.d.ts"/>
///<reference path="../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import jquery from "jquery";

export default class PanCluster extends ol.control.Control {
	constructor(optOptions?) {
		var options = optOptions || {};
		let parent = jquery(`
		<div style="background-color: rgba(0,0,0,0)" class="ol-unselectable ol-control panCluster">
			<table style="font-size:75%">
				<tr>
					<td></td><td class="ol-control" style="position:relative"><button class="panCluster N">N</button></td><td></td>
				</tr>
				<tr>
					<td class="ol-control" style="position:relative"><button class="panCluster W">W</button></td>
					<td class="ol-control" style="position:relative"><button class="panCluster X fa fa-arrows-alt"></button></td>
					<td class="ol-control" style="position:relative"><button class="panCluster E">E</button></td>
				</tr>
				<tr>
					<td></td><td class="ol-control" style="position:relative"><button class="panCluster S">S</button></td><td></td>
				</tr>
			</table>
		</div>`);

		var directions = {
			N: [0, 1],
			E: [1, 0],
			S: [0, -1],
			W: [-1, 0],
			X: [null, null]
		};

		super({ element: parent[0], target: options.target });

		let self = this;

		let pan = function(xSign, ySign) {
			let panPercent = 0.3;
			let map = self.getMap();
			let view = map.getView();
			let extent = view.calculateExtent(map.getSize());

			let extentWidth = Math.abs(extent[0] - extent[2]);
			let extentHeight = Math.abs(extent[1] - extent[3]);

			let center = view.getCenter();

			center[0] += extentWidth * xSign * panPercent;
			center[1] += extentHeight * ySign * panPercent;

			view.setCenter(center);
		};

		let zoomExtent = function() {
			let map = self.getMap();
			let view = map.getView();
			let extent = view.get("extent") || view.getProjection().getExtent();
			let size = map.getSize();
			view.fit(extent, size);
		};

		for (let direction in directions) {
			let xSign = directions[direction][0];
			let ySign = directions[direction][1];

			let button = parent.find(".panCluster." + direction);

			if (xSign !== null) {
				button.click(pan.bind(this, xSign, ySign));
			}
			else {
				button.click(zoomExtent.bind(this));
			}
		}
	}
}