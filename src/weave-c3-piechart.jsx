import AbstractWeaveTool from "./AbstractWeaveTool.js";
import c3 from "c3";
import d3 from "d3";
import _ from "lodash";
import {registerToolImplementation} from "./WeaveTool.jsx";
import React from "react";

class WeaveC3PieChart extends AbstractWeaveTool {
    constructor(props) {
        super(props);
    }

    _selectionKeysChanged() {
      if(!this.chart)
        return;

      var keys = this.toolPath.selection_keyset.getKeys();
      if(keys.length) {
          this.chart.focus(keys);
      } else {
          this.chart.focus();
      }
    }

    _probedKeysChanged() {
      var keys = this.toolPath.probe_keyset.getKeys();

      if(keys.length) {
          this.chart.focus(keys);
      } else {
          this._selectionKeysChanged();
      }
    }

    _updateStyle() {
        d3.selectAll(this.element).selectAll("circle").style("opacity", 1)
                                                      .style("stroke", "black")
                                                      .style("stroke-opacity", 0.5);
    }

    _dataChanged() {
        console.log("data changed called");
        if(!this.chart)
          return;

        let numericMapping = {
            data: this.paths.data
        };

        let stringMapping = {
            fill: {
                //alpha: this._fillStylePath.push("alpha"),
                color: this.paths.fillStyle.push("color")
                //caps: this._fillStylePath.push("caps")
            },
            line: {
                //alpha: this._lineStylePath.push("alpha"),
                //color: this._lineStylePath.push("color")
                //caps: this._lineStylePath.push("caps")
            },
            label: this.paths.label
        };

        this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, {keySet: this.paths.filteredKeySet, dataType: "number"});
        this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, {keySet: this.paths.filteredKeySet, dataType: "string"});

        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach( (record, index) => {
            this.indexToKey[index] = record.id;
            this.keyToIndex[record.id] = index;
        });

        //this.records = _.sortBy(this.records, "id");
        var columns = [];

        columns = this.numericRecords.map(function(record) {
            var tempArr = [];
            tempArr.push(record.id);
            tempArr.push(record.data);
            return tempArr;
        });

        var chartType = "pie";
        if(this.paths.plotter.getState("innerRadius") > 0) {
            chartType = "donut";
        }

        this.colors = {};
        this.stringRecords.forEach((record) => {
            this.colors[record.id] = record.fill.color || "#C0CDD1";
        });

        this.chart.load({columns: columns, type: chartType, colors: this.colors, unload: true});
    }

    componentDidUpdate() {
      super.componentDidUpdate();
      //console.log("resizing");
      var start = Date.now();
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
        var dataChanged = _.debounce(this._dataChanged.bind(this), 100);
        var selectionKeySetChanged = this._selectionKeysChanged.bind(this);
        var probeKeySetChanged = _.debounce(this._probedKeysChanged.bind(this), 100);
        var plotterPath = this.toolPath.pushPlotter("plot");
        var manifest = [
          { name: "plotter", path: plotterPath, callbacks: null},
          { name: "data", path: plotterPath.push("data"), callbacks: dataChanged },
          { name: "label", path: plotterPath.push("label"), callbacks: dataChanged },
          { name: "fillStyle", path: plotterPath.push("fill"), callbacks: dataChanged },
          { name: "lineStyle", path: plotterPath.push("line"), callbacks: dataChanged },
          { name: "innerRadius", path: plotterPath.push("innerRadius"), callback: dataChanged },
          { name: "filteredKeySet", path: plotterPath.push("filteredKeySet")},
          { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged},
          { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged}
        ];

        this.initializePaths(manifest);

        this.c3Config = {
            //size: this.getElementSize(),
            bindto: this.element,
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
               type: "pie",
                onselected: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this.toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                    }
                },
                onunselected: (d) => {
                    if(d && d.hasOwnProperty("data")) {
                        // d has a different structure than "onselected" argument
                        this.toolPath.selection_keyset.setKeys([]);
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
            pie: {
                label: {
                    show: true,
                    format: (value, ratio, id) => {
                        if(this.stringRecords && this.stringRecords.length) {
                            var record = this.stringRecords[this.keyToIndex[id]];
                            if(record && record.label) {
                                return record.label;
                            }
                            return value;
                        }
                    }
                }
            },
            donut: {
                label: {
                    show: true,
                    format: (value, ratio, id) => {
                        if(this.stringRecords && this.stringRecords.length) {
                            var record = this.stringRecords[this.keyToIndex[id]];
                            if(record && record.label) {
                                return record.label;
                            }
                            return value;
                        }
                    }
                }
            },
            legend: {
                show: false
            },
            onrendered: this._updateStyle.bind(this)
        };
        this.chart = c3.generate(this.c3Config);
    }
}

export default WeaveC3PieChart;

registerToolImplementation("weave.visualization.tools::PieChartTool", WeaveC3PieChart);
