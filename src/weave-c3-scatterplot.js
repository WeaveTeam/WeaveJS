import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";
import lodash from "lodash";
import d3 from "d3";

var _visualizationPath;
var _plotterPath;
var _xAxisPath;
var _yAxisPath;
var _dataXPath;
var _dataYPath;

var _fillStylePath;
var _lineStylePath;

var _sizeByPath;

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

        _visualizationPath = toolPath.push("children", "visualization");
        _plotterPath = toolPath.pushPlotter("plot");

        _dataXPath = _plotterPath.push("dataX");
        _dataYPath = _plotterPath.push("dataY");
        _xAxisPath = toolPath.pushPlotter("xAxis");
        _yAxisPath = toolPath.pushPlotter("yAxis");

        _fillStylePath = _plotterPath.push("fill");
        _lineStylePath = _plotterPath.push("line");
        _sizeByPath = _plotterPath.push("sizeBy");

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
                    // check if we have a size by column
                    //var sizeColumn = lodash.pluck(_normalizedRecords, "size");
                    // sizeColumn.every(function(v) { retun v === null});

                    if(_sizeByPath.getState().length) {
                        let minScreenRadius = _plotterPath.push("minScreenRadius").getState();
                        let maxScreenRadius = _plotterPath.push("maxScreenRadius").getState();
                        var normalizedRecord = this.normalizedRecords[this.chartToOriginal(d.index)];

                        return normalizedRecord && normalizedRecord.size ?
                                minScreenRadius + normalizedRecord.size * (maxScreenRadius - minScreenRadius) :
                                (maxScreenRadius + minScreenRadius) / 2;
                    }
                    else {
                        return _plotterPath.push("defaultScreenRadius").getState();
                    }
                }
            }
        };

        this.indexCache = lodash({});

        [_dataXPath, _dataYPath, _sizeByPath, _fillStylePath, _lineStylePath].forEach( (item) => {
            item.addCallback(lodash.debounce(this._dataChanged.bind(this), true, false), 100);
        });

        [_dataXPath, _dataYPath, _xAxisPath, _yAxisPath].forEach((item) => {
            item.addCallback(lodash.debounce(this._axisChanged.bind(this), true, false), 100);
        });

        ["axesAlpha",
         "axesColor",
         "axesThickness",
         "gridLineAlpha",
         "gridLineColor",
         "gridLineThickness"].forEach((item) => {
            _visualizationPath.push(item).addCallback(lodash.debounce(this._visualizationChanged.bind(this), true, false), 100);
        });
        _visualizationPath.addCallback(lodash.debounce(this._visualizationChanged.bind(this), true, false), 100);

        toolPath.selection_keyset.addCallback(this._selectionKeysChanged.bind(this), true, false);



        //this._c3Options.axis.x.min = _xAxisPath.push("axisLineMinValue").getState();
        //this._c3Options.axis.x.max = _xAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.x.label.text = _xAxisPath.push("overrideAxisName").getState() || _dataXPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.x.tick.count = _xAxisPath.push("tickCountRequested").getState() || 10;
        this._c3Options.axis.x.label.position = "outer-center";

        //this._c3Options.axis.y.min = _yAxisPath.push("axisLineMinValue").getState();
        //this._c3Options.axis.y.max = _yAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.y.label.text = _yAxisPath.push("overrideAxisName").getState() || _dataYPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.y.tick.count = _yAxisPath.push("tickCountRequested").getState() || 10;
        this._c3Options.axis.y.label.position = "outer-middle";

        this._c3Options.bindto = this.element[0];
        this.update = lodash.debounce(this._update.bind(this), 100);
        this.update();
    }

    _updateContents () {
        this._sizeChanged();
    }

    _axisChanged () {
        //this._c3Options.axis.x.min = _xAxisPath.push("axisLineMinValue").getState();
        //this._c3Options.axis.x.max = _xAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.x.label.text = _xAxisPath.push("overrideAxisName").getState() || _dataXPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.x.tick.count = _xAxisPath.push("tickCountRequested").getState();
        this._c3Options.axis.x.label.position = "outer-center";

        //this._c3Options.axis.y.min = _yAxisPath.push("axisLineMinValue").getState();
        //this._c3Options.axis.y.max = _yAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.y.label.text = _yAxisPath.push("overrideAxisName").getState() || _dataYPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.y.tick.count = _yAxisPath.push("tickCountRequested").getState();
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
        let mapping = { x: _dataXPath,
                        y: _dataYPath,
                        size: _sizeByPath,
                        fill: {
                            alpha: _fillStylePath.push("alpha"),
                            color: _fillStylePath.push("color")
                        },
                        line: {
                            alpha: _lineStylePath.push("alpha"),
                            color: _lineStylePath.push("color"),
                            caps: _lineStylePath.push("caps")
                        }
                    };

        this.originalRecords = lodash(_plotterPath.retrieveRecords(mapping)).sortBy("id")
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

        var axesAlpha = _visualizationPath.push("axesAlpha").getState();
        var axesColor = _visualizationPath.push("axesColor").getState();
        var axesThickness = _visualizationPath.push("axesThickness").getState();

        var gridLineAlpha = _visualizationPath.push("gridLineAlpha").getState();
        var gridLineColor = _visualizationPath.push("gridLineColor").getState();
        var gridLineThickNess = _visualizationPath.push("gridLineThickness").getState();

        jquery(this.element).find(".c3-axis-x").css("stroke", axesColor);
        jquery(this.element).find(".c3-axis-y").css("stroke", axesColor);

        jquery(this.element).find(".c3-axis-x").css("opacity", axesAlpha);
        jquery(this.element).find(".c3-axis-y").css("opacity", axesAlpha);

        jquery(this.element).find(".c3-axis-x").css("stroke-width", axesThickness);
        jquery(this.element).find(".c3-axis-y").css("stroke-width", axesThickness);

        jquery(this.element).find(".c3-xgrid").css("stroke", gridLineColor);
        jquery(this.element).find(".c3-ygrid").css("stroke", gridLineColor);

        jquery(this.element).find(".c3-xgrid").css("opacity", gridLineAlpha);
        jquery(this.element).find(".c3-ygrid").css("opacity", gridLineAlpha);

        jquery(this.element).find(".c3-xgrid").css("stroke-width", gridLineThickNess);
        jquery(this.element).find(".c3-ygrid").css("stroke-width", gridLineThickNess);
    }

    _update() {
        this.chart = c3.generate(this._c3Options);
        d3.selectAll(this.element).selectAll("circle").style("stroke", "black")
                                                      .style("stroke-opacity", _lineStylePath.push("alpha", "defaultValue").getState())
                                                      .style("opacity", _fillStylePath.push("alpha", "defaultValue").getState());
        this.element.css("position", "absolute");
        this._buildKeyIndices();
    }

    destroy() {
        this.chart.destroy();
        super();
    }
}

WeavePanel.registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
