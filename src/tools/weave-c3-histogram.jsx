import AbstractWeaveTool from "./AbstractWeaveTool.jsx";
import c3 from "c3";
import _ from "lodash";
import {registerToolImplementation} from "../WeaveTool.jsx";
import FormatUtils from "../Utils/FormatUtils";
import StandardLib from "../Utils/StandardLib";
import React from "react";

class WeaveC3Histogram extends AbstractWeaveTool {
    constructor(props) {
        super(props);
        this.busy = false;

        this.c3Config = {
            //size: this.getElementSize(),
            padding: {
              top: 20,
              bottom: 20,
              right: 30
            },
            data: {
                columns: [],
                selection: {
                   enabled: true,
                   multiple: true,
                   draggable: true
               },
               type: "bar",
               color: (color, d) => {
                    if(d && d.hasOwnProperty("index")) {
                        var decColor = this.paths.fillStyle.push("color").push("internalDynamicColumn", null).getValue("this.getColorFromDataValue.bind(this)")(d.index).toString(16);
                        return "#" + StandardLib.decimalToHex(decColor);
                    }
                    return "#C0CDD1";
               },
               onselected: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        var selectedIds = this.paths.binnedColumn.getValue("this.getKeysFromBinIndex.bind(this)")(d.index).map( (qKey) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.addKeys(selectedIds);
                    }
                },
                onunselected: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        var unSelectedIds = this.paths.binnedColumn.getValue("this.getKeysFromBinIndex.bind(this)")(d.index).map( (qKey) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.selection_keyset.removeKeys(unSelectedIds);
                    }
                },
                onmouseover: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        var selectedIds = this.paths.binnedColumn.getValue("this.getKeysFromBinIndex.bind(this)")(d.index).map( (qKey) => {
                            return this.toolPath.qkeyToString(qKey);
                        });
                        this.toolPath.probe_keyset.setKeys(selectedIds);
                    }
                },
                onmouseout: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.probe_keyset.setKeys([]);
                    }
                }
            },
            bindto: this.element,
            legend: {
                show: false
            },
            axis: {
                x: {
                    type: "category",
                    label: {
                        position: "outer-center"
                    },
                    tick: {
                        multiline: false,
                        format: (num) => {
                            return this.paths.binnedColumn.getValue("this.deriveStringFromNumber.bind(this)")(num);
                        }
                    }
                },
                y: {
                    label: {
                        position: "outer-middle"
                    },
                    tick: {
                        fit: false,
                        format: FormatUtils.defaultNumberFormatting
                    }
                },
                rotated: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            bar: {
                width: {
                    ratio: 0.95
                }
            },
            onrendered: this._updateStyle.bind(this)
        };
    }

    _selectionKeysChanged() {
        // var keys = this.toolPath.selection_keyset.getKeys();
        // var selectedBins = {};

        // if(this.idToRecord) {
        //     keys.forEach((key) => {
        //         var bin = this.idToRecord[key].binnedColumn;
        //         selectedBins[bin] = true;
        //     });
        // }

        // this.chart.select("height", _.keys(selectedBins).map(Number), true);
    }
    _probedKeysChanged() {

    }

    rotateAxes() {
      //this.c3Config.axis.rotated = true;
      //this.forceUpdate();
    }

    _axisChanged () {
      if(!this.chart)
        return;

      if(this.busy)
        return;

      this.chart.axis.labels({
          x: this.paths.xAxis.push("overrideAxisName").getState() || this.paths.binnedColumn.getValue("this.getMetadata('title')"),
          y: function() {
              var overrideAxisName = this.paths.yAxis.push("overrideAxisName").getState();
              if(overrideAxisName) {
                  return overrideAxisName;
              } else {
                  if(this.paths.columnToAggregate.getState().length) {
                      switch(this.paths.aggregationMethod.getState()) {
                          case "count":
                              return "Number of records";
                          case "sum":
                              return "Sum of " + this.paths.columnToAggregate.getValue("this.getMetadata('title')");
                          case "mean":
                              return "Mean of " + this.paths.columnToAggregate.getValue("this.getMetadata('title')");
                      }
                  } else {
                      return "Number of records";
                  }
              }
          }.bind(this)()
      });
    }

    _updateStyle() {

    }

    _dataChanged() {

        if(!this.chart)
          return;
        if(this.busy) {
            return;
        }

        let numericMapping = {
          binnedColumn: this.paths.binnedColumn,
          columnToAggregate: this.paths.columnToAggregate
        };

        let stringMapping = {
          binnedColumn: this.paths.binnedColumn
        };

        this.binnedColumnDataType = this.paths.binnedColumn.getValue("this.getMetadata('dataType')");

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.idToRecord = {};
        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record, index) => {
            this.idToRecord[record.id] = record;
            this.keyToIndex[record.id] = index;
            this.indexToKey[index] = record.id;
        });

        this.numberOfBins = this.paths.binnedColumn.getValue("this.numberOfBins");

        this.histData = [];

        // this._columnToAggregatePath.getValue("this.getInternalColumn()");
        var columnToAggregateNameIsDefined = this.paths.columnToAggregate.getState().length > 0;

        for(let iBin = 0; iBin < this.numberOfBins; iBin++) {

            let recordsInBin = _.filter(this.numericRecords, { binnedColumn: iBin });

            if(recordsInBin) {
               var obj = {};
               if(columnToAggregateNameIsDefined) {
                    obj.height = this.getAggregateValue(recordsInBin, "columnToAggregate", this.paths.aggregationMethod.getState());
                    this.histData.push(obj);
                } else {
                    obj.height = this.getAggregateValue(recordsInBin, "binnedColumn", "count");
                    this.histData.push(obj);
                }
            }
        }

        var keys = { value: ["height"] };
        this._axisChanged();
        this.busy = true;
        this.chart.load({json: this.histData, keys, unload: true, done: () => { this.busy = false; }});
    }

    getAggregateValue(records, columnToAggregateName, aggregationMethod) {

        var count = 0;
        var sum = 0;

        if(!Array.isArray(records)) {
            return 0;
        }

        records.forEach((record) => {
            count++;
            sum += record[columnToAggregateName];
        });

        if (aggregationMethod === "mean") {
            return sum / count; // convert sum to mean
        }

        if (aggregationMethod === "count") {

            return count; // use count of finite values
        }

        // sum
        return sum;
    }

    componentDidUpdate() {
      super.componentDidUpdate();
      //console.log("component did update");
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

        var axisChanged = _.debounce(this._axisChanged.bind(this), 100);
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = _.debounce(this._probedKeysChanged.bind(this), 100);
        var plotterPath = this.toolPath.pushPlotter("plot");
        var mapping = [
          { name: "plotter", path: plotterPath, callbacks: null},
          { name: "binnedColumn", path: plotterPath.push("binnedColumn"), callbacks: [dataChanged, axisChanged] },
          { name: "columnToAggregate", path: plotterPath.push("columnToAggregate"), callbacks: dataChanged },
          { name: "aggregationMethod", path: plotterPath.push("aggregationMethod"), callbacks: [dataChanged, axisChanged] },
          { name: "fillStyle", path: plotterPath.push("fillStyle"), callbacks: dataChanged },
          { name: "lineStyle", path: plotterPath.push("lineStyle"), callbacks: dataChanged },
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

export default WeaveC3Histogram;

registerToolImplementation("weave.visualization.tools::HistogramTool", WeaveC3Histogram);
