import c3 from "c3";
import WeavePanel from "./WeavePanel";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";
import lodash from "lodash";
import d3 from "d3";
import StandardLib from "./Utils/StandardLib";


/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */
function _normalizeRecords (records, attributes) {

    // to avoid computing the stats at each iteration.
    var columnStatsCache = {};
    attributes.forEach(function(attr) {
        columnStatsCache[attr] = {
            min: lodash.min(lodash.pluck(records, attr)),
            max: lodash.max(lodash.pluck(records, attr))
        };
    });

    return records.map(function(record) {

        var obj = {};

        attributes.forEach(function(attr) {
          var min = columnStatsCache[attr].min;
          var max = columnStatsCache[attr].max;
          if(record[attr]) {
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

export default class WeaveC3ScatterPlot extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);
        this.lookup = {};
        this._visualizationPath = toolPath.push("children", "visualization");
        this._plotterPath = toolPath.pushPlotter("plot");

        this._dataXPath = this._plotterPath.push("dataX");
        this._dataYPath = this._plotterPath.push("dataY");
        this._xAxisPath = toolPath.pushPlotter("xAxis");
        this._yAxisPath = toolPath.pushPlotter("yAxis");

        this._fillStylePath = this._plotterPath.push("fill");
        this._lineStylePath = this._plotterPath.push("line");
        this._sizeByPath = this._plotterPath.push("sizeBy");

        this.lookup.chartToOriginal = {};
        this.lookup.originalToChart = {};

        this.plotterState = {};

        this._plotterPath.addCallback(() => {
            this.plotterState = this._plotterPath.getState();
        }, true);

        this._c3Options = {
            data: {
                rows: [],
                x: "x",
                xSort: false,
                type: "scatter",//,
                selection: {enabled: true, multiple: true},
                color: (color, d) => {
                    if(this.records && d.hasOwnProperty("index")) {
                        var record = this.records[d.index];
                        return (record && record.fill) ? record.fill.color : 0;
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
                        fit: false
                        // format: function(num) {
                        //     return num.toFixed(2);
                        // }
                    }
                },
                y: {
                    label: {
                        position: "outer-middle"
                    },
                    tick: {
                        fit: false
                        // format: function(num) {
                        //     return num.toFixed(2);
                        // }
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
                    if(this.plotterState && this.plotterState.sizeBy.length) {
                        let minScreenRadius = this.plotterState.minScreenRadius;
                        let maxScreenRadius = this.plotterState.maxScreenRadius;

                        var normalizedRecord = this.normalizedRecords[d.index];
                        return (normalizedRecord && normalizedRecord.size ?
                                minScreenRadius + normalizedRecord.size * (maxScreenRadius - minScreenRadius) :
                                this.plotterState.defaultScreenRadius) || 1;
                    }
                    else {
                        return (this.plotterState.defaultScreenRadius) || 1;
                    }
                }
                // focus: {
                //     expand: {
                //         r: point.r * 1.5
                //     }
                // },
                // point: {
                //     select: {
                //         r: point.r * 1.5
                //     }
                // }
            },
            onrendered: this._updateStyle.bind(this)
        };

        var dataChanged = lodash.debounce(this._dataChanged.bind(this), 100);
        [this._dataXPath, this._dataYPath, this._sizeByPath, this._fillStylePath, this._lineStylePath].forEach( (path) => {
            path.addCallback(dataChanged, true, false);
        });

        var axisChanged = lodash.debounce(this._axisChanged.bind(this), 100);
        [this._dataXPath, this._dataYPath, this._xAxisPath, this._yAxisPath].forEach((path) => {
            path.addCallback(axisChanged, true, false);
        });

        toolPath.selection_keyset.addCallback(this._selectionKeysChanged.bind(this), true, false);

        this._c3Options.bindto = this.element[0];

        this.chart = c3.generate(this._c3Options);
    }

    _updateContents () {
        this._sizeChanged();
    }

    _axisChanged () {
        this.chart.axis.max({
            x: this._xAxisPath.push("axisLineMaxValue").getState(),
            y: this._yAxisPath.push("axisLineMaxValue").getState()
        });

        this.chart.axis.min({
            x: this._xAxisPath.push("axisLineMinValue").getState(),
            y: this._yAxisPath.push("axisLineMinValue").getState()
        });

        this.chart.axis.labels({
            x: this._xAxisPath.push("overrideAxisName").getState() || this._dataXPath.getValue("ColumnUtils.getTitle(this)"),
            y: this._yAxisPath.push("overrideAxisName").getState() || this._dataYPath.getValue("ColumnUtils.getTitle(this)")
        });
    }

    _dataChanged() {
        let mapping = { point: {
                            x: this._dataXPath,
                            y: this._dataYPath
                        },
                        size: this._sizeByPath,
                        fill: {
                            alpha: this._fillStylePath.push("alpha"),
                            color: this._fillStylePath.push("color")
                        },
                        line: {
                            alpha: this._lineStylePath.push("alpha"),
                            color: this._lineStylePath.push("color"),
                            caps: this._lineStylePath.push("caps")
                        }
                    };

        this.records = lodash.sortByOrder(this._plotterPath.retrieveRecords(mapping, opener.weave.path("defaultSubsetKeyFilter")), ["size", "id"], ["desc", "asc"]);

        this.keyToIndex = {};

        this.records.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
        });

        this.normalizedRecords = _normalizeRecords(this.records, ["size"]);
        this.chart.load({data: lodash.pluck(this.records, "point")});
    }

    _sizeChanged() {
        var size = {
                height: jquery(this.element).height(),
                width: jquery(this.element).width()
        };
        if(this.chart) {
            this.chart.resize(size);
        }
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        var indices = keys.map((key) => {
            return Number(this.keyToIndex[key]);
        });
        this.chart.select("y", indices, true);
    }

    _updateStyle() {
        d3.selectAll(this.element).selectAll("circle").style("opacity", 1)
                                                      .style("stroke", "black")
                                                      .style("stroke-opacity", 0.5);
    }

    destroy() {
        this.chart.destroy();
        super();
    }
}

WeavePanelManager.registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
