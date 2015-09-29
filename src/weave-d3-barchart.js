import WeavePanel from "./WeavePanel";
import * as WeavePanelManager from "./WeavePanelManager.js";
import lodash from "lodash";
import d3 from "d3";
import SimpleAxisPlotter from "./weave/visualization/plotters/SimpleAxisPlotter";

export default class WeaveD3Barchart extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);

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
            path.addCallback(lodash.debounce(this._updateContents.bind(this), true), false, 20);
        });

        this.update = lodash.debounce(this._updateContents.bind(this), 20);

        this.update();
    }

    _axisChanged () {

    }

    _updateContents() {
        this._svg.selectAll("*").remove();

       this._svg.attr("width", this.panelWidth)
               .attr("height", this.panelHeight);

        let mapping = { sort: this.sortColumnPath,
                        label: this.labelColumnPath,
                        color: this.colorColumnPath,
                        heights: this.heightColumnsPath.getChildren(),
                        line: {
                            alpha: this._lineStylePath.push("alpha"),
                            color: this._lineStylePath.push("color"),
                            caps: this._lineStylePath.push("caps")
                        }
                    };
        this.records = this._plotterPath.retrieveRecords(mapping);
        this.records.forEach(function (item) {
          item.qkey = opener.weave.WeavePath.Keys.stringToQKey(item.id);
          item.localName = item.qkey.localName;
          item.keyType = item.qkey.keyType;
        });

        this.records = lodash.sortByAll(this.records, ["sort", "localName"]);
        console.log(this.records);

        var dataBounds = {
            xMin: this._xAxisPath.push("axisLineMinValue").getState(),
            xMax: this._xAxisPath.push("axisLineMaxValue").getState(),
            yMin: this._yAxisPath.push("axisLineMinValue").getState(),
            yMax: this._yAxisPath.push("axisLineMaxValue").getState()
        };

        var screenBounds = {
            xMin: Number(this.marginLeft), // convert to numeric
            yMin: Number(this.marginTop), // convert to numeric
            xMax: Number(this.panelWidth - this.marginRight),
            yMax: Number(this.panelHeight - this.marginTop - this.marginBottom)
        };

        // d3 scaling functions for the axis.
        var xScale = d3.scale.ordinal()
                             .domain( this.records.map((record, idx) => { return idx; }) )
                             .rangeBands([screenBounds.xMin,
                                     screenBounds.xMax], 0, 0);

        var xAxisScale = d3.scale.linear()
                                 .domain([dataBounds.xMin,
                                          dataBounds.xMax])
                                 .range([screenBounds.xMin,
                                         screenBounds.xMax]);

        var yScale = d3.scale.linear()
                             .domain([dataBounds.yMin,
                                      dataBounds.yMax])
                             .range([screenBounds.yMin,
                                     screenBounds.yMax]); // flipped because svg y axis is backward

        var yAxisScale = d3.scale.linear()
                             .domain([dataBounds.yMin,
                                      dataBounds.yMax])
                             .range([screenBounds.yMax,
                                     screenBounds.yMin]);

        var xAxisOptions = {
            position: {x: 0, y: screenBounds.yMax},
            dataBounds: dataBounds,
            screenBounds: {min: screenBounds.xMin, max: screenBounds.xMax},
            weavePath: this._xAxisPath,
            scales: {x: xAxisScale, y: yAxisScale},
            orientation: "bottom",
            tickCountRequested: this._xAxisPath.push("tickCountRequested").getState()
        };

        var yAxisOptions = {
            position: {x: screenBounds.xMin, y: 0},
            dataBounds: dataBounds,
            screenBounds: {min: screenBounds.yMax, max: screenBounds.yMin}, // flipped because svg axis is backward
            weavePath: this._yAxisPath,
            scales: {x: xAxisScale, y: yAxisScale},
            orientation: "left",
            tickCountRequested: this._yAxisPath.push("tickCountRequested").getState()
        };

        this.xAxis = new SimpleAxisPlotter(xAxisOptions);
        this.yAxis = new SimpleAxisPlotter(yAxisOptions);

        this.xAxis.drawPlot(this._svg);
        this.yAxis.drawPlot(this._svg);

        var groupingMode = this._plotterPath.push("groupingMode").getState();

        this.records.forEach((record, index) => {
                var numOfHeights = record.heights.length;
                if(numOfHeights > 1) {
                  switch(groupingMode) {
                    case "stack":
                      record.heights.forEach((height, i) => {
                        this._svg.append("rect")
                           .attr("x", xScale(index))
                           .attr("y", screenBounds.yMax + screenBounds.yMin - yScale(record.heights[i] + yScale(record.heights[i - 1])))
                           .attr("width", xScale.rangeBand() / numOfHeights)
                           .attr("height", yScale(record.heights[i]) - screenBounds.yMin )
                           .style("fill", record.color)
                           .style("fill-opacity", 1)
                           .style("stroke", "black")
                           .style("stroke-width", 1)
                           .style("stroke-opacity", 0.5)
                           .on("mouseover", function() {
                            });
                      });
                      break;
                    case "group":
                      this._svg.append("rect")
                     .attr("x", xScale(index))
                     .attr("y", screenBounds.yMax + screenBounds.yMin - yScale(record.heights[0]))
                     .attr("width", xScale.rangeBand())
                     .attr("height", yScale(record.heights[0]) - screenBounds.yMin )
                     .style("fill", record.color)
                     .style("fill-opacity", 1)
                     .style("stroke", "black")
                     .style("stroke-width", 1)
                     .style("stroke-opacity", 0.5)
                     .on("mouseover", function() {

                      });
                      break;
                    case "percentStack":
                      this._svg.append("rect")
                     .attr("x", xScale(index))
                     .attr("y", screenBounds.yMax + screenBounds.yMin - yScale(record.heights[0]))
                     .attr("width", xScale.rangeBand())
                     .attr("height", yScale(record.heights[0]) - screenBounds.yMin )
                     .style("fill", record.color)
                     .style("fill-opacity", 1)
                     .style("stroke", "black")
                     .style("stroke-width", 1)
                     .style("stroke-opacity", 0.5)
                     .on("mouseover", function() {

                      });
                      break;
                    default:
                      break;
                  }
                } else {
                    this._svg.append("rect")
                     .attr("x", xScale(index))
                     .attr("y", screenBounds.yMax + screenBounds.yMin - yScale(record.heights[0]))
                     .attr("width", xScale.rangeBand())
                     .attr("height", yScale(record.heights[0]) - screenBounds.yMin )
                     .style("fill", record.color)
                     .style("fill-opacity", 1)
                     .style("stroke", "black")
                     .style("stroke-width", 1)
                     .style("stroke-opacity", 0.5)
                     .on("mouseover", function() {

                      });
                }
        });
    }

    _drawStackedBars () {

    }

    _drawGroupedBars () {

    }

    _drawProbeLines () {

    }

    _sizeChanged() {

    }

    _selectionKeysChanged() {

    }

    _visualizationChanged() {

    }

    _updateStyle() {

    }

    destroy() {
        this.teardownCallbacks();
    }
}

//WeavePanelManager.registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveD3Barchart);
