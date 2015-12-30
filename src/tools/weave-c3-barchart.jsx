import AbstractWeaveTool from "./AbstractWeaveTool.jsx";
import d3 from "d3";
import c3 from "c3";
import {registerToolImplementation} from "../WeaveTool.jsx";
import _ from "lodash";
import StandardLib from "../Utils/StandardLib";
import FormatUtils from "../Utils/FormatUtils";
import React from "react";

class WeaveC3Barchart extends AbstractWeaveTool {

    constructor(props) {
        super(props);

        this.c3Config = {
            //size: this.getElementSize(),
            padding: {
              top: 20,
              bottom: 20,
              right: 30
            },
            data: {
                json: [],
                type: "bar",
                xSort: false,
                selection: {
                   enabled: true,
                   multiple: true,
                   draggable: true

               },
               labels: {
                 format: (v, id, i, j) => {
                   if(this.showValueLabels) {
                     return v;
                   } else {
                     return "";
                   }
                 }
               },
               order: null,
               color: (color, d) => {
                    if(this.heightColumnNames.length === 1 && d.hasOwnProperty("index")) {

                        // find the corresponding index of numericRecords in stringRecords
                        var id = this.indexToKey[d.index];
                        var index = _.pluck(this.stringRecords, "id").indexOf(id);
                        return this.stringRecords[index] ? this.stringRecords[index].color : "#C0CDD1";
                    } else {
                        return color || "#C0CDD1";
                    }
               },
               onclick: (d) => {
                 if(!this.keyDown && d && d.hasOwnProperty("index")) {
                     this.toolPath.selection_keyset.setKeys([this.indexToKey[d.index]]);
                 }
               },
               onselected: (d) => {
                   this.flag = true;
                   if(d && d.hasOwnProperty("index")) {
                       this.toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                   }
               },
               onunselected: (d) => {
                   this.flag = true;
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
            axis: {
                x: {
                    type: "category",
                    label: {
                        position: "outer-center"
                    },
                    tick: {
                        fit: false,
                        multiline: false,
                        format: (num) => {
                             if(this.stringRecords && this.stringRecords[num]) {
                               return this.stringRecords[num].xLabel;
                             } else {
                               return "";
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
                      multiline: false,
                      format: (num) => {
                          if(this.yLabelColumnPath && this.yLabelColumnDataType !== "number") {
                            return this.yAxisValueToLabel[num] || "";
                          } else if (this.groupingMode === "percentStack") {
                            return d3.format(".0%")(num);
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
            bindto: null,
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            legend: {
                show: false
            },
            onrendered: () => {
              this.busy = false;
            }
        };
    }

    _selectionKeysChanged () {
        var keys = this.toolPath.selection_keyset.getKeys();
        // var indices = this.indexCache.pick(keys).values();
        var indices = keys.map((key) => {
            return Number(this.keyToIndex[key]);
        });

        this.chart.focus();
        if(indices.length) {
            this.chart.select(this.heightColumnNames, indices, true);
        }

    }

    _probedKeysChanged () {
        var keys = this.toolPath.probe_keyset.getKeys();
        var indices = keys.map((key) => {
            return Number(this.keyToIndex[key]);
        });
        if(indices.length) {
            //this.chart.select(this.heightColumnNames,indices,true);
            this.chart.focus()
        }else{
            this._selectionKeysChanged();
        }
    }

    handleClick(event) {
      if(!this.flag) {
        this.toolPath.selection_keyset.setKeys([]);
      }
      this.flag = false;
    }

    toggleKey(event) {
        if((event.keyIdentifier == "Control")||(event.keyIdentifier == "Meta")) {
            this.keyDown = !this.keyDown;
        }
    }

    rotateAxes() {
      // this.c3Config.axis.rotated = this.paths.horizontalMode.getState();
      // setTimeout(() => {
      //   this.busy = true;
      //   c3.generate(this.c3Config);
      // }, 10);
    }

    _axisChanged () {
        if(!this.chart)
          return;

        if(this.busy) {
          setTimeout(this._axisChanged, 20);
          return;
        }

        var xLabel = this.paths.xAxis.push("overrideAxisName").getState() || "Sorted by " + this.paths.sortColumn.getObject().getMetadata('title');
        var yLabel = this.paths.yAxis.push("overrideAxisName").getState() || (this.heightColumnsLabels ? this.heightColumnsLabels.join(", ") : "");

        this.chart.axis.labels({
          x: xLabel,
          y: yLabel
        });

        this.c3Config.axis.x.label.text = xLabel;
        this.c3Config.axis.y.label.text = yLabel;
    }

    handleShowValueLabels () {
      this.showValueLabels = this.paths.showValueLabels.getState();
      this.chart.flush();
    }

    _updateColumns() {
        this.heightColumnNames = [];
        this.heightColumnsLabels = [];

        var heightColumns = this.paths.heightColumns.getChildren();

        for (let idx in heightColumns)
        {
            let column = heightColumns[idx];
            let title = column.getValue("this.getMetadata('title')");
            let name = column.getPath().pop();

            this.heightColumnsLabels.push(title);
            this.heightColumnNames.push(name);
        }
    }

    _dataChanged() {
        if(!this.chart) {
          return;
        }

        if(this.busy) {
          return;
        }

        this._updateColumns();

        var heightColumns = this.paths.heightColumns.getChildren();

         var numericMapping = {
            sort: this.paths.sortColumn,
            xLabel: this.paths.labelColumn
        };

        var stringMapping = {
            sort: this.paths.sortColumn,
            color: this.paths.colorColumn,
            xLabel: this.paths.labelColumn
        };

        for (let idx in heightColumns)
        {
            let column = heightColumns[idx];
            let name = column.getPath().pop();
            numericMapping[name] = column; // all height columns as numeric value for the chart

            if(idx === 0 || idx === "0") {
              this.yLabelColumnPath = column;
              stringMapping.yLabel = column; // only using the first column to label the y axis
              numericMapping.yLabel = column;
            }
        }

        this.yLabelColumnDataType = this.yLabelColumnPath.getValue("this.getMetadata('dataType')");

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.records = _.zip(this.numericRecords, this.stringRecords);
        this.records = _.sortByAll(this.records, [[0, "sort"], [0, "id"]]);

        if(this.records.length)
          [this.numericRecords, this.stringRecords] = _.unzip(this.records);

        this.yAxisValueToLabel = {};
        this.xAxisValueToLabel = {};
        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
            this.indexToKey[index] = record.id;
        });


        this.stringRecords.forEach((record, index) => {
          var numericRecord = this.numericRecords[index];
          this.yAxisValueToLabel[numericRecord.yLabel] = record.yLabel;
          this.xAxisValueToLabel[numericRecord.xLabel] = record.xLabel;
        });

        this.groupingMode = this.paths.groupingMode.getState();
        //var horizontalMode = this.paths.plotter.push("horizontalMode").getState();

        // set axis rotation mode
        //this.chart.load({axes: { rotated: horizontalMode }});

        if(this.groupingMode === "stack") {
            this.chart.groups([this.heightColumnNames]);
        } else if(this.groupingMode === "group") {
            this.chart.groups([]);
        } else if(this.groupingMode === "percentStack") {
            this.chart.groups([this.heightColumnNames]);
        }

        if(this.groupingMode === "percentStack" && this.heightColumnNames.length > 1) {
            // normalize the height columns to be percentages.
            var newValues = this.numericRecords.map((record) => {
                var heights = _.pick(record, this.heightColumnNames);
                var sum = 0;
                _.keys(heights).forEach((key) => {
                    sum += heights[key];
                });

                _.keys(heights).forEach((key) => {
                    heights[key] = heights[key] / sum;
                });

                return heights;
            });

            this.numericRecords = newValues;
        }

        var keys = {};
        // if label column is specified
        if(this.paths.labelColumn.getState().length) {
            keys.x = "xLabel";
        }

        keys.value = this.heightColumnNames;
        var colors = {};

        if(this.heightColumnNames.length > 1) {
            this.colorRamp = this.paths.chartColors.getState();
            this.heightColumnNames.map((name, index) => {
                var color = StandardLib.interpolateColor(index / (this.heightColumnNames.length - 1), this.colorRamp);
                colors[name] = "#" + StandardLib.decimalToHex(color);
            });
            colors = {};
        }

        var data = _.cloneDeep(this.c3Config.data);
        data.json = this.numericRecords;
        data.colors = colors;
        data.keys = keys;
        data.unload = true;
        data.done = () => { this.busy = false; };
        this.c3Config.data = data;
        this.busy = true;
        this.chart.load(data);
    }

    _updateStyle() {}

    componentDidUpdate() {
        super.componentDidUpdate();
        var newElementSize = this.getElementSize();
        if(!_.isEqual(newElementSize, this.elementSize)) {
          this.chart.resize(newElementSize);
          this.elementSize = newElementSize;
        }
    }

    componentWillUnmount() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
        super.componentWillUnmount();
    }

    componentDidMount() {
        super.componentDidMount();
        document.addEventListener("keydown", this.toggleKey.bind(this));
        document.addEventListener("keyup", this.toggleKey.bind(this));
        var axisChanged = _.debounce(this._axisChanged.bind(this), 100);
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        var handleShowValueLabels = _.debounce(this.handleShowValueLabels.bind(this), 10);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = _.debounce(this._probedKeysChanged.bind(this), 100);
        var rotateAxes = _.debounce(this.rotateAxes.bind(this), 10);

        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
          { name: "plotter", path: plotterPath, callbacks: null},
          { name: "heightColumns", path: plotterPath.push("heightColumns"), callbacks: [dataChanged, axisChanged] },
          { name: "labelColumn", path: plotterPath.push("labelColumn"), callbacks: [dataChanged, axisChanged] },
          { name: "sortColumn", path: plotterPath.push("sortColumn"), callbacks: [dataChanged, axisChanged] },
          { name: "colorColumn", path: plotterPath.push("colorColumn"), callbacks: dataChanged },
          { name: "chartColors", path: plotterPath.push("chartColors"), callbacks: dataChanged },
          { name: "groupingMode", path: plotterPath.push("groupingMode"), callbacks: dataChanged },
          { name: "horizontalMode", path: plotterPath.push("horizontalMode"), callbacks: rotateAxes },
          { name: "showValueLabels", path: plotterPath.push("showValueLabels"), callbacks: handleShowValueLabels},
          { name: "xAxis", path: this.toolPath.pushPlotter("xAxis"), callbacks: axisChanged },
          { name: "yAxis", path: this.toolPath.pushPlotter("yAxis"), callbacks: axisChanged },
          { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged},
          { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
          { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(mapping);
        this.c3Config.bindto = this.element;
        this.chart = c3.generate(this.c3Config);
    }
}

export default WeaveC3Barchart;

registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
