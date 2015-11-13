import AbstractWeaveTool from "./AbstractWeaveTool.js";
import d3 from "d3";
import c3 from "c3";
import {registerToolImplementation} from "./WeaveTool.jsx";
import lodash from "lodash";
import StandardLib from "./Utils/StandardLib";
import FormatUtils from "./Utils/FormatUtils";

class WeaveC3Barchart extends AbstractWeaveTool {
    constructor(props) {
        super(props);
        this._plotterPath = this.toolPath.pushPlotter("plot");
        this._heightColumnsPath = this._plotterPath.push("heightColumns");
        this._labelColumnPath = this._plotterPath.push("labelColumn");
        this._sortColumnPath = this._plotterPath.push("sortColumn");
        this._colorColumnPath = this._plotterPath.push("colorColumn");
        this._chartColorsPath = this._plotterPath.push("chartColors");

        this._xAxisPath = this.toolPath.pushPlotter("xAxis");
        this._yAxisPath = this.toolPath.pushPlotter("yAxis");

        this.groupingMode = this._plotterPath.push("groupingMode").getState();

        this.colorRamp = this._chartColorsPath.getState();
        this.chart = null;

        this.busy = false;

        this.keyToIndex = {};

        this.chart = c3.generate({
            size: this._getElementSize(),
            data: {
                json: [],
                type: "bar",
                xSort: false,
                selection: {
                   enabled: true,
                   multiple: true,
                   draggable: true

               },
               order: null,
               color: (color, d) => {
                    if(this.heightColumnNames.length === 1 && d.hasOwnProperty("index")) {

                        // find the corresponding index of numericRecords in stringRecords
                        var id = this.indexToKey[d.index];
                        var index = lodash.pluck(this.stringRecords, "id").indexOf(id);

                        return this.stringRecords[index].color || "#C0CDD1";
                    } else {
                        return color || "#C0CDD1";
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
                        rotate: 0,
                        format: (num) => {
                            if(this.stringRecords && this.stringRecords.length) {
                               // find the corresponding index of numericRecords in stringRecords
                               var id = this.indexToKey[num];
                               var index = lodash.pluck(this.stringRecord, "id").indexOf(id);

                               var record = this.stringRecords[index];
                               if(record && record.xLabel) {
                                    return record.xLabel;
                               }
                            } else {
                                return FormatUtils.defaultNumberFormatting(num);
                            }
                        }
                    }
                },
                y: {
                    label: {
                        position: "outer-middle"
                    },
                    tick: (num) => {
                        if(this.groupingMode === "percentStack") {
                            return d3.format(".0%")(num);
                        } else {
                            return FormatUtils.defaultNumberFormatting(num);
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
            bindto: this.element,
            bar: {
                width: {
                    ratio: 0.8
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
         this._chartColorsPath,
         this._plotterPath.push("groupingMode")].forEach((path) => {
            path.addCallback(dataChanged, true, false);
        });

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

        var plotterChanged = lodash.debounce(this._plotterChanged.bind(this), 100);
        this._plotterPath.addCallback(plotterChanged, true, false);
    }

    // _teardownCallbacks() {
    //     this.toolPath.selection_keyset.removeCallback(this._selectionKeysChanged);
    // }

    _plotterChanged() {
        this.groupingMode = this._plotterPath.push("groupingMode").getState();
    }

    resize() {
        this.chart.resize(this._getElementSize());
    }

    _getElementSize() {
        return {
            width: this.element.clientWidth,
            height: this.element.clientHeight
        };
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
        if(this.busy) {
            return;
        }

        this.chart.axis.labels({
            x: this._xAxisPath.push("overrideAxisName").getState() || "Sorted by " + this._sortColumnPath.getValue("ColumnUtils.getTitle(this)"),
            y: this._yAxisPath.push("overrideAxisName").getState() || this.heightColumnsLabels.join(", ")
        });
    }

    _updateColumns() {
        this.heightColumnNames = [];
        this.heightColumnsLabels = [];

        var heightColumns = this._heightColumnsPath.getChildren();

        for (let idx in heightColumns)
        {
            let column = heightColumns[idx];
            let title = column.getValue("getMetadata('title')");
            let name = column.getPath().pop();

            this.heightColumnsLabels.push(title);
            this.heightColumnNames.push(name);
        }
    }

    _dataChanged() {

        if(this.busy) {
            return;
        }

        this._updateColumns();

        var heightColumns = this._heightColumnsPath.getChildren();

         var numericMapping = {
            sort: this._sortColumnPath,
            xLabel: this._labelColumnPath
        };

        var stringMapping = {
            sort: this._sortColumnPath,
            color: this._colorColumnPath,
            xLabel: this._labelColumnPath
        };

        for (let idx in heightColumns)
        {
            let column = heightColumns[idx];
            let name = column.getPath().pop();
            numericMapping[name] = column; // all height columns as numeric value for the chart

            if(idx === 0 || idx === "0") {
              stringMapping.yLabel = column; // only using the first column to label the y axis
              numericMapping.yLabel = column;
            }
        }

        this.numericRecords = this.toolPath.pushPlotter("plot").retrieveRecords(numericMapping, {keySet: this._plotterPath.push("filteredKeySet"), dataType: "number"});
        this.numericRecords = lodash.sortByAll(this.numericRecords, ["sort", "id"]);

        this.stringRecords = this.toolPath.pushPlotter("plot").retrieveRecords(stringMapping, {keySet: this._plotterPath.push("filteredKeySet"), dataType: "string"});

        this.keyToIndex = {};
        this.indexToKey = {};

        this.numericRecords.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
            this.indexToKey[index] = record.id;
        });


        this.groupingMode = this._plotterPath.push("groupingMode").getState();
        //var horizontalMode = this._plotterPath.push("horizontalMode").getState();

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
                var heights = lodash.pick(record, this.heightColumnNames);
                var sum = 0;
                lodash.keys(heights).forEach((key) => {
                    sum += heights[key];
                });

                lodash.keys(heights).forEach((key) => {
                    heights[key] = heights[key] / sum;
                });

                return heights;
            });

            this.numericRecords = newValues;
        }

        this.keyToIndex = {};
        this.numericRecords.forEach((record, index) => {
            this.keyToIndex[record.id] = index;
        });

        var keys = {};
        // if label column is specified
        if(this._labelColumnPath.getState().length) {
            keys.x = "xLabel";
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

        this._axisChanged();
        this.busy = true;
        this.chart.load({json: this.numericRecords, colors, keys, unload: true, done: () => { this.busy = false; }});
    }

    _updateStyle() {}

    destroy() {
        /* Cleanup callbacks */
        //this.teardownCallbacks();
        this.chart.destroy();
    }
}

export default WeaveC3Barchart;

registerToolImplementation("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
