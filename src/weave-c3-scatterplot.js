import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";
import lodash from "lodash";
import d3 from "d3";

var _plotterPath;
var _xAxisPath;
var _yAxisPath;
var _dataXPath;
var _dataYPath;

var _fillStylePath;
var _lineStylePath;

var _sizeByPath;
var _records = [];

var _normalizedRecords = [];

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
                order: "asc",
                keys: {
                    x: "x",
                    value: ["y"]
                },
                type: "scatter",//,
                color: function (color, d) {
                    if(_records && _records.length && _records[d.index]) {
                        return _records[d.index].fill ? _records[d.index].fill.color : 0;
                    }
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
                r: function(d) {
                    // check if we have a size by column
                    //var sizeColumn = lodash.pluck(_normalizedRecords, "size");
                    // sizeColumn.every(function(v) { retun v === null});

                    if(_sizeByPath.getState().length) {
                        let minScreenRadius = _plotterPath.push("minScreenRadius").getState();
                        let maxScreenRadius = _plotterPath.push("maxScreenRadius").getState();
                        return minScreenRadius + _normalizedRecords[d.index].size * (maxScreenRadius - minScreenRadius);
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
        _records = _plotterPath.retrieveRecords(mapping);
        _records.forEach(function(record, i) {record.idx = i; });
        _normalizedRecords = _normalizeRecords(_records, ["x", "y", "size"]);
        this._c3Options.data.json = _records;
        this.indexCache = lodash(_records).map((item, idx) => {return [item.id, idx]; }).zipObject();
        this.dataNames = lodash.keys(mapping);
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
        var indices = this.indexCache.pick(keys).values().value();
        this.chart.select("y", indices, true);
    }

    _update() {
        this.chart = c3.generate(this._c3Options);
        this.element.css("position", "absolute");
    }

    destroy() {
        this.chart.destroy();
        super();
    }
}

WeavePanel.registerToolImplementation("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
