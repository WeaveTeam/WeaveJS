import c3 from "c3";
import WeavePanel from "./WeavePanel";
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
          if(min && max && record[attr]) {
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

        this._c3Options = {
            data: {
                size: {},
                json: [],
                hide: ["originalIndex"],
                order: "asc",
                keys: {
                    x: "x",
                    value: ["y", "originalIndex"]
                },
                type: "scatter",//,
                color: (color, d) => {
                        var record = this.originalRecords[this.chartToOriginal(d.index)];
                        return (record && record.fill) ? record.fill.color : 0;
                    },
                selection: {enabled: true, multiple: true}
            },
            legend: {
                show: false
            },
            axis: {
                x: {
                    //min: "",
                    //max: "",
                    label: {
                        text: "",
                        position: ""
                    },
                    tick: {
                        count: 10,
                        fit: false,
                        format: function(num) {
                            return num.toFixed(2);
                        }
                    }
                },
                y: {
                    //min: "",
                    //max: "",
                    label: {
                        text: "",
                        position: ""
                    },
                    tick: {
                        count: 10,
                        fit: false,
                        format: function(num) {
                            return num.toFixed(2);
                        }
                    }
                },
                color: "#B0B0B0",
                alpha: "1",
                thickness: "10"
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                },
                alpha: "1",
                color: "#DDDDDD",
                thickness: "1"
            },
            point: {
                r: (d) => {
                    // check if we have a size by column
                    //var sizeColumn = lodash.pluck(_normalizedRecords, "size");
                    // sizeColumn.every(function(v) { retun v === null});

                    if(this._sizeByPath.getState().length) {
                        let minScreenRadius = this._plotterPath.push("minScreenRadius").getState();
                        let maxScreenRadius = this._plotterPath.push("maxScreenRadius").getState();
                        var normalizedRecord = this.normalizedRecords[this.chartToOriginal(d.index)];

                        return normalizedRecord && normalizedRecord.size ?
                                minScreenRadius + normalizedRecord.size * (maxScreenRadius - minScreenRadius) :
                                (maxScreenRadius + minScreenRadius) / 2;
                    }
                    else {
                        return this._plotterPath.push("defaultScreenRadius").getState();
                    }
                }
            }
        };

        this.indexCache = lodash({});

        [this._dataXPath, this._dataYPath, this._sizeByPath, this._fillStylePath, this._lineStylePath].forEach( (path) => {
            path.addCallback(lodash.debounce(this._dataChanged.bind(this), true, false), 100);
        });

        [this._dataXPath, this._dataYPath, this._xAxisPath, this._yAxisPath].forEach((path) => {
            path.addCallback(lodash.debounce(this._axisChanged.bind(this), true, false), 100);
        });

        ["axesAlpha",
         "axesColor",
         "axesThickness",
         "gridLineAlpha",
         "gridLineColor",
         "gridLineThickness"].forEach((item) => {
            this._visualizationPath.push(item).addCallback(lodash.debounce(this._visualizationChanged.bind(this), true, false), 100);
        });
        this._visualizationPath.addCallback(lodash.debounce(this._visualizationChanged.bind(this), true, false), 100);

        toolPath.selection_keyset.addCallback(this._selectionKeysChanged.bind(this), true, false);



        //this._c3Options.axis.x.min = _xAxisPath.push("axisLineMinValue").getState();
        //this._c3Options.axis.x.max = _xAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.x.label.text = this._xAxisPath.push("overrideAxisName").getState() || this._dataXPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.x.tick.count = this._xAxisPath.push("tickCountRequested").getState() || 10;
        this._c3Options.axis.x.label.position = "outer-center";

        //this._c3Options.axis.y.min = _yAxisPath.push("axisLineMinValue").getState();
        //this._c3Options.axis.y.max = _yAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.y.label.text = this._yAxisPath.push("overrideAxisName").getState() || this._dataYPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.y.tick.count = this._yAxisPath.push("tickCountRequested").getState() || 10;
        this._c3Options.axis.y.label.position = "outer-middle";

        this._c3Options.bindto = this.element[0];
        this.update = lodash.debounce(this._update.bind(this), 100);
        this.update();
    }

    _updateContents () {
        this._sizeChanged();
    }

    _axisChanged () {
        this._c3Options.axis.x.min = this._xAxisPath.push("axisLineMinValue").getState();
        this._c3Options.axis.x.max = this._xAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.x.label.text = this._xAxisPath.push("overrideAxisName").getState() || this._dataXPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.x.tick.count = this._xAxisPath.push("tickCountRequested").getState();
        this._c3Options.axis.x.label.position = "outer-center";

        this._c3Options.axis.y.min = this._yAxisPath.push("axisLineMinValue").getState();
        this._c3Options.axis.y.max = this._yAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.y.label.text = this._yAxisPath.push("overrideAxisName").getState() || this._dataYPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.y.tick.count = this._yAxisPath.push("tickCountRequested").getState();
        this._c3Options.axis.y.label.position = "outer-middle";
        this.update();
    }

    keyToChart(key) {
        return this.lookup.keyToChart[key];
    }
    keyToOriginal(key) {
        return this.lookup.keyToRecord[key].originalIndex;
    }

    keyToRecord(key) {
        return this.lookup.keyToRecord[key];
    }

    chartToOriginal(index) {
        return this.lookup.chartToOriginal[index];
    }

    _buildChartIndices()
    {
        this.lookup.chartToOriginal = {};
        this.lookup.originalToChart = {};

        if (this.chart.data("originalIndex").length === 0)
        {
            return;
        }
        var chartData = this.chart.data("originalIndex")[0].values;

        for (let chartIndex in chartData)
        {
            this.lookup.chartToOriginal[chartIndex] = chartData[chartIndex].value;
            this.lookup.originalToChart[chartData[chartIndex].value] = chartIndex;
        }
    }
    _buildKeyIndices()
    {
        this._buildChartIndices();
        this.lookup.keyToChart = {};
        for (let originalIndex in this.originalRecords)
        {
            let key = this.originalRecords[originalIndex].id;
            this.lookup.keyToChart[key] = this.lookup.originalToChart[originalIndex];
        }
    }

    _dataChanged() {
        let mapping = { x: this._dataXPath,
                        y: this._dataYPath,
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

        this.originalRecords = lodash(this._plotterPath.retrieveRecords(mapping)).sortBy("id")
            .forEach(function(record, index) {record.originalIndex = index; }).value();

        this.normalizedRecords = _normalizeRecords(this.originalRecords, ["x", "y", "size"]);

        this._c3Options.data.json = this.originalRecords;

        this.lookup.keyToRecord = lodash.indexBy(this.originalRecords, "id");

        this.keyToIndexLookup = null;
        this.update();
    }

    _sizeChanged() {
        this._c3Options.size = {
                height: jquery(this.element).height(),
                width: jquery(this.element).width()
        };
        this.update();
    }

    _selectionKeysChanged() {
        var keys = this.toolPath.selection_keyset.getKeys();
        var indices = keys.map(this.keyToChart, this).map(Number);
        this.chart.select("y", indices, true);
    }

    _visualizationChanged() {

        this._c3Options.axis.alpha = this._visualizationPath.push("axesAlpha").getState();
        this._c3Options.axis.color = this._visualizationPath.push("axesColor").getState();
        this._c3Options.axis.thickness = this._visualizationPath.push("axesThickness").getState();

        this._c3Options.grid.alpha = this._visualizationPath.push("gridLineAlpha").getState();
        this._c3Options.grid.color = this._visualizationPath.push("gridLineColor").getState();
        this._c3Options.grid.thickness = this._visualizationPath.push("gridLineThickness").getState();
    }

    _updateStyle() {

        d3.selectAll(this.element).selectAll("circle").style("stroke", "black")
                                                     .style("stroke-opacity", 0.5)
                                                     .style("opacity", 1);
        this.element.css("position", "absolute");

        jquery(this.element).find(".c3-axis path").css("stroke", "#" + StandardLib.decimalToHex(this._c3Options.axis.color));
        jquery(this.element).find(".c3-axis path").css("opacity", this._c3Options.axis.alpha);
        jquery(this.element).find(".c3-axis path").css("stroke-width", this._c3Options.axis.thickness);

        jquery(this.element).find(".c3-xgrid").removeAttr("stroke-dasharray");
        jquery(this.element).find(".c3-ygrid").removeAttr("stroke-dasharray");

        jquery(this.element).find(".c3-xgrid").css("stroke", "#" + StandardLib.decimalToHex(this._c3Options.axis.color));
        jquery(this.element).find(".c3-ygrid").css("stroke", "#" + StandardLib.decimalToHex(this._c3Options.axis.color));

        jquery(this.element).find(".c3-xgrid").css("opacity", this._c3Options.grid.alpha);
        jquery(this.element).find(".c3-ygrid").css("opacity", this._c3Options.grid.alpha);

        jquery(this.element).find(".c3-xgrid").css("stroke-width", this._c3Options.grid.thickness);
        jquery(this.element).find(".c3-ygrid").css("stroke-width", this._c3Options.grid.thickness);
    }

    _update() {
        this.chart = c3.generate(this._c3Options);
        this._updateStyle();
        this._buildKeyIndices();
    }

    destroy() {
        this.chart.destroy();
        super();
    }
}

WeavePanel.registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
