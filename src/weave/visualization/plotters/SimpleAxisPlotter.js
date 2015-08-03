import d3 from "d3";
import * as Text from "../../../Utils/Text";

export default class {

	constructor(axisPath) {

		this.axisLineMinValue = NaN;
		this.axisLineMaxValue = NaN;

		this.forceTickCount = false;

		this.labelHorizontalAlign = Text.HORIZONTAL_ALIGN_LEFT;
		this.labelTextAlignment = Text.HORIZONTAL_ALIGN_RIGHT;

		this.labelVerticalAlign = Text.VERTICAL_ALIGN_MIDDLE;

		this.overrideAxisName = "";
		this.showAxisName = true;
		this.showLabels = true;

		this.tickCountRequested = 10;
		this.tickMaxValue = NaN;
		this.tickMinValue = NaN;

		this.axisGridLineThickness = 1;
		this.axisGridLineColor = 0xDDDDDD;
		this.axisGrideLineAlpha = 1;

		this.axesThickness = 10;
		this.axesAlpha = 1;
		this.axesColor = 0xB0B0B0;
	}



	drawPlot(destination) {
		console.svg = destination;
		destination.append("class", "axis")
		.attr("width", 1440)
		.attr("height", 30);
	}
}
