import AbstractWeaveTool from "./AbstractWeaveTool.js";
import c3 from "c3";
import d3 from "d3";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";
import FormatUtils from "./Utils/FormatUtils";


class WeaveC3LineChart extends AbstractWeaveTool {
    constructor(props) {
        super(props);
        this._plotterPath = this.toolPath.pushPlotter("plot");
        this._columnsPath = this._plotterPath.push("columns");
        this._lineStylePath = this._plotterPath.push("lineStyle");

        this._xAxisPath = this.toolPath.pushPlotter("xAxis");
        this._yAxisPath = this.toolPath.pushPlotter("yAxis");

        this.chart = c3.generate({
            size: this._getElementSize(),
            data: {
                columns: [],
                xSort: false,
                selection: {
                   enabled: true,
                   multiple: true,
                   draggable: true
               }
            },
            tooltip: {
                show: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            axis: {
                x: {
                    tick: {
                        multiline: false,
                        rotate: 0,
                        format: (d) => {
                            return this.columnLabels[d];
                        }
                    }
                },
                y: {
                    tick: {
                        format: (num) => {
                          if(this.yLabelColumnPath && this.yLabelColumnPath.getValue("getMetadata('dataType')") !== "number") {
                            return this.yAxisValueToLabel[num] || "";
                          } else {
                            return FormatUtils.defaultNumberFormatting(num);
                          }
                        }
                    }
                }
            },
            bindto: this.element,
            legend: {
                show: false
            },
            onrendered: this._updateStyle.bind(this)
        });

        this._setupCallbacks();
    }

    _setupCallbacks() {
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        [
            this._columnsPath,
            this._lineStylePath,
            this._plotterPath.push("curveType")
        ].forEach((path) => {
            path.addCallback(dataChanged, true, false);
        });

        var selectionChanged = this._selectionKeysChanged.bind(this);
        this.toolPath.selection_keyset.addCallback(selectionChanged, true, false);
    }

    resize() {
        this.chart.resize(this._getElementSize());
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        if(keys.length) {
            this.chart.focus(keys);
        } else {
            this.chart.focus();
        }
    }

    _updateStyle() {
        d3.selectAll(this.element).selectAll("circle").style("opacity", 1)
                                                      .style("stroke", "black")
                                                      .style("stroke-opacity", 0.5);
    }

    _dataChanged() {
        this.columnLabels = [];
        this.columnNames = [];

        var children = this._columnsPath.getChildren();

        this.yLabelColumnPath = children[0];

        let numericMapping = {
            columns: children,
            yLabel: this.yLabelColumnPath
        };


        let stringMapping = {
            columns: children,
            line: {
                //alpha: this._lineStylePath.push("alpha"),
                color: this._lineStylePath.push("color")
                //caps: this._lineStylePath.push("caps")
            },
            yLabel: this.yLabelColumnPath
        };

        for (let idx in children) {
            let child = children[idx];
            let title = child.getValue("getMetadata('title')");
            let name = child.getPath().pop();
            this.columnLabels.push(title);
            this.columnNames.push(name);
        }

        this.numericRecords = this._plotterPath.retrieveRecords(numericMapping, {keySet: this._plotterPath.push("filteredKeySet"), dataType: "number"});
        this.stringRecords = this._plotterPath.retrieveRecords(stringMapping, {keySet: this._plotterPath.push("filteredKeySet"), dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortBy(this.records, [0, "id"]);
        [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};

        this.numericRecords.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
            this.indexToKey[index] = record.id;
        });

        this.stringRecords.forEach((record, index) => {
          var numericRecord = this.numericRecords[index];
          this.yAxisValueToLabel[numericRecord.yLabel] = record.yLabel;
        });

        var columns = [];

        columns = this.numericRecords.map(function(record) {
            var tempArr = [];
            tempArr.push(record.id);
            _.keys(record.columns).forEach((key) => {
                tempArr.push(record.columns[key]);
            });
            return tempArr;
        });

        this.colors = {};
        this.stringRecords.forEach((record) => {
            this.colors[record.id] = record.line.color || "#C0CDD1";
        });

        var chartType = "line";
        if(this._plotterPath.push("curveType").getState() === "double") {
            chartType = "spline";
        }

        this.chart.load({columns: columns, colors: this.colors, type: chartType, unload: true});
    }
}

export default WeaveC3LineChart;

registerToolImplementation("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
