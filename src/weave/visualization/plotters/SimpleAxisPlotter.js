import d3 from "d3";
import $ from "jquery";
import * as Text from "../../../Utils/Text";

export default class {

    constructor(options) {

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

        this.position = options.position;
        this.screenBounds = options.screenBounds;
        this.dataBounds = options.dataBounds;
        this.weavePath = options.weavePath;
    }

    get niceDataBounds () {
        return {
            min: this.weavePath.push("axisLineMinValue").getState(),
            max: this.weavePath.push("axisLineMaxValue").getState()
        };
    }

    get axisName () {
        return this.weavePath.push("overrideAxisName").getState();
    }

    drawPlot(destination, orientation) {
        // destination.append("class", "axis")
        // .attr("width", 1440)
        // .attr(   "height", 30);

        // Will be be in axis Optionsa
        var scale = d3.scale.linear()
                             .domain([this.niceDataBounds.min, this.niceDataBounds.max])
                             .range([this.screenBounds.min, this.screenBounds.max]);

        this.axis = destination.append("g")
                   .attr("class", "axis")
                   .attr("transform", "translate(" + this.position.x + ", " + this.position.y + ")")
                   .call(d3.svg.axis().scale(scale).orient(orientation));
    }
}
