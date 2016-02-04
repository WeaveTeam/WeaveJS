"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _AbstractC3Tool2 = require("./AbstractC3Tool");

var _AbstractC3Tool3 = _interopRequireDefault(_AbstractC3Tool2);

var _WeaveTool = require("../WeaveTool");

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _FormatUtils = require("../utils/FormatUtils");

var _FormatUtils2 = _interopRequireDefault(_FormatUtils);

var _c = require("c3");

var c3 = _interopRequireWildcard(_c);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

var WeaveC3LineChart = function (_AbstractC3Tool) {
    _inherits(WeaveC3LineChart, _AbstractC3Tool);

    function WeaveC3LineChart(props) {
        _classCallCheck(this, WeaveC3LineChart);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveC3LineChart).call(this, props));

        _this.busy = false;
        _this.keyToIndex = {};
        _this.indexToKey = {};
        _this.yAxisValueToLabel = {};
        _this.columns = [];
        _this.validate = _.debounce(_this.validate.bind(_this), 30);
        _this.c3ConfigYAxis = {
            show: true,
            tick: {
                multiline: true,
                format: function format(num) {
                    if (_this.yLabelColumnPath && _this.yLabelColumnPath.getValue("this.getMetadata('dataType')") !== "number") {
                        return _this.yAxisValueToLabel[num] || "";
                    } else {
                        return String(_FormatUtils2.default.defaultNumberFormatting(num));
                    }
                }
            }
        };
        _this.c3Config = {
            size: {
                width: _this.props.style.width,
                height: _this.props.style.height
            },
            padding: {
                top: 20,
                bottom: 0,
                left: 100,
                right: 20
            },
            data: {
                columns: [],
                xSort: false,
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                onclick: function onclick(d) {
                    var event = _this.chart.internal.d3.event;
                    if (!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.setKeys([d.id]);
                    }
                },
                onselected: function onselected(d) {
                    _this.flag = true;
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.addKeys([d.id]);
                    }
                },
                onunselected: function onunselected(d) {
                    _this.flag = true;
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.removeKeys([d.id]);
                    }
                },
                onmouseover: function onmouseover(d) {
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.probe_keyset.setKeys([d.id]);
                    }
                    var columnNamesToValue = {};
                    var lineIndex = _.findIndex(_this.numericRecords, function (record) {
                        return record["id"].toString() == d.id;
                    });
                    _this.columnLabels.forEach(function (label, index, array) {
                        if (_this.numericRecords && _this.numericRecords[lineIndex]) {
                            columnNamesToValue[label] = _this.numericRecords[lineIndex]["columns"][index];
                        }
                    });
                    _this.props.toolTip.setState({
                        x: _this.chart.internal.d3.event.pageX,
                        y: _this.chart.internal.d3.event.pageY,
                        showToolTip: true,
                        columnNamesToValue: columnNamesToValue
                    });
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
            tooltip: {
                show: false
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            axis: {
                x: {
                    tick: {
                        culling: {
                            max: null
                        },
                        multiline: false,
                        rotate: -45,
                        format: function format(d) {
                            if (weavejs.WeaveAPI.Locale.reverseLayout) {
                                //handle case where labels need to be reversed
                                var temp = _this.columnLabels.length - 1;
                                return _this.columnLabels[temp - d];
                            } else {
                                return _this.columnLabels[d];
                            }
                        }
                    }
                }
            },
            bindto: null,
            legend: {
                show: false
            },
            onrendered: function onrendered() {
                _this.busy = false;
                _this.updateStyle();
                if (_this.dirty) _this.validate();
            }
        };
        return _this;
    }

    _createClass(WeaveC3LineChart, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "updateStyle",
        value: function updateStyle() {
            var _this2 = this;

            if (!this.chart) return;
            d3.select(this.element).selectAll("circle").style("opacity", 1).style("stroke", "black").style("stroke-opacity", 0.0);
            var selectedKeys = this.toolPath.selection_keyset.getKeys();
            var probedKeys = this.toolPath.probe_keyset.getKeys();
            var selectedIndices = selectedKeys.map(function (key) {
                return Number(_this2.keyToIndex[key]);
            });
            var probedIndices = probedKeys.map(function (key) {
                return Number(_this2.keyToIndex[key]);
            });
            var keys = Object.keys(this.keyToIndex);
            var indices = keys.map(function (key) {
                return Number(_this2.keyToIndex[key]);
            });
            var unselectedIndices = _.difference(indices, selectedIndices);
            unselectedIndices = _.difference(unselectedIndices, probedIndices);
            if (probedIndices.length) {
                //unfocus all circles
                //d3.select(this.element).selectAll("circle").filter(".c3-shape").style({opacity: 0.1, "stroke-opacity": 0.0});
                var filtered = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape");
                probedIndices.forEach(function (index) {
                    //custom style for circles on probed lines
                    var circleCount = filtered[index] ? filtered[index].length : 0;
                    var probedCircles = _.range(0, circleCount);
                    probedCircles.forEach(function (i) {
                        filtered[index][i].style.opacity = "1.0";
                        filtered[index][i].style.strokeOpacity = "0.0";
                    });
                });
                this.customStyle(probedIndices, "path", ".c3-shape.c3-line", { opacity: 1.0 });
            }
            if (selectedIndices.length) {
                //unfocus all circles
                d3.select(this.element).selectAll("circle").filter(".c3-shape").style("opacity", "0.1");
                var filtered = d3.select(this.element).selectAll("g").filter(".c3-chart-line").selectAll("circle").filter(".c3-shape");
                selectedIndices.forEach(function (index) {
                    //custom style for circles on selected lines
                    var circleCount = filtered[index] ? filtered[index].length : 0;
                    var selectedCircles = _.range(0, circleCount);
                    selectedCircles.forEach(function (i) {
                        filtered[index][i].style.opacity = "1.0";
                        filtered[index][i].style.strokeOpacity = "1.0";
                    });
                });
                this.customStyle(unselectedIndices, "path", ".c3-shape.c3-line", { opacity: 0.1 });
                this.customStyle(selectedIndices, "path", ".c3-shape.c3-line", { opacity: 1.0 });
                this.chart.select(["y"], selectedIndices, true);
            } else if (!probedIndices.length) {
                //focus all circles
                d3.select(this.element).selectAll("circle").filter(".c3-shape").style({ opacity: 1.0, "stroke-opacity": 0.0 });
                this.customStyle(indices, "path", ".c3-shape.c3-line", { opacity: 1.0 });
                this.chart.select(["y"], [], true);
            }
        }
    }, {
        key: "dataChanged",
        value: function dataChanged() {
            var _this3 = this;

            this.columnLabels = [];
            this.columnNames = [];
            var children = this.paths.columns.getChildren();
            this.yLabelColumnPath = children[0];
            var numericMapping = {
                columns: children,
                yLabel: this.yLabelColumnPath
            };
            var stringMapping = {
                columns: children,
                line: {
                    //alpha: this._lineStylePath.push("alpha"),
                    color: this.paths.lineStyle.push("color")
                },
                yLabel: this.yLabelColumnPath
            };
            for (var idx in children) {
                var child = children[idx];
                var title = child.getObject().getMetadata('title');
                var name = child.getPath().pop();
                this.columnLabels.push(title);
                this.columnNames.push(name);
            }
            this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, { keySet: this.paths.filteredKeySet, dataType: "number" });
            this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, { keySet: this.paths.filteredKeySet, dataType: "string" });
            this.records = _.zip(this.numericRecords, this.stringRecords);
            this.records = _.sortBy(this.records, [0, "id"]);
            if (this.records.length) {
                ;

                var _$unzip = _.unzip(this.records);

                var _$unzip2 = _slicedToArray(_$unzip, 2);

                this.numericRecords = _$unzip2[0];
                this.stringRecords = _$unzip2[1];
            }this.keyToIndex = {};
            this.indexToKey = {};
            this.yAxisValueToLabel = {};
            this.numericRecords.forEach(function (record, index) {
                _this3.keyToIndex[record.id] = index;
                _this3.indexToKey[index] = record.id;
            });
            this.stringRecords.forEach(function (record, index) {
                var numericRecord = _this3.numericRecords[index];
                _this3.yAxisValueToLabel[numericRecord["yLabel"]] = record["yLabel"];
            });
            this.columns = this.numericRecords.map(function (record) {
                var tempArr = [];
                tempArr.push(record["id"]);
                _.keys(record["columns"]).forEach(function (key) {
                    tempArr.push(record["columns"][key]);
                });
                return tempArr;
            });
            this.colors = {};
            this.stringRecords.forEach(function (record) {
                _this3.colors[record.id] = record["line"]["color"] || "#C0CDD1";
            });
            this.chartType = "line";
            if (this.paths.plotter.push("curveType").getState() === "double") {
                this.chartType = "spline";
            }
            if (weavejs.WeaveAPI.Locale.reverseLayout) {
                this.columns.forEach(function (column, index, array) {
                    var temp = [];
                    temp.push(column.shift());
                    column = column.reverse();
                    column.forEach(function (item) {
                        temp.push(item);
                    });
                    array[index] = temp;
                });
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
            var mapping = [{ name: "plotter", path: plotterPath, callbacks: this.validate }, { name: "columns", path: plotterPath.push("columns") }, { name: "lineStyle", path: plotterPath.push("lineStyle") }, { name: "curveType", path: plotterPath.push("curveType") }, { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") }, { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") }, { name: "marginTop", path: this.plotManagerPath.push("marginTop") }, { name: "marginRight", path: this.plotManagerPath.push("marginRight") }, { name: "overrideYMax", path: this.plotManagerPath.push("overrideYMax") }, { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") }, { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle }, { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.updateStyle }];
            this.initializePaths(mapping);
            this.paths.filteredKeySet.getObject().setColumnKeySources(this.paths.columns.getObject().getObjects());
            this.c3Config.bindto = this.element;
            this.validate(true);
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
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (this.c3Config.size.width != this.props.style.width || this.c3Config.size.height != this.props.style.height) {
                this.c3Config.size = { width: this.props.style.width, height: this.props.style.height };
                this.validate(true);
            }
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
            var axisChange = this.detectChange('columns', 'overrideYMax');
            if (axisChange || this.detectChange('plotter', 'curveType', 'lineStyle', 'filteredKeySet')) {
                changeDetected = true;
                this.dataChanged();
            }
            if (axisChange) {
                changeDetected = true;
                var xLabel = " "; //this.paths.xAxis.push("overrideAxisName").getState() || this.paths.dataX.getObject().getMetadata('title');
                var yLabel = " "; //this.paths.yAxis.push("overrideAxisName").getState() || this.paths.dataY.getObject().getMetadata('title');
                if (this.numericRecords) {
                    var temp = {};
                    if (weavejs.WeaveAPI.Locale.reverseLayout) {
                        this.stringRecords.forEach(function (record) {
                            temp[record["id"].toString()] = 'y2';
                        });
                        this.c3Config.data.axes = temp;
                        this.c3Config.axis.y2 = this.c3ConfigYAxis;
                        this.c3Config.axis.y = { show: false };
                        this.c3Config.axis.x.tick.rotate = 45;
                    } else {
                        this.stringRecords.forEach(function (record) {
                            temp[record["id"].toString()] = 'y';
                        });
                        this.c3Config.data.axes = temp;
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
                if (!isNaN(this.paths.overrideYMax.getState())) {
                    this.c3Config.axis.y.max = this.paths.overrideYMax.getState();
                } else {
                    this.c3Config.axis.y.max = null;
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
            this.chart.load({ columns: this.columns, colors: this.colors, type: this.chartType, unload: true });
        }
    }]);

    return WeaveC3LineChart;
}(_AbstractC3Tool3.default);

exports.default = WeaveC3LineChart;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::LineChartTool", WeaveC3LineChart);
//Weave.registerClass("weavejs.tools.LineChartTool", WeaveC3LineChart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtYzMtbGluZWNoYXJ0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyY3RzL3Rvb2xzL3dlYXZlLWMzLWxpbmVjaGFydC50c3giXSwibmFtZXMiOlsiV2VhdmVDM0xpbmVDaGFydCIsIldlYXZlQzNMaW5lQ2hhcnQuY29uc3RydWN0b3IiLCJXZWF2ZUMzTGluZUNoYXJ0LmhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzIiwiV2VhdmVDM0xpbmVDaGFydC51cGRhdGVTdHlsZSIsIldlYXZlQzNMaW5lQ2hhcnQuZGF0YUNoYW5nZWQiLCJXZWF2ZUMzTGluZUNoYXJ0LmNvbXBvbmVudFdpbGxVbm1vdW50IiwiV2VhdmVDM0xpbmVDaGFydC5jb21wb25lbnREaWRNb3VudCIsIldlYXZlQzNMaW5lQ2hhcnQuaGFuZGxlQ2xpY2siLCJXZWF2ZUMzTGluZUNoYXJ0LmNvbXBvbmVudERpZFVwZGF0ZSIsIldlYXZlQzNMaW5lQ2hhcnQudmFsaWRhdGUiLCJXZWF2ZUMzTGluZUNoYXJ0LmxvYWREYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFVWSxBQUFFLEFBQU0sQUFBSSxBQUNqQjs7OztJQUFLLEFBQUMsQUFBTSxBQUFRLEFBQ3BCLEFBQVcsQUFBTSxBQUFzQixBQUV2Qzs7Ozs7Ozs7SUFBSyxBQUFFLEFBQU0sQUFBSSxBQUtqQixBQUFXLEFBQU0sQUFBc0IsQUFXOUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQStCLEFBQWM7OztBQXdCekMsOEJBQVksQUFBbUI7Ozt3R0FDckIsQUFBSyxBQUFDLEFBQUM7O0FBQ2IsQUFBSSxjQUFDLEFBQUksT0FBRyxBQUFLLEFBQUM7QUFDbEIsQUFBSSxjQUFDLEFBQVUsYUFBRyxBQUFFLEFBQUM7QUFDckIsQUFBSSxjQUFDLEFBQVUsYUFBRyxBQUFFLEFBQUM7QUFDckIsQUFBSSxjQUFDLEFBQWlCLG9CQUFHLEFBQUUsQUFBQztBQUM1QixBQUFJLGNBQUMsQUFBTyxV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QUksTUFBRSxBQUFJLEtBQUMsQUFBUyxXQUFFLEFBQU0sUUFBRSxBQUFJLEFBQUMsQUFBQyxBQUFDLEFBQ3RHLEFBQUMsQUFDTCxBQUFDLEFBS0Q7Ozs7Ozs7a0JBQWUsQUFBZ0IsQUFBQzs7QUFFaEMsQUFBMEIsMkNBQUMsQUFBMEMsNENBQUUsQUFBZ0IsQUFBQyxBQUFDLEFBQ3pGLEFBQTRIIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9jMy9jMy5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9kMy9kMy5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3dlYXZlL3dlYXZlanMuZC50c1wiLz5cblxuaW1wb3J0IHtJVmlzVG9vbFByb3BzfSBmcm9tIFwiLi9JVmlzVG9vbFwiO1xuaW1wb3J0IHtJVG9vbFBhdGhzfSBmcm9tIFwiLi9BYnN0cmFjdEMzVG9vbFwiO1xuaW1wb3J0IEFic3RyYWN0QzNUb29sIGZyb20gXCIuL0Fic3RyYWN0QzNUb29sXCI7XG5pbXBvcnQge3JlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi4vV2VhdmVUb29sXCI7XG5pbXBvcnQgKiBhcyBkMyBmcm9tIFwiZDNcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IEZvcm1hdFV0aWxzIGZyb20gXCIuLi91dGlscy9Gb3JtYXRVdGlsc1wiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjMyBmcm9tIFwiYzNcIjtcbmltcG9ydCB7Q2hhcnRDb25maWd1cmF0aW9uLCBDaGFydEFQSX0gZnJvbSBcImMzXCI7XG5pbXBvcnQge01vdXNlRXZlbnR9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtnZXRUb29sdGlwQ29udGVudH0gZnJvbSBcIi4vdG9vbHRpcFwiO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSBcIi4vdG9vbHRpcFwiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuLi91dGlscy9TdGFuZGFyZExpYlwiO1xuXG5pbXBvcnQgSVF1YWxpZmllZEtleSA9IHdlYXZlanMuYXBpLmRhdGEuSVF1YWxpZmllZEtleTtcblxuaW50ZXJmYWNlIElMaW5lQ2hhcnRQYXRocyBleHRlbmRzIElUb29sUGF0aHMge1xuICAgIGNvbHVtbnM6IFdlYXZlUGF0aDtcbiAgICBsaW5lU3R5bGU6IFdlYXZlUGF0aDtcbiAgICBjdXJ2ZVR5cGU6IFdlYXZlUGF0aDtcbiAgICBvdmVycmlkZVlNYXg6IFdlYXZlUGF0aDtcbn1cblxuY2xhc3MgV2VhdmVDM0xpbmVDaGFydCBleHRlbmRzIEFic3RyYWN0QzNUb29sIHtcbiAgICBwcml2YXRlIGtleVRvSW5kZXg6e1trZXk6c3RyaW5nXTogbnVtYmVyfTtcbiAgICBwcml2YXRlIGluZGV4VG9LZXk6e1tpbmRleDpudW1iZXJdOiBJUXVhbGlmaWVkS2V5fTtcbiAgICBwcml2YXRlIHlBeGlzVmFsdWVUb0xhYmVsOntbdmFsdWU6bnVtYmVyXTogc3RyaW5nfTtcbiAgICBwcml2YXRlIGNvbG9yczp7W2lkOnN0cmluZ106IHN0cmluZ307XG4gICAgcHJpdmF0ZSB5TGFiZWxDb2x1bW5QYXRoOldlYXZlUGF0aDtcbiAgICBwcml2YXRlIG51bWVyaWNSZWNvcmRzOlJlY29yZFtdO1xuICAgIHByaXZhdGUgc3RyaW5nUmVjb3JkczpSZWNvcmRbXTtcbiAgICBwcml2YXRlIHJlY29yZHM6UmVjb3JkW11bXTtcbiAgICBwcml2YXRlIGNvbHVtbkxhYmVsczpzdHJpbmdbXTtcbiAgICBwcml2YXRlIGNvbHVtbk5hbWVzOnN0cmluZ1tdO1xuICAgIHByaXZhdGUgY29sdW1uczphbnk7XG4gICAgcHJpdmF0ZSBjaGFydFR5cGU6c3RyaW5nO1xuXG4gICAgcHJpdmF0ZSBmbGFnOmJvb2xlYW47XG4gICAgcHJpdmF0ZSBidXN5OmJvb2xlYW47XG4gICAgcHJpdmF0ZSBkaXJ0eTpib29sZWFuO1xuXG4gICAgcHJvdGVjdGVkIGNoYXJ0OkNoYXJ0QVBJO1xuICAgIHByb3RlY3RlZCBjM0NvbmZpZzpDaGFydENvbmZpZ3VyYXRpb247XG4gICAgcHJvdGVjdGVkIGMzQ29uZmlnWUF4aXM6YzMuWUF4aXNDb25maWd1cmF0aW9uO1xuXG4gICAgcHJvdGVjdGVkIHBhdGhzOklMaW5lQ2hhcnRQYXRocztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklWaXNUb29sUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5rZXlUb0luZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW5kZXhUb0tleSA9IHt9O1xuICAgICAgICB0aGlzLnlBeGlzVmFsdWVUb0xhYmVsID0ge307XG4gICAgICAgIHRoaXMuY29sdW1ucyA9IFtdO1xuICAgICAgICB0aGlzLnZhbGlkYXRlID0gXy5kZWJvdW5jZSh0aGlzLnZhbGlkYXRlLmJpbmQodGhpcyksIDMwKTtcblxuICAgICAgICB0aGlzLmMzQ29uZmlnWUF4aXMgPSB7XG4gICAgICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICAgICAgdGljazoge1xuICAgICAgICAgICAgICAgIG11bHRpbGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IChudW06bnVtYmVyKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnlMYWJlbENvbHVtblBhdGggJiYgdGhpcy55TGFiZWxDb2x1bW5QYXRoLmdldFZhbHVlKFwidGhpcy5nZXRNZXRhZGF0YSgnZGF0YVR5cGUnKVwiKSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMueUF4aXNWYWx1ZVRvTGFiZWxbbnVtXSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhGb3JtYXRVdGlscy5kZWZhdWx0TnVtYmVyRm9ybWF0dGluZyhudW0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYzNDb25maWcgPSB7XG4gICAgICAgICAgICBzaXplOiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMucHJvcHMuc3R5bGUud2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLnN0eWxlLmhlaWdodFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhZGRpbmc6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDIwLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgICAgICBsZWZ0OjEwMCxcbiAgICAgICAgICAgICAgICByaWdodDoyMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zOiBbXSxcbiAgICAgICAgICAgICAgICB4U29ydDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uY2xpY2s6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnQ6TW91c2VFdmVudCA9IHRoaXMuY2hhcnQuaW50ZXJuYWwuZDMuZXZlbnQgYXMgTW91c2VFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYoIShldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpICYmIGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuc2V0S2V5cyhbZC5pZF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbnNlbGVjdGVkOiAoZDphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYoZCAmJiBkLmhhc093blByb3BlcnR5KFwiaW5kZXhcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5hZGRLZXlzKFtkLmlkXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9udW5zZWxlY3RlZDogKGQ6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQucmVtb3ZlS2V5cyhbZC5pZF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbm1vdXNlb3ZlcjogKGQ6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnByb2JlX2tleXNldC5zZXRLZXlzKFtkLmlkXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgY29sdW1uTmFtZXNUb1ZhbHVlOntbY29sdW1uTmFtZTpzdHJpbmddIDogc3RyaW5nfG51bWJlciB9ID0ge307XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaW5lSW5kZXg6bnVtYmVyID0gXy5maW5kSW5kZXgodGhpcy5udW1lcmljUmVjb3JkcywgKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZFtcImlkXCJdLnRvU3RyaW5nKCkgPT0gZC5pZDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2x1bW5MYWJlbHMuZm9yRWFjaCggKGxhYmVsOnN0cmluZyxpbmRleDpudW1iZXIsYXJyYXk6YW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMubnVtZXJpY1JlY29yZHMgJiYgdGhpcy5udW1lcmljUmVjb3Jkc1tsaW5lSW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uTmFtZXNUb1ZhbHVlW2xhYmVsXSA9IHRoaXMubnVtZXJpY1JlY29yZHNbbGluZUluZGV4XVtcImNvbHVtbnNcIl1baW5kZXhdIGFzIG51bWJlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50b29sVGlwLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMuY2hhcnQuaW50ZXJuYWwuZDMuZXZlbnQucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLmNoYXJ0LmludGVybmFsLmQzLmV2ZW50LnBhZ2VZLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1Rvb2xUaXA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvVmFsdWU6IGNvbHVtbk5hbWVzVG9WYWx1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9ubW91c2VvdXQ6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRvb2xUaXAuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUb29sVGlwOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ3JpZDoge1xuICAgICAgICAgICAgICAgIHg6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeToge1xuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGF4aXM6IHtcbiAgICAgICAgICAgICAgICB4OiB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1bGxpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXg6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aWxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRlOiAtNDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IChkOm51bWJlcik6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9oYW5kbGUgY2FzZSB3aGVyZSBsYWJlbHMgbmVlZCB0byBiZSByZXZlcnNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcDpudW1iZXIgPSB0aGlzLmNvbHVtbkxhYmVscy5sZW5ndGgtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sdW1uTGFiZWxzW3RlbXAtZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbHVtbkxhYmVsc1tkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmluZHRvOiBudWxsLFxuICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnJlbmRlcmVkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTdHlsZSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcnR5KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlOmFueSlcblx0e1xuXG5cdH1cblxuICAgIHByaXZhdGUgdXBkYXRlU3R5bGUoKSB7XG4gICAgICAgIGlmKCF0aGlzLmNoYXJ0KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpLnNlbGVjdEFsbChcImNpcmNsZVwiKS5zdHlsZShcIm9wYWNpdHlcIiwgMSlcbiAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZVwiLCBcImJsYWNrXCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2Utb3BhY2l0eVwiLCAwLjApO1xuXG4gICAgICAgIHZhciBzZWxlY3RlZEtleXM6c3RyaW5nW10gPSB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuZ2V0S2V5cygpO1xuICAgICAgICB2YXIgcHJvYmVkS2V5czpzdHJpbmdbXSA9IHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmdldEtleXMoKTtcbiAgICAgICAgdmFyIHNlbGVjdGVkSW5kaWNlczpudW1iZXJbXSA9IHNlbGVjdGVkS2V5cy5tYXAoKGtleTpzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIodGhpcy5rZXlUb0luZGV4W2tleV0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHByb2JlZEluZGljZXM6bnVtYmVyW10gPSBwcm9iZWRLZXlzLm1hcCgoa2V5OnN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlcih0aGlzLmtleVRvSW5kZXhba2V5XSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIga2V5czpzdHJpbmdbXSA9IE9iamVjdC5rZXlzKHRoaXMua2V5VG9JbmRleCk7XG4gICAgICAgIHZhciBpbmRpY2VzOm51bWJlcltdID0ga2V5cy5tYXAoKGtleTpzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIodGhpcy5rZXlUb0luZGV4W2tleV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdW5zZWxlY3RlZEluZGljZXMgPSBfLmRpZmZlcmVuY2UoaW5kaWNlcywgc2VsZWN0ZWRJbmRpY2VzKTtcbiAgICAgICAgdW5zZWxlY3RlZEluZGljZXMgPSBfLmRpZmZlcmVuY2UodW5zZWxlY3RlZEluZGljZXMscHJvYmVkSW5kaWNlcyk7XG4gICAgICAgIGlmKHByb2JlZEluZGljZXMubGVuZ3RoKXtcbiAgICAgICAgICAgIC8vdW5mb2N1cyBhbGwgY2lyY2xlc1xuICAgICAgICAgICAgLy9kMy5zZWxlY3QodGhpcy5lbGVtZW50KS5zZWxlY3RBbGwoXCJjaXJjbGVcIikuZmlsdGVyKFwiLmMzLXNoYXBlXCIpLnN0eWxlKHtvcGFjaXR5OiAwLjEsIFwic3Ryb2tlLW9wYWNpdHlcIjogMC4wfSk7XG5cbiAgICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpLnNlbGVjdEFsbChcImdcIikuZmlsdGVyKFwiLmMzLWNoYXJ0LWxpbmVcIikuc2VsZWN0QWxsKFwiY2lyY2xlXCIpLmZpbHRlcihcIi5jMy1zaGFwZVwiKTtcbiAgICAgICAgICAgIHByb2JlZEluZGljZXMuZm9yRWFjaCggKGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vY3VzdG9tIHN0eWxlIGZvciBjaXJjbGVzIG9uIHByb2JlZCBsaW5lc1xuICAgICAgICAgICAgICAgIHZhciBjaXJjbGVDb3VudDpudW1iZXIgPSBmaWx0ZXJlZFtpbmRleF0gPyBmaWx0ZXJlZFtpbmRleF0ubGVuZ3RoIDogMDtcbiAgICAgICAgICAgICAgICB2YXIgcHJvYmVkQ2lyY2xlczpudW1iZXJbXSA9IF8ucmFuZ2UoMCxjaXJjbGVDb3VudCk7XG4gICAgICAgICAgICAgICAgcHJvYmVkQ2lyY2xlcy5mb3JFYWNoKCAoaTpudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgKGZpbHRlcmVkW2luZGV4XVtpXSBhcyBIVE1MRWxlbWVudCkuc3R5bGUub3BhY2l0eSA9IFwiMS4wXCI7XG4gICAgICAgICAgICAgICAgICAgIChmaWx0ZXJlZFtpbmRleF1baV0gYXMgSFRNTEVsZW1lbnQpLnN0eWxlLnN0cm9rZU9wYWNpdHkgPSBcIjAuMFwiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbVN0eWxlKHByb2JlZEluZGljZXMsIFwicGF0aFwiLCBcIi5jMy1zaGFwZS5jMy1saW5lXCIsIHtvcGFjaXR5OiAxLjB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZihzZWxlY3RlZEluZGljZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvL3VuZm9jdXMgYWxsIGNpcmNsZXNcbiAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpLnNlbGVjdEFsbChcImNpcmNsZVwiKS5maWx0ZXIoXCIuYzMtc2hhcGVcIikuc3R5bGUoXCJvcGFjaXR5XCIsIFwiMC4xXCIpO1xuXG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBkMy5zZWxlY3QodGhpcy5lbGVtZW50KS5zZWxlY3RBbGwoXCJnXCIpLmZpbHRlcihcIi5jMy1jaGFydC1saW5lXCIpLnNlbGVjdEFsbChcImNpcmNsZVwiKS5maWx0ZXIoXCIuYzMtc2hhcGVcIik7XG4gICAgICAgICAgICBzZWxlY3RlZEluZGljZXMuZm9yRWFjaCggKGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vY3VzdG9tIHN0eWxlIGZvciBjaXJjbGVzIG9uIHNlbGVjdGVkIGxpbmVzXG4gICAgICAgICAgICAgICAgdmFyIGNpcmNsZUNvdW50ID0gZmlsdGVyZWRbaW5kZXhdID8gZmlsdGVyZWRbaW5kZXhdLmxlbmd0aCA6IDA7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkQ2lyY2xlcyA9IF8ucmFuZ2UoMCxjaXJjbGVDb3VudCk7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDaXJjbGVzLmZvckVhY2goIChpOm51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAoZmlsdGVyZWRbaW5kZXhdW2ldIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5vcGFjaXR5ID0gXCIxLjBcIjtcbiAgICAgICAgICAgICAgICAgICAgKGZpbHRlcmVkW2luZGV4XVtpXSBhcyBIVE1MRWxlbWVudCkuc3R5bGUuc3Ryb2tlT3BhY2l0eSA9IFwiMS4wXCI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5jdXN0b21TdHlsZSh1bnNlbGVjdGVkSW5kaWNlcywgXCJwYXRoXCIsIFwiLmMzLXNoYXBlLmMzLWxpbmVcIiwge29wYWNpdHk6IDAuMX0pO1xuICAgICAgICAgICAgdGhpcy5jdXN0b21TdHlsZShzZWxlY3RlZEluZGljZXMsIFwicGF0aFwiLCBcIi5jMy1zaGFwZS5jMy1saW5lXCIsIHtvcGFjaXR5OiAxLjB9KTtcbiAgICAgICAgICAgIHRoaXMuY2hhcnQuc2VsZWN0KFtcInlcIl0sIHNlbGVjdGVkSW5kaWNlcywgdHJ1ZSk7XG4gICAgICAgIH1lbHNlIGlmKCFwcm9iZWRJbmRpY2VzLmxlbmd0aCl7XG4gICAgICAgICAgICAvL2ZvY3VzIGFsbCBjaXJjbGVzXG4gICAgICAgICAgICBkMy5zZWxlY3QodGhpcy5lbGVtZW50KS5zZWxlY3RBbGwoXCJjaXJjbGVcIikuZmlsdGVyKFwiLmMzLXNoYXBlXCIpLnN0eWxlKHtvcGFjaXR5OiAxLjAsIFwic3Ryb2tlLW9wYWNpdHlcIjogMC4wfSk7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbVN0eWxlKGluZGljZXMsIFwicGF0aFwiLCBcIi5jMy1zaGFwZS5jMy1saW5lXCIsIHtvcGFjaXR5OiAxLjB9KTtcbiAgICAgICAgICAgIHRoaXMuY2hhcnQuc2VsZWN0KFtcInlcIl0sIFtdLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZGF0YUNoYW5nZWQoKSB7XG4gICAgICAgIHRoaXMuY29sdW1uTGFiZWxzID0gW107XG4gICAgICAgIHRoaXMuY29sdW1uTmFtZXMgPSBbXTtcblxuICAgICAgICB2YXIgY2hpbGRyZW46V2VhdmVQYXRoW10gPSB0aGlzLnBhdGhzLmNvbHVtbnMuZ2V0Q2hpbGRyZW4oKTtcblxuICAgICAgICB0aGlzLnlMYWJlbENvbHVtblBhdGggPSBjaGlsZHJlblswXTtcblxuICAgICAgICBsZXQgbnVtZXJpY01hcHBpbmc6YW55ID0ge1xuICAgICAgICAgICAgY29sdW1uczogY2hpbGRyZW4sXG4gICAgICAgICAgICB5TGFiZWw6IHRoaXMueUxhYmVsQ29sdW1uUGF0aFxuICAgICAgICB9O1xuXG5cbiAgICAgICAgbGV0IHN0cmluZ01hcHBpbmc6YW55ID0ge1xuICAgICAgICAgICAgY29sdW1uczogY2hpbGRyZW4sXG4gICAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICAgICAgLy9hbHBoYTogdGhpcy5fbGluZVN0eWxlUGF0aC5wdXNoKFwiYWxwaGFcIiksXG4gICAgICAgICAgICAgICAgY29sb3I6IHRoaXMucGF0aHMubGluZVN0eWxlLnB1c2goXCJjb2xvclwiKVxuICAgICAgICAgICAgICAgIC8vY2FwczogdGhpcy5fbGluZVN0eWxlUGF0aC5wdXNoKFwiY2Fwc1wiKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHlMYWJlbDogdGhpcy55TGFiZWxDb2x1bW5QYXRoXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChsZXQgaWR4IGluIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbltpZHhdO1xuICAgICAgICAgICAgbGV0IHRpdGxlID0gY2hpbGQuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IGNoaWxkLmdldFBhdGgoKS5wb3AoKTtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uTGFiZWxzLnB1c2godGl0bGUpO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5OYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5udW1lcmljUmVjb3JkcyA9IHRoaXMucGF0aHMucGxvdHRlci5yZXRyaWV2ZVJlY29yZHMobnVtZXJpY01hcHBpbmcsIHtrZXlTZXQ6IHRoaXMucGF0aHMuZmlsdGVyZWRLZXlTZXQsIGRhdGFUeXBlOiBcIm51bWJlclwifSk7XG4gICAgICAgIHRoaXMuc3RyaW5nUmVjb3JkcyA9IHRoaXMucGF0aHMucGxvdHRlci5yZXRyaWV2ZVJlY29yZHMoc3RyaW5nTWFwcGluZywge2tleVNldDogdGhpcy5wYXRocy5maWx0ZXJlZEtleVNldCwgZGF0YVR5cGU6IFwic3RyaW5nXCJ9KTtcblxuICAgICAgICB0aGlzLnJlY29yZHMgPSBfLnppcCh0aGlzLm51bWVyaWNSZWNvcmRzLCB0aGlzLnN0cmluZ1JlY29yZHMpO1xuICAgICAgICB0aGlzLnJlY29yZHMgPSBfLnNvcnRCeSh0aGlzLnJlY29yZHMsIFswLCBcImlkXCJdKTtcblxuICAgICAgICBpZih0aGlzLnJlY29yZHMubGVuZ3RoKVxuICAgICAgICAgICAgW3RoaXMubnVtZXJpY1JlY29yZHMsIHRoaXMuc3RyaW5nUmVjb3Jkc10gPSBfLnVuemlwKHRoaXMucmVjb3Jkcyk7XG5cbiAgICAgICAgdGhpcy5rZXlUb0luZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW5kZXhUb0tleSA9IHt9O1xuICAgICAgICB0aGlzLnlBeGlzVmFsdWVUb0xhYmVsID0ge307XG5cbiAgICAgICAgdGhpcy5udW1lcmljUmVjb3Jkcy5mb3JFYWNoKChyZWNvcmQ6UmVjb3JkLCBpbmRleDpudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHRoaXMua2V5VG9JbmRleFtyZWNvcmQuaWQgYXMgYW55XSA9IGluZGV4O1xuICAgICAgICAgICAgdGhpcy5pbmRleFRvS2V5W2luZGV4XSA9IHJlY29yZC5pZDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zdHJpbmdSZWNvcmRzLmZvckVhY2goKHJlY29yZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHZhciBudW1lcmljUmVjb3JkID0gdGhpcy5udW1lcmljUmVjb3Jkc1tpbmRleF07XG4gICAgICAgICAgICB0aGlzLnlBeGlzVmFsdWVUb0xhYmVsW251bWVyaWNSZWNvcmRbXCJ5TGFiZWxcIl0gYXMgbnVtYmVyXSA9IHJlY29yZFtcInlMYWJlbFwiXSBhcyBzdHJpbmc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29sdW1ucyA9IHRoaXMubnVtZXJpY1JlY29yZHMubWFwKGZ1bmN0aW9uKHJlY29yZDpSZWNvcmQpIHtcbiAgICAgICAgICAgIHZhciB0ZW1wQXJyOmFueVtdID0gW107XG4gICAgICAgICAgICB0ZW1wQXJyLnB1c2gocmVjb3JkW1wiaWRcIl0pO1xuICAgICAgICAgICAgXy5rZXlzKHJlY29yZFtcImNvbHVtbnNcIl0pLmZvckVhY2goKGtleTpzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICB0ZW1wQXJyLnB1c2goKHJlY29yZFtcImNvbHVtbnNcIl0gYXMgUmVjb3JkKVtrZXldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBBcnI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29sb3JzID0ge307XG4gICAgICAgIHRoaXMuc3RyaW5nUmVjb3Jkcy5mb3JFYWNoKChyZWNvcmQ6UmVjb3JkKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbG9yc1tyZWNvcmQuaWQgYXMgYW55XSA9ICgocmVjb3JkW1wibGluZVwiXSBhcyBSZWNvcmQpW1wiY29sb3JcIl0gYXMgc3RyaW5nKSB8fCBcIiNDMENERDFcIjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jaGFydFR5cGU9IFwibGluZVwiO1xuICAgICAgICBpZih0aGlzLnBhdGhzLnBsb3R0ZXIucHVzaChcImN1cnZlVHlwZVwiKS5nZXRTdGF0ZSgpID09PSBcImRvdWJsZVwiKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0VHlwZSA9IFwic3BsaW5lXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZih3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KXtcbiAgICAgICAgICAgIHRoaXMuY29sdW1ucy5mb3JFYWNoKCAoY29sdW1uOmFueVtdLCBpbmRleDpudW1iZXIsIGFycmF5OmFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciB0ZW1wOmFueVtdID0gW107XG4gICAgICAgICAgICAgICAgdGVtcC5wdXNoKGNvbHVtbi5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICBjb2x1bW4gPSBjb2x1bW4ucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgIGNvbHVtbi5mb3JFYWNoKCAoaXRlbTphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFycmF5W2luZGV4XSA9IHRlbXA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvKiBDbGVhbnVwIGNhbGxiYWNrcyAqL1xuICAgICAgICAvL3RoaXMudGVhcmRvd25DYWxsYmFja3MoKTtcbiAgICAgICAgdGhpcy5jaGFydC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcblxuICAgICAgICB2YXIgcGxvdHRlclBhdGg6V2VhdmVQYXRoID0gdGhpcy50b29sUGF0aC5wdXNoUGxvdHRlcihcInBsb3RcIik7XG4gICAgICAgIHZhciBtYXBwaW5nID0gW1xuICAgICAgICAgICAgeyBuYW1lOiBcInBsb3R0ZXJcIiwgcGF0aDogcGxvdHRlclBhdGgsIGNhbGxiYWNrczogdGhpcy52YWxpZGF0ZX0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiY29sdW1uc1wiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiY29sdW1uc1wiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImxpbmVTdHlsZVwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwibGluZVN0eWxlXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiY3VydmVUeXBlXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJjdXJ2ZVR5cGVcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5Cb3R0b21cIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpbkJvdHRvbVwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm1hcmdpbkxlZnRcIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpbkxlZnRcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5Ub3BcIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpblRvcFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm1hcmdpblJpZ2h0XCIsIHBhdGg6IHRoaXMucGxvdE1hbmFnZXJQYXRoLnB1c2goXCJtYXJnaW5SaWdodFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm92ZXJyaWRlWU1heFwiLCBwYXRoOiB0aGlzLnBsb3RNYW5hZ2VyUGF0aC5wdXNoKFwib3ZlcnJpZGVZTWF4XCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiZmlsdGVyZWRLZXlTZXRcIiwgcGF0aDogcGxvdHRlclBhdGgucHVzaChcImZpbHRlcmVkS2V5U2V0XCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwic2VsZWN0aW9uS2V5U2V0XCIsIHBhdGg6IHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldCwgY2FsbGJhY2tzOiB0aGlzLnVwZGF0ZVN0eWxlIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwicHJvYmVLZXlTZXRcIiwgcGF0aDogdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQsIGNhbGxiYWNrczogdGhpcy51cGRhdGVTdHlsZSB9XG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXplUGF0aHMobWFwcGluZyk7XG5cbiAgICAgICBcdHRoaXMucGF0aHMuZmlsdGVyZWRLZXlTZXQuZ2V0T2JqZWN0KCkuc2V0Q29sdW1uS2V5U291cmNlcyh0aGlzLnBhdGhzLmNvbHVtbnMuZ2V0T2JqZWN0KCkuZ2V0T2JqZWN0cygpKTtcblxuICAgICAgICB0aGlzLmMzQ29uZmlnLmJpbmR0byA9IHRoaXMuZWxlbWVudDtcbiAgICAgICAgdGhpcy52YWxpZGF0ZSh0cnVlKTtcbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhldmVudDpNb3VzZUV2ZW50KTp2b2lkIHtcbiAgICAgICAgaWYoIXRoaXMuZmxhZykge1xuICAgICAgICAgICAgdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LnNldEtleXMoW10pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmxhZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgaWYodGhpcy5jM0NvbmZpZy5zaXplLndpZHRoICE9IHRoaXMucHJvcHMuc3R5bGUud2lkdGggfHwgdGhpcy5jM0NvbmZpZy5zaXplLmhlaWdodCAhPSB0aGlzLnByb3BzLnN0eWxlLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5zaXplID0ge3dpZHRoOiB0aGlzLnByb3BzLnN0eWxlLndpZHRoLCBoZWlnaHQ6IHRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0fTtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxpZGF0ZShmb3JjZWQ6Ym9vbGVhbiA9IGZhbHNlKTp2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5idXN5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGNoYW5nZURldGVjdGVkOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgdmFyIGF4aXNDaGFuZ2U6Ym9vbGVhbiA9IHRoaXMuZGV0ZWN0Q2hhbmdlKCdjb2x1bW5zJywgJ292ZXJyaWRlWU1heCcpO1xuICAgICAgICBpZiAoYXhpc0NoYW5nZSB8fCB0aGlzLmRldGVjdENoYW5nZSgncGxvdHRlcicsICdjdXJ2ZVR5cGUnLCAnbGluZVN0eWxlJywnZmlsdGVyZWRLZXlTZXQnKSlcbiAgICAgICAge1xuICAgICAgICAgICAgY2hhbmdlRGV0ZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kYXRhQ2hhbmdlZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChheGlzQ2hhbmdlKVxuICAgICAgICB7XG4gICAgICAgICAgICBjaGFuZ2VEZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgeExhYmVsOnN0cmluZyA9IFwiIFwiOy8vdGhpcy5wYXRocy54QXhpcy5wdXNoKFwib3ZlcnJpZGVBeGlzTmFtZVwiKS5nZXRTdGF0ZSgpIHx8IHRoaXMucGF0aHMuZGF0YVguZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG4gICAgICAgICAgICB2YXIgeUxhYmVsOnN0cmluZyA9IFwiIFwiOy8vdGhpcy5wYXRocy55QXhpcy5wdXNoKFwib3ZlcnJpZGVBeGlzTmFtZVwiKS5nZXRTdGF0ZSgpIHx8IHRoaXMucGF0aHMuZGF0YVkuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG5cblxuICAgICAgICAgICAgaWYgKHRoaXMubnVtZXJpY1JlY29yZHMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHRlbXA6YW55ID0gIHt9O1xuICAgICAgICAgICAgICAgIGlmICh3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHJpbmdSZWNvcmRzLmZvckVhY2goIChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBbcmVjb3JkW1wiaWRcIl0udG9TdHJpbmcoKV0gPSAneTInO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5kYXRhLmF4ZXMgPSB0ZW1wO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueTIgPSB0aGlzLmMzQ29uZmlnWUF4aXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55ID0ge3Nob3c6IGZhbHNlfTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLngudGljay5yb3RhdGUgPSA0NTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHJpbmdSZWNvcmRzLmZvckVhY2goIChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBbcmVjb3JkW1wiaWRcIl0udG9TdHJpbmcoKV0gPSAneSc7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmRhdGEuYXhlcyA9IHRlbXA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55ID0gdGhpcy5jM0NvbmZpZ1lBeGlzO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jM0NvbmZpZy5heGlzLnkyO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC50aWNrLnJvdGF0ZSA9IC00NTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy54LmxhYmVsID0ge3RleHQ6eExhYmVsLCBwb3NpdGlvbjpcIm91dGVyLWNlbnRlclwifTtcbiAgICAgICAgICAgIHRoaXMuYzNDb25maWdZQXhpcy5sYWJlbCA9IHt0ZXh0OnlMYWJlbCwgcG9zaXRpb246XCJvdXRlci1taWRkbGVcIn07XG5cbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy50b3AgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5Ub3AuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC5oZWlnaHQgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5Cb3R0b20uZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICBpZih3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KXtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnBhZGRpbmcubGVmdCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpblJpZ2h0LmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy5yaWdodCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpbkxlZnQuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnBhZGRpbmcubGVmdCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpbkxlZnQuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5wYWRkaW5nLnJpZ2h0ID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luUmlnaHQuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCFpc05hTih0aGlzLnBhdGhzLm92ZXJyaWRlWU1heC5nZXRTdGF0ZSgpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55Lm1heCA9IHRoaXMucGF0aHMub3ZlcnJpZGVZTWF4LmdldFN0YXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55Lm1heCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbmdlRGV0ZWN0ZWQgfHwgZm9yY2VkKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jaGFydCA9IGMzLmdlbmVyYXRlKHRoaXMuYzNDb25maWcpO1xuICAgICAgICAgICAgdGhpcy5sb2FkRGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5jdWxsQXhlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9hZERhdGEoKSB7XG4gICAgICAgIGlmKCF0aGlzLmNoYXJ0IHx8IHRoaXMuYnVzeSlcbiAgICAgICAgICAgIHJldHVybiBTdGFuZGFyZExpYi5kZWJvdW5jZSh0aGlzLCAnbG9hZERhdGEnKTtcbiAgICAgICAgdGhpcy5jaGFydC5sb2FkKHtjb2x1bW5zOiB0aGlzLmNvbHVtbnMsIGNvbG9yczogdGhpcy5jb2xvcnMsIHR5cGU6IHRoaXMuY2hhcnRUeXBlLCB1bmxvYWQ6IHRydWV9KTtcbiAgICB9XG59XG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IFdlYXZlQzNMaW5lQ2hhcnQ7XG5cbnJlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9uKFwid2VhdmUudmlzdWFsaXphdGlvbi50b29sczo6TGluZUNoYXJ0VG9vbFwiLCBXZWF2ZUMzTGluZUNoYXJ0KTtcbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlanMudG9vbHMuTGluZUNoYXJ0VG9vbFwiLCBXZWF2ZUMzTGluZUNoYXJ0LCBbd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3RXaXRoTmV3UHJvcGVydGllc10pO1xuIl19
