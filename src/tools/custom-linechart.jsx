import AbstractWeaveTool from "./AbstractWeaveTool.jsx";
import {registerToolImplementation} from "../WeaveTool.jsx";
import c3 from "c3";
import _ from "lodash";
import d3 from "d3";
import FormatUtils from "../Utils/FormatUtils";
import StandardLib from "../Utils/StandardLib";
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

          if(!min)
            min = 0;

          if(max - min === 0) {
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

class CustomLineChart extends AbstractWeaveTool {

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

        var linePlotters = this.toolPath.push('children', 'visualization', 'plotManager', 'plotters').getValue('getObjects(LineChartPlotter)');

        let numericMapping = {
          point: {
            x: this.paths.dataX,
            y: this.paths.dataY
          },
          size: this.paths.sizeBy,
          lines: {}
        };
        let lines = numericMapping.lines;
        let xs = {};
        linePlotters.forEach((plotter, i) => {
          xs['y'+i] = 'x'+i;
          lines['x'+i] = plotter.push('dataX');
          lines['y'+i] = plotter.push('dataY');
        });

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

        var timeout = Date.now() + 3000;
        while (Date.now() < timeout)
        {
          this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
          this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});
          if (this.numericRecords.length === this.stringRecords.length)
            break;
        }

        if (this.numericRecords.length !== this.stringRecords.length)
          throw new Error("Failed to retrieve records.");

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);

        if(this.records.length)
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
                let minScreenRadius = this.plotterState.minScreenRadius;
                let maxScreenRadius = this.plotterState.maxScreenRadius;
                return (normalizedRecord && normalizedRecord.size ?
                        minScreenRadius + normalizedRecord.size * (maxScreenRadius - minScreenRadius) :
                        this.plotterState.defaultScreenRadius) || 3;
            }
            else {
                return (this.plotterState.defaultScreenRadius) || 3;
            }
        });

        this._axisChanged();
        this.busy = true;
        var loadParams = {unload: true, done: () => { this.busy = false; }};

        if (linePlotters.length) {
          loadParams.xs = xs, loadParams.data = _.pluck(this.numericRecords, 'lines');
          var colors = {};
          var names = {};
          var columnTitleToColor = {};
          linePlotters.forEach((linePlotter, i) => {
             colors["y"+i] = "#" + StandardLib.decimalToHex(linePlotter.getState("lineStyle", "color", "defaultValue"));
             names["y"+i] = linePlotter.push("dataY").getValue("getMetadata('title')");
             columnTitleToColor[names["y"+i]] = colors["y"+i];
          });
          this.props.updateTitleToColor(columnTitleToColor);
        }
        else {
          loadParams.data = _.pluck(this.numericRecords, 'point');
        }
        this.chart.load(loadParams);
        this.chart.data.names(names);
        this.chart.data.colors(colors);
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
      //console.log("resizing");
      //var start = Date.now();
      var newElementSize = this.getElementSize();
      if(!_.isEqual(newElementSize, this.elementSize)) {
        this.chart.resize(newElementSize);
        this.elementSize = newElementSize;
      }
      //var end = Date.now();
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
        super.componentWillUnmount();
    }

    componentDidMount() {
        super.componentDidMount();
        var axisChanged = this._axisChanged.bind(this);
        var dataChanged = this._dataChanged.bind(this);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = this._probedKeysChanged.bind(this);

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
          { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged },
          { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
          { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);

        this.c3Config = {
            bindto: this.element,
            tooltip: {
              show: false
            },
            padding: {
              top: 10,
              bottom: 10,
              right: 10
            },
            data: {
                rows: [],
                //xSort: false,
                type: "line",
                selection: {
                    enabled: true,
                    multiple: false,
                    draggable: false
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
                show: true
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
                          if(this.paths.dataX && this.xAxisValueToLabel && this.dataXType !== "number") {
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
                          if(this.paths.dataY && this.yAxisValueToLabel && this.dataYType !== "number") {
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
                },
                show: false
            },
            onrendered: this._updateStyle.bind(this)
        };
        this.chart = c3.generate(this.c3Config);
    }
}
export default CustomLineChart;
