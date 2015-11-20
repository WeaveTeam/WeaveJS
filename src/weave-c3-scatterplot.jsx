import AbstractWeaveTool from "./AbstractWeaveTool.js";
import {registerToolImplementation} from "./WeaveTool.jsx";
import c3 from "c3";
import _ from "lodash";
import d3 from "d3";
import FormatUtils from "./Utils/FormatUtils";
import React from "react";

/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */
function _normalizeRecords (records, attributes) {

    // to avoid computing the stats at each iteration.
    var columnStatsCache = {};
    attributes.forEach(function(attr) {
        columnStatsCache[attr] = {
            min: _.min(_.pluck(records, attr)),
            max: _.max(_.pluck(records, attr))
        };
    });

    return records.map(function(record) {

        var obj = {};

        attributes.forEach(function(attr) {
          var min = columnStatsCache[attr].min;
          var max = columnStatsCache[attr].max;

          if(!min || !max || max - min === 0) {
            return 0;
          }

          if(record[attr]) {
            // console.log( (record[attr] - min) / (max - min));
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

class WeaveC3ScatterPlot extends AbstractWeaveTool {

    constructor(props) {
        super(props);
    }

    _axisChanged () {

        if(this.busy) {
            return;
        }

        this.chart.axis.labels({
            x: this.paths.xAxis.getState("overrideAxisName") || this.paths.dataX.getValue("ColumnUtils.getTitle(this)"),
            y: this.paths.yAxis.getState("overrideAxisName") || this.paths.dataY.getValue("ColumnUtils.getTitle(this)")
        });
    }

    _dataChanged() {
        if(this.busy) {
            return;
        }
        let numericMapping = {
          point: {
            x: this.paths.dataX,
            y: this.paths.dataY
          },
          size: this.paths.sizeBy
        };

        let stringMapping = {
            point: {
              x: this.paths.dataX,
              y: this.paths.dataY
            },
            fill: {
              //alpha: this._fillStylePath.push("alpha"),
              color: this.paths.fill.push("color")
            },
            line: {
              //alpha: this._lineStylePath.push("alpha"),
              color: this.paths.line.push("color")
              //caps: this._lineStylePath.push("caps")
            }
        };

        this.dataXType = this.paths.dataX.getValue("getMetadata('dataType')");
        this.dataYType = this.paths.dataY.getValue("getMetadata('dataType')");

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);

        [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};

        this.numericRecords.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
            this.indexToKey[index] = record.id;
        });

        this.stringRecords.forEach((record, index) => {
          this.xAxisValueToLabel[this.numericRecords[index].point.x] = record.point.x;
          this.yAxisValueToLabel[this.numericRecords[index].point.y] = record.point.y;
        });

        this.normalizedRecords = _normalizeRecords(this.numericRecords, ["size"]);

        this.plotterState = this.paths.plotter.getState();
        this.normalizedPointSizes = this.normalizedRecords.map((normalizedRecord) => {
            if(this.plotterState && this.plotterState.sizeBy.length) {
                let minScreenRadius = this.paths.plotter.minScreenRadius;
                let maxScreenRadius = this.plotterState.maxScreenRadius;

                return (normalizedRecord && normalizedRecord.size ?
                        minScreenRadius + normalizedRecord.size * (maxScreenRadius - minScreenRadius) :
                        this.plotterState.defaultScreenRadius) || 1;
            }
            else {
                return (this.plotterState.defaultScreenRadius) || 1;
            }
        });

        this._axisChanged();
        this.busy = true;
        this.chart.load({data: _.pluck(this.numericRecords, "point"), unload: true, done: () => { this.busy = false; }});
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        var indices = keys.map((key) => {
            return Number(this.keyToIndex[key]);
        });
        this.chart.select("y", indices, true);
    }

    _probedKeysChanged() {
        /*
        var keys = this.toolPath.probe_keyset.getKeys();
        var indices = keys.map( (key) => {
            return Number(this.keyToIndex[key]);
        });
        */
        // this.chart.select("y", indices, true);
    }

    _updateStyle() {
        d3.selectAll(this.element).selectAll("circle").style("opacity", 1)
                                                      .style("stroke", "black")
                                                      .style("stroke-opacity", 0.5);
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        this.chart.resize(this.getElementSize());
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        super.componentWillUnmount();
        this.chart.destroy();
    }

    componentDidMount() {
        super.componentDidMount();
        var axisChanged = _.debounce(this._axisChanged.bind(this), 100);
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = _.debounce(this._probedKeysChanged.bind(this), 30);
        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
          { name: "plotter", path: plotterPath, callbacks: null},
          { name: "dataX", path: plotterPath.push("dataX"), callbacks: [dataChanged, axisChanged] },
          { name: "dataY", path: plotterPath.push("dataY"), callbacks: [dataChanged, axisChanged] },
          { name: "sizeBy", path: plotterPath.push("sizeBy"), callbacks: dataChanged },
          { name: "fill", path: plotterPath.push("fill"), callbacks: [dataChanged] },
          { name: "line", path: plotterPath.push("line"), callbacks: dataChanged },
          { name: "xAxis", path: this.toolPath.pushPlotter("xAxis"), callbacks: axisChanged },
          { name: "yAxis", path: this.toolPath.pushPlotter("yAxis"), callbacks: axisChanged },
          { name: "filteredKeySet", path: plotterPath.push("filteredKeySet")},
          { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
          { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);

        this.c3Config = {
            bindto: this.element,
            data: {
                rows: [],
                x: "x",
                xSort: false,
                type: "scatter",
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                color: (color, d) => {
                    if(this.stringRecords && d.hasOwnProperty("index")) {

                        // find the corresponding index of numericRecords in stringRecords
                        var id = this.indexToKey[d.index];
                        var index = _.pluck(this.stringRecords, "id").indexOf(id);

                        var record = this.stringRecords[index];
                        return (record && record.fill && record.fill.color) ? record.fill.color : "#C0CDD1";
                    }
                    return "#C0CDD1";
                },
                onselected: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                    }
                },
                onunselected: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.removeKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseover: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseout: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                    }
                }
            },
            legend: {
                show: false
            },
            axis: {
                x: {
                    label: {
                        position: "outer-center"
                    },
                    tick: {
                        fit: false,
                        rotate: 0,
                        format: (num) => {
                          if(this._dataXPath && this.xAxisValueToLabel && this.dataXType !== "number") {
                            return this.xAxisValueToLabel[num] || "";
                          } else {
                            return FormatUtils.defaultNumberFormatting(num);
                          }
                        }
                    }
                },
                y: {
                    label: {
                        position: "outer-middle"
                    },
                    tick: {
                        fit: false,
                        format: (num) => {
                          if(this._dataYPath && this.yAxisValueToLabel && this.dataYType !== "number") {
                            return this.yAxisValueToLabel[num] || "";
                          } else {
                            return FormatUtils.defaultNumberFormatting(num);
                          }
                        }
                    }
                }
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            point: {
                r: (d) => {
                    if(d.hasOwnProperty("index")) {
                        return this.normalizedPointSizes[d.index];
                    }

                }
            },
            onrendered: this._updateStyle.bind(this)
        };
        this.chart = c3.generate(this.c3Config);
    }

    render() {
      return <div style={{width: "100%", height: "100%"}}/>;
    }
}
export default WeaveC3ScatterPlot;

registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
