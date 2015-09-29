
import WeavePanel from "./WeavePanel";
import * as WeavePanelManager from "./WeavePanelManager.js";
import lodash from "lodash";
import d3 from "d3";
import SimpleAxisPlotter from "./weave/visualization/plotters/SimpleAxisPlotter";

/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */
function _normalizeRecords (records, attributes) {

    // to avoid computing the stats at each iteration.
    var columnStatsCache = {};
    attributes.forEach(function(attr) {
        columnStatsCache[attr] = {
            min: lodash.min(lodash.pluck(records, attr)),
            max: lodash.max(lodash.pluck(records, attr))
        };
    });

    return records.map(function(record) {

        var obj = {};

        attributes.forEach(function(attr) {
          var min = columnStatsCache[attr].min;
          var max = columnStatsCache[attr].max;
          if(min && max && record[attr]) {
            obj[attr] = (record[attr] - min) / (max - min);
          } else {
            // if any of the value above is null then
            // we can't normalize
            obj[attr] = null;
          }
        });

        return obj;
    });
}

export default class WeaveD3ScatterPlot extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);
        this.lookup = {};
        this._visualizationPath = toolPath.push("children", "visualization");
        this._plotterPath = toolPath.pushPlotter("plot");

        this._dataXPath = this._plotterPath.push("dataX");
        this._dataYPath = this._plotterPath.push("dataY");

        this._xAxisPath = toolPath.pushPlotter("xAxis");
        this._yAxisPath = toolPath.pushPlotter("yAxis");

        this._fillStylePath = this._plotterPath.push("fill");
        this._lineStylePath = this._plotterPath.push("line");
        this._sizeByPath = this._plotterPath.push("sizeBy");

        this._svg = d3.select(this.element[0]).append("svg")
                                              .attr("width", this.panelWidth)
                                              .attr("height", this.panelHeight);

        [this._dataXPath, this._dataYPath, this._sizeByPath, this._fillStylePath, this._lineStylePath].forEach( (path) => {
            path.addCallback(lodash.debounce(this._updateContents.bind(this), 20), true, false);
        });

        this.update = lodash.debounce(this._update.bind(this), 20);
    }

    _axisChanged () {

    }


    _updateContents() {
        //console.log("this runs");
        this._svg.selectAll("*").remove();
        this._svg.attr("width", this.panelWidth)
                 .attr("height", this.panelHeight);
        let mapping = { x: this._dataXPath,
                        y: this._dataYPath,
                        size: this._sizeByPath,
                        fill: {
                            alpha: this._fillStylePath.push("alpha"),
                            color: this._fillStylePath.push("color")
                        },
                        line: {
                            alpha: this._lineStylePath.push("alpha"),
                            color: this._lineStylePath.push("color"),
                            caps: this._lineStylePath.push("caps")
                        }
                    };

        this.records = this._plotterPath.retrieveRecords(mapping);

        this.normalizedRecords = _normalizeRecords(this.records, ["x", "y", "size"]);

        var screenBounds = {
            xMin: this.marginLeft,
            yMin: this.marginTop,
            xMax: this.panelWidth - this.marginRight,
            yMax: this.panelHeight - this.marginTop - this.marginBottom
        };

        var dataBounds = {
            xMin: this._xAxisPath.push("axisLineMinValue").getState(),
            xMax: this._xAxisPath.push("axisLineMaxValue").getState(),
            yMin: this._yAxisPath.push("axisLineMinValue").getState(),
            yMax: this._yAxisPath.push("axisLineMaxValue").getState()
        };

        // d3 scaling functions for the axis.
        var xScale = d3.scale.linear()
                             .domain([dataBounds.xMin,
                                      dataBounds.xMax])
                             .range([screenBounds.xMin,
                                     screenBounds.xMax]);

        var yScale = d3.scale.linear()
                             .domain([dataBounds.yMin,
                                      dataBounds.yMax])
                             .range([screenBounds.yMax,
                                     screenBounds.yMin]); // flipped because svg y axis is backward

        var xAxisOptions = {
            position: {x: 0, y: screenBounds.yMax},
            dataBounds: dataBounds,
            screenBounds: {min: screenBounds.xMin, max: screenBounds.xMax},
            weavePath: this._xAxisPath,
            scales: {x: xScale, y: yScale},
            orientation: "bottom",
            tickCountRequested: this._xAxisPath.push("tickCountRequested").getState()
        };

        var yAxisOptions = {
            position: {x: screenBounds.xMin, y: 0},
            dataBounds: dataBounds,
            screenBounds: {min: screenBounds.yMax, max: screenBounds.yMin}, // flipped because svg axis is backward
            weavePath: this._yAxisPath,
            scales: {x: xScale, y: yScale},
            orientation: "left",
            tickCountRequested: this._yAxisPath.push("tickCountRequested").getState()
        };

        this.xAxis = new SimpleAxisPlotter(xAxisOptions);
        this.yAxis = new SimpleAxisPlotter(yAxisOptions);

        this.xAxis.drawPlot(this._svg);
        this.yAxis.drawPlot(this._svg);

        // variables to calculate the point size
        var minScreenRadius = this._plotterPath.push("minScreenRadius").getState();
        var maxScreenRadius = this._plotterPath.push("maxScreenRadius").getState();

        this.records.forEach((record, index) => {

            var pointSize = 0;

            var normalizedRecord = this.normalizedRecords[index];
            if(normalizedRecord.size && normalizedRecord && normalizedRecord.size) {
                pointSize = minScreenRadius + normalizedRecord.size * (maxScreenRadius - minScreenRadius);
            } else {
                pointSize = this._plotterPath.push("defaultScreenRadius").getState();
            }

            // check if record is within bounds
            if( (record.x >= dataBounds.xMin && record.x <= dataBounds.xMax) &&
                (record.y >= dataBounds.yMin && record.y <= dataBounds.yMax) ) {

                this._svg.append("circle")
                     .attr("cx", xScale(record.x))
                     .attr("cy", yScale(record.y))
                     .attr("r", pointSize)
                             .style("fill", record.fill.color)
                             .style("fill-opacity", record.fill.alpha)
                             .style("stroke", "black")
                             .style("stroke-opacity", record.line.alpha)
                      .on("mouseover", function() {
                      });
            }
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

    }
}

// WeavePanelManager.registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveD3ScatterPlot);
