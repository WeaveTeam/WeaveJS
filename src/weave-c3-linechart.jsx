import AbstractWeaveTool from "./AbstractWeaveTool.js";
import c3 from "c3";
import d3 from "d3";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";
import FormatUtils from "./Utils/FormatUtils";
import React from "react";

class WeaveC3LineChart extends AbstractWeaveTool {
    constructor(props) {
        super(props);

        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = _.debounce(this._probedKeysChanged.bind(this), 20);
        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
          { name: "plotter", path: plotterPath, callbacks: null},
          { name: "columns", path: plotterPath.push("columns"), callbacks: dataChanged },
          { name: "lineStyle", path: plotterPath.push("lineStyle"), callbacks: dataChanged },
          { name: "curveType", path: plotterPath.push("curveType"), callbacks: dataChanged },
          { name: "filteredKeySet", path: plotterPath.push("filteredKeySet")},
          { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
          { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);

        this.c3Config = {
            //size: this.getElementSize(),
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
        };
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        if(keys.length) {
            this.chart.focus(keys);
        } else {
            this.chart.focus();
        }
    }

    _probedKeysChanged() {

    }

    _updateStyle() {
        d3.selectAll(this.element).selectAll("circle").style("opacity", 1)
                                                      .style("stroke", "black")
                                                      .style("stroke-opacity", 0.5);
    }

    _dataChanged() {
        this.columnLabels = [];
        this.columnNames = [];

        var children = this.paths.columns.getChildren();

        this.yLabelColumnPath = children[0];

        let numericMapping = {
            columns: children,
            yLabel: this.yLabelColumnPath
        };


        let stringMapping = {
            columns: children,
            line: {
                //alpha: this._lineStylePath.push("alpha"),
                color: this.paths.lineStyle.push("color")
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

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.plotter.push("filteredKeySet"), dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.plotter.push("filteredKeySet"), dataType: "string"});

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
        if(this.paths.plotter.push("curveType").getState() === "double") {
            chartType = "spline";
        }

        this.chart.load({columns: columns, colors: this.colors, type: chartType, unload: true});
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
        this.chart = c3.generate(this.c3Config);
    }

    render() {
        return <div style={{width: "100%", height: "100%" /*, maxHeight: this.getElementSize().height, maxWidth: this.getElementSize().width*/}}/>;
    }
}

export default WeaveC3LineChart;

registerToolImplementation("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
