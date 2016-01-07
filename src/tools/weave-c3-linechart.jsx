import AbstractWeaveTool from "../../outts/tools/AbstractWeaveTool.jsx";
import c3 from "c3";
import d3 from "d3";
import _ from "lodash";
import {registerToolImplementation} from "../../outts/WeaveTool.jsx";
import FormatUtils from "../Utils/FormatUtils";
import React from "react";

class WeaveC3LineChart extends AbstractWeaveTool {
    constructor(props) {
        super(props);
        this.keyToIndex = {};
        this.indexToKey = {};
        this.yAxisValueToLabel = {};
    }

    _selectionKeysChanged() {
        if(!this.chart)
            return;

        var selectedKeys = this.toolPath.selection_keyset.getKeys();
        var selectedIndices = selectedKeys.map((key) => {
            return Number(this.keyToIndex[key]);
        });
        var keys = Object.keys(this.keyToIndex);
        var indices = keys.map((key) => {
            return Number(this.keyToIndex[key]);
        });

        var unselectedIndices = _.difference(indices, selectedIndices);
        if(selectedIndices.length) {
            //unfocus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style("opacity", "0.1");

            selectedIndices.forEach( (index) => {
                //custom style for circles on selected lines
                var circleCount = d3.select(d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index])[0][0].length;
                var selectedCircles = _.range(0,circleCount);
                selectedCircles.forEach( (i) => {
                    d3.select(d3.select(d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index])[0][0][i]).style("opacity", "1.0");
                });
            });

            this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", "opacity", "0.1");
            this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", "opacity", "1.0");
            this.chart.select(["y"], selectedIndices, true);
        }else{
            //focus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style("opacity", "1.0");
            this.customStyle(indices, "path", ".c3-shape.c3-line", "opacity", "1.0");
            this.chart.select(["y"], [], true);
        }
    }

    _probedKeysChanged() {
        var selectedKeys = this.toolPath.probe_keyset.getKeys();
        var selectedIndices = selectedKeys.map((key) => {
            return Number(this.keyToIndex[key]);
        });
        var keys = Object.keys(this.keyToIndex);
        var indices = keys.map((key) => {
            return Number(this.keyToIndex[key]);
        });
        var unselectedIndices = _.difference(indices, selectedIndices);

        if (selectedIndices.length) {
            //unfocus all circles
            d3.select(this.element).selectAll("circle").filter(".c3-shape").style("opacity", "0.1");

            selectedIndices.forEach( (index) => {
                //custom style for circles on probed lines
                var circleCount = d3.select(d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index])[0][0].length;
                var selectedCircles = _.range(0,circleCount);
                selectedCircles.forEach( (i) => {
                    d3.select(d3.select(d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape")[index])[0][0][i]).style("opacity", "1.0");
                });
            });

            this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", "opacity", "0.1");
            this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", "opacity", "1.0");
        } else {
            this._selectionKeysChanged()
        }
    }

    _updateStyle() {
        d3.select(this.element).selectAll("circle").style("opacity", 1);
                                                      //.style("stroke", "black")
                                                      //.style("stroke-opacity", 0.5);
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
            let title = child.getValue("this.getMetadata('title')");
            let name = child.getPath().pop();
            this.columnLabels.push(title);
            this.columnNames.push(name);
        }

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortBy(this.records, [0, "id"]);

        if(this.records.length)
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
        //console.log("resizing");
        //var start = Date.now();
        var newElementSize = this.getElementSize();
        if(!_.isEqual(newElementSize, this.elementSize)) {
          this.chart.resize(newElementSize);
          this.elementSize = newElementSize;
        }
        //var end = Date.now();
        //console.log(end - start);
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        super.componentWillUnmount();
        this.chart.destroy();
    }

    componentDidMount() {
        super.componentDidMount();
        document.addEventListener("keydown", this.toggleKey.bind(this));
        document.addEventListener("keyup", this.toggleKey.bind(this));
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = _.debounce(this._probedKeysChanged.bind(this), 100);
        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
          { name: "plotter", path: plotterPath, callbacks: null},
          { name: "columns", path: plotterPath.push("columns"), callbacks: dataChanged },
          { name: "lineStyle", path: plotterPath.push("lineStyle"), callbacks: dataChanged },
          { name: "curveType", path: plotterPath.push("curveType"), callbacks: dataChanged },
          { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged },
          { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
          { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);

        this.c3Config = {
            //size: this.getElementSize(),
            padding: {
              top: 20,
              bottom: 20,
              right: 30
            },
            data: {
                columns: [],
                xSort: false,
                selection: {
                   enabled: true,
                   multiple: true,
                   draggable: true
               },
                onclick: (d) => {
                    if(!this.keyDown && d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.setKeys([d.id]);
                    }
                },
                onselected: (d) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([d.id]);
                    }
                },
                onunselected: (d) => {
                    this.flag = true;
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.removeKeys([d.id]);
                    }
                },
                onmouseover: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([d.id]);
                    }
                },
                onmouseout: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                    }
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
                        multiline: true,
                        format: (num) => {
                          if(this.yLabelColumnPath && this.yLabelColumnPath.getValue("this.getMetadata('dataType')") !== "number") {
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

        this.chart = c3.generate(this.c3Config);
    }

    handleClick(event:MouseEvent):void {
        if(!this.flag) {
            this.toolPath.selection_keyset.setKeys([]);
        }
        this.flag = false;
    }

    toggleKey(event:KeyboardEvent):void {
        if((event.keyCode === 17)||(event.keyCode === 91) || (event.keyCode === 224)) {
            this.keyDown = !this.keyDown;
        }
    }
}

export default WeaveC3LineChart;

registerToolImplementation("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
