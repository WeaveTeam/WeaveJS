import c3 from "c3";
import d3 from "d3";
import WeavePanel from "./WeavePanel.js";
import lodash from "lodash";
import StandardLib from "./Utils/StandardLib";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";

export default class WeaveC3LineChart extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this._plotterPath = this.toolPath.pushPlotter("plot");
        this._columnsPath = this._plotterPath.push("columns");
        this._lineStylePath = this._plotterPath.push("lineStyle");

        this._xAxisPath = toolPath.pushPlotter("xAxis");
        this._yAxisPath = toolPath.pushPlotter("yAxis");

        this.chart = c3.generate({
            size: {
                width: jquery(this.element).width(),
                height: jquery(this.element).height()
            },
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
                        format: (d) => {
                            return this.columnLabels[d];
                        }
                    }
                }
            },
            bindto: this.element[0],
            legend: {
                show: false
            },
            onrendered: this._updateStyle.bind(this)
        });

        this._setupCallbacks();
    }

    _setupCallbacks() {
        var dataChanged = lodash.debounce(this._dataChanged.bind(this), 100);
        [
            this._columnsPath,
            this._lineStylePath
        ].forEach((path) => {
            path.addCallback(dataChanged, true, false);
        });

        var selectionChanged = this._selectionKeysChanged.bind(this);
        this.toolPath.selection_keyset.addCallback(selectionChanged, true, false);
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

    _updateStyle() {
        d3.selectAll(this.element).selectAll("circle").style("opacity", 1)
                                                      .style("stroke", "black")
                                                      .style("stroke-opacity", 0.5);
    }

    _dataChanged() {
        this.columnLabels = [];
        this.columnNames = [];

        var children = this._columnsPath.getChildren();
        let mapping = {
            columns: children,
            line: {
                alpha: this._lineStylePath.push("alpha"),
                color: this._lineStylePath.push("color"),
                caps: this._lineStylePath.push("caps")
            }
        };

        for (let idx in children) {
            let child = children[idx];
            let title = child.getValue("getMetadata('title')");
            let name = child.getPath().pop();
            this.columnLabels.push(title);
            this.columnNames.push(name);
        }

        this.records = this._plotterPath.retrieveRecords(mapping, opener.weave.path("defaultSubsetKeyFilter"));
        this.records = lodash.sortBy(this.records, "id");
        var columns = [];

        columns = this.records.map(function(record) {
            var tempArr = [];
            tempArr.push(record.id);
            lodash.keys(record.columns).forEach((key) => {
                tempArr.push(record.columns[key]);
            });
            return tempArr;
        });

        this.colors = {};
        this.records.forEach((record) => {
            this.colors[record.id] = 0 || record.line.color;
        });

        this.chart.load({columns: columns, colors: this.colors, unload: true});
    }
}

WeavePanelManager.registerToolImplementation("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
