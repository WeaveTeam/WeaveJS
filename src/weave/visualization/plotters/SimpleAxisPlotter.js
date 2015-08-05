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

        this.tickCountRequested = options.tickCountRequested;
        this.tickMaxValue = NaN;
        this.tickMinValue = NaN;

        this.axisGridLineThickness = 1;
        this.axisGridLineColor = "#DDDDDD";
        this.axisGrideLineAlpha = 1;

        this.axesThickness = 10;
        this.axesAlpha = 1;
        this.axesColor = "#B0B0B0";

        this.position = options.position;
        this.screenBounds = options.screenBounds;
        this.dataBounds = options.dataBounds;
        this.weavePath = options.weavePath;
        this.orientation = options.orientation;
        this.scales = options.scales;

        let scale = null;
        if(this.orientation === "bottom") {
            scale = this.scales.x;
        } else {
            scale = this.scales.y;
        }

        this.axis = d3.svg.axis().scale(scale)
                                 .orient(this.orientation)
                                 .ticks(this.tickCountRequested);
    }

    get axisName () {
        return this.weavePath.push("overrideAxisName").getState();
    }

    get niceDataBounds () {
        return {
            min: this.weavePath.push("axisLineMinValue").getState(),
            max: this.weavePath.push("axisLineMaxValue").getState()
        };
    }

    drawPlot(destination) {
        this.drawAxis(destination, this.orientation);
        this.drawGridLines(destination, this.orientation);
    }

    drawAxis(destination) {

        destination.append("g")
                   .attr("class", "axis")
                   .attr("transform", "translate(" + this.position.x + ", " + this.position.y + ")")
                   .call(this.axis);

        console.selection = $(destination[0]);
        $(destination[0]).find(".axis").find("path").css({
            "shape-rendering": "crispEdges",
            "stroke": this.axisColor,
            "fill": this.axisColor,
            "stroke-width": this.axisThickness,
            "stroke-opacity": this.axisAlpha
        });
    }

    drawGridLines(destination) {

        var ticks = this.axis.scale().ticks();
        if(this.orientation === "bottom") {
            ticks.forEach( (tickPos) => {
                destination.append("line")
                           .attr({
                                     "x1": this.scales.x(tickPos),
                                     "x2": this.scales.x(tickPos),
                                     "y1": this.scales.y(this.dataBounds.yMin),
                                     "y2": this.scales.y(this.dataBounds.yMax),
                                     "fill": "none",
                                     "shape-rendering": "crispEdges",
                                     "stroke": this.axisGridLineColor,
                                     "stroke-width": this.axisGridLineThickness,
                                     "stroke-opacity": this.axisGrideLineAlpha
                            });
            });

        } else {
            ticks.forEach( (tickPos) => {
                destination.append("line")
                           .attr({
                                    "x1": this.scales.x(this.dataBounds.xMin),
                                    "x2": this.scales.x(this.dataBounds.xMax),
                                    "y1": this.scales.y(tickPos),
                                    "y2": this.scales.y(tickPos),
                                    "fill": "none",
                                    "shape-rendering": "crispEdges",
                                    "stroke": this.axisGridLineColor,
                                    "stroke-width": this.axisGridLineThickness,
                                    "stroke-opacity": this.axisGrideLineAlpha
                            });

            });
        }
    }
}
