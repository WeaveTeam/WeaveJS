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

var _sizePath;
var _records = [];

var _normalizedRecords = [];

/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */
function _normalizeRecords (records, attributes) {
    
    let normalizedRecords = [];
    attributes.map(function(attr) {
        //let min = records
        //let column = records.
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
        _sizePath = _plotterPath.push("sizeBy");

        this._c3Options = {
            data: {
                size: {},
                json: [],
                order: null,
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
                selection: {enabled: true, multiple: true},
                sort: "asc"
            },
            legend: {
                show: false
            },
            axis: {
                x: {
                    min: "",
                    max: "",
                    label: {
                        text: "",
                        position: ""
                    },
                    tick: {
                        count: 5
                    }
                },
                y: {
                    min: "",
                    max: "",
                    label: {
                        text: "",
                        position: ""
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
                    //console.log(_sizePath.getState());
                    if(_sizePath.getState().length) {
                        let minScreenRadius = _plotterPath.push("minScreenRadius").getState();
                        let maxScreenRadius = _plotterPath.push("maxScreenRadius").getState();
                        return minScreenRadius + _records[d.index].size / (maxScreenRadius - minScreenRadius) || 0;
                    } else {
                       // if not we use the defaultScreenRadius size
                        return _plotterPath.push("defaultScreenRadius").getState() || 5; // or 5 just for sanity check.
                    }
                }
            }
        };

        this.indexCache = lodash({});

        [_dataXPath, _dataYPath, _sizePath, _fillStylePath, _lineStylePath].forEach( (item) => {
            item.addCallback(lodash.debounce(this._dataChanged.bind(this), true, false), 100);
        });

        [_dataXPath, _dataYPath, _xAxisPath, _yAxisPath].forEach((item) => {
            item.addCallback(lodash.debounce(this._axisChanged.bind(this), true, false), 100);
        });

        toolPath.selection_keyset.addCallback(this._selectionKeysChanged.bind(this), true, false);

        this._c3Options.axis.x.min = _xAxisPath.push("axisLineMinValue").getState();
        this._c3Options.axis.x.max = _xAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.x.label.text = _xAxisPath.push("overrideAxisName").getState() || _dataXPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.x.label.position = "outer-center";

        this._c3Options.axis.y.min = _yAxisPath.push("axisLineMinValue").getState();
        this._c3Options.axis.y.max = _yAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.y.label.text = _yAxisPath.push("overrideAxisName").getState() || _dataYPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.y.label.position = "outer-middle";

        this._c3Options.bindto = this.element[0];
        this.update = lodash.debounce(this._update.bind(this), 100);
        this.update();
    }

    _updateContents () {
        this._sizeChanged();
    }

    _axisChanged () {
        this._c3Options.axis.x.min = _xAxisPath.push("axisLineMinValue").getState();
        this._c3Options.axis.x.max = _xAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.x.label.text = _xAxisPath.push("overrideAxisName").getState() || _dataXPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.x.label.position = "outer-center";

        this._c3Options.axis.y.min = _yAxisPath.push("axisLineMinValue").getState();
        this._c3Options.axis.y.max = _yAxisPath.push("axisLineMaxValue").getState();
        this._c3Options.axis.y.label.text = _yAxisPath.push("overrideAxisName").getState() || _dataYPath.getValue("ColumnUtils.getTitle(this)");
        this._c3Options.axis.y.label.position = "outer-middle";
        this.update();
    }

    _dataChanged() {
        let mapping = { x: _dataXPath,
                        y: _dataYPath,
                        size: _sizePath,
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
        _records = lodash.sortBy(_plotterPath.retrieveRecords(mapping), ["x", "y"]);
        console.log(_records);
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
