///<reference path="../../../typings/lodash/lodash.d.ts"/>
///<reference path="../../../typings/openlayers/openlayers.d.ts"/>
///<reference path="../../../typings/weave/WeavePath.d.ts"/>

import * as ol from "openlayers";
import * as lodash from "lodash";
import * as jquery from "jquery";

class BoxControl extends ol.control.Control {
	constructor(opt_options) {
		let options = opt_options ? opt_options : {};

		let element = jquery("<div>").css({
			position: "absolute",
		}).addClass('ol-box');

		super({element: element[0], target: options.target});
	}

	setPixels(startPixel, endPixel)
	{
		this.startPixel = startPixel;
		this.endPixel = endPixel;

		let [left, top] = startPixel;
		let [right, bottom] = endPixel;

		[top, bottom] = lodash.sortBy([top, bottom]);
		[left, right] = lodash.sortBy([left, right]);

 		let height = bottom - top;
		let width = right - left;

		jquery(this.element).css({top, left, width, height});

		this.updateGeometry();
	}

	updateGeometry()
	{
		let startPixel = this.startPixel;
		let endPixel = this.endPixel;
		var pixels = [
			startPixel,
			[startPixel[0], endPixel[1]],
			endPixel,
			[endPixel[0], startPixel[1]]
		];
		var map = this.getMap();

		var coordinates:Array<ol.Coordinate> = pixels.map(map.getCoordinateFromPixel, map);
		// close the polygon
		coordinates[4] = coordinates[0].slice();

		if (!this.geometry_) {
			this.geometry_ = new ol.geom.Polygon([coordinates]);
		} else {
			this.geometry_.setCoordinates([coordinates]);
		}
	}


	getGeometry()
	{
		return this.geometry_;
	}
}

var CustomDragBox = function (opt_options) {
		ol.interaction.Pointer.call(this, {
			handleDownEvent: CustomDragBox.handleDownEvent,
			handleDragEvent: CustomDragBox.handleDragEvent,
			handleUpEvent: CustomDragBox.handleUpEvent
		});

		let options = opt_options ? opt_options : {};

		this.boxControl = new BoxControl();

		this.startPixel_ = null;

		this.condition_ = options.condition ? options.condition : ol.events.condition.always;
};

ol.inherits(CustomDragBox, ol.interaction.Pointer);

CustomDragBox.prototype.getGeometry = function () {
	return this.boxControl.getGeometry();
}

CustomDragBox.handleDragEvent = function (mapBrowserEvent) {
	if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
		return;
	}
	this.boxControl.setPixels(this.startPixel_, mapBrowserEvent.pixel);
	this.dispatchEvent({type: 'boxdrag', innerEvent: mapBrowserEvent});
}

CustomDragBox.handleDownEvent = function (mapBrowserEvent) {
	if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
		return false;
	}

	if (this.condition_(mapBrowserEvent)) {
		this.startPixel_ = mapBrowserEvent.pixel;
		this.boxControl.setMap(mapBrowserEvent.map);
		this.boxControl.setPixels(this.startPixel_, this.startPixel_);
		this.dispatchEvent({type: 'boxstart', innerEvent: mapBrowserEvent});
		return true;
	} else {
		return false;
	}
}

CustomDragBox.handleUpEvent = function (mapBrowserEvent) {
	if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
		return true;
	}

	this.boxControl.setMap(null);

	this.dispatchEvent({type: 'boxend', innerEvent: mapBrowserEvent});
}

export default CustomDragBox;
