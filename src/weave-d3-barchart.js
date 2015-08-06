import WeavePanel from "./WeavePanel";
import * as WeavePanelManager from "./WeavePanelManager.js";
import lodash from "lodash";
import d3 from "d3";
import SimpleAxisPlotter from "./weave/visualization/plotters/SimpleAxisPlotter";

export default class WeaveD3Barchart extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);
        console.log("toolPath", toolPath);
        window.toolPath = toolPath;


        this._visualizationPath = toolPath.push("children", "visualization");
        this._plotterPath = toolPath.pushPlotter("plot");

        this.labelColumnPath = this._plotterPath.push("labelColumn");
        this.heightColumnsPath = this._plotterPath.push("heightColumns");

        this.sortColumnPath = this._plotterPath.push("sortColumn");

        this.colorColumnPath = this._plotterPath.push("colorColumn");

        this._xAxisPath = toolPath.pushPlotter("xAxis");
        this._yAxisPath = toolPath.pushPlotter("yAxis");

        this._lineStylePath = this._plotterPath.push("line");

        this._svg = d3.select(this.element[0]).append("svg")
                                              .attr("width", this.panelWidth)
                                              .attr("height", this.panelHeight);

        [this.labelColumnPath, this.heightColumnsPath, this.sortColumnPath, this.colorColumnPath, this._lineStylePath].forEach( (path) => {
            path.addCallback(lodash.debounce(this._updateContents.bind(this), true, false), 100);
        });

        this.update = lodash.debounce(this._update.bind(this), 100);
    }

    _axisChanged () {

    }

    get screenBounds () {
        return {
            xMin: this.marginLeft,
            yMin: this.marginTop,
            xMax: this.panelWidth - this.marginRight,
            yMax: this.panelHeight - this.marginTop - this.marginBottom
        };
    }

    _updateContents() {
        //console.log("this runs");
        this._svg.selectAll("*").remove();

        let mapping = { sort: this.sortColumnPath,
                        label: this.labelColumnPath,
                        color: this.colorColumnPath,
                        heights: () => {
                            // convert array of children to hashmap
                            var heightColumns = this.heightColumnsPath.getChildren();
                            var map = {};
                            for (let idx in heightColumns) {
                                let column = heightColumns[idx];
                                let name = column.getPath().pop();
                                map[name] = column;
                            }
                            return map;
                        }(),
                        line: {
                            alpha: this._lineStylePath.push("alpha"),
                            color: this._lineStylePath.push("color"),
                            caps: this._lineStylePath.push("caps")
                        }
                    };
        this.records = this._plotterPath.retrieveRecords(mapping);

        lodash(this.records).sortBy("sort");

        var dataBounds = {
            xMin: this._xAxisPath.push("axisLineMinValue").getState(),
            xMax: this._xAxisPath.push("axisLineMaxValue").getState(),
            yMin: this._yAxisPath.push("axisLineMinValue").getState(),
            yMax: this._yAxisPath.push("axisLineMaxValue").getState()
        };

        // d3 scaling functions for the axis.
        var xScale = d3.scale.ordinal()
                             .domain( this.records.map((record) => { return record.sort; }) )
                             .rangeRoundBands([0,
                                     this.screenBounds.xMax]);

        var xAxisScale = d3.scale.linear()
                                 .domain([dataBounds.xMin,
                                          dataBounds.xMax])
                                 .range([this.screenBounds.xMin,
                                         this.screenBounds.xMax]);

        var yScale = d3.scale.linear()
                             .domain([dataBounds.yMin,
                                      dataBounds.yMax])
                             .range([this.screenBounds.yMax,
                                     this.screenBounds.yMin]); // flipped because svg y axis is backward

        var xAxisOptions = {
            position: {x: 0, y: this.screenBounds.yMax},
            dataBounds: dataBounds,
            screenBounds: {min: this.screenBounds.xMin, max: this.screenBounds.xMax},
            weavePath: this._xAxisPath,
            scales: {x: xAxisScale, y: yScale},
            orientation: "bottom",
            tickCountRequested: this._xAxisPath.push("tickCountRequested").getState()
        };

        var yAxisOptions = {
            position: {x: this.screenBounds.xMin, y: 0},
            dataBounds: dataBounds,
            screenBounds: {min: this.screenBounds.yMax, max: this.screenBounds.yMin}, // flipped because svg axis is backward
            weavePath: this._yAxisPath,
            scales: {x: xAxisScale, y: yScale},
            orientation: "left",
            tickCountRequested: this._yAxisPath.push("tickCountRequested").getState()
        };

        this.xAxis = new SimpleAxisPlotter(xAxisOptions);
        this.yAxis = new SimpleAxisPlotter(yAxisOptions);

        this.xAxis.drawPlot(this._svg);
        this.yAxis.drawPlot(this._svg);

        this.records.forEach((record, index) => {
                this._svg.append("rect")
                     .attr("x", xScale(record.sort))
                     .attr("y", this.screenBounds.yMax)
                     .attr("width", xScale.rangeBand())
                     .attr("height", (this.screenBounds.yMax - yScale(record.heights.ReferencedColumn)) )
                     .style("fill", record.color)
                     .style("fill-opacity", 1)
                     .style("stroke", "black")
                     .style("stroke-opacity", 1)
                     .on("mouseover", function() {

                      });
        });
    }

    _sizeChanged() {

    }

    _selectionKeysChanged() {

    }

    _visualizationChanged() {

    }

    _updateStyle() {

    }

    _update() {

    }

    destroy() {
        super();
    }
}

WeavePanelManager.registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveD3Barchart);
