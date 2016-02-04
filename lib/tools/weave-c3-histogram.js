"use strict";

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

var _c = require("c3");

var c3 = _interopRequireWildcard(_c);

var _FormatUtils = require("../utils/FormatUtils");

var _FormatUtils2 = _interopRequireDefault(_FormatUtils);

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

var WeaveC3Histogram = function (_AbstractC3Tool) {
    _inherits(WeaveC3Histogram, _AbstractC3Tool);

    function WeaveC3Histogram(props) {
        _classCallCheck(this, WeaveC3Histogram);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveC3Histogram).call(this, props));

        _this.busy = false;
        _this.idToRecord = {};
        _this.keyToIndex = {};
        _this.indexToKey = {};
        _this.validate = _.debounce(_this.validate.bind(_this), 30);
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
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                type: "bar",
                color: function color(_color, d) {
                    if (d && d.hasOwnProperty("index")) {
                        var decColor;
                        if (weavejs.WeaveAPI.Locale.reverseLayout) {
                            //handle case where labels need to be reversed for chart flip
                            var temp = _this.histData.length - 1;
                            decColor = _this.paths.fillStyle.push("color").getObject("internalDynamicColumn", null).getColorFromDataValue(temp - d.index).toString(16);
                        } else {
                            decColor = _this.paths.fillStyle.push("color").getObject("internalDynamicColumn", null).getColorFromDataValue(d.index).toString(16);
                        }
                        return "#" + _StandardLib2.default.decimalToHex(decColor);
                    }
                    return "#C0CDD1";
                },
                onclick: function onclick(d) {
                    var event = _this.chart.internal.d3;
                    if (!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                        var selectedIds = _this.paths.binnedColumn.getObject().getKeysFromBinIndex(d.index).map(function (qKey) {
                            return _this.toolPath.qkeyToString(qKey);
                        });
                        _this.toolPath.selection_keyset.setKeys(selectedIds);
                    }
                },
                onselected: function onselected(d) {
                    _this.flag = true;
                    if (d && d.hasOwnProperty("index")) {
                        var selectedIds = _this.paths.binnedColumn.getObject().getKeysFromBinIndex(d.index).map(function (qKey) {
                            return _this.toolPath.qkeyToString(qKey);
                        });
                        _this.toolPath.selection_keyset.addKeys(selectedIds);
                    }
                },
                onunselected: function onunselected(d) {
                    _this.flag = true;
                    if (d && d.hasOwnProperty("index")) {
                        var unSelectedIds = _this.paths.binnedColumn.getObject().getKeysFromBinIndex(d.index).map(function (qKey) {
                            return _this.toolPath.qkeyToString(qKey);
                        });
                        _this.toolPath.selection_keyset.removeKeys(unSelectedIds);
                    }
                },
                onmouseover: function onmouseover(d) {
                    if (d && d.hasOwnProperty("index")) {
                        var selectedIds = _this.paths.binnedColumn.getObject().getKeysFromBinIndex(d.index).map(function (qKey) {
                            return _this.toolPath.qkeyToString(qKey);
                        });
                        _this.toolPath.probe_keyset.setKeys(selectedIds);
                    }
                },
                onmouseout: function onmouseout(d) {
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.probe_keyset.setKeys([]);
                    }
                }
            },
            bindto: null,
            legend: {
                show: false
            },
            axis: {
                x: {
                    type: "category",
                    label: {
                        text: "",
                        position: "outer-center"
                    },
                    tick: {
                        rotate: -45,
                        culling: {
                            max: null
                        },
                        multiline: false,
                        format: function format(num) {
                            if (_this.element && _this.props.style.height > 0) {
                                var labelHeight = Number(_this.paths.marginBottom.getState()) / Math.cos(45 * (Math.PI / 180));
                                var labelString;
                                if (weavejs.WeaveAPI.Locale.reverseLayout) {
                                    //handle case where labels need to be reversed
                                    var temp = _this.histData.length - 1;
                                    labelString = _this.paths.binnedColumn.getObject().deriveStringFromNumber(temp - num);
                                } else {
                                    labelString = _this.paths.binnedColumn.getObject().deriveStringFromNumber(num);
                                }
                                if (labelString) {
                                    var stringSize = _StandardLib2.default.getTextWidth(labelString, _this.getFontString());
                                    var adjustmentCharacters = labelString.length - Math.floor(labelString.length * (labelHeight / stringSize));
                                    return adjustmentCharacters > 0 ? labelString.substring(0, labelString.length - adjustmentCharacters - 3) + "..." : labelString;
                                } else {
                                    return "";
                                }
                            } else {
                                return _this.paths.binnedColumn.getObject().deriveStringFromNumber(num);
                            }
                        }
                    }
                },
                rotated: false
            },
            tooltip: {
                format: {
                    title: function title(num) {
                        return _this.paths.binnedColumn.getObject().deriveStringFromNumber(num);
                    },
                    name: function name(_name, ratio, id, index) {
                        return _this.getYAxisLabel();
                    }
                },
                show: false
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
            bar: {
                width: {
                    ratio: 0.95
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
                fit: false,
                format: function format(num) {
                    return String(_FormatUtils2.default.defaultNumberFormatting(num));
                }
            }
        };
        return _this;
    }

    _createClass(WeaveC3Histogram, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "handleClick",
        value: function handleClick(event) {
            if (!this.flag) {
                this.toolPath.selection_keyset.setKeys([]);
            }
            this.flag = false;
        }
    }, {
        key: "rotateAxes",
        value: function rotateAxes() {
            //this.c3Config.axis.rotated = true;
            //this.forceUpdate();
        }
    }, {
        key: "getYAxisLabel",
        value: function getYAxisLabel() {
            var overrideAxisName = this.paths.yAxis.push("overrideAxisName").getState();
            if (overrideAxisName) {
                return overrideAxisName;
            } else {
                if (this.paths.columnToAggregate.getState().length) {
                    switch (this.paths.aggregationMethod.getState()) {
                        case "count":
                            return "Number of records";
                        case "sum":
                            return "Sum of " + this.paths.columnToAggregate.getObject().getMetadata('title');
                        case "mean":
                            return "Mean of " + this.paths.columnToAggregate.getObject().getMetadata('title');
                    }
                } else {
                    return "Number of records";
                }
            }
        }
    }, {
        key: "updateStyle",
        value: function updateStyle() {
            if (!this.chart) return;
            d3.select(this.element).selectAll("path").style("opacity", 1).style("stroke", "black").style("stroke-width", "1px").style("stroke-opacity", 0.5);
            var selectedKeys = this.toolPath.selection_keyset.getKeys();
            var probedKeys = this.toolPath.probe_keyset.getKeys();
            var selectedRecords = _.filter(this.numericRecords, function (record) {
                return _.includes(selectedKeys, record.id);
            });
            var probedRecords = _.filter(this.numericRecords, function (record) {
                return _.includes(probedKeys, record.id);
            });
            var selectedBinIndices = _.pluck(_.uniq(selectedRecords, 'binnedColumn'), 'binnedColumn');
            var probedBinIndices = _.pluck(_.uniq(probedRecords, 'binnedColumn'), 'binnedColumn');
            var binIndices = _.pluck(_.uniq(this.numericRecords, 'binnedColumn'), 'binnedColumn');
            var unselectedBinIndices = _.difference(binIndices, selectedBinIndices);
            unselectedBinIndices = _.difference(unselectedBinIndices, probedBinIndices);
            if (selectedBinIndices.length) {
                this.customStyle(unselectedBinIndices, "path", ".c3-shape", { opacity: 0.3, "stroke-opacity": 0.0 });
                this.customStyle(selectedBinIndices, "path", ".c3-shape", { opacity: 1.0, "stroke-opacity": 1.0 });
            } else if (!probedBinIndices.length) {
                this.customStyle(binIndices, "path", ".c3-shape", { opacity: 1.0, "stroke-opacity": 0.5 });
                this.chart.select(this.heightColumnNames, [], true);
            }
        }
    }, {
        key: "dataChanged",
        value: function dataChanged() {
            var _this2 = this;

            var numericMapping = {
                binnedColumn: this.paths.binnedColumn,
                columnToAggregate: this.paths.columnToAggregate
            };
            var stringMapping = {
                binnedColumn: this.paths.binnedColumn
            };
            this.binnedColumnDataType = this.paths.binnedColumn.getObject().getMetadata('dataType');
            this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, { keySet: this.paths.filteredKeySet, dataType: "number" });
            this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, { keySet: this.paths.filteredKeySet, dataType: "string" });
            this.idToRecord = {};
            this.keyToIndex = {};
            this.indexToKey = {};
            this.numericRecords.forEach(function (record, index) {
                _this2.idToRecord[record.id] = record;
                _this2.keyToIndex[record.id] = index;
                _this2.indexToKey[index] = record.id;
            });
            this.numberOfBins = this.paths.binnedColumn.getObject().numberOfBins;
            this.histData = [];
            // this._columnToAggregatePath.getObject().getInternalColumn();
            var columnToAggregateNameIsDefined = this.paths.columnToAggregate.getState().length > 0;
            for (var iBin = 0; iBin < this.numberOfBins; iBin++) {
                var recordsInBin = _.filter(this.numericRecords, { binnedColumn: iBin });
                if (recordsInBin) {
                    var obj = { height: 0 };
                    if (columnToAggregateNameIsDefined) {
                        obj.height = this.getAggregateValue(recordsInBin, "columnToAggregate", this.paths.aggregationMethod.getState());
                        this.histData.push(obj);
                    } else {
                        obj.height = this.getAggregateValue(recordsInBin, "binnedColumn", "count");
                        this.histData.push(obj);
                    }
                }
            }
            this.keys = { value: ["height"] };
            if (weavejs.WeaveAPI.Locale.reverseLayout) {
                this.histData = this.histData.reverse();
            }
            this.c3Config.data.json = this.histData;
            this.c3Config.data.keys = this.keys;
        }
    }, {
        key: "getAggregateValue",
        value: function getAggregateValue(records, columnToAggregateName, aggregationMethod) {
            var count = 0;
            var sum = 0;
            if (!Array.isArray(records)) {
                return 0;
            }
            records.forEach(function (record) {
                count++;
                sum += record[columnToAggregateName];
            });
            if (aggregationMethod === "mean") {
                return sum / count; // convert sum to mean
            }
            if (aggregationMethod === "count") {
                return count; // use count of finite values
            }
            // sum
            return sum;
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
            this.showXAxisLabel = false;
            var plotterPath = this.toolPath.pushPlotter("plot");
            var mapping = [{ name: "plotter", path: plotterPath, callbacks: this.validate }, { name: "binnedColumn", path: plotterPath.push("binnedColumn") }, { name: "columnToAggregate", path: plotterPath.push("columnToAggregate") }, { name: "aggregationMethod", path: plotterPath.push("aggregationMethod") }, { name: "fillStyle", path: plotterPath.push("fillStyle") }, { name: "lineStyle", path: plotterPath.push("lineStyle") }, { name: "xAxis", path: this.toolPath.pushPlotter("xAxis") }, { name: "yAxis", path: this.toolPath.pushPlotter("yAxis") }, { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") }, { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") }, { name: "marginTop", path: this.plotManagerPath.push("marginTop") }, { name: "marginRight", path: this.plotManagerPath.push("marginRight") }, { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") }, { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle }, { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.updateStyle }];
            this.initializePaths(mapping);
            this.paths.filteredKeySet.getObject().setSingleKeySource(this.paths.fillStyle.getObject('color', 'internalDynamicColumn'));
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
            var axisChange = this.detectChange('binnedColumn', 'aggregationMethod', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight');
            var axisSettingsChange = this.detectChange('xAxis', 'yAxis');
            if (axisChange || this.detectChange('plotter', 'columnToAggregate', 'fillStyle', 'lineStyle', 'filteredKeySet')) {
                changeDetected = true;
                this.dataChanged();
            }
            if (axisChange) {
                changeDetected = true;
                var xLabel = this.paths.xAxis.getState("overrideAxisName") || this.paths.binnedColumn.getObject().getMetadata('title');
                if (!this.showXAxisLabel) {
                    xLabel = " ";
                }
                var yLabel = this.getYAxisLabel.bind(this)();
                if (this.numericRecords) {
                    var temp = "height";
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
            }
        }
    }, {
        key: "loadData",
        value: function loadData() {
            var _this3 = this;

            if (!this.chart || this.busy) return _StandardLib2.default.debounce(this, 'loadData');
            this.chart.load({ json: this.histData, keys: this.keys, unload: true, done: function done() {
                    _this3.busy = false;_this3.cullAxes();
                } });
        }
    }]);

    return WeaveC3Histogram;
}(_AbstractC3Tool3.default);

