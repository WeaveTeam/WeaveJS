import c3 from "c3";
import d3 from "d3";
import WeavePanel from "./WeavePanel.js";
import lodash from "lodash";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";

export default class WeaveC3PieChart extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this._toolPath = toolPath;
        this._plotterPath = this.toolPath.pushPlotter("plot");

        this._dataPath = this._plotterPath.push("data");
        this._labelPath = this._plotterPath.push("label");

        this._lineStylePath = this._plotterPath.push("line");
        this._fillStylePath = this._plotterPath.push("fill");

        this.config = {
            size: {
                width: jquery(this.element).width(),
                height: jquery(this.element).height()
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
                        this._toolPath.selection_keyset.addKeys([this.indexToKey[d.index]]);
                    }
                },
                onunselected: (d) => {
                    if(d && d.hasOwnProperty("data")) {
                        // d has a different structure than "onselected" argument
                        this._toolPath.selection_keyset.setKeys([]);
                    }
                },
                onmouseover: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this._toolPath.probe_keyset.setKeys([this.indexToKey[d.index]]);
                    }
                },
                onmouseout: (d) => {
                    if(d && d.hasOwnProperty("index")) {
                        this._toolPath.probe_keyset.setKeys([]);
                    }
                }
            },
            pie: {
                label: {
                    show: true,
                    format: (value, ratio, id) => {
                        if(this.records) {
                            var record = this.records[this.keyToIndex[id]];
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
                        if(this.records) {
                            var record = this.records[this.keyToIndex[id]];
                            if(record && record.label) {
                                return record.label;
                            }
                            return value;
                        }
                    }
                }
            },
            bindto: this.element[0],
            legend: {
                show: false
            },
            onrendered: this._updateStyle.bind(this)
        };
        this.chart = c3.generate(this.config);
        this._setupCallbacks();
    }

    _setupCallbacks() {
        var dataChanged = lodash.debounce(this._dataChanged.bind(this), 100);
        [
            this._dataPath,
            this._labelPath,
            this._lineStylePath,
            this._fillStylePath
        ].forEach((path) => {
            path.addCallback(dataChanged, true, false);
        });

        var selectionChanged = this._selectionKeysChanged.bind(this);
        this._toolPath.selection_keyset.addCallback(selectionChanged, true, false);

        this._toolPath.probe_keyset.addCallback(this._probedKeysChanged.bind(this), true, false);

        this._plotterPath.push("innerRadius").addCallback(dataChanged, true, false);
    }

    _updateContents() {
        this.chart.resize({height: jquery(this.element).height(),
                      width: jquery(this.element).width()});
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
        var keys = this._toolPath.probe_keyset.getKeys();
        var indices = keys.map( (key) => {
            return Number(this.keyToIndex[key]);
        });
        this.chart.select("y", indices, true);
    }

    _updateStyle() {
        d3.selectAll(this.element).selectAll("circle").style("opacity", 1)
                                                      .style("stroke", "black")
                                                      .style("stroke-opacity", 0.5);
    }

    _dataChanged() {
        let mapping = {
            data: this._dataPath,
            fill: {
                alpha: this._fillStylePath.push("alpha"),
                color: this._fillStylePath.push("color"),
                caps: this._fillStylePath.push("caps")
            },
            line: {
                alpha: this._lineStylePath.push("alpha"),
                color: this._lineStylePath.push("color"),
                caps: this._lineStylePath.push("caps")
            },
            label: this._labelPath
        };

        this.records = this._plotterPath.retrieveRecords(mapping, opener.weave.path("defaultSubsetKeyFilter"));

        this.keyToIndex = {};
        this.indexToKey = {};

        this.records.forEach( (record, index) => {
            this.indexToKey[index] = record.id;
            this.keyToIndex[record.id] = index;
        });
        //this.records = lodash.sortBy(this.records, "id");
        var columns = [];

        columns = this.records.map(function(record) {
            var tempArr = [];
            tempArr.push(record.id);
            tempArr.push(record.data);
            return tempArr;
        });

        var chartType = "pie";
        if(this._plotterPath.push("innerRadius").getState() > 0) {
            chartType = "donut";
        }

        this.colors = {};
        this.records.forEach((record) => {
            this.colors[record.id] = record.fill.color || "#C0CDD1";
        });

        this.chart.load({columns: columns, type: chartType, colors: this.colors, unload: true});
    }
}

WeavePanelManager.registerToolImplementation("weave.visualization.tools::PieChartTool", WeaveC3PieChart);
