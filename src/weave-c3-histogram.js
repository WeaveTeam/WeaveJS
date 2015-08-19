import c3 from "c3";
import d3 from "d3";
import WeavePanel from "./WeavePanel.js";
import lodash from "lodash";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";

export default class WeaveC3Histogram extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this._plotterPath = this.toolPath.pushPlotter("plot");

        this._binnedColumnPath = this._plotterPath.push("binnedColumn");

        this._columnPath = this._binnedColumnPath.push("internalDynamicColumn"); //.push(null).push("internalDynamicColumn").push(null);

        this._lineStylePath = this._plotterPath.push("lineStyle");
        this._fillStylePath = this._plotterPath.push("fillStyle");

        this._columnToAggregatePath = this._plotterPath.push("columnToAggregate");

        this._aggregationMethodPath = this._plotterPath.push("aggregationMethod");

        this._xAxisPath = toolPath.pushPlotter("xAxis");
        this._yAxisPath = toolPath.pushPlotter("yAxis");

        this.chart = c3.generate({
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
               type: "bar",
               color: (color, d) => {
                    if(d && d.hasOwnProperty("index") && this.bins) {
                        return this.bins[d.index].color;
                    }
                    return "#C0CDD1";
               }
            },
            bindto: this.element[0],
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
                        format: (d) => {
                            return this._binnedColumnPath.getValue("deriveStringFromNumber")(d);
                        }
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
        });

        this._setupCallbacks();
    }

    _setupCallbacks() {
        var dataChanged = lodash.debounce(this._dataChanged.bind(this), 100);
        [
            this._binnedColumnPath,
            this._lineStylePath,
            this._fillStylePath,
            this._columnToAggregatePath,
            this._aggregationMethodPath
        ].forEach((path) => {
            path.addCallback(dataChanged, true, false);
        });

        var selectionChanged = this._selectionKeysChanged.bind(this);
        this.toolPath.selection_keyset.addCallback(selectionChanged, true, false);

        var axisChanged = lodash.debounce(this._axisChanged.bind(this), 100);
        [
            this._xAxisPath,
            this._yAxisPath,
            this._binnedColumnPath,
            this._aggregationMethodPath
        ].forEach((path) => {
            path.addCallback(axisChanged, true, false);
        });
    }

    _updateContents() {
        this.chart.resize({height: jquery(this.element).height(),
                   width: jquery(this.element).width()});
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();

        var selectedBins = {};

        keys.forEach((key) => {
            this.binsToId.forEach((ids, bin) => {
                if(lodash.contains(ids, key)) {
                    selectedBins[bin] = true;
                }
            });
        });
        this.chart.select("height", lodash.keys(selectedBins).map(Number), true);
    }

      _axisChanged () {
        // this.chart.axis.labels({
        //     x: this._xAxisPath.push("overrideAxisName").getState() || this._binnedColumnPath.getValue("ColumnUtils.getTitle(this)"),
        //     y: function() {
        //         var overrideAxisName = this._yAxisPath.push("overrideAxisName").getState();
        //         if(overrideAxisName) {
        //             return overrideAxisName;
        //         } else {
        //             if(this._columnToAggregatePath.getState().length) {
        //                 switch(this._aggregationMethodPath.getState()) {
        //                     case "count":
        //                         return "Number of records";
        //                     case "sum":
        //                         return "Sum of " + this._columnToAggregatePath.getValue("ColumnUtils.getTitle(this)");
        //                     case "mean":
        //                         return "Mean of " + this._columnToAggregatePath.getValue("ColumnUtils.getTitle(this)");
        //                 }
        //             } else {
        //                 return "Number of records";
        //             }
        //         }
        //     }.bind(this)()
        // });
    }

    _updateStyle() {

    }

    _dataChanged() {
        let mapping = {
            binnedColumn: this._binnedColumnPath,
            column: this._columnPath,
            columnToAggregate: this._columnToAggregatePath,
            fill: {
                alpha: this._fillStylePath.push("alpha"),
                color: this._fillStylePath.push("color"),
                caps: this._fillStylePath.push("caps")
            },
            line: {
                alpha: this._lineStylePath.push("alpha"),
                color: this._lineStylePath.push("color"),
                caps: this._lineStylePath.push("caps")
            }
        };

        // binnedColumn's internalDynamicColumn has a dynamicKeyFilter
        // plot has filtered keySet
        this.records = this._plotterPath.retrieveRecords(mapping, opener.weave.path("defaultSubsetKeyFilter"));

        this.numberOfBins = this._binnedColumnPath.getValue("numberOfBins");

        this.histData = [];

        // this._columnToAggregatePath.getValue("getInternatlColumn()");
        for(let iBin = 0; iBin < this.numberOfBins; iBin++) {

            let recordsInBin = lodash.filter(this.records, { binnedColumn: iBin });

            if(recordsInBin) {
               var obj = {};
               if(this._columnToAggregatePath.getState().length) {
                    obj.height = this.getAggregateValue(recordsInBin, "columnToAggregate", this._aggregationMethodPath.getState());
                    this.histData.push(obj);
                } else {
                    obj.height = this.getAggregateValue(recordsInBin, "column", "count");
                    this.histData.push(obj);
                }
            }
        }

        var keys = { value: ["height"] };
        this.chart.load({json: this.histData, keys, unload: true});
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

    destroy() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
        super();
    }
}

WeavePanelManager.registerToolImplementation("weave.visualization.tools::HistogramTool", WeaveC3Histogram);
