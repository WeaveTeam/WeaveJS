
import WeavePanel from "./WeavePanel";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";
import lodash from "lodash";
import d3 from "d3";
import StandardLib from "./Utils/StandardLib";
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
            path.addCallback(lodash.debounce(this._updateContents.bind(this), true, false), 100);
        });

        this.update = lodash.debounce(this._update.bind(this), 100);
    }

    _axisChanged () {

    }

    get screenBounds () {
        return {
            xMin: this.marginLeft,
            yMin: this.marginBottom,
            xMax: this.panelWidth - this.marginLeft - this.marginRight,
            yMax: this.panelHeight - this.marginTop - this.marginBottom
        };
    }

    _updateContents() {
        //console.log("this runs");
        this._svg.selectAll("*").remove();

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

        this.originalRecords = lodash(this._plotterPath.retrieveRecords(mapping)).sortBy("id")
            .forEach(function(record, index) {record.originalIndex = index; }).value();

        this.normalizedRecords = _normalizeRecords(this.originalRecords, ["x", "y", "size"]);

        var xColumn = lodash.pluck(this.originalRecords, "x");
        var yColumn = lodash.pluck(this.originalRecords, "y");

        var xBounds = StandardLib.getDataBounds(xColumn);
        var yBounds = StandardLib.getDataBounds(yColumn);

        var xAxisOptions = {
            position: {x: 0, y: this.screenBounds.yMax + this.screenBounds.yMin},
            weavePath: this._xAxisPath,
            dataBounds: xBounds,
            screenBounds: {min: this.screenBounds.xMin, max: this.screenBounds.xMax}
        };

        var yAxisOptions = {
            position: {x: this.screenBounds.xMin, y: 0},
            weavePath: this._yAxisPath,
            dataBounds: yBounds,
            screenBounds: {min: this.screenBounds.yMax, max: this.screenBounds.yMin} // flipped because svg axis is backward
        };

        this.xAxis = new SimpleAxisPlotter(xAxisOptions);
        this.yAxis = new SimpleAxisPlotter(yAxisOptions);

        this.xAxis.drawPlot(this._svg, "bottom");
        this.yAxis.drawPlot(this._svg, "left");

        var xScale = d3.scale.linear()
                     .domain([this._xAxisPath.push("axisLineMinValue").getState(),
                              this._xAxisPath.push("axisLineMaxValue").getState()])
                     .range([this.screenBounds.xMin, this.screenBounds.xMax]);

        var yScale = d3.scale.linear()
                             .domain([this._yAxisPath.push("axisLineMinValue").getState(),
                             this._yAxisPath.push("axisLineMaxValue").getState()])
                             .range([this.screenBounds.yMax, this.screenBounds.yMin]); // flipped because svg y axis is backward

        this.originalRecords.forEach((record) => {
            this._svg.append("circle")
                     .attr("cx", xScale(record.x))
                     .attr("cy", yScale(record.y))
                     .attr("r", record.size || this._plotterPath.push("defaultScreenRadius").getState())
                             .style("fill", record.fill.color)
                             .style("fill-opacity", record.fill.alpha)
                             .style("stroke", "black")
                             .style("stroke-opacity", record.line.alpha);
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

WeavePanelManager.registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveD3ScatterPlot);
