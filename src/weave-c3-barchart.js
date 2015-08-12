import c3 from "c3";
import WeavePanel from "./WeavePanel";
import * as WeavePanelManager from "./WeavePanelManager.js";
import jquery from "jquery";
import lodash from "lodash";
import StandardLib from "./Utils/StandardLib";

export default class WeaveC3Barchart extends WeavePanel {
    constructor(parent, toolPath) {
        super(parent, toolPath);

        this._plotterPath = this.toolPath.pushPlotter("plot");
        this._heightColumnsPath = this._plotterPath.push("heightColumns");
        this._labelColumnPath = this._plotterPath.push("labelColumn");
        this._sortColumnPath = this._plotterPath.push("sortColumn");
        this._colorColumnPath = this._plotterPath.push("colorColumn");
        this._chartColorsPath = this._plotterPath.push("chartColors");

        this._xAxisPath = toolPath.pushPlotter("xAxis");
        this._yAxisPath = toolPath.pushPlotter("yAxis");

        this.colorRamp = this._chartColorsPath.getState();
        this.chart = null;
        this.chart = c3.generate({
            size: {
                width: jquery(this.element).width(),
                height: jquery(this.element).height()
            },
            data: {
                json: [],
                type: "bar",
                xSort: false,
                selection: {
                   enabled: true,
                   multiple: true
               },
               order: null,
               color: (color, d) => {
                    if(this.heightColumnNames.length === 1 && d.hasOwnProperty("index")) {
                        return this.records[d.index].color;
                    } else {
                        return color;
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
            bindto: this.element[0],
            bar: {
                width: {
                    ratio: 0.9
                }
            },
            legend: {
                show: false
            }
        });

        this._setupCallbacks();
    }

    _setupCallbacks() {
        var dataChanged = lodash.debounce(this._dataChanged.bind(this), 100);

        [this._heightColumnsPath,
         this._labelColumnPath,
         this._sortColumnPath,
         this._colorColumnPath,
         this._chartColorsPath].forEach((path) => {
            path.addCallback(dataChanged, true, false);
        });

        // var chartColorsChanged = lodash.debounce(this._chartColorsChanged.bind(this), 100);
        // this._chartColorsPath.addCallback(chartColorsChanged, true, false);

        var selectionChanged = this._selectionKeysChanged.bind(this);
        this.toolPath.selection_keyset.addCallback(selectionChanged, true, false);

        var axisChanged = lodash.debounce(this._axisChanged.bind(this), 100);
        [this._heightColumnsPath,
         this._labelColumnPath,
         this._sortColumnPath,
         this._xAxisPath,
         this._yAxisPath].forEach((path) => {
            path.addCallback(axisChanged, true, false);
        });

        var groupingModeChanged = lodash.debounce(this._groupingModeChanged.bind(this), 100);
        this._plotterPath.addCallback(groupingModeChanged, true, false);
    }

    _teardownCallbacks() {
        this.toolPath.selection_keyset.removeCallback(this._boundSelectionChanged);
    }

    _groupingModeChanged() {
        var groupingMode = this._plotterPath.push("groupingMode").getState();
        // var horizontalMode = this._plotterPath.push("horizontalMode").getState();

        // set axis rotation mode
        //this.chart.load({axes: { rotated: horizontalMode }});

        if(groupingMode === "stack") {
            this.chart.groups([this.heightColumnNames]);
        } else if(groupingMode === "group") {
            this.chart.groups([]);
        } else if(groupingMode === "percentStack") {
            this.chart.groups([this.heightColumnNames]);
        }
    }
    _updateContents() {
        this.chart.resize({height: jquery(this.element).height(),
                      width: jquery(this.element).width()});
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        // var indices = this.indexCache.pick(keys).values();
        var indices = keys.map((key) => {
            return Number(this.keyToIndex[key]);
        });
        this.chart.select(this.heightColumnNames, indices, true);
    }

    _axisChanged () {
        //console.log("axisChanged");
        // this.chart.axis.max({
        //     x: this._xAxisPath.push("axisLineMaxValue").getState(),
        //     y: this._yAxisPath.push("axisLineMaxValue").getState()
        // });

        // this.chart.axis.min({
        //     x: this._xAxisPath.push("axisLineMinValue").getState(),
        //     y: this._yAxisPath.push("axisLineMinValue").getState()
        // });

        this.chart.axis.labels({
            x: "Sorted by " + this._sortColumnPath.getValue("ColumnUtils.getTitle(this)"),
            y: this._yAxisPath.push("overrideAxisName").getState() || this.heightColumnsLabels.join(", ")
        });
    }

    _dataChanged() {
        this.heightColumnNames = [];
        this.heightColumnsLabels = [];

        var heightColumns = this._heightColumnsPath.getChildren();

        var mapping =
        {
            label: this._labelColumnPath,
            sort: this._sortColumnPath,
            color: this._colorColumnPath
        };

        for (let idx in heightColumns)
        {
            let column = heightColumns[idx];
            let title = column.getValue("getMetadata('title')");
            let name = column.getPath().pop();

            mapping[name] = column;
            this.heightColumnsLabels.push(title);
            this.heightColumnNames.push(name);
        }

        this.records = this.toolPath.pushPlotter("plot").retrieveRecords(mapping, opener.weave.path("defaultSubsetKeyFilter"));
        this.records = lodash.sortBy(this.records, "sort");

        this.keyToIndex = {};
        this.records.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
        });

        var keys = {};
        // if label column is specified
        if(this._labelColumnPath.getState().length) {
            keys.x = "label";
        }

        keys.value = this.heightColumnNames;

        var colors = {};

        if(this.heightColumnNames.length > 1) {
            this.colorRamp = this._chartColorsPath.getState();
            this.heightColumnNames.map((name, index) => {
                var color = StandardLib.interpolateColor(index / (this.heightColumnNames.length - 1), this.colorRamp);
                colors[name] = "#" + color.toString(16);
            });
        } else {
            colors = {};
        }

        var groups = [];
        var groupingMode = this._plotterPath.push("groupingMode").getState();
        // var horizontalMode = this._plotterPath.push("horizontalMode").getState();

        // set axis rotation mode
        //this.chart.load({axes: { rotated: horizontalMode }});

        if(groupingMode === "stack") {
            groups = [this.heightColumnNames];
        } else if(groupingMode === "group") {
            groups = [];
        } else if(groupingMode === "percentStack") {
            groups = [this.heightColumnNames];
        }

        this.chart.load({json: this.records, colors, keys, unload: true, order: null, selection: {enabled: true, multiple: true, done: function() {
            this._groupingModeChanged();
        }}});

    }

    _updateStyle() {}


    _update() {
        this.chart = c3.generate(this._c3Options);
        this._updateStyle();
    }

    destroy() {
        /* Cleanup callbacks */
        this.teardownCallbacks();
        this.chart.destroy();
        super();
    }
}

WeavePanelManager.registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