exports.default = WeaveC3Histogram;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::HistogramTool", WeaveC3Histogram);
(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::ColormapHistogramTool", WeaveC3Histogram);
//Weave.registerClass("weavejs.tools.HistogramTool", WeaveC3Histogram, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//Weave.registerClass("weavejs.tools.ColormapHistogramTool", WeaveC3Histogram, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtYzMtaGlzdG9ncmFtLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyY3RzL3Rvb2xzL3dlYXZlLWMzLWhpc3RvZ3JhbS50c3giXSwibmFtZXMiOlsiV2VhdmVDM0hpc3RvZ3JhbSIsIldlYXZlQzNIaXN0b2dyYW0uY29uc3RydWN0b3IiLCJXZWF2ZUMzSGlzdG9ncmFtLmhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzIiwiV2VhdmVDM0hpc3RvZ3JhbS5oYW5kbGVDbGljayIsIldlYXZlQzNIaXN0b2dyYW0ucm90YXRlQXhlcyIsIldlYXZlQzNIaXN0b2dyYW0uZ2V0WUF4aXNMYWJlbCIsIldlYXZlQzNIaXN0b2dyYW0udXBkYXRlU3R5bGUiLCJXZWF2ZUMzSGlzdG9ncmFtLmRhdGFDaGFuZ2VkIiwiV2VhdmVDM0hpc3RvZ3JhbS5nZXRBZ2dyZWdhdGVWYWx1ZSIsIldlYXZlQzNIaXN0b2dyYW0uY29tcG9uZW50RGlkVXBkYXRlIiwiV2VhdmVDM0hpc3RvZ3JhbS5jb21wb25lbnRXaWxsVW5tb3VudCIsIldlYXZlQzNIaXN0b2dyYW0uY29tcG9uZW50RGlkTW91bnQiLCJXZWF2ZUMzSGlzdG9ncmFtLnZhbGlkYXRlIiwiV2VhdmVDM0hpc3RvZ3JhbS5sb2FkRGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQVVZLEFBQUMsQUFBTSxBQUFRLEFBQ3BCOzs7O0lBQUssQUFBRSxBQUFNLEFBQUksQUFFakI7Ozs7SUFBSyxBQUFFLEFBQU0sQUFBSSxBQUVqQixBQUFXLEFBQU0sQUFBc0IsQUFDdkMsQUFBVyxBQUFNLEFBQXNCLEFBZTlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUErQixBQUFjOzs7QUFzQnpDLDhCQUFZLEFBQW1COzs7d0dBQ3JCLEFBQUssQUFBQyxBQUFDOztBQUNiLEFBQUksY0FBQyxBQUFJLE9BQUcsQUFBSyxBQUFDO0FBQ2xCLEFBQUksY0FBQyxBQUFVLGFBQUcsQUFBRSxB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QUMsQUFBSSxLQUFDLEFBQUksTUFBRSxBQUFNLFFBQUUsQUFBSSxNQUFFLEFBQUk7QUFBVSxBQUFJLDJCQUFDLEFBQUksT0FBRyxBQUFLLEFBQUMsWUFBQyxBQUFJLENBQUMsQUFBUSxBQUFFLEFBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQyxBQUM3SCxBQUFDLEFBQ0wsQUFBQyxBQUVEO2lCQUprRjs7Ozs7OztrQkFJbkUsQUFBZ0IsQUFBQzs7QUFFaEMsQUFBMEIsMkNBQUMsQUFBMEMsNENBQUUsQUFBZ0IsQUFBQyxBQUFDO0FBQ3pGLEFBQTBCLDJDQUFDLEFBQWtELG9EQUFFLEFBQWdCLEFBQUMsQUFBQyxBQUNqRyxBQUE0SCxBQUM1SCxBQUFvSSIsInNvdXJjZXNDb250ZW50IjpbIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvYzMvYzMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvZDMvZDMuZC50c1wiLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG5cbmltcG9ydCB7SVZpc1Rvb2xQcm9wc30gZnJvbSBcIi4vSVZpc1Rvb2xcIjtcbmltcG9ydCB7SVRvb2xQYXRoc30gZnJvbSBcIi4vQWJzdHJhY3RDM1Rvb2xcIjtcbmltcG9ydCBBYnN0cmFjdEMzVG9vbCBmcm9tIFwiLi9BYnN0cmFjdEMzVG9vbFwiO1xuaW1wb3J0IHtyZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbn0gZnJvbSBcIi4uL1dlYXZlVG9vbFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBkMyBmcm9tIFwiZDNcIjtcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgYzMgZnJvbSBcImMzXCI7XG5pbXBvcnQge0NoYXJ0Q29uZmlndXJhdGlvbiwgQ2hhcnRBUEl9IGZyb20gXCJjM1wiO1xuaW1wb3J0IEZvcm1hdFV0aWxzIGZyb20gXCIuLi91dGlscy9Gb3JtYXRVdGlsc1wiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuLi91dGlscy9TdGFuZGFyZExpYlwiXG5pbXBvcnQge01vdXNlRXZlbnR9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtnZXRUb29sdGlwQ29udGVudH0gZnJvbSBcIi4vdG9vbHRpcFwiO1xuaW1wb3J0IFRvb2x0aXAgZnJvbSBcIi4vdG9vbHRpcFwiO1xuXG5pbXBvcnQgSVF1YWxpZmllZEtleSA9IHdlYXZlanMuYXBpLmRhdGEuSVF1YWxpZmllZEtleTtcblxuaW50ZXJmYWNlIElIaXN0b2dyYW1QYXRocyBleHRlbmRzIElUb29sUGF0aHMge1xuICAgIGJpbm5lZENvbHVtbjogV2VhdmVQYXRoO1xuICAgIGNvbHVtblRvQWdncmVnYXRlOiBXZWF2ZVBhdGg7XG4gICAgYWdncmVnYXRpb25NZXRob2Q6IFdlYXZlUGF0aDtcbiAgICBmaWxsU3R5bGU6IFdlYXZlUGF0aDtcbiAgICBsaW5lU3R5bGU6IFdlYXZlUGF0aDtcbn1cblxuY2xhc3MgV2VhdmVDM0hpc3RvZ3JhbSBleHRlbmRzIEFic3RyYWN0QzNUb29sIHtcbiAgICBwcml2YXRlIGlkVG9SZWNvcmQ6e1tpZDpzdHJpbmddOiBSZWNvcmR9O1xuICAgIHByaXZhdGUga2V5VG9JbmRleDp7W2tleTpzdHJpbmddOiBudW1iZXJ9O1xuICAgIHByaXZhdGUgaW5kZXhUb0tleTp7W2luZGV4Om51bWJlcl06IElRdWFsaWZpZWRLZXl9O1xuICAgIHByaXZhdGUgc3RyaW5nUmVjb3JkczpSZWNvcmRbXTtcbiAgICBwcml2YXRlIG51bWVyaWNSZWNvcmRzOlJlY29yZFtdO1xuICAgIHByaXZhdGUgaGVpZ2h0Q29sdW1uTmFtZXM6c3RyaW5nW107XG4gICAgcHJpdmF0ZSBiaW5uZWRDb2x1bW5EYXRhVHlwZTpzdHJpbmc7XG4gICAgcHJpdmF0ZSBudW1iZXJPZkJpbnM6bnVtYmVyO1xuICAgIHByaXZhdGUgc2hvd1hBeGlzTGFiZWw6Ym9vbGVhbjtcbiAgICBwcml2YXRlIGhpc3REYXRhOnt9W107XG4gICAgcHJpdmF0ZSBrZXlzOnt4PzpzdHJpbmcsIHZhbHVlOnN0cmluZ1tdfTtcbiAgICBwcm90ZWN0ZWQgYzNDb25maWc6Q2hhcnRDb25maWd1cmF0aW9uO1xuICAgIHByb3RlY3RlZCBjM0NvbmZpZ1lBeGlzOmMzLllBeGlzQ29uZmlndXJhdGlvbjtcbiAgICBwcm90ZWN0ZWQgY2hhcnQ6Q2hhcnRBUEk7XG5cbiAgICBwcm90ZWN0ZWQgcGF0aHM6SUhpc3RvZ3JhbVBhdGhzO1xuXG4gICAgcHJpdmF0ZSBmbGFnOmJvb2xlYW47XG4gICAgcHJpdmF0ZSBidXN5OmJvb2xlYW47XG4gICAgcHJpdmF0ZSBkaXJ0eTpib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6SVZpc1Rvb2xQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuYnVzeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlkVG9SZWNvcmQgPSB7fTtcbiAgICAgICAgdGhpcy5rZXlUb0luZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW5kZXhUb0tleSA9IHt9O1xuICAgICAgICB0aGlzLnZhbGlkYXRlID0gXy5kZWJvdW5jZSh0aGlzLnZhbGlkYXRlLmJpbmQodGhpcyksIDMwKTtcblxuICAgICAgICB0aGlzLmMzQ29uZmlnID0ge1xuICAgICAgICAgICAgc2l6ZToge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnN0eWxlLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYWRkaW5nOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICAgICAgbGVmdDoxMDAsXG4gICAgICAgICAgICAgICAgcmlnaHQ6MjBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgY29sdW1uczogW10sXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiYmFyXCIsXG4gICAgICAgICAgICAgICAgY29sb3I6IChjb2xvcjpzdHJpbmcsIGQ6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVjQ29sb3I6bnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYod2VhdmVqcy5XZWF2ZUFQSS5Mb2NhbGUucmV2ZXJzZUxheW91dCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9oYW5kbGUgY2FzZSB3aGVyZSBsYWJlbHMgbmVlZCB0byBiZSByZXZlcnNlZCBmb3IgY2hhcnQgZmxpcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wOm51bWJlciA9IHRoaXMuaGlzdERhdGEubGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjQ29sb3IgPSB0aGlzLnBhdGhzLmZpbGxTdHlsZS5wdXNoKFwiY29sb3JcIikuZ2V0T2JqZWN0KFwiaW50ZXJuYWxEeW5hbWljQ29sdW1uXCIsIG51bGwpLmdldENvbG9yRnJvbURhdGFWYWx1ZSh0ZW1wLWQuaW5kZXgpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY0NvbG9yID0gdGhpcy5wYXRocy5maWxsU3R5bGUucHVzaChcImNvbG9yXCIpLmdldE9iamVjdChcImludGVybmFsRHluYW1pY0NvbHVtblwiLCBudWxsKS5nZXRDb2xvckZyb21EYXRhVmFsdWUoZC5pbmRleCkudG9TdHJpbmcoMTYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI1wiICsgU3RhbmRhcmRMaWIuZGVjaW1hbFRvSGV4KGRlY0NvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIjQzBDREQxXCI7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiAoZDphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50Ok1vdXNlRXZlbnQgPSB0aGlzLmNoYXJ0LmludGVybmFsLmQzIGFzIE1vdXNlRXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmKCEoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KSAmJiBkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkSWRzOnN0cmluZ1tdID0gdGhpcy5wYXRocy5iaW5uZWRDb2x1bW4uZ2V0T2JqZWN0KCkuZ2V0S2V5c0Zyb21CaW5JbmRleChkLmluZGV4KS5tYXAoIChxS2V5Ont9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9vbFBhdGgucWtleVRvU3RyaW5nKHFLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuc2V0S2V5cyhzZWxlY3RlZElkcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uc2VsZWN0ZWQ6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkSWRzOnN0cmluZ1tdID0gdGhpcy5wYXRocy5iaW5uZWRDb2x1bW4uZ2V0T2JqZWN0KCkuZ2V0S2V5c0Zyb21CaW5JbmRleChkLmluZGV4KS5tYXAoIChxS2V5Ont9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9vbFBhdGgucWtleVRvU3RyaW5nKHFLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuYWRkS2V5cyhzZWxlY3RlZElkcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9udW5zZWxlY3RlZDogKGQ6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5TZWxlY3RlZElkczpzdHJpbmdbXSA9IHRoaXMucGF0aHMuYmlubmVkQ29sdW1uLmdldE9iamVjdCgpLmdldEtleXNGcm9tQmluSW5kZXgoZC5pbmRleCkubWFwKCAocUtleTp7fSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvb2xQYXRoLnFrZXlUb1N0cmluZyhxS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LnJlbW92ZUtleXModW5TZWxlY3RlZElkcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9ubW91c2VvdmVyOiAoZDphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZCAmJiBkLmhhc093blByb3BlcnR5KFwiaW5kZXhcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZElkczpzdHJpbmdbXSA9IHRoaXMucGF0aHMuYmlubmVkQ29sdW1uLmdldE9iamVjdCgpLmdldEtleXNGcm9tQmluSW5kZXgoZC5pbmRleCkubWFwKCAocUtleTp7fSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvb2xQYXRoLnFrZXlUb1N0cmluZyhxS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhzZWxlY3RlZElkcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9ubW91c2VvdXQ6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmluZHRvOiBudWxsLFxuICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBheGlzOiB7XG4gICAgICAgICAgICAgICAgeDoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNhdGVnb3J5XCIsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFwib3V0ZXItY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGljazoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRlOiAtNDUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdWxsaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4OiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlsaW5lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogKG51bTpudW1iZXIpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5lbGVtZW50ICYmIHRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWxIZWlnaHQ6bnVtYmVyID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luQm90dG9tLmdldFN0YXRlKCkpL01hdGguY29zKDQ1KihNYXRoLlBJLzE4MCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWxTdHJpbmc6c3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaGFuZGxlIGNhc2Ugd2hlcmUgbGFiZWxzIG5lZWQgdG8gYmUgcmV2ZXJzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wOm51bWJlciA9IHRoaXMuaGlzdERhdGEubGVuZ3RoLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZyA9IHRoaXMucGF0aHMuYmlubmVkQ29sdW1uLmdldE9iamVjdCgpLmRlcml2ZVN0cmluZ0Zyb21OdW1iZXIodGVtcC1udW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nID0gdGhpcy5wYXRocy5iaW5uZWRDb2x1bW4uZ2V0T2JqZWN0KCkuZGVyaXZlU3RyaW5nRnJvbU51bWJlcihudW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGxhYmVsU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RyaW5nU2l6ZTpudW1iZXIgPSBTdGFuZGFyZExpYi5nZXRUZXh0V2lkdGgobGFiZWxTdHJpbmcsIHRoaXMuZ2V0Rm9udFN0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZGp1c3RtZW50Q2hhcmFjdGVyczpudW1iZXIgPSBsYWJlbFN0cmluZy5sZW5ndGggLSBNYXRoLmZsb29yKGxhYmVsU3RyaW5nLmxlbmd0aCAqIChsYWJlbEhlaWdodCAvIHN0cmluZ1NpemUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGp1c3RtZW50Q2hhcmFjdGVycyA+IDAgPyBsYWJlbFN0cmluZy5zdWJzdHJpbmcoMCwgbGFiZWxTdHJpbmcubGVuZ3RoIC0gYWRqdXN0bWVudENoYXJhY3RlcnMgLSAzKSArIFwiLi4uXCIgOiBsYWJlbFN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGF0aHMuYmlubmVkQ29sdW1uLmdldE9iamVjdCgpLmRlcml2ZVN0cmluZ0Zyb21OdW1iZXIobnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJvdGF0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogKG51bTpudW1iZXIpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXRocy5iaW5uZWRDb2x1bW4uZ2V0T2JqZWN0KCkuZGVyaXZlU3RyaW5nRnJvbU51bWJlcihudW0pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAobmFtZTpzdHJpbmcsIHJhdGlvOm51bWJlciwgaWQ6c3RyaW5nLCBpbmRleDpudW1iZXIpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRZQXhpc0xhYmVsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogeyBkdXJhdGlvbjogMCB9LFxuICAgICAgICAgICAgZ3JpZDoge1xuICAgICAgICAgICAgICAgIHg6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeToge1xuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhcjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB7XG4gICAgICAgICAgICAgICAgICAgIHJhdGlvOiAwLjk1XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ucmVuZGVyZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVN0eWxlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGlydHkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jM0NvbmZpZ1lBeGlzID0ge1xuICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiB7XG4gICAgICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJvdXRlci1taWRkbGVcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRpY2s6IHtcbiAgICAgICAgICAgICAgICBmaXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogKG51bTpudW1iZXIpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoRm9ybWF0VXRpbHMuZGVmYXVsdE51bWJlckZvcm1hdHRpbmcobnVtKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlOmFueSlcbiAgICB7XG5cbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhldmVudDpNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmKCF0aGlzLmZsYWcpIHtcbiAgICAgICAgICAgIHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5zZXRLZXlzKFtdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZsYWcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByb3RhdGVBeGVzKCkge1xuICAgICAgICAvL3RoaXMuYzNDb25maWcuYXhpcy5yb3RhdGVkID0gdHJ1ZTtcbiAgICAgICAgLy90aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRZQXhpc0xhYmVsKCk6c3RyaW5nIHtcbiAgICAgICAgdmFyIG92ZXJyaWRlQXhpc05hbWUgPSB0aGlzLnBhdGhzLnlBeGlzLnB1c2goXCJvdmVycmlkZUF4aXNOYW1lXCIpLmdldFN0YXRlKCk7XG4gICAgICAgIGlmKG92ZXJyaWRlQXhpc05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBvdmVycmlkZUF4aXNOYW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYodGhpcy5wYXRocy5jb2x1bW5Ub0FnZ3JlZ2F0ZS5nZXRTdGF0ZSgpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCh0aGlzLnBhdGhzLmFnZ3JlZ2F0aW9uTWV0aG9kLmdldFN0YXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImNvdW50XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJOdW1iZXIgb2YgcmVjb3Jkc1wiO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3VtXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJTdW0gb2YgXCIgKyB0aGlzLnBhdGhzLmNvbHVtblRvQWdncmVnYXRlLmdldE9iamVjdCgpLmdldE1ldGFkYXRhKCd0aXRsZScpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwibWVhblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiTWVhbiBvZiBcIiArIHRoaXMucGF0aHMuY29sdW1uVG9BZ2dyZWdhdGUuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOdW1iZXIgb2YgcmVjb3Jkc1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlU3R5bGUoKSB7XG4gICAgXHRpZiAoIXRoaXMuY2hhcnQpXG4gICAgXHRcdHJldHVybjtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcy5lbGVtZW50KS5zZWxlY3RBbGwoXCJwYXRoXCIpLnN0eWxlKFwib3BhY2l0eVwiLCAxKVxuICAgICAgICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiYmxhY2tcIilcbiAgICAgICAgICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCBcIjFweFwiKVxuICAgICAgICAgICAgLnN0eWxlKFwic3Ryb2tlLW9wYWNpdHlcIiwgMC41KTtcblxuICAgICAgICB2YXIgc2VsZWN0ZWRLZXlzOklRdWFsaWZpZWRLZXlbXSA9IHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5nZXRLZXlzKCk7XG4gICAgICAgIHZhciBwcm9iZWRLZXlzOklRdWFsaWZpZWRLZXlbXSA9IHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmdldEtleXMoKTtcbiAgICAgICAgdmFyIHNlbGVjdGVkUmVjb3JkczpSZWNvcmRbXSA9IF8uZmlsdGVyKHRoaXMubnVtZXJpY1JlY29yZHMsIGZ1bmN0aW9uKHJlY29yZDpSZWNvcmQpIHtcbiAgICAgICAgICAgIHJldHVybiBfLmluY2x1ZGVzKHNlbGVjdGVkS2V5cywgcmVjb3JkLmlkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBwcm9iZWRSZWNvcmRzOlJlY29yZFtdID0gXy5maWx0ZXIodGhpcy5udW1lcmljUmVjb3JkcywgZnVuY3Rpb24ocmVjb3JkOlJlY29yZCkge1xuICAgICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXMocHJvYmVkS2V5cywgcmVjb3JkLmlkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBzZWxlY3RlZEJpbkluZGljZXM6bnVtYmVyW10gPSBfLnBsdWNrKF8udW5pcShzZWxlY3RlZFJlY29yZHMsICdiaW5uZWRDb2x1bW4nKSwgJ2Jpbm5lZENvbHVtbicpO1xuICAgICAgICB2YXIgcHJvYmVkQmluSW5kaWNlczpudW1iZXJbXSA9IF8ucGx1Y2soXy51bmlxKHByb2JlZFJlY29yZHMsICdiaW5uZWRDb2x1bW4nKSwgJ2Jpbm5lZENvbHVtbicpO1xuICAgICAgICB2YXIgYmluSW5kaWNlczpudW1iZXJbXSA9IF8ucGx1Y2soXy51bmlxKHRoaXMubnVtZXJpY1JlY29yZHMsICdiaW5uZWRDb2x1bW4nKSwgJ2Jpbm5lZENvbHVtbicpO1xuICAgICAgICB2YXIgdW5zZWxlY3RlZEJpbkluZGljZXM6bnVtYmVyW10gPSBfLmRpZmZlcmVuY2UoYmluSW5kaWNlcyxzZWxlY3RlZEJpbkluZGljZXMpO1xuICAgICAgICB1bnNlbGVjdGVkQmluSW5kaWNlcyA9IF8uZGlmZmVyZW5jZSh1bnNlbGVjdGVkQmluSW5kaWNlcyxwcm9iZWRCaW5JbmRpY2VzKTtcblxuICAgICAgICBpZihzZWxlY3RlZEJpbkluZGljZXMubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbVN0eWxlKHVuc2VsZWN0ZWRCaW5JbmRpY2VzLCBcInBhdGhcIiwgXCIuYzMtc2hhcGVcIiwge29wYWNpdHk6IDAuMywgXCJzdHJva2Utb3BhY2l0eVwiOiAwLjB9KTtcbiAgICAgICAgICAgIHRoaXMuY3VzdG9tU3R5bGUoc2VsZWN0ZWRCaW5JbmRpY2VzLCBcInBhdGhcIiwgXCIuYzMtc2hhcGVcIiwge29wYWNpdHk6IDEuMCwgXCJzdHJva2Utb3BhY2l0eVwiOiAxLjB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKCFwcm9iZWRCaW5JbmRpY2VzLmxlbmd0aClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5jdXN0b21TdHlsZShiaW5JbmRpY2VzLCBcInBhdGhcIiwgXCIuYzMtc2hhcGVcIiwge29wYWNpdHk6IDEuMCwgXCJzdHJva2Utb3BhY2l0eVwiOiAwLjV9KTtcbiAgICAgICAgICAgIHRoaXMuY2hhcnQuc2VsZWN0KHRoaXMuaGVpZ2h0Q29sdW1uTmFtZXMsIFtdLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZGF0YUNoYW5nZWQoKSB7XG5cbiAgICAgICAgdmFyIG51bWVyaWNNYXBwaW5nOmFueSA9IHtcbiAgICAgICAgICAgIGJpbm5lZENvbHVtbjogdGhpcy5wYXRocy5iaW5uZWRDb2x1bW4sXG4gICAgICAgICAgICBjb2x1bW5Ub0FnZ3JlZ2F0ZTogdGhpcy5wYXRocy5jb2x1bW5Ub0FnZ3JlZ2F0ZVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzdHJpbmdNYXBwaW5nOmFueSA9IHtcbiAgICAgICAgICAgIGJpbm5lZENvbHVtbjogdGhpcy5wYXRocy5iaW5uZWRDb2x1bW5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmJpbm5lZENvbHVtbkRhdGFUeXBlID0gdGhpcy5wYXRocy5iaW5uZWRDb2x1bW4uZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ2RhdGFUeXBlJyk7XG5cbiAgICAgICAgdGhpcy5udW1lcmljUmVjb3JkcyA9IHRoaXMucGF0aHMucGxvdHRlci5yZXRyaWV2ZVJlY29yZHMobnVtZXJpY01hcHBpbmcsIHtrZXlTZXQ6IHRoaXMucGF0aHMuZmlsdGVyZWRLZXlTZXQsIGRhdGFUeXBlOiBcIm51bWJlclwifSk7XG4gICAgICAgIHRoaXMuc3RyaW5nUmVjb3JkcyA9IHRoaXMucGF0aHMucGxvdHRlci5yZXRyaWV2ZVJlY29yZHMoc3RyaW5nTWFwcGluZywge2tleVNldDogdGhpcy5wYXRocy5maWx0ZXJlZEtleVNldCwgZGF0YVR5cGU6IFwic3RyaW5nXCJ9KTtcblxuICAgICAgICB0aGlzLmlkVG9SZWNvcmQgPSB7fTtcbiAgICAgICAgdGhpcy5rZXlUb0luZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW5kZXhUb0tleSA9IHt9O1xuXG4gICAgICAgIHRoaXMubnVtZXJpY1JlY29yZHMuZm9yRWFjaCgocmVjb3JkOlJlY29yZCwgaW5kZXg6bnVtYmVyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlkVG9SZWNvcmRbcmVjb3JkLmlkIGFzIGFueV0gPSByZWNvcmQ7XG4gICAgICAgICAgICB0aGlzLmtleVRvSW5kZXhbcmVjb3JkLmlkIGFzIGFueV0gPSBpbmRleDtcbiAgICAgICAgICAgIHRoaXMuaW5kZXhUb0tleVtpbmRleF0gPSByZWNvcmQuaWQ7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubnVtYmVyT2ZCaW5zID0gdGhpcy5wYXRocy5iaW5uZWRDb2x1bW4uZ2V0T2JqZWN0KCkubnVtYmVyT2ZCaW5zO1xuXG4gICAgICAgIHRoaXMuaGlzdERhdGEgPSBbXTtcblxuICAgICAgICAvLyB0aGlzLl9jb2x1bW5Ub0FnZ3JlZ2F0ZVBhdGguZ2V0T2JqZWN0KCkuZ2V0SW50ZXJuYWxDb2x1bW4oKTtcbiAgICAgICAgdmFyIGNvbHVtblRvQWdncmVnYXRlTmFtZUlzRGVmaW5lZDpib29sZWFuID0gdGhpcy5wYXRocy5jb2x1bW5Ub0FnZ3JlZ2F0ZS5nZXRTdGF0ZSgpLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgZm9yKGxldCBpQmluOm51bWJlciA9IDA7IGlCaW4gPCB0aGlzLm51bWJlck9mQmluczsgaUJpbisrKSB7XG5cbiAgICAgICAgICAgIGxldCByZWNvcmRzSW5CaW46UmVjb3JkW10gPSBfLmZpbHRlcih0aGlzLm51bWVyaWNSZWNvcmRzLCB7IGJpbm5lZENvbHVtbjogaUJpbiB9KTtcblxuICAgICAgICAgICAgaWYocmVjb3Jkc0luQmluKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iajphbnkgPSB7aGVpZ2h0OjB9O1xuICAgICAgICAgICAgICAgIGlmKGNvbHVtblRvQWdncmVnYXRlTmFtZUlzRGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBvYmouaGVpZ2h0ID0gdGhpcy5nZXRBZ2dyZWdhdGVWYWx1ZShyZWNvcmRzSW5CaW4sIFwiY29sdW1uVG9BZ2dyZWdhdGVcIiwgdGhpcy5wYXRocy5hZ2dyZWdhdGlvbk1ldGhvZC5nZXRTdGF0ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaXN0RGF0YS5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmhlaWdodCA9IHRoaXMuZ2V0QWdncmVnYXRlVmFsdWUocmVjb3Jkc0luQmluLCBcImJpbm5lZENvbHVtblwiLCBcImNvdW50XCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpc3REYXRhLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmtleXMgPSB7IHZhbHVlOiBbXCJoZWlnaHRcIl0gfTtcbiAgICAgICAgaWYod2VhdmVqcy5XZWF2ZUFQSS5Mb2NhbGUucmV2ZXJzZUxheW91dCl7XG4gICAgICAgICAgICB0aGlzLmhpc3REYXRhID0gdGhpcy5oaXN0RGF0YS5yZXZlcnNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmMzQ29uZmlnLmRhdGEuanNvbiA9IHRoaXMuaGlzdERhdGE7XG4gICAgICAgIHRoaXMuYzNDb25maWcuZGF0YS5rZXlzID0gdGhpcy5rZXlzO1xuICAgICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRBZ2dyZWdhdGVWYWx1ZShyZWNvcmRzOlJlY29yZFtdLCBjb2x1bW5Ub0FnZ3JlZ2F0ZU5hbWU6c3RyaW5nLCBhZ2dyZWdhdGlvbk1ldGhvZDpXZWF2ZVBhdGgpOm51bWJlciB7XG5cbiAgICAgICAgdmFyIGNvdW50Om51bWJlciA9IDA7XG4gICAgICAgIHZhciBzdW06bnVtYmVyID0gMDtcblxuICAgICAgICBpZighQXJyYXkuaXNBcnJheShyZWNvcmRzKSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICByZWNvcmRzLmZvckVhY2goKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIHN1bSArPSByZWNvcmRbY29sdW1uVG9BZ2dyZWdhdGVOYW1lXSBhcyBudW1iZXI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChhZ2dyZWdhdGlvbk1ldGhvZCA9PT0gXCJtZWFuXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBzdW0gLyBjb3VudDsgLy8gY29udmVydCBzdW0gdG8gbWVhblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFnZ3JlZ2F0aW9uTWV0aG9kID09PSBcImNvdW50XCIpIHtcblxuICAgICAgICAgICAgcmV0dXJuIGNvdW50OyAvLyB1c2UgY291bnQgb2YgZmluaXRlIHZhbHVlc1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3VtXG4gICAgICAgIHJldHVybiBzdW07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICBpZih0aGlzLmMzQ29uZmlnLnNpemUud2lkdGggIT0gdGhpcy5wcm9wcy5zdHlsZS53aWR0aCB8fCB0aGlzLmMzQ29uZmlnLnNpemUuaGVpZ2h0ICE9IHRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnNpemUgPSB7d2lkdGg6IHRoaXMucHJvcHMuc3R5bGUud2lkdGgsIGhlaWdodDogdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHR9O1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvKiBDbGVhbnVwIGNhbGxiYWNrcyAqL1xuICAgICAgICAvL3RoaXMudGVhcmRvd25DYWxsYmFja3MoKTtcbiAgICAgICAgdGhpcy5jaGFydC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5zaG93WEF4aXNMYWJlbCA9IGZhbHNlO1xuICAgICAgICB2YXIgcGxvdHRlclBhdGggPSB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwicGxvdFwiKTtcbiAgICAgICAgdmFyIG1hcHBpbmcgPSBbXG4gICAgICAgICAgICB7IG5hbWU6IFwicGxvdHRlclwiLCBwYXRoOiBwbG90dGVyUGF0aCwgY2FsbGJhY2tzOiB0aGlzLnZhbGlkYXRlfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJiaW5uZWRDb2x1bW5cIiwgcGF0aDogcGxvdHRlclBhdGgucHVzaChcImJpbm5lZENvbHVtblwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImNvbHVtblRvQWdncmVnYXRlXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJjb2x1bW5Ub0FnZ3JlZ2F0ZVwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImFnZ3JlZ2F0aW9uTWV0aG9kXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJhZ2dyZWdhdGlvbk1ldGhvZFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImZpbGxTdHlsZVwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiZmlsbFN0eWxlXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwibGluZVN0eWxlXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJsaW5lU3R5bGVcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJ4QXhpc1wiLCBwYXRoOiB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwieEF4aXNcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJ5QXhpc1wiLCBwYXRoOiB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwieUF4aXNcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5Cb3R0b21cIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpbkJvdHRvbVwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm1hcmdpbkxlZnRcIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpbkxlZnRcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5Ub3BcIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpblRvcFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm1hcmdpblJpZ2h0XCIsIHBhdGg6IHRoaXMucGxvdE1hbmFnZXJQYXRoLnB1c2goXCJtYXJnaW5SaWdodFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImZpbHRlcmVkS2V5U2V0XCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJmaWx0ZXJlZEtleVNldFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcInNlbGVjdGlvbktleVNldFwiLCBwYXRoOiB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQsIGNhbGxiYWNrczogdGhpcy51cGRhdGVTdHlsZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcInByb2JlS2V5U2V0XCIsIHBhdGg6IHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LCBjYWxsYmFja3M6IHRoaXMudXBkYXRlU3R5bGUgfVxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVBhdGhzKG1hcHBpbmcpO1xuXG4gICAgICAgXHR0aGlzLnBhdGhzLmZpbHRlcmVkS2V5U2V0LmdldE9iamVjdCgpLnNldFNpbmdsZUtleVNvdXJjZSh0aGlzLnBhdGhzLmZpbGxTdHlsZS5nZXRPYmplY3QoJ2NvbG9yJywgJ2ludGVybmFsRHluYW1pY0NvbHVtbicpKTtcblxuICAgICAgICB0aGlzLmMzQ29uZmlnLmJpbmR0byA9IHRoaXMuZWxlbWVudDtcbiAgICAgICAgdGhpcy52YWxpZGF0ZSh0cnVlKTtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZShmb3JjZWQ6Ym9vbGVhbiA9IGZhbHNlKTp2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5idXN5KVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGNoYW5nZURldGVjdGVkOmJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgdmFyIGF4aXNDaGFuZ2U6Ym9vbGVhbiA9IHRoaXMuZGV0ZWN0Q2hhbmdlKCdiaW5uZWRDb2x1bW4nLCAnYWdncmVnYXRpb25NZXRob2QnLCAnbWFyZ2luQm90dG9tJywgJ21hcmdpblRvcCcsICdtYXJnaW5MZWZ0JywgJ21hcmdpblJpZ2h0Jyk7XG4gICAgICAgIHZhciBheGlzU2V0dGluZ3NDaGFuZ2U6Ym9vbGVhbiA9IHRoaXMuZGV0ZWN0Q2hhbmdlKCd4QXhpcycsICd5QXhpcycpO1xuICAgICAgICBpZiAoYXhpc0NoYW5nZSB8fCB0aGlzLmRldGVjdENoYW5nZSgncGxvdHRlcicsICdjb2x1bW5Ub0FnZ3JlZ2F0ZScsICdmaWxsU3R5bGUnLCAnbGluZVN0eWxlJywnZmlsdGVyZWRLZXlTZXQnKSlcbiAgICAgICAge1xuICAgICAgICAgICAgY2hhbmdlRGV0ZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kYXRhQ2hhbmdlZCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChheGlzQ2hhbmdlKVxuICAgICAgICB7XG4gICAgICAgICAgICBjaGFuZ2VEZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB2YXIgeExhYmVsOnN0cmluZyA9IHRoaXMucGF0aHMueEF4aXMuZ2V0U3RhdGUoXCJvdmVycmlkZUF4aXNOYW1lXCIpIHx8IHRoaXMucGF0aHMuYmlubmVkQ29sdW1uLmdldE9iamVjdCgpLmdldE1ldGFkYXRhKCd0aXRsZScpO1xuICAgICAgICAgICAgaWYoIXRoaXMuc2hvd1hBeGlzTGFiZWwpe1xuICAgICAgICAgICAgICAgIHhMYWJlbCA9IFwiIFwiO1xuICAgICAgICAgICAgfXZhciB5TGFiZWw6c3RyaW5nID0gdGhpcy5nZXRZQXhpc0xhYmVsLmJpbmQodGhpcykoKTtcblxuXG4gICAgICAgICAgICBpZiAodGhpcy5udW1lcmljUmVjb3JkcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgdGVtcDpzdHJpbmcgPSBcImhlaWdodFwiO1xuICAgICAgICAgICAgICAgIGlmICh3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5kYXRhLmF4ZXMgPSB7W3RlbXBdOid5Mid9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueTIgPSB0aGlzLmMzQ29uZmlnWUF4aXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55ID0ge3Nob3c6IGZhbHNlfTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLngudGljay5yb3RhdGUgPSA0NTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5kYXRhLmF4ZXMgPSB7W3RlbXBdOid5J307XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55ID0gdGhpcy5jM0NvbmZpZ1lBeGlzO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jM0NvbmZpZy5heGlzLnkyO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC50aWNrLnJvdGF0ZSA9IC00NTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy54LmxhYmVsID0ge3RleHQ6eExhYmVsLCBwb3NpdGlvbjpcIm91dGVyLWNlbnRlclwifTtcbiAgICAgICAgICAgIHRoaXMuYzNDb25maWdZQXhpcy5sYWJlbCA9IHt0ZXh0OnlMYWJlbCwgcG9zaXRpb246XCJvdXRlci1taWRkbGVcIn07XG5cbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy50b3AgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5Ub3AuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC5oZWlnaHQgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5Cb3R0b20uZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICBpZih3ZWF2ZWpzLldlYXZlQVBJLkxvY2FsZS5yZXZlcnNlTGF5b3V0KXtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnBhZGRpbmcubGVmdCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpblJpZ2h0LmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy5yaWdodCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpbkxlZnQuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLnBhZGRpbmcubGVmdCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpbkxlZnQuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5wYWRkaW5nLnJpZ2h0ID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luUmlnaHQuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbmdlRGV0ZWN0ZWQgfHwgZm9yY2VkKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmJ1c3kgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jaGFydCA9IGMzLmdlbmVyYXRlKHRoaXMuYzNDb25maWcpO1xuICAgICAgICAgICAgdGhpcy5sb2FkRGF0YSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9hZERhdGEoKSB7XG4gICAgICAgIGlmKCF0aGlzLmNoYXJ0IHx8IHRoaXMuYnVzeSlcbiAgICAgICAgICAgIHJldHVybiBTdGFuZGFyZExpYi5kZWJvdW5jZSh0aGlzLCAnbG9hZERhdGEnKTtcbiAgICAgICAgdGhpcy5jaGFydC5sb2FkKHtqc29uOiB0aGlzLmhpc3REYXRhLCBrZXlzOnRoaXMua2V5cywgdW5sb2FkOiB0cnVlLCBkb25lOiAoKSA9PiB7IHRoaXMuYnVzeSA9IGZhbHNlOyB0aGlzLmN1bGxBeGVzKCk7fX0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2VhdmVDM0hpc3RvZ3JhbTtcblxucmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb24oXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnRvb2xzOjpIaXN0b2dyYW1Ub29sXCIsIFdlYXZlQzNIaXN0b2dyYW0pO1xucmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb24oXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnRvb2xzOjpDb2xvcm1hcEhpc3RvZ3JhbVRvb2xcIiwgV2VhdmVDM0hpc3RvZ3JhbSk7XG4vL1dlYXZlLnJlZ2lzdGVyQ2xhc3MoXCJ3ZWF2ZWpzLnRvb2xzLkhpc3RvZ3JhbVRvb2xcIiwgV2VhdmVDM0hpc3RvZ3JhbSwgW3dlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlT2JqZWN0V2l0aE5ld1Byb3BlcnRpZXNdKTtcbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlanMudG9vbHMuQ29sb3JtYXBIaXN0b2dyYW1Ub29sXCIsIFdlYXZlQzNIaXN0b2dyYW0sIFt3ZWF2ZWpzLmFwaS5jb3JlLklMaW5rYWJsZU9iamVjdFdpdGhOZXdQcm9wZXJ0aWVzXSk7XG4iXX0=
