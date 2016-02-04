"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _AbstractC3Tool2 = require("./AbstractC3Tool");

var _AbstractC3Tool3 = _interopRequireDefault(_AbstractC3Tool2);

var _WeaveTool = require("../WeaveTool");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

var _FormatUtils = require("../utils/FormatUtils");

var _FormatUtils2 = _interopRequireDefault(_FormatUtils);

var _c = require("c3");

var c3 = _interopRequireWildcard(_c);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

/* private
 * @param records array or records
 * @param attributes array of attributes to be normalized
 */

var WeaveC3ScatterPlot = function (_AbstractC3Tool) {
    _inherits(WeaveC3ScatterPlot, _AbstractC3Tool);

    function WeaveC3ScatterPlot(props) {
        _classCallCheck(this, WeaveC3ScatterPlot);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveC3ScatterPlot).call(this, props));

        _this.keyToIndex = {};
        _this.indexToKey = {};
        _this.yAxisValueToLabel = {};
        _this.xAxisValueToLabel = {};
        _this.validate = _.debounce(_this.validate.bind(_this), 30);
        _this.c3Config = {
            size: {
                height: _this.props.style.height,
                width: _this.props.style.width
            },
            bindto: null,
            padding: {
                top: 20,
                bottom: 0,
                left: 100,
                right: 20
            },
            data: {
                rows: [],
                x: "x",
                xSort: false,
                type: "scatter",
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                color: function color(_color, d) {
                    if (_this.stringRecords && d.hasOwnProperty("index")) {
                        // find the corresponding index of numericRecords in stringRecords
                        //                        var id:IQualifiedKey = this.indexToKey[d.index as number];
                        //                        var index:number = _.pluck(this.stringRecords, "id").indexOf(id);
                        var record = _this.stringRecords[d.index];
                        return record && record["fill"] && record["fill"]["color"] ? record["fill"]["color"] : "#000000";
                    }
                    return "#000000";
                },
                onclick: function onclick(d) {
                    var event = _this.chart.internal.d3.event;
                    if (!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.setKeys([_this.indexToKey[d.index]]);
                    }
                },
                onselected: function onselected(d) {
                    _this.flag = true;
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.addKeys([_this.indexToKey[d.index]]);
                    }
                },
                onunselected: function onunselected(d) {
                    _this.flag = true;
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.removeKeys([_this.indexToKey[d.index]]);
                    }
                },
                onmouseover: function onmouseover(d) {
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.probe_keyset.setKeys([]);
                        var columnNamesToValue = {};
                        var xValue = _this.numericRecords[d.index]["point"]["x"];
                        if (xValue) {
                            columnNamesToValue[_this.paths.dataX.getObject().getMetadata('title')] = xValue;
                        }
                        var yValue = _this.numericRecords[d.index]["point"]["y"];
                        if (yValue) {
                            columnNamesToValue[_this.paths.dataY.getObject().getMetadata('title')] = yValue;
                        }
                        var sizeByValue = _this.numericRecords[d.index]["size"];
                        if (sizeByValue) {
                            columnNamesToValue[_this.paths.sizeBy.getObject().getMetadata('title')] = sizeByValue;
                        }
                        _this.toolPath.probe_keyset.setKeys([_this.indexToKey[d.index]]);
                        _this.props.toolTip.setState({
                            x: _this.chart.internal.d3.event.pageX,
                            y: _this.chart.internal.d3.event.pageY,
                            showToolTip: true,
                            columnNamesToValue: columnNamesToValue
                        });
                    }
                },
                onmouseout: function onmouseout(d) {
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.probe_keyset.setKeys([]);
                        _this.props.toolTip.setState({
                            showToolTip: false
                        });
                    }
                }
            },
            legend: {
                show: false
            },
            axis: {
                x: {
                    label: {
                        text: "",
                        position: "outer-center"
                    },
                    tick: {
                        format: function format(num) {
                            if (_this.paths.dataX && _this.xAxisValueToLabel && _this.dataXType !== "number") {
                                return _this.xAxisValueToLabel[num] || "";
                            } else {
                                return String(_FormatUtils2.default.defaultNumberFormatting(num));
                            }
                        },
                        rotate: -45,
                        culling: {
                            max: null
                        },
                        fit: false
                    }
                }
            },
            transition: { duration: 0 },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            tooltip: {
                format: {
                    title: function title(num) {
                        return _this.paths.xAxis.getState("overrideAxisName") || _this.paths.dataX.getObject().getMetadata('title');
                    },
                    name: function name(_name, ratio, id, index) {
                        return _this.paths.yAxis.getState("overrideAxisName") || _this.paths.dataY.getObject().getMetadata('title');
                    }
                },
                show: false
            },
            point: {
                r: function r(d) {
                    if (d.hasOwnProperty("index")) {
                        return _this.normalizedPointSizes[d.index];
                    }
                },
                focus: {
                    expand: {
                        enabled: false
                    }
                }
            },
            onrendered: function onrendered() {
                _this.busy = false;
                _this.updateStyle();
                if (_this.dirty) _this.validate();
            }
        };
        _this.c3ConfigYAxis = {
            show: true,
            label: {
                text: "",
                position: "outer-middle"
            },
            tick: {
                format: function format(num) {
                    if (_this.paths.dataY && _this.yAxisValueToLabel && _this.dataYType !== "number") {
                        return _this.yAxisValueToLabel[num] || "";
                    } else {
                        return String(_FormatUtils2.default.defaultNumberFormatting(num));
                    }
                }
            }
        };
        return _this;
    }

    _createClass(WeaveC3ScatterPlot, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "normalizeRecords",
        value: function normalizeRecords(records, attributes) {
            // to avoid computing the stats at each iteration.
            var columnStatsCache = {};
            attributes.forEach(function (attr) {
                columnStatsCache[attr] = {
                    min: _.min(_.pluck(records, attr)),
                    max: _.max(_.pluck(records, attr))
                };
            });
            return records.map(function (record) {
                var obj = {};
                attributes.forEach(function (attr) {
                    var min = columnStatsCache[attr].min;
                    var max = columnStatsCache[attr].max;
                    if (!min) min = 0;
                    if (max - min === 0) {
                        return 0;
                    }
                    if (record[attr]) {
                        // console.log( (record[attr] - min) / (max - min));
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
    }, {
        key: "dataChanged",
        value: function dataChanged() {
            var _this2 = this;

            var numericMapping = {
                point: {
                    x: this.paths.dataX,
                    y: this.paths.dataY
                },
                size: this.paths.sizeBy
            };
            var stringMapping = {
                point: {
                    x: this.paths.dataX,
                    y: this.paths.dataY
                },
                fill: {
                    //alpha: this._fillStylePath.push("alpha"),
                    color: this.paths.fill.push("color")
                },
                line: {
                    //alpha: this._lineStylePath.push("alpha"),
                    color: this.paths.line.push("color")
                }
            };
            this.dataXType = this.paths.dataX.getObject().getMetadata('dataType');
            this.dataYType = this.paths.dataY.getObject().getMetadata('dataType');
            this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, { keySet: this.paths.filteredKeySet, dataType: "number" });
            if (!this.numericRecords.length) return;
            this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, { keySet: this.paths.filteredKeySet, dataType: "string" });
            this.records = _.zip(this.numericRecords, this.stringRecords);
            this.records = _.sortByOrder(this.records, ["size", "id"], ["desc", "asc"]);
            if (weavejs.WeaveAPI.Locale.reverseLayout) {
                this.records = this.records.reverse();
            }
            if (this.records.length) {
                ;

                var _$unzip = _.unzip(this.records);

                var _$unzip2 = _slicedToArray(_$unzip, 2);

                this.numericRecords = _$unzip2[0];
                this.stringRecords = _$unzip2[1];
            }this.keyToIndex = {};
            this.indexToKey = {};
            this.yAxisValueToLabel = {};
            this.xAxisValueToLabel = {};
            this.numericRecords.forEach(function (record, index) {
                _this2.keyToIndex[record.id] = index;
                _this2.indexToKey[index] = record.id;
            });
            this.stringRecords.forEach(function (record, index) {
                _this2.xAxisValueToLabel[_this2.numericRecords[index]["point"]["x"]] = record["point"]["x"];
                _this2.yAxisValueToLabel[_this2.numericRecords[index]["point"]["y"]] = record["point"]["y"];
            });
            this.normalizedRecords = this.normalizeRecords(this.numericRecords, ["size"]);
            this.plotterState = this.paths.plotter.getUntypedState ? this.paths.plotter.getUntypedState() : this.paths.plotter.getState();
            this.normalizedPointSizes = this.normalizedRecords.map(function (normalizedRecord) {
                if (_this2.plotterState && _this2.plotterState.sizeBy) {
                    var minScreenRadius = _this2.plotterState.minScreenRadius;
                    var maxScreenRadius = _this2.plotterState.maxScreenRadius;
                    return (normalizedRecord && normalizedRecord["size"] ? minScreenRadius + normalizedRecord["size"] * (maxScreenRadius - minScreenRadius) : _this2.plotterState.defaultScreenRadius) || 3;
                } else {
                    return _this2.plotterState.defaultScreenRadius || 3;
                }
            });
        }
    }, {
        key: "handleClick",
        value: function handleClick(event) {
            if (!this.flag) {
                this.toolPath.selection_keyset.setKeys([]);
            }
            this.flag = false;
        }
    }, {
        key: "updateStyle",
        value: function updateStyle() {
            var _this3 = this;

            if (!this.chart || !this.dataXType) return;
            d3.select(this.element).selectAll("circle").style("opacity", 1).style("stroke", "black").style("stroke-opacity", 0.0).style("stroke-width", 1.0);
            var selectedKeys = this.toolPath.selection_keyset.getKeys();
            var probedKeys = this.toolPath.probe_keyset.getKeys();
            var selectedIndices = selectedKeys.map(function (key) {
                return Number(_this3.keyToIndex[key]);
            });
            var probedIndices = probedKeys.map(function (key) {
                return Number(_this3.keyToIndex[key]);
            });
            var keys = Object.keys(this.keyToIndex);
            var indices = keys.map(function (key) {
                return Number(_this3.keyToIndex[key]);
            });
            var unselectedIndices = _.difference(indices, selectedIndices);
            unselectedIndices = _.difference(unselectedIndices, probedIndices);
            if (probedIndices.length) {
                this.customStyle(probedIndices, "circle", ".c3-shape", { opacity: 1.0, "stroke-opacity": 0.5, "stroke-width": 1.5 });
            }
            if (selectedIndices.length) {
                this.customStyle(unselectedIndices, "circle", ".c3-shape", { opacity: 0.3, "stroke-opacity": 0.0 });
                this.customStyle(selectedIndices, "circle", ".c3-shape", { opacity: 1.0, "stroke-opacity": 1.0 });
                this.chart.select(["y"], selectedIndices, true);
            } else if (!probedIndices.length) {
                this.customStyle(indices, "circle", ".c3-shape", { opacity: 1.0, "stroke-opacity": 0.0 });
                this.chart.select(["y"], [], true);
            }
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
                this.c3Config.size = { width: this.props.style.width, height: this.props.style.height };
                this.validate(true);
            }
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            /* Cleanup callbacks */
            //this.teardownCallbacks();
            this.chart.destroy();
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.element.addEventListener("click", this.handleClick.bind(this));
            var plotterPath = this.toolPath.pushPlotter("plot");
            var mapping = [{ name: "plotter", path: plotterPath, callbacks: this.validate }, { name: "dataX", path: plotterPath.push("dataX") }, { name: "dataY", path: plotterPath.push("dataY") }, { name: "sizeBy", path: plotterPath.push("sizeBy") }, { name: "fill", path: plotterPath.push("fill") }, { name: "line", path: plotterPath.push("line") }, { name: "xAxis", path: this.toolPath.pushPlotter("xAxis") }, { name: "yAxis", path: this.toolPath.pushPlotter("yAxis") }, { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") }, { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") }, { name: "marginTop", path: this.plotManagerPath.push("marginTop") }, { name: "marginRight", path: this.plotManagerPath.push("marginRight") }, { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") }, { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle }, { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.updateStyle }];
            this.initializePaths(mapping);
            this.paths.filteredKeySet.getObject().setColumnKeySources([this.paths.dataX.getObject(), this.paths.dataY.getObject()]);
            this.c3Config.bindto = this.element;
            this.validate(true);
        }
    }, {
        key: "validate",
        value: function validate() {
            var forced = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            if (this.busy) {
                this.dirty = true;
                return;
            }
            this.dirty = false;
            var changeDetected = false;
            var axisChange = this.detectChange('dataX', 'dataY', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight');
            var axisSettingsChange = this.detectChange('xAxis', 'yAxis');
            if (axisChange || this.detectChange('plotter', 'sizeBy', 'fill', 'line', 'filteredKeySet')) {
                changeDetected = true;
                this.dataChanged();
            }
            if (axisChange) {
                changeDetected = true;
                var xLabel = this.paths.xAxis.push("overrideAxisName").getState() || this.paths.dataX.getObject().getMetadata('title');
                var yLabel = this.paths.yAxis.push("overrideAxisName").getState() || this.paths.dataY.getObject().getMetadata('title');
                if (this.numericRecords) {
                    var temp = "y";
                    if (weavejs.WeaveAPI.Locale.reverseLayout) {
                        this.c3Config.data.axes = _defineProperty({}, temp, 'y2');
                        this.c3Config.axis.y2 = this.c3ConfigYAxis;
                        this.c3Config.axis.y = { show: false };
                        this.c3Config.axis.x.tick.rotate = 45;
                    } else {
                        this.c3Config.data.axes = _defineProperty({}, temp, 'y');
                        this.c3Config.axis.y = this.c3ConfigYAxis;
                        delete this.c3Config.axis.y2;
                        this.c3Config.axis.x.tick.rotate = -45;
                    }
                }
                this.c3Config.axis.x.label = { text: xLabel, position: "outer-center" };
                this.c3ConfigYAxis.label = { text: yLabel, position: "outer-middle" };
                this.c3Config.padding.top = Number(this.paths.marginTop.getState());
                this.c3Config.axis.x.height = Number(this.paths.marginBottom.getState());
                if (weavejs.WeaveAPI.Locale.reverseLayout) {
                    this.c3Config.padding.left = Number(this.paths.marginRight.getState());
                    this.c3Config.padding.right = Number(this.paths.marginLeft.getState());
                } else {
                    this.c3Config.padding.left = Number(this.paths.marginLeft.getState());
                    this.c3Config.padding.right = Number(this.paths.marginRight.getState());
                }
            }
            if (changeDetected || forced) {
                this.busy = true;
                this.chart = c3.generate(this.c3Config);
                this.loadData();
                this.cullAxes();
            }
        }
    }, {
        key: "loadData",
        value: function loadData() {
            if (!this.chart || this.busy) return _StandardLib2.default.debounce(this, 'loadData');
            this.chart.load({ data: _.pluck(this.numericRecords, "point"), unload: true });
            //after data is loaded we need to remove the clip-path so that points are not
            // clipped when rendered near edge of chart
            //TODO: determine if adding padding to axes range will further improve aesthetics of chart
            this.chart.internal.main.select('.c3-chart').attr('clip-path', null);
        }
    }]);

    return WeaveC3ScatterPlot;
}(_AbstractC3Tool3.default);

exports.default = WeaveC3ScatterPlot;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::ScatterPlotTool", WeaveC3ScatterPlot);
//Weave.registerClass("weavejs.tools.ScatterPlotTool", WeaveC3ScatterPlot, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtYzMtc2NhdHRlcnBsb3QuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvd2VhdmUtYzMtc2NhdHRlcnBsb3QudHN4Il0sIm5hbWVzIjpbIldlYXZlQzNTY2F0dGVyUGxvdCIsIldlYXZlQzNTY2F0dGVyUGxvdC5jb25zdHJ1Y3RvciIsIldlYXZlQzNTY2F0dGVyUGxvdC5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIldlYXZlQzNTY2F0dGVyUGxvdC5ub3JtYWxpemVSZWNvcmRzIiwiV2VhdmVDM1NjYXR0ZXJQbG90LmRhdGFDaGFuZ2VkIiwiV2VhdmVDM1NjYXR0ZXJQbG90LmhhbmRsZUNsaWNrIiwiV2VhdmVDM1NjYXR0ZXJQbG90LnVwZGF0ZVN0eWxlIiwiV2VhdmVDM1NjYXR0ZXJQbG90LmNvbXBvbmVudERpZFVwZGF0ZSIsIldlYXZlQzNTY2F0dGVyUGxvdC5jb21wb25lbnRXaWxsVW5tb3VudCIsIldlYXZlQzNTY2F0dGVyUGxvdC5jb21wb25lbnREaWRNb3VudCIsIldlYXZlQzNTY2F0dGVyUGxvdC52YWxpZGF0ZSIsIldlYXZlQzNTY2F0dGVyUGxvdC5sb2FkRGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBV1ksQUFBQyxBQUFNLEFBQVEsQUFDcEI7Ozs7SUFBSyxBQUFFLEFBQU0sQUFBSSxBQUNqQixBQUFXLEFBQU0sQUFBc0IsQUFFdkM7Ozs7Ozs7O0lBQUssQUFBRSxBQUFNLEFBQUksQUFNakIsQUFBVyxBQUFNLEFBQXNCLEFBaUI5QyxBQUdHLEFBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBaUMsQUFBYzs7O0FBeUIzQyxnQ0FBWSxBQUFtQjs7OzBHQUNyQixBQUFLLEFBQUMsQUFBQzs7QUFDYixBQUFJLGNBQUMsQUFBVSxhQUFHLEFBQUUsQUFBQztBQUNyQixBQUFJLGNBQUMsQUFBVSxhQUFHLEFBQUUsQUFBQztBQUNyQixBQUFJLGNB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Ii8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvYzMvYzMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvZDMvZDMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC1kb20uZC50c1wiLz5cblxuaW1wb3J0IHtJVmlzVG9vbFByb3BzfSBmcm9tIFwiLi9JVmlzVG9vbFwiO1xuaW1wb3J0IHtJVG9vbFBhdGhzfSBmcm9tIFwiLi9BYnN0cmFjdEMzVG9vbFwiO1xuaW1wb3J0IEFic3RyYWN0QzNUb29sIGZyb20gXCIuL0Fic3RyYWN0QzNUb29sXCI7XG5pbXBvcnQge3JlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi4vV2VhdmVUb29sXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIGQzIGZyb20gXCJkM1wiO1xuaW1wb3J0IEZvcm1hdFV0aWxzIGZyb20gXCIuLi91dGlscy9Gb3JtYXRVdGlsc1wiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjMyBmcm9tIFwiYzNcIjtcbmltcG9ydCB7Q2hhcnRDb25maWd1cmF0aW9uLCBDaGFydEFQSX0gZnJvbSBcImMzXCI7XG5pbXBvcnQge01vdXNlRXZlbnR9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtnZXRUb29sdGlwQ29udGVudH0gZnJvbSBcIi4vdG9vbHRpcFwiO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSBcIi4vdG9vbHRpcFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuLi91dGlscy9TdGFuZGFyZExpYlwiO1xuXG5pbXBvcnQgSVF1YWxpZmllZEtleSA9IHdlYXZlanMuYXBpLmRhdGEuSVF1YWxpZmllZEtleTtcblxuaW50ZXJmYWNlIElDb2x1bW5TdGF0cyB7XG4gICAgbWluOiBudW1iZXI7XG4gICAgbWF4OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJU2NhdHRlcnBsb3RQYXRocyBleHRlbmRzIElUb29sUGF0aHMge1xuICAgIGRhdGFYOiBXZWF2ZVBhdGg7XG4gICAgZGF0YVk6IFdlYXZlUGF0aDtcbiAgICBzaXplQnk6IFdlYXZlUGF0aDtcbiAgICBmaWxsOiBXZWF2ZVBhdGg7XG4gICAgbGluZTogV2VhdmVQYXRoO1xufVxuXG4vKiBwcml2YXRlXG4gKiBAcGFyYW0gcmVjb3JkcyBhcnJheSBvciByZWNvcmRzXG4gKiBAcGFyYW0gYXR0cmlidXRlcyBhcnJheSBvZiBhdHRyaWJ1dGVzIHRvIGJlIG5vcm1hbGl6ZWRcbiAqL1xuY2xhc3MgV2VhdmVDM1NjYXR0ZXJQbG90IGV4dGVuZHMgQWJzdHJhY3RDM1Rvb2wge1xuXG4gICAgcHJpdmF0ZSBrZXlUb0luZGV4Ontba2V5OnN0cmluZ106IG51bWJlcn07XG4gICAgcHJpdmF0ZSBpbmRleFRvS2V5OntbaW5kZXg6bnVtYmVyXTogSVF1YWxpZmllZEtleX07XG4gICAgcHJpdmF0ZSB4QXhpc1ZhbHVlVG9MYWJlbDp7W3ZhbHVlOm51bWJlcl06IHN0cmluZ307XG4gICAgcHJpdmF0ZSB5QXhpc1ZhbHVlVG9MYWJlbDp7W3ZhbHVlOm51bWJlcl06IHN0cmluZ307XG4gICAgcHJvdGVjdGVkIGNoYXJ0OkNoYXJ0QVBJO1xuICAgIHByaXZhdGUgZGF0YVhUeXBlOnN0cmluZztcbiAgICBwcml2YXRlIGRhdGFZVHlwZTpzdHJpbmc7XG4gICAgcHJpdmF0ZSBudW1lcmljUmVjb3JkczpSZWNvcmRbXTtcbiAgICBwcml2YXRlIHN0cmluZ1JlY29yZHM6UmVjb3JkW107XG4gICAgcHJpdmF0ZSBub3JtYWxpemVkUmVjb3JkczpSZWNvcmRbXTtcbiAgICBwcml2YXRlIHJlY29yZHM6UmVjb3JkW11bXTtcblxuICAgIHByb3RlY3RlZCBwYXRoczpJU2NhdHRlcnBsb3RQYXRocztcbiAgICBwcml2YXRlIHBsb3R0ZXJTdGF0ZTphbnk7XG4gICAgcHJpdmF0ZSBub3JtYWxpemVkUG9pbnRTaXplczpudW1iZXJbXTtcblxuICAgIHByaXZhdGUgZmxhZzpib29sZWFuO1xuICAgIHByaXZhdGUgYnVzeTpib29sZWFuO1xuICAgIHByaXZhdGUgZGlydHk6Ym9vbGVhbjtcblxuICAgIHByb3RlY3RlZCBjM0NvbmZpZzpDaGFydENvbmZpZ3VyYXRpb247XG4gICAgcHJvdGVjdGVkIGMzQ29uZmlnWUF4aXM6YzMuWUF4aXNDb25maWd1cmF0aW9uO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6SVZpc1Rvb2xQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMua2V5VG9JbmRleCA9IHt9O1xuICAgICAgICB0aGlzLmluZGV4VG9LZXkgPSB7fTtcbiAgICAgICAgdGhpcy55QXhpc1ZhbHVlVG9MYWJlbCA9IHt9O1xuICAgICAgICB0aGlzLnhBeGlzVmFsdWVUb0xhYmVsID0ge307XG4gICAgICAgIHRoaXMudmFsaWRhdGUgPSBfLmRlYm91bmNlKHRoaXMudmFsaWRhdGUuYmluZCh0aGlzKSwgMzApO1xuXG4gICAgICAgIHRoaXMuYzNDb25maWcgPSB7XG4gICAgICAgICAgICBzaXplOiB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLnN0eWxlLmhlaWdodCxcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5wcm9wcy5zdHlsZS53aWR0aFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJpbmR0bzogbnVsbCxcbiAgICAgICAgICAgIHBhZGRpbmc6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDIwLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgICAgICBsZWZ0OjEwMCxcbiAgICAgICAgICAgICAgICByaWdodDoyMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICByb3dzOiBbXSxcbiAgICAgICAgICAgICAgICB4OiBcInhcIixcbiAgICAgICAgICAgICAgICB4U29ydDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJzY2F0dGVyXCIsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbG9yOiAoY29sb3I6c3RyaW5nLCBkOmFueSk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5zdHJpbmdSZWNvcmRzICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIGluZGV4IG9mIG51bWVyaWNSZWNvcmRzIGluIHN0cmluZ1JlY29yZHNcbi8vICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkOklRdWFsaWZpZWRLZXkgPSB0aGlzLmluZGV4VG9LZXlbZC5pbmRleCBhcyBudW1iZXJdO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXg6bnVtYmVyID0gXy5wbHVjayh0aGlzLnN0cmluZ1JlY29yZHMsIFwiaWRcIikuaW5kZXhPZihpZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWNvcmQ6UmVjb3JkID0gdGhpcy5zdHJpbmdSZWNvcmRzW2QuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChyZWNvcmQgJiYgcmVjb3JkW1wiZmlsbFwiXSAmJiAocmVjb3JkW1wiZmlsbFwiXSBhcyBSZWNvcmQpW1wiY29sb3JcIl0pID8gKHJlY29yZFtcImZpbGxcIl0gYXMgUmVjb3JkKVtcImNvbG9yXCJdIGFzIHN0cmluZyA6IFwiIzAwMDAwMFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiMwMDAwMDBcIjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uY2xpY2s6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnQ6TW91c2VFdmVudCA9ICh0aGlzLmNoYXJ0LmludGVybmFsLmQzKS5ldmVudCBhcyBNb3VzZUV2ZW50O1xuICAgICAgICAgICAgICAgICAgICBpZighKGV2ZW50LmN0cmxLZXl8fGV2ZW50Lm1ldGFLZXkpICYmIGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuc2V0S2V5cyhbdGhpcy5pbmRleFRvS2V5W2QuaW5kZXhdXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uc2VsZWN0ZWQ6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LmFkZEtleXMoW3RoaXMuaW5kZXhUb0tleVtkLmluZGV4XV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbnVuc2VsZWN0ZWQ6IChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQucmVtb3ZlS2V5cyhbdGhpcy5pbmRleFRvS2V5W2QuaW5kZXhdXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9ubW91c2VvdmVyOiAoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sdW1uTmFtZXNUb1ZhbHVlOntbY29sdW1uTmFtZTpzdHJpbmddIDogc3RyaW5nfG51bWJlciB9ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeFZhbHVlOm51bWJlciA9IHRoaXMubnVtZXJpY1JlY29yZHNbZC5pbmRleF1bXCJwb2ludFwiXVtcInhcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih4VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvVmFsdWVbdGhpcy5wYXRocy5kYXRhWC5nZXRPYmplY3QoKS5nZXRNZXRhZGF0YSgndGl0bGUnKV0gPSB4VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB5VmFsdWU6bnVtYmVyID0gdGhpcy5udW1lcmljUmVjb3Jkc1tkLmluZGV4XVtcInBvaW50XCJdW1wieVwiXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoeVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uTmFtZXNUb1ZhbHVlW3RoaXMucGF0aHMuZGF0YVkuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyldID0geVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2l6ZUJ5VmFsdWU6bnVtYmVyID0gdGhpcy5udW1lcmljUmVjb3Jkc1tkLmluZGV4XVtcInNpemVcIl0gYXMgbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2l6ZUJ5VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvVmFsdWVbdGhpcy5wYXRocy5zaXplQnkuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyldID0gIHNpemVCeVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhbdGhpcy5pbmRleFRvS2V5W2QuaW5kZXhdXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRvb2xUaXAuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMuY2hhcnQuaW50ZXJuYWwuZDMuZXZlbnQucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5jaGFydC5pbnRlcm5hbC5kMy5ldmVudC5wYWdlWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93VG9vbFRpcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvVmFsdWU6IGNvbHVtbk5hbWVzVG9WYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9ubW91c2VvdXQ6IChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnByb2JlX2tleXNldC5zZXRLZXlzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudG9vbFRpcC5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1Rvb2xUaXA6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZWdlbmQ6IHtcbiAgICAgICAgICAgICAgICBzaG93OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGF4aXM6IHtcbiAgICAgICAgICAgICAgICB4OiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFwib3V0ZXItY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGljazoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAobnVtOm51bWJlcik6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnBhdGhzLmRhdGFYICYmIHRoaXMueEF4aXNWYWx1ZVRvTGFiZWwgJiYgdGhpcy5kYXRhWFR5cGUgIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueEF4aXNWYWx1ZVRvTGFiZWxbbnVtXSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoRm9ybWF0VXRpbHMuZGVmYXVsdE51bWJlckZvcm1hdHRpbmcobnVtKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZTogLTQ1LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VsbGluZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpdDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB7IGR1cmF0aW9uOiAwIH0sXG4gICAgICAgICAgICBncmlkOiB7XG4gICAgICAgICAgICAgICAgeDoge1xuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB5OiB7XG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogKG51bTpudW1iZXIpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXRocy54QXhpcy5nZXRTdGF0ZShcIm92ZXJyaWRlQXhpc05hbWVcIikgfHwgdGhpcy5wYXRocy5kYXRhWC5nZXRPYmplY3QoKS5nZXRNZXRhZGF0YSgndGl0bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogKG5hbWU6c3RyaW5nLCByYXRpbzpudW1iZXIsIGlkOnN0cmluZywgaW5kZXg6bnVtYmVyKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGF0aHMueUF4aXMuZ2V0U3RhdGUoXCJvdmVycmlkZUF4aXNOYW1lXCIpIHx8IHRoaXMucGF0aHMuZGF0YVkuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9pbnQ6IHtcbiAgICAgICAgICAgICAgICByOiAoZDphbnkpOm51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplZFBvaW50U2l6ZXNbZC5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZm9jdXM6IHtcbiAgICAgICAgICAgICAgICAgICAgZXhwYW5kOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ucmVuZGVyZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlydHkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jM0NvbmZpZ1lBeGlzID0ge1xuICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJvdXRlci1taWRkbGVcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRpY2s6IHtcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IChudW06bnVtYmVyKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnBhdGhzLmRhdGFZICYmIHRoaXMueUF4aXNWYWx1ZVRvTGFiZWwgJiYgdGhpcy5kYXRhWVR5cGUgIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnlBeGlzVmFsdWVUb0xhYmVsW251bV0gfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoRm9ybWF0VXRpbHMuZGVmYXVsdE51bWJlckZvcm1hdHRpbmcobnVtKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlOmFueSlcblx0e1xuXG5cdH1cblxuICAgIHByaXZhdGUgbm9ybWFsaXplUmVjb3JkcyAocmVjb3JkczpSZWNvcmRbXSwgYXR0cmlidXRlczpzdHJpbmdbXSk6YW55W10ge1xuXG4gICAgICAgIC8vIHRvIGF2b2lkIGNvbXB1dGluZyB0aGUgc3RhdHMgYXQgZWFjaCBpdGVyYXRpb24uXG4gICAgICAgIHZhciBjb2x1bW5TdGF0c0NhY2hlOntbYXR0cmlidXRlOnN0cmluZ106SUNvbHVtblN0YXRzfSA9IHt9O1xuICAgICAgICBhdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oYXR0cjpzdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbHVtblN0YXRzQ2FjaGVbYXR0cl0gPSB7XG4gICAgICAgICAgICAgICAgbWluOiBfLm1pbihfLnBsdWNrKHJlY29yZHMsIGF0dHIpKSxcbiAgICAgICAgICAgICAgICBtYXg6IF8ubWF4KF8ucGx1Y2socmVjb3JkcywgYXR0cikpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVjb3Jkcy5tYXAoZnVuY3Rpb24ocmVjb3JkOmFueSkge1xuXG4gICAgICAgICAgICB2YXIgb2JqOmFueSA9IHt9O1xuXG4gICAgICAgICAgICBhdHRyaWJ1dGVzLmZvckVhY2goZnVuY3Rpb24oYXR0cjpzdHJpbmcpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWluOm51bWJlciA9IGNvbHVtblN0YXRzQ2FjaGVbYXR0cl0ubWluO1xuICAgICAgICAgICAgICAgIHZhciBtYXg6bnVtYmVyID0gY29sdW1uU3RhdHNDYWNoZVthdHRyXS5tYXg7XG5cbiAgICAgICAgICAgICAgICBpZighbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSAwO1xuXG4gICAgICAgICAgICAgICAgaWYobWF4IC0gbWluID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKHJlY29yZFthdHRyXSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggKHJlY29yZFthdHRyXSAtIG1pbikgLyAobWF4IC0gbWluKSk7XG4gICAgICAgICAgICAgICAgICAgIG9ialthdHRyXSA9IChyZWNvcmRbYXR0cl0gLSBtaW4pIC8gKG1heCAtIG1pbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgYW55IG9mIHRoZSB2YWx1ZSBhYm92ZSBpcyBudWxsIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuJ3Qgbm9ybWFsaXplXG4gICAgICAgICAgICAgICAgICAgIG9ialthdHRyXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGF0YUNoYW5nZWQoKSB7XG5cbiAgICAgICAgbGV0IG51bWVyaWNNYXBwaW5nOmFueSA9IHtcbiAgICAgICAgICAgIHBvaW50OiB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy5wYXRocy5kYXRhWCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnBhdGhzLmRhdGFZXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2l6ZTogdGhpcy5wYXRocy5zaXplQnlcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgc3RyaW5nTWFwcGluZzphbnkgPSB7XG4gICAgICAgICAgICBwb2ludDoge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMucGF0aHMuZGF0YVgsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5wYXRocy5kYXRhWVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbGw6IHtcbiAgICAgICAgICAgICAgICAvL2FscGhhOiB0aGlzLl9maWxsU3R5bGVQYXRoLnB1c2goXCJhbHBoYVwiKSxcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhpcy5wYXRocy5maWxsLnB1c2goXCJjb2xvclwiKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICAvL2FscGhhOiB0aGlzLl9saW5lU3R5bGVQYXRoLnB1c2goXCJhbHBoYVwiKSxcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhpcy5wYXRocy5saW5lLnB1c2goXCJjb2xvclwiKVxuICAgICAgICAgICAgICAgIC8vY2FwczogdGhpcy5fbGluZVN0eWxlUGF0aC5wdXNoKFwiY2Fwc1wiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGF0YVhUeXBlID0gdGhpcy5wYXRocy5kYXRhWC5nZXRPYmplY3QoKS5nZXRNZXRhZGF0YSgnZGF0YVR5cGUnKTtcbiAgICAgICAgdGhpcy5kYXRhWVR5cGUgPSB0aGlzLnBhdGhzLmRhdGFZLmdldE9iamVjdCgpLmdldE1ldGFkYXRhKCdkYXRhVHlwZScpO1xuXG4gICAgICAgIHRoaXMubnVtZXJpY1JlY29yZHMgPSB0aGlzLnBhdGhzLnBsb3R0ZXIucmV0cmlldmVSZWNvcmRzKG51bWVyaWNNYXBwaW5nLCB7a2V5U2V0OiB0aGlzLnBhdGhzLmZpbHRlcmVkS2V5U2V0LCBkYXRhVHlwZTogXCJudW1iZXJcIn0pO1xuICAgICAgICBpZighdGhpcy5udW1lcmljUmVjb3Jkcy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuc3RyaW5nUmVjb3JkcyA9IHRoaXMucGF0aHMucGxvdHRlci5yZXRyaWV2ZVJlY29yZHMoc3RyaW5nTWFwcGluZywge2tleVNldDogdGhpcy5wYXRocy5maWx0ZXJlZEtleVNldCwgZGF0YVR5cGU6IFwic3RyaW5nXCJ9KTtcblxuICAgICAgICB0aGlzLnJlY29yZHMgPSBfLnppcCh0aGlzLm51bWVyaWNSZWNvcmRzLCB0aGlzLnN0cmluZ1JlY29yZHMpO1xuICAgICAgICB0aGlzLnJlY29yZHMgPSBfLnNvcnRCeU9yZGVyKHRoaXMucmVjb3JkcywgW1wic2l6ZVwiLCBcImlkXCJdLCBbXCJkZXNjXCIsIFwiYXNjXCJdKTtcblxuICAgICAgICBpZih3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KSB7XG4gICAgICAgICAgICB0aGlzLnJlY29yZHMgPSB0aGlzLnJlY29yZHMucmV2ZXJzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5yZWNvcmRzLmxlbmd0aClcbiAgICAgICAgICAgIFt0aGlzLm51bWVyaWNSZWNvcmRzLCB0aGlzLnN0cmluZ1JlY29yZHNdID0gXy51bnppcCh0aGlzLnJlY29yZHMpO1xuXG4gICAgICAgIHRoaXMua2V5VG9JbmRleCA9IHt9O1xuICAgICAgICB0aGlzLmluZGV4VG9LZXkgPSB7fTtcbiAgICAgICAgdGhpcy55QXhpc1ZhbHVlVG9MYWJlbCA9IHt9O1xuICAgICAgICB0aGlzLnhBeGlzVmFsdWVUb0xhYmVsID0ge307XG5cbiAgICAgICAgdGhpcy5udW1lcmljUmVjb3Jkcy5mb3JFYWNoKChyZWNvcmQ6UmVjb3JkLCBpbmRleDpudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHRoaXMua2V5VG9JbmRleFtyZWNvcmQuaWQgYXMgYW55XSA9IGluZGV4O1xuICAgICAgICAgICAgdGhpcy5pbmRleFRvS2V5W2luZGV4XSA9IHJlY29yZC5pZDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zdHJpbmdSZWNvcmRzLmZvckVhY2goKHJlY29yZDphbnksIGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgdGhpcy54QXhpc1ZhbHVlVG9MYWJlbFsodGhpcy5udW1lcmljUmVjb3Jkc1tpbmRleF1bXCJwb2ludFwiXSBhcyBSZWNvcmQpW1wieFwiXSBhcyBudW1iZXJdID0gKHJlY29yZFtcInBvaW50XCJdIGFzIFJlY29yZClbXCJ4XCJdIGFzIHN0cmluZztcbiAgICAgICAgICAgIHRoaXMueUF4aXNWYWx1ZVRvTGFiZWxbKHRoaXMubnVtZXJpY1JlY29yZHNbaW5kZXhdW1wicG9pbnRcIl0gYXMgUmVjb3JkKVtcInlcIl0gYXMgbnVtYmVyXSA9IChyZWNvcmRbXCJwb2ludFwiXSBhcyBSZWNvcmQpW1wieVwiXSBhcyBzdHJpbmc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubm9ybWFsaXplZFJlY29yZHMgPSB0aGlzLm5vcm1hbGl6ZVJlY29yZHModGhpcy5udW1lcmljUmVjb3JkcywgW1wic2l6ZVwiXSk7XG4gICAgICAgIHRoaXMucGxvdHRlclN0YXRlID0gdGhpcy5wYXRocy5wbG90dGVyLmdldFVudHlwZWRTdGF0ZSA/IHRoaXMucGF0aHMucGxvdHRlci5nZXRVbnR5cGVkU3RhdGUoKSA6IHRoaXMucGF0aHMucGxvdHRlci5nZXRTdGF0ZSgpO1xuICAgICAgICB0aGlzLm5vcm1hbGl6ZWRQb2ludFNpemVzID0gdGhpcy5ub3JtYWxpemVkUmVjb3Jkcy5tYXAoKG5vcm1hbGl6ZWRSZWNvcmQ6UmVjb3JkKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLnBsb3R0ZXJTdGF0ZSAmJiB0aGlzLnBsb3R0ZXJTdGF0ZS5zaXplQnkpIHtcbiAgICAgICAgICAgICAgICBsZXQgbWluU2NyZWVuUmFkaXVzID0gdGhpcy5wbG90dGVyU3RhdGUubWluU2NyZWVuUmFkaXVzO1xuICAgICAgICAgICAgICAgIGxldCBtYXhTY3JlZW5SYWRpdXMgPSB0aGlzLnBsb3R0ZXJTdGF0ZS5tYXhTY3JlZW5SYWRpdXM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChub3JtYWxpemVkUmVjb3JkICYmIG5vcm1hbGl6ZWRSZWNvcmRbXCJzaXplXCJdID9cbiAgICAgICAgICAgICAgICAgICAgbWluU2NyZWVuUmFkaXVzICsgbm9ybWFsaXplZFJlY29yZFtcInNpemVcIl0gYXMgbnVtYmVyICogKG1heFNjcmVlblJhZGl1cyAtIG1pblNjcmVlblJhZGl1cykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbG90dGVyU3RhdGUuZGVmYXVsdFNjcmVlblJhZGl1cykgfHwgMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5wbG90dGVyU3RhdGUuZGVmYXVsdFNjcmVlblJhZGl1cykgfHwgMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2soZXZlbnQ6TW91c2VFdmVudCk6dm9pZCB7XG4gICAgICAgIGlmKCF0aGlzLmZsYWcpIHtcbiAgICAgICAgICAgIHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5zZXRLZXlzKFtdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZsYWcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB1cGRhdGVTdHlsZSgpXG4gICAge1xuICAgIFx0aWYgKCF0aGlzLmNoYXJ0IHx8ICF0aGlzLmRhdGFYVHlwZSlcbiAgICBcdFx0cmV0dXJuO1xuICAgIFx0XG4gICAgICAgIGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpXG5cdCAgICAgICAgLnNlbGVjdEFsbChcImNpcmNsZVwiKVxuXHQgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSlcbiAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZVwiLCBcImJsYWNrXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2Utb3BhY2l0eVwiLCAwLjApXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwxLjApO1xuXG4gICAgICAgIHZhciBzZWxlY3RlZEtleXM6c3RyaW5nW10gPSB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuZ2V0S2V5cygpO1xuICAgICAgICB2YXIgcHJvYmVkS2V5czpzdHJpbmdbXSA9IHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmdldEtleXMoKTtcbiAgICAgICAgdmFyIHNlbGVjdGVkSW5kaWNlczpudW1iZXJbXSA9IHNlbGVjdGVkS2V5cy5tYXAoKGtleTpzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIodGhpcy5rZXlUb0luZGV4W2tleV0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHByb2JlZEluZGljZXM6bnVtYmVyW10gPSBwcm9iZWRLZXlzLm1hcCgoa2V5OnN0cmluZykgPT4ge1xuICAgICAgICAgICByZXR1cm4gTnVtYmVyKHRoaXMua2V5VG9JbmRleFtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBrZXlzOnN0cmluZ1tdID0gT2JqZWN0LmtleXModGhpcy5rZXlUb0luZGV4KTtcbiAgICAgICAgdmFyIGluZGljZXM6bnVtYmVyW10gPSBrZXlzLm1hcCgoa2V5OnN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlcih0aGlzLmtleVRvSW5kZXhba2V5XSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB1bnNlbGVjdGVkSW5kaWNlczpudW1iZXJbXSA9IF8uZGlmZmVyZW5jZShpbmRpY2VzLCBzZWxlY3RlZEluZGljZXMpO1xuICAgICAgICB1bnNlbGVjdGVkSW5kaWNlcyA9IF8uZGlmZmVyZW5jZSh1bnNlbGVjdGVkSW5kaWNlcyxwcm9iZWRJbmRpY2VzKTtcbiAgICAgICAgaWYgKHByb2JlZEluZGljZXMubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbVN0eWxlKHByb2JlZEluZGljZXMsIFwiY2lyY2xlXCIsIFwiLmMzLXNoYXBlXCIsIHtvcGFjaXR5OjEuMCwgXCJzdHJva2Utb3BhY2l0eVwiOiAwLjUsIFwic3Ryb2tlLXdpZHRoXCI6IDEuNX0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxlY3RlZEluZGljZXMubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbVN0eWxlKHVuc2VsZWN0ZWRJbmRpY2VzLCBcImNpcmNsZVwiLCBcIi5jMy1zaGFwZVwiLCB7b3BhY2l0eTogMC4zLCBcInN0cm9rZS1vcGFjaXR5XCI6IDAuMH0pO1xuICAgICAgICAgICAgdGhpcy5jdXN0b21TdHlsZShzZWxlY3RlZEluZGljZXMsIFwiY2lyY2xlXCIsIFwiLmMzLXNoYXBlXCIsIHtvcGFjaXR5OiAxLjAsIFwic3Ryb2tlLW9wYWNpdHlcIjogMS4wfSk7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0LnNlbGVjdChbXCJ5XCJdLCBzZWxlY3RlZEluZGljZXMsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFwcm9iZWRJbmRpY2VzLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXN0b21TdHlsZShpbmRpY2VzLCBcImNpcmNsZVwiLCBcIi5jMy1zaGFwZVwiLCB7b3BhY2l0eTogMS4wLCBcInN0cm9rZS1vcGFjaXR5XCI6IDAuMH0pO1xuICAgICAgICAgICAgdGhpcy5jaGFydC5zZWxlY3QoW1wieVwiXSwgW10sIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICBpZih0aGlzLmMzQ29uZmlnLnNpemUud2lkdGggIT0gdGhpcy5wcm9wcy5zdHlsZS53aWR0aCB8fCB0aGlzLmMzQ29uZmlnLnNpemUuaGVpZ2h0ICE9IHRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnNpemUgPSB7d2lkdGg6IHRoaXMucHJvcHMuc3R5bGUud2lkdGgsIGhlaWdodDogdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHR9O1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvKiBDbGVhbnVwIGNhbGxiYWNrcyAqL1xuICAgICAgICAvL3RoaXMudGVhcmRvd25DYWxsYmFja3MoKTtcbiAgICAgICAgdGhpcy5jaGFydC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcblxuICAgICAgICB2YXIgcGxvdHRlclBhdGggPSB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwicGxvdFwiKTtcbiAgICAgICAgdmFyIG1hcHBpbmcgPSBbXG4gICAgICAgICAgICB7IG5hbWU6IFwicGxvdHRlclwiLCBwYXRoOiBwbG90dGVyUGF0aCwgY2FsbGJhY2tzOiB0aGlzLnZhbGlkYXRlfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJkYXRhWFwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiZGF0YVhcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJkYXRhWVwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiZGF0YVlcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJzaXplQnlcIiwgcGF0aDogcGxvdHRlclBhdGgucHVzaChcInNpemVCeVwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImZpbGxcIiwgcGF0aDogcGxvdHRlclBhdGgucHVzaChcImZpbGxcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJsaW5lXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJsaW5lXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwieEF4aXNcIiwgcGF0aDogdGhpcy50b29sUGF0aC5wdXNoUGxvdHRlcihcInhBeGlzXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwieUF4aXNcIiwgcGF0aDogdGhpcy50b29sUGF0aC5wdXNoUGxvdHRlcihcInlBeGlzXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwibWFyZ2luQm90dG9tXCIsIHBhdGg6IHRoaXMucGxvdE1hbmFnZXJQYXRoLnB1c2goXCJtYXJnaW5Cb3R0b21cIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5MZWZ0XCIsIHBhdGg6IHRoaXMucGxvdE1hbmFnZXJQYXRoLnB1c2goXCJtYXJnaW5MZWZ0XCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwibWFyZ2luVG9wXCIsIHBhdGg6IHRoaXMucGxvdE1hbmFnZXJQYXRoLnB1c2goXCJtYXJnaW5Ub3BcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5SaWdodFwiLCBwYXRoOiB0aGlzLnBsb3RNYW5hZ2VyUGF0aC5wdXNoKFwibWFyZ2luUmlnaHRcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJmaWx0ZXJlZEtleVNldFwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiZmlsdGVyZWRLZXlTZXRcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJzZWxlY3Rpb25LZXlTZXRcIiwgcGF0aDogdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LCBjYWxsYmFja3M6IHRoaXMudXBkYXRlU3R5bGUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJwcm9iZUtleVNldFwiLCBwYXRoOiB0aGlzLnRvb2xQYXRoLnByb2JlX2tleXNldCwgY2FsbGJhY2tzOiB0aGlzLnVwZGF0ZVN0eWxlIH1cbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVQYXRocyhtYXBwaW5nKTtcblxuICAgICAgICB0aGlzLnBhdGhzLmZpbHRlcmVkS2V5U2V0LmdldE9iamVjdCgpLnNldENvbHVtbktleVNvdXJjZXMoW3RoaXMucGF0aHMuZGF0YVguZ2V0T2JqZWN0KCksIHRoaXMucGF0aHMuZGF0YVkuZ2V0T2JqZWN0KCldKTtcblxuICAgICAgICB0aGlzLmMzQ29uZmlnLmJpbmR0byA9IHRoaXMuZWxlbWVudDtcbiAgICAgICAgdGhpcy52YWxpZGF0ZSh0cnVlKTtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZShmb3JjZWQ6Ym9vbGVhbiA9IGZhbHNlKTp2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5idXN5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGNoYW5nZURldGVjdGVkOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgdmFyIGF4aXNDaGFuZ2U6Ym9vbGVhbiA9IHRoaXMuZGV0ZWN0Q2hhbmdlKCdkYXRhWCcsICdkYXRhWScsICdtYXJnaW5Cb3R0b20nLCAnbWFyZ2luVG9wJywgJ21hcmdpbkxlZnQnLCAnbWFyZ2luUmlnaHQnKTtcbiAgICAgICAgdmFyIGF4aXNTZXR0aW5nc0NoYW5nZTpib29sZWFuID0gdGhpcy5kZXRlY3RDaGFuZ2UoJ3hBeGlzJywgJ3lBeGlzJyk7XG4gICAgICAgIGlmIChheGlzQ2hhbmdlIHx8IHRoaXMuZGV0ZWN0Q2hhbmdlKCdwbG90dGVyJywgJ3NpemVCeScsICdmaWxsJywgJ2xpbmUnLCdmaWx0ZXJlZEtleVNldCcpKVxuICAgICAgICB7XG4gICAgICAgICAgICBjaGFuZ2VEZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmRhdGFDaGFuZ2VkKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF4aXNDaGFuZ2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNoYW5nZURldGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciB4TGFiZWw6c3RyaW5nID0gdGhpcy5wYXRocy54QXhpcy5wdXNoKFwib3ZlcnJpZGVBeGlzTmFtZVwiKS5nZXRTdGF0ZSgpIHx8IHRoaXMucGF0aHMuZGF0YVguZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG4gICAgICAgICAgICB2YXIgeUxhYmVsOnN0cmluZyA9IHRoaXMucGF0aHMueUF4aXMucHVzaChcIm92ZXJyaWRlQXhpc05hbWVcIikuZ2V0U3RhdGUoKSB8fCB0aGlzLnBhdGhzLmRhdGFZLmdldE9iamVjdCgpLmdldE1ldGFkYXRhKCd0aXRsZScpO1xuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLm51bWVyaWNSZWNvcmRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB0ZW1wOnN0cmluZyA9IFwieVwiO1xuICAgICAgICAgICAgICAgIGlmICh3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KVxuICAgICAgICAgICAgICAgIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmRhdGEuYXhlcyA9IHtbdGVtcF06J3kyJ307XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55MiA9IHRoaXMuYzNDb25maWdZQXhpcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLnkgPSB7c2hvdzogZmFsc2V9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC50aWNrLnJvdGF0ZSA9IDQ1O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuZGF0YS5heGVzID0ge1t0ZW1wXToneSd9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueSA9IHRoaXMuYzNDb25maWdZQXhpcztcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuYzNDb25maWcuYXhpcy55MjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLngudGljay5yb3RhdGUgPSAtNDU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC5sYWJlbCA9IHt0ZXh0OnhMYWJlbCwgcG9zaXRpb246XCJvdXRlci1jZW50ZXJcIn07XG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnWUF4aXMubGFiZWwgPSB7dGV4dDp5TGFiZWwsIHBvc2l0aW9uOlwib3V0ZXItbWlkZGxlXCJ9O1xuXG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnBhZGRpbmcudG9wID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luVG9wLmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLnguaGVpZ2h0ID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luQm90dG9tLmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgaWYod2VhdmVqcy5XZWF2ZUFQSS5Mb2NhbGUucmV2ZXJzZUxheW91dCl7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5wYWRkaW5nLmxlZnQgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5SaWdodC5nZXRTdGF0ZSgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnBhZGRpbmcucmlnaHQgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5MZWZ0LmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5wYWRkaW5nLmxlZnQgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5MZWZ0LmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy5yaWdodCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpblJpZ2h0LmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYW5nZURldGVjdGVkIHx8IGZvcmNlZClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5idXN5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2hhcnQgPSBjMy5nZW5lcmF0ZSh0aGlzLmMzQ29uZmlnKTtcbiAgICAgICAgICAgIHRoaXMubG9hZERhdGEoKTtcbiAgICAgICAgICAgIHRoaXMuY3VsbEF4ZXMoKTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9hZERhdGEoKSB7XG4gICAgICAgIGlmKCF0aGlzLmNoYXJ0IHx8IHRoaXMuYnVzeSlcbiAgICAgICAgICAgIHJldHVybiBTdGFuZGFyZExpYi5kZWJvdW5jZSh0aGlzLCAnbG9hZERhdGEnKTtcbiAgICAgICAgdGhpcy5jaGFydC5sb2FkKHtkYXRhOiBfLnBsdWNrKHRoaXMubnVtZXJpY1JlY29yZHMsIFwicG9pbnRcIiksIHVubG9hZDogdHJ1ZX0pO1xuICAgICAgICAvL2FmdGVyIGRhdGEgaXMgbG9hZGVkIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBjbGlwLXBhdGggc28gdGhhdCBwb2ludHMgYXJlIG5vdFxuICAgICAgICAvLyBjbGlwcGVkIHdoZW4gcmVuZGVyZWQgbmVhciBlZGdlIG9mIGNoYXJ0XG4gICAgICAgIC8vVE9ETzogZGV0ZXJtaW5lIGlmIGFkZGluZyBwYWRkaW5nIHRvIGF4ZXMgcmFuZ2Ugd2lsbCBmdXJ0aGVyIGltcHJvdmUgYWVzdGhldGljcyBvZiBjaGFydFxuICAgICAgICB0aGlzLmNoYXJ0LmludGVybmFsLm1haW4uc2VsZWN0KCcuYzMtY2hhcnQnKS5hdHRyKCdjbGlwLXBhdGgnLG51bGwpO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFdlYXZlQzNTY2F0dGVyUGxvdDtcblxucmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb24oXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnRvb2xzOjpTY2F0dGVyUGxvdFRvb2xcIiwgV2VhdmVDM1NjYXR0ZXJQbG90KTtcbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlanMudG9vbHMuU2NhdHRlclBsb3RUb29sXCIsIFdlYXZlQzNTY2F0dGVyUGxvdCwgW3dlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlT2JqZWN0V2l0aE5ld1Byb3BlcnRpZXNdKTtcbiJdfQ==
