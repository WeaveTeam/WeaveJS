import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";


var _plotterPath;
var _xAxisPath;
var _yAxisPath;
var _dataXPath;
var _dataYPath;

var _xAxis;
var _yAxis;

class SimpleAxis {

    // This class takes a weavePath to an SimpleAxis plotter
    constructor(axisPath) {

        this._c3Axis = {};
        this._axisPath = axisPath;
        axisPath.addCallback(function() {
            this._c3Axis.min = this._axisPath.push("axisLineMinValue").getState();
            this._c3Axis.max = this._axisPath.push("axisLineMaxValue").getState();
            this._c3Axis.culling = this._axisPath.push("tickCountRequested").getState();
            this._c3Axis.label = {
                text: "", // the axis label needs to be set externally
                position: "outer-center" // weave axisname currently has only one position.
            };
        }.bind(this), true, false);
    }

    // This function return a C3 Object configuation for an axis
    getC3Axis () {
        return this._c3Axis;
    }
}

export default class extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);

        this._c3Options = {
            data: {
                size: {},
                json: [],
                keys: {
                    x: "x",
                    value: ["y"]
                },
                type: "scatter"
            },
            axis: {}
        };
        _plotterPath = this.toolPath.pushPlotter("plot");

        _dataXPath = _plotterPath.push("dataX");
        _dataYPath = _plotterPath.push("dataY");

        _xAxisPath = this.toolPath.pushPlotter("xAxis");
        _yAxisPath = this.toolPath.pushPlotter("yAxis");

        _xAxis = new SimpleAxis(_xAxisPath);
        _yAxis = new SimpleAxis(_yAxisPath);

        [_dataXPath, _dataYPath].forEach( (item) => {
            item.addCallback(this._dataChanged.bind(this), true, false);
        });

        [_dataXPath, _dataYPath, _xAxisPath.push("overrideAxisName"), _yAxisPath.push("overrideAxisName")].forEach((item) => {
            item.addCallback(this._axisChanged.bind(this), true, false);
        });

        this._c3Options.bindto = this.element[0];
        this.update();
    }

    _updateContents () {
        this._sizeChanged.call(this);
    }

    _axisChanged () {

        this._c3Options.axis.x = _xAxis.getC3Axis();
        this._c3Options.axis.x.label.text = _xAxisPath.push("overrideAxisName").getState() || _dataXPath.getValue("ColumnUtils.getTitle(this)");

        this._c3Options.axis.y = _yAxis.getC3Axis();
        this._c3Options.axis.y.label.text = _xAxisPath.push("overrideAxisName").getState() || _dataXPath.getValue("ColumnUtils.getTitle(this)");

        this.update();
    }

    _dataChanged() {
        this._c3Options.data.json = _plotterPath.retrieveRecords({ x: _dataXPath, y: _dataYPath});
        this.update();
    }

    _sizeChanged() {
        this._c3Options.size = {
                height: jquery(this.element).height(),
                width: jquery(this.element).width()
        };
        this.update();
    }

    update() {
        console.log(this._c3Options);
        this.chart = c3.generate(this._c3Options);
    }
}


