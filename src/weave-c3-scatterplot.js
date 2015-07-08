import c3 from "c3";
import WeavePanel from "./WeavePanel";
import jquery from "jquery";


var _plotterPath;
var _xAxisPath;
var _yAxisPath;
var _dataXPath;
var _dataYPath;

var _c3Options = {
    data: {
        size: {},
        json: {},
        keys: {
            x: "x",
            value: ["y"]
        },
        type: "scatter"
    },
    axis: {
        x: {
            // needs to change
            label: "",
            tick: {
                fit: false
            }
        },
        y: {
            label: ""
        }
    }
};

function _axisLabelChanged () {
    var xAxisTitle = _xAxisPath.push("overrideAxisName").getState() || _dataXPath.getValue("ColumnUtils.getTitle(this)");
    var yAxisTitle = _yAxisPath.push("overrideAxisName").getState() || _dataYPath.getValue("ColumnUtils.getTitle(this)");
    _c3Options.axis.x.label = xAxisTitle;
    _c3Options.axis.y.label = yAxisTitle;
    this.update();
}

function _dataChanged() {
    _c3Options.data.json = _plotterPath.retrieveRecords({ x: _dataXPath, y: _dataYPath});
    this.update();
}

function _sizeChanged() {
    _c3Options.size = {
            height: jquery(this.element).height(),
            width: jquery(this.element).width()
    };
    this.update();
}

export default class extends WeavePanel {

    constructor(parent, toolPath) {
        super(parent, toolPath);

        _plotterPath = this.toolPath.pushPlotter("plot");

        _dataXPath = _plotterPath.push("dataX");
        _dataYPath = _plotterPath.push("dataY");

        _xAxisPath = this.toolPath.pushPlotter("xAxis");
        _yAxisPath = this.toolPath.pushPlotter("yAxis");

        [_dataXPath, _dataYPath].forEach( (item) => {
            item.addCallback(_dataChanged.bind(this), true, false);
        });

        [_dataXPath, _dataYPath, _xAxisPath.push("overrideAxisName"), _yAxisPath.push("overrideAxisName")].forEach((item) => {
            item.addCallback(_axisLabelChanged.bind(this), true, false);
        });

        _c3Options.bindto = this.element[0];
        this.update();
    }

    _updateContents () {
        _sizeChanged.call(this);
    }

    update() {
        this.chart = c3.generate(_c3Options);
    }
}
