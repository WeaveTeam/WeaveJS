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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../typings/c3/c3.d.ts"/>
///<reference path="../../typings/d3/d3.d.ts"/>
///<reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

var WeaveC3Barchart = function (_AbstractC3Tool) {
    _inherits(WeaveC3Barchart, _AbstractC3Tool);

    function WeaveC3Barchart(props) {
        _classCallCheck(this, WeaveC3Barchart);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveC3Barchart).call(this, props));

        _this.keyToIndex = {};
        _this.indexToKey = {};
        _this.yAxisValueToLabel = {};
        _this.xAxisValueToLabel = {};
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
                json: [],
                type: "bar",
                xSort: false,
                names: {},
                selection: {
                    enabled: true,
                    multiple: true,
                    draggable: true
                },
                labels: {
                    format: function format(v, id, i, j) {
                        if (_this.showValueLabels) {
                            return v;
                        } else {
                            return "";
                        }
                    }
                },
                order: null,
                color: function color(_color, d) {
                    if (_this.heightColumnNames.length === 1 && d.hasOwnProperty("index")) {
                        // find the corresponding index of numericRecords in stringRecords
                        var id = _this.indexToKey[d.index];
                        var index = _.pluck(_this.stringRecords, "id").indexOf(id);
                        return _this.stringRecords[index] ? _this.stringRecords[index]["color"] : "#C0CDD1";
                    } else {
                        return _color || "#C0CDD1";
                    }
                },
                onclick: function onclick(d) {},
                onselected: function onselected(d) {
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.addKeys([_this.indexToKey[d.index]]);
                    }
                },
                onunselected: function onunselected(d) {
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.selection_keyset.removeKeys([_this.indexToKey[d.index]]);
                    }
                },
                onmouseover: function onmouseover(d) {
                    if (d && d.hasOwnProperty("index")) {
                        _this.toolPath.probe_keyset.setKeys([]);
                        var columnNamesToValue = {};
                        var columnNamesToColor = {};
                        _this.heightColumnNames.forEach(function (column, index) {
                            columnNamesToValue[_this.heightColumnsLabels[index]] = _this.numericRecords[d.index]['heights'][column];
                            if (_this.heightColumnNames.length > 1) {
                                var color = _StandardLib2.default.interpolateColor(index / (_this.heightColumnNames.length - 1), _this.colorRamp);
                                columnNamesToColor[_this.heightColumnsLabels[index]] = "#" + _StandardLib2.default.decimalToHex(color);
                            }
                        });
                        var title = _this.stringRecords[d.index]["xLabel"];
                        _this.props.toolTip.setState({
                            x: _this.chart.internal.d3.event.pageX,
                            y: _this.chart.internal.d3.event.pageY,
                            showToolTip: true,
                            title: title,
                            columnNamesToValue: columnNamesToValue,
                            columnNamesToColor: columnNamesToColor
                        });
                        _this.toolPath.probe_keyset.setKeys([_this.indexToKey[d.index]]);
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
                            if (_this.stringRecords && _this.stringRecords[num]) {
                                if (_this.element && _this.props.style.height > 0 && _this.paths.marginBottom) {
                                    var labelHeight = Number(_this.paths.marginBottom.getState()) / Math.cos(45 * (Math.PI / 180));
                                    var labelString = _this.stringRecords[num]["xLabel"];
                                    if (labelString) {
                                        var stringSize = _StandardLib2.default.getTextWidth(labelString, _this.getFontString());
                                        var adjustmentCharacters = labelString.length - Math.floor(labelString.length * (labelHeight / stringSize));
                                        return adjustmentCharacters > 0 ? labelString.substring(0, labelString.length - adjustmentCharacters - 3) + "..." : labelString;
                                    } else {
                                        return "";
                                    }
                                } else {
                                    return _this.stringRecords[num]["xLabel"];
                                }
                            } else {
                                return "";
                            }
                        }
                    }
                },
                rotated: false
            },
            tooltip: {
                format: {
                    title: function title(num) {
                        if (_this.stringRecords && _this.stringRecords[num]) {
                            return _this.stringRecords[num]["xLabel"];
                        } else {
                            return "";
                        }
                    },
                    name: function name(_name, ratio, id, index) {
                        var labelIndex = _this.heightColumnNames.indexOf(_name);
                        return _this.heightColumnsLabels ? _this.heightColumnsLabels[labelIndex] : "";
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
            bindto: null,
            bar: {
                width: {
                    ratio: 0.8
                }
            },
            legend: {
                show: false,
                position: "bottom"
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
                multiline: false,
                format: function format(num) {
                    if (_this.yLabelColumnPath && _this.yLabelColumnDataType !== "number") {
                        return _this.yAxisValueToLabel[num] || "";
                    } else if (_this.groupingMode === "percentStack") {
                        return d3.format(".0%")(num);
                    } else {
                        return String(_FormatUtils2.default.defaultNumberFormatting(num));
                    }
                }
            }
        };
        return _this;
    }

    _createClass(WeaveC3Barchart, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "handlePointClick",
        value: function handlePointClick(event) {
            var probeKeys = this.toolPath.probe_keyset.getKeys();
            var selectionKeys = this.toolPath.selection_keyset.getKeys();
            if (_.isEqual(probeKeys, selectionKeys)) this.toolPath.selection_keyset.setKeys([]);else this.toolPath.selection_keyset.setKeys(probeKeys);
        }
    }, {
        key: "handleShowValueLabels",
        value: function handleShowValueLabels() {
            if (!this.chart) return;
            this.showValueLabels = this.paths.showValueLabels.getState();
            this.chart.flush();
        }
    }, {
        key: "dataChanged",
        value: function dataChanged() {
            var _this2 = this;

            var lhm = this.paths.heightColumns.getObject();
            var columns = lhm.getObjects();
            var names = lhm.getNames();
            // the y label column is the first column in heightColumns
            this.yLabelColumnPath = Weave.getPath(columns[0]);
            var numericMapping = {
                sort: this.paths.sortColumn,
                xLabel: this.paths.labelColumn,
                heights: {},
                yLabel: this.yLabelColumnPath
            };
            var stringMapping = {
                sort: this.paths.sortColumn,
                color: this.paths.colorColumn,
                xLabel: this.paths.labelColumn,
                yLabel: this.yLabelColumnPath
            };
            this.heightColumnNames = [];
            this.heightColumnsLabels = [];
            for (var idx in columns) {
                var column = columns[idx];
                var name = names[idx];
                var title = column.getMetadata('title');
                this.heightColumnsLabels.push(title);
                this.heightColumnNames.push(name);
                numericMapping.heights[name] = column;
            }
            this.yLabelColumnDataType = this.yLabelColumnPath.getObject().getMetadata('dataType');
            this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, { keySet: this.paths.filteredKeySet, dataType: "number" });
            if (!this.numericRecords.length) return;
            this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, { keySet: this.paths.filteredKeySet, dataType: "string" });
            this.records = _.zip(this.numericRecords, this.stringRecords);
            //this.records = _.sortByOrder(this.records, ["sort", "id"], ['asc', 'asc']);
            this.records = _.sortBy(this.records, function (record) {
                return record[0]["sort"];
            });
            if (weavejs.WeaveAPI.Locale.reverseLayout) {
                this.records = this.records.reverse();
            }
            if (this.records.length) {
                ;

                var _$unzip = _.unzip(this.records);

                var _$unzip2 = _slicedToArray(_$unzip, 2);

                this.numericRecords = _$unzip2[0];
                this.stringRecords = _$unzip2[1];
            }this.yAxisValueToLabel = {};
            this.xAxisValueToLabel = {};
            this.keyToIndex = {};
            this.indexToKey = {};
            this.numericRecords.forEach(function (record, index) {
                _this2.keyToIndex[record.id] = index;
                _this2.indexToKey[index] = record.id;
            });
            this.stringRecords.forEach(function (record, index) {
                var numericRecord = _this2.numericRecords[index];
                if (numericRecord) {
                    _this2.yAxisValueToLabel[numericRecord["yLabel"]] = record["yLabel"];
                    _this2.xAxisValueToLabel[numericRecord["xLabel"]] = record["xLabel"];
                }
            });
            this.groupingMode = this.paths.groupingMode.getState();
            //var horizontalMode = this.paths.plotter.push("horizontalMode").getState();
            // set axis rotation mode
            //this.chart.load({axes: { rotated: horizontalMode }});
            if (this.groupingMode === "stack" || this.groupingMode === "percentStack")
                //this.c3Config.data.groups = [this.heightColumnNames];
                this.chart.groups([this.heightColumnNames]);else this.c3Config.data.groups = [];
            if (this.groupingMode === "percentStack" && this.heightColumnNames.length > 1) {
                // normalize the height columns to be percentages.
                this.numericRecords.forEach(function (record) {
                    var heights = record['heights'];
                    var sum = 0;
                    for (var key in heights) {
                        sum += heights[key];
                    }for (var key in heights) {
                        heights[key] /= sum;
                    }
                });
            }
            ;
            var keys = { x: "", value: [] };
            // if label column is specified
            if (this.paths.labelColumn.getState().length) {
                keys.x = "xLabel";
                this.c3Config.legend.show = false;
            } else {
                this.c3Config.legend.show = true;
            }
            keys.value = this.heightColumnNames;
            var columnColors = {};
            var columnTitles = {};
            if (this.heightColumnNames.length > 1) {
                this.colorRamp = this.paths.chartColors.getState();
                this.heightColumnNames.map(function (name, index) {
                    var color = _StandardLib2.default.interpolateColor(index / (_this2.heightColumnNames.length - 1), _this2.colorRamp);
                    columnColors[name] = "#" + _StandardLib2.default.decimalToHex(color);
                    columnTitles[name] = _this2.heightColumnsLabels[index];
                });
                if (this.paths.labelColumn.getState().length) {
                    this.c3Config.legend.show = true;
                }
            } else {
                this.c3Config.legend.show = false;
            }
            var data = _.cloneDeep(this.c3Config.data);
            data.json = _.pluck(this.numericRecords, 'heights');
            //need other stuff for data.json to work
            this.numericRecords.forEach(function (record, index) {
                for (var k in record) {
                    if (k != 'heights') data.json[index][k] = record[k];
                }
            });
            data.colors = columnColors;
            data.keys = keys;
            data.names = columnTitles;
            data.unload = true;
            this.c3Config.data = data;
        }
    }, {
        key: "updateStyle",
        value: function updateStyle() {
            var _this3 = this;

            if (!this.chart || !this.heightColumnNames) return;
            d3.select(this.element).selectAll("path").style("opacity", 1).style("stroke", "black").style("stroke-width", "1px").style("stroke-opacity", 0.5);
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
            this.heightColumnNames.forEach(function (item) {
                var paths = d3.selectAll("g").filter(".c3-shapes-" + item + ".c3-bars").selectAll("path");
                var texts = d3.selectAll("g").filter(".c3-texts-" + item).selectAll("text");
                if (selectedIndices.length) {
                    _this3.customSelectorStyle(unselectedIndices, paths, { opacity: 0.3, "stroke-opacity": 0.0 });
                    _this3.customSelectorStyle(selectedIndices, paths, { opacity: 1.0, "stroke-opacity": 1.0 });
                    _this3.customSelectorStyle(unselectedIndices, texts, { "fill-opacity": 0.3 });
                    _this3.customSelectorStyle(selectedIndices, texts, { "fill-opacity": 1.0 });
                } else if (!probedIndices.length) {
                    _this3.customSelectorStyle(indices, paths, { opacity: 1.0, "stroke-opacity": 0.5 });
                    _this3.customSelectorStyle(indices, texts, { "fill-opacity": 1.0 });
                }
            });
            if (selectedIndices.length) this.chart.select(this.heightColumnNames, selectedIndices, true);else if (!probedIndices.length) this.chart.select(this.heightColumnNames, [], true);
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
        key: "componentDidMount",
        value: function componentDidMount() {
            _StandardLib2.default.addPointClickListener(this.element, this.handlePointClick.bind(this));
            this.showXAxisLabel = false;
            var plotterPath = this.toolPath.pushPlotter("plot");
            var mapping = [{ name: "plotter", path: plotterPath, callbacks: this.validate }, { name: "heightColumns", path: plotterPath.push("heightColumns") }, { name: "labelColumn", path: plotterPath.push("labelColumn") }, { name: "sortColumn", path: plotterPath.push("sortColumn") }, { name: "colorColumn", path: plotterPath.push("colorColumn") }, { name: "chartColors", path: plotterPath.push("chartColors") }, { name: "groupingMode", path: plotterPath.push("groupingMode") }, { name: "horizontalMode", path: plotterPath.push("horizontalMode") }, { name: "showValueLabels", path: plotterPath.push("showValueLabels") }, { name: "xAxis", path: this.toolPath.pushPlotter("xAxis") }, { name: "yAxis", path: this.toolPath.pushPlotter("yAxis") }, { name: "marginBottom", path: this.plotManagerPath.push("marginBottom") }, { name: "marginLeft", path: this.plotManagerPath.push("marginLeft") }, { name: "marginTop", path: this.plotManagerPath.push("marginTop") }, { name: "marginRight", path: this.plotManagerPath.push("marginRight") }, { name: "overrideYMax", path: this.plotManagerPath.push("overrideYMax") }, { name: "overrideYMin", path: this.plotManagerPath.push("overrideYMin") }, { name: "filteredKeySet", path: plotterPath.push("filteredKeySet") }, { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: this.updateStyle }, { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: this.updateStyle }];
            this.initializePaths(mapping);
            this.paths.filteredKeySet.getObject().setColumnKeySources([this.paths.sortColumn.getObject()]);
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
            var axisChange = this.detectChange('heightColumns', 'labelColumn', 'sortColumn', 'marginBottom', 'marginTop', 'marginLeft', 'marginRight', 'overrideYMax', 'overrideYMin');
            var axisSettingsChange = this.detectChange('xAxis', 'yAxis');
            if (axisChange || this.detectChange('colorColumn', 'chartColors', 'groupingMode', 'filteredKeySet')) {
                changeDetected = true;
                this.dataChanged();
            }
            if (axisChange) {
                changeDetected = true;
                var xLabel = this.paths.xAxis.push("overrideAxisName").getState() || "Sorted by " + this.paths.sortColumn.getObject().getMetadata('title');
                var yLabel = this.paths.yAxis.push("overrideAxisName").getState() || (this.heightColumnsLabels ? this.heightColumnsLabels.join(", ") : "");
                if (!this.showXAxisLabel) {
                    xLabel = " ";
                }
                if (this.heightColumnNames && this.heightColumnNames.length) {
                    var temp = {};
                    if (weavejs.WeaveAPI.Locale.reverseLayout) {
                        this.heightColumnNames.forEach(function (name) {
                            temp[name] = 'y2';
                        });
                        this.c3Config.data.axes = temp;
                        this.c3Config.axis.y2 = this.c3ConfigYAxis;
                        this.c3Config.axis.y = { show: false };
                        this.c3Config.axis.x.tick.rotate = 45;
                    } else {
                        this.heightColumnNames.forEach(function (name) {
                            temp[name] = 'y';
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
                if (this.paths.labelColumn.getState().length) {
                    this.c3Config.axis.x.height = Number(this.paths.marginBottom.getState());
                } else {
                    this.c3Config.axis.x.height = null;
                }
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
                if (!isNaN(this.paths.overrideYMin.getState())) {
                    this.c3Config.axis.y.min = this.paths.overrideYMin.getState();
                } else {
                    this.c3Config.axis.y.min = null;
                }
            }
            if (this.detectChange('horizontalMode')) {
                changeDetected = true;
                this.c3Config.axis.rotated = this.paths.horizontalMode.getState();
            }
            if (this.detectChange('showValueLabels')) {
                changeDetected = true;
                this.showValueLabels = this.paths.showValueLabels.getState();
            }
            if (changeDetected || forced) {
                this.busy = true;
                this.chart = c3.generate(this.c3Config);
                this.cullAxes();
            }
        }
    }]);

    return WeaveC3Barchart;
}(_AbstractC3Tool3.default);

exports.default = WeaveC3Barchart;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::CompoundBarChartTool", WeaveC3Barchart);
//Weave.registerClass("weavejs.tools.CompoundBarChartTool", WeaveC3Barchart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtYzMtYmFyY2hhcnQuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvd2VhdmUtYzMtYmFyY2hhcnQudHN4Il0sIm5hbWVzIjpbIldlYXZlQzNCYXJjaGFydCIsIldlYXZlQzNCYXJjaGFydC5jb25zdHJ1Y3RvciIsIldlYXZlQzNCYXJjaGFydC5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIldlYXZlQzNCYXJjaGFydC5oYW5kbGVQb2ludENsaWNrIiwiV2VhdmVDM0JhcmNoYXJ0LmhhbmRsZVNob3dWYWx1ZUxhYmVscyIsIldlYXZlQzNCYXJjaGFydC5kYXRhQ2hhbmdlZCIsIldlYXZlQzNCYXJjaGFydC51cGRhdGVTdHlsZSIsIldlYXZlQzNCYXJjaGFydC5jb21wb25lbnREaWRVcGRhdGUiLCJXZWF2ZUMzQmFyY2hhcnQuY29tcG9uZW50RGlkTW91bnQiLCJXZWF2ZUMzQmFyY2hhcnQudmFsaWRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQVVZLEFBQUMsQUFBTSxBQUFRLEFBQ3BCOzs7O0lBQUssQUFBRSxBQUFNLEFBQUksQUFDakIsQUFBVyxBQUFNLEFBQXNCLEFBRXZDOzs7Ozs7OztJQUFLLEFBQUUsQUFBTSxBQUFJLEFBRWpCLEFBQVcsQUFBTSxBQUFzQixBQWlCOUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQThCLEFBQWM7OztBQTBCeEMsNkJBQVksQUFBbUI7Ozt1R0FDckIsQUFBSyxBQUFDLEFBQUM7O0FBQ2IsQUFBSSxjQUFDLEFBQVUsYUFBRyxBQUFFLEFBQUM7QUFDckIsQUFBSSxjQUFDLEFBQVUsYUFBRyxBQUFFLEFBQUM7QUFDckIsQUFBSSxjQUFDLEFBQWlCLG9CQUFHLEFBQUUsQUFBQztBQUM1QixBQUFJLGNBQUMsQUFBaUIsb0JBQUcsQUFBRSxBQUFDO0FBQzVCLEFBQUksY0FBQyxBQUFRLFdBQUcsQUFBQyxFQUFDLEFBQVEsU0FBQyxBQUFJLE1B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QUMsQUFBUSxBQUFFLEFBQUMsQUFDdEUsQUFBQzs7QUFDRCxBQUFFLEFBQUMsZ0JBQUMsQUFBSSxLQUFDLEFBQVksYUFBQyxBQUFpQixBQUFDLEFBQUM7QUFFckMsQUFBYyxpQ0FBRyxBQUFJLEFBQUMsS0FEMUIsQUFBQztBQUVHLEFBQUkscUJBQUMsQUFBZSxrQkFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQWUsZ0JBQUMsQUFBUSxBQUFFLEFBQUMsQUFDakUsQUFBQzs7QUFFRCxBQUFFLEFBQUMsZ0JBQUMsQUFBYyxrQkFBSSxBQUFNLEFBQUM7QUFFekIsQUFBSSxxQkFBQyxBQUFJLE9BQUcsQUFBSSxBQUFDO0FBQ2pCLEFBQUkscUJBQUMsQUFBSyxRQUFHLEFBQUUsR0FBQyxBQUFRLFNBQUMsQUFBSSxLQUFDLEFBQVEsQUFBQyxBQUFDO0FBQ3hDLEFBQUkscUJBQUMsQUFBUSxBQUFFLEFBQUMsQUFDcEIsQUFBQyxBQUNMLEFBQUMsQUFDTCxBQUFDLEFBRUQsV0FSUSxBQUFDOzs7Ozs7OztrQkFRTSxBQUFlLEFBQUM7O0FBQy9CLEFBQTBCLDJDQUFDLEFBQWlELG1EQUFFLEFBQWUsQUFBQyxBQUFDLEFBQy9GLEFBQWtJIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9jMy9jMy5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9kMy9kMy5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3dlYXZlL3dlYXZlanMuZC50c1wiLz5cblxuaW1wb3J0IHtJVmlzVG9vbFByb3BzfSBmcm9tIFwiLi9JVmlzVG9vbFwiO1xuaW1wb3J0IHtJVG9vbFBhdGhzfSBmcm9tIFwiLi9BYnN0cmFjdEMzVG9vbFwiO1xuaW1wb3J0IEFic3RyYWN0QzNUb29sIGZyb20gXCIuL0Fic3RyYWN0QzNUb29sXCI7XG5pbXBvcnQge3JlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi4vV2VhdmVUb29sXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIGQzIGZyb20gXCJkM1wiO1xuaW1wb3J0IEZvcm1hdFV0aWxzIGZyb20gXCIuLi91dGlscy9Gb3JtYXRVdGlsc1wiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBjMyBmcm9tIFwiYzNcIjtcbmltcG9ydCB7Q2hhcnRDb25maWd1cmF0aW9uLCBDaGFydEFQSX0gZnJvbSBcImMzXCI7XG5pbXBvcnQgU3RhbmRhcmRMaWIgZnJvbSBcIi4uL3V0aWxzL1N0YW5kYXJkTGliXCI7XG5cbmltcG9ydCBJUXVhbGlmaWVkS2V5ID0gd2VhdmVqcy5hcGkuZGF0YS5JUXVhbGlmaWVkS2V5O1xuXG5pbnRlcmZhY2UgSUJhcmNoYXJ0UGF0aHMgZXh0ZW5kcyBJVG9vbFBhdGhzIHtcbiAgICBoZWlnaHRDb2x1bW5zOiBXZWF2ZVBhdGg7XG4gICAgbGFiZWxDb2x1bW46IFdlYXZlUGF0aDtcbiAgICBzb3J0Q29sdW1uOiBXZWF2ZVBhdGg7XG4gICAgY29sb3JDb2x1bW46IFdlYXZlUGF0aDtcbiAgICBjaGFydENvbG9yczogV2VhdmVQYXRoO1xuICAgIGdyb3VwaW5nTW9kZTogV2VhdmVQYXRoO1xuICAgIGhvcml6b250YWxNb2RlOiBXZWF2ZVBhdGg7XG4gICAgc2hvd1ZhbHVlTGFiZWxzOiBXZWF2ZVBhdGg7XG4gICAgb3ZlcnJpZGVZTWF4OiBXZWF2ZVBhdGg7XG4gICAgb3ZlcnJpZGVZTWluOiBXZWF2ZVBhdGg7XG59XG5cbmNsYXNzIFdlYXZlQzNCYXJjaGFydCBleHRlbmRzIEFic3RyYWN0QzNUb29sIHtcblxuICAgIHByaXZhdGUga2V5VG9JbmRleDp7W2tleTpzdHJpbmddOiBudW1iZXJ9O1xuICAgIHByaXZhdGUgaW5kZXhUb0tleTp7W2luZGV4Om51bWJlcl06IElRdWFsaWZpZWRLZXl9O1xuICAgIHByaXZhdGUgeEF4aXNWYWx1ZVRvTGFiZWw6e1t2YWx1ZTpudW1iZXJdOiBzdHJpbmd9O1xuICAgIHByaXZhdGUgeUF4aXNWYWx1ZVRvTGFiZWw6e1t2YWx1ZTpudW1iZXJdOiBzdHJpbmd9O1xuICAgIHByaXZhdGUgeUxhYmVsQ29sdW1uRGF0YVR5cGU6c3RyaW5nO1xuICAgIHByaXZhdGUgZ3JvdXBpbmdNb2RlOnN0cmluZztcbiAgICBwcml2YXRlIGhlaWdodENvbHVtbk5hbWVzOnN0cmluZ1tdO1xuICAgIHByaXZhdGUgaGVpZ2h0Q29sdW1uc0xhYmVsczpzdHJpbmdbXTtcbiAgICBwcml2YXRlIHN0cmluZ1JlY29yZHM6UmVjb3JkW107XG4gICAgcHJpdmF0ZSBudW1lcmljUmVjb3JkczpSZWNvcmRbXTtcbiAgICBwcml2YXRlIHJlY29yZHM6UmVjb3JkW11bXTtcbiAgICBwcml2YXRlIGNvbG9yUmFtcDpzdHJpbmdbXTtcbiAgICBwcml2YXRlIHNob3dWYWx1ZUxhYmVsczpib29sZWFuO1xuICAgIHByaXZhdGUgc2hvd1hBeGlzTGFiZWw6Ym9vbGVhbjtcbiAgICBwcml2YXRlIHlMYWJlbENvbHVtblBhdGg6V2VhdmVQYXRoO1xuICAgIHByb3RlY3RlZCBjM0NvbmZpZzpDaGFydENvbmZpZ3VyYXRpb247XG4gICAgcHJvdGVjdGVkIGMzQ29uZmlnWUF4aXM6YzMuWUF4aXNDb25maWd1cmF0aW9uO1xuICAgIHByb3RlY3RlZCBjaGFydDpDaGFydEFQSTtcblxuICAgIHByb3RlY3RlZCBwYXRoczpJQmFyY2hhcnRQYXRocztcblxuICAgIHByaXZhdGUgYnVzeTpib29sZWFuO1xuICAgIHByaXZhdGUgZGlydHk6Ym9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklWaXNUb29sUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmtleVRvSW5kZXggPSB7fTtcbiAgICAgICAgdGhpcy5pbmRleFRvS2V5ID0ge307XG4gICAgICAgIHRoaXMueUF4aXNWYWx1ZVRvTGFiZWwgPSB7fTtcbiAgICAgICAgdGhpcy54QXhpc1ZhbHVlVG9MYWJlbCA9IHt9O1xuICAgICAgICB0aGlzLnZhbGlkYXRlID0gXy5kZWJvdW5jZSh0aGlzLnZhbGlkYXRlLmJpbmQodGhpcyksIDMwKTtcblxuICAgICAgICB0aGlzLmMzQ29uZmlnID0ge1xuICAgICAgICAgICAgc2l6ZToge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnN0eWxlLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYWRkaW5nOiB7XG4gICAgICAgICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICAgICAgbGVmdDogMTAwLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiAyMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBqc29uOiBbXSxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImJhclwiLFxuICAgICAgICAgICAgICAgIHhTb3J0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBuYW1lczoge30sXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogKHYsIGlkLCBpLCBqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnNob3dWYWx1ZUxhYmVscykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3JkZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgY29sb3I6IChjb2xvcjpzdHJpbmcsIGQ6YW55KTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmhlaWdodENvbHVtbk5hbWVzLmxlbmd0aCA9PT0gMSAmJiBkLmhhc093blByb3BlcnR5KFwiaW5kZXhcIikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmluZCB0aGUgY29ycmVzcG9uZGluZyBpbmRleCBvZiBudW1lcmljUmVjb3JkcyBpbiBzdHJpbmdSZWNvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSB0aGlzLmluZGV4VG9LZXlbZC5pbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBfLnBsdWNrKHRoaXMuc3RyaW5nUmVjb3JkcywgXCJpZFwiKS5pbmRleE9mKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cmluZ1JlY29yZHNbaW5kZXhdID8gdGhpcy5zdHJpbmdSZWNvcmRzW2luZGV4XVtcImNvbG9yXCJdIGFzIHN0cmluZyA6IFwiI0MwQ0REMVwiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yIHx8IFwiI0MwQ0REMVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiAoZDphbnkpID0+IHtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uc2VsZWN0ZWQ6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LmFkZEtleXMoW3RoaXMuaW5kZXhUb0tleVtkLmluZGV4XV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbnVuc2VsZWN0ZWQ6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LnJlbW92ZUtleXMoW3RoaXMuaW5kZXhUb0tleVtkLmluZGV4XV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbm1vdXNlb3ZlcjogKGQ6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnByb2JlX2tleXNldC5zZXRLZXlzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2x1bW5OYW1lc1RvVmFsdWU6e1tjb2x1bW5OYW1lOnN0cmluZ10gOiBzdHJpbmd8bnVtYmVyIH0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2x1bW5OYW1lc1RvQ29sb3I6e1tjb2x1bW5OYW1lOnN0cmluZ10gOiBzdHJpbmd9ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodENvbHVtbk5hbWVzLmZvckVhY2goIChjb2x1bW46c3RyaW5nLCBpbmRleDpudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvVmFsdWVbdGhpcy5oZWlnaHRDb2x1bW5zTGFiZWxzW2luZGV4XV0gPSB0aGlzLm51bWVyaWNSZWNvcmRzW2QuaW5kZXhdWydoZWlnaHRzJ11bY29sdW1uXSBhcyBudW1iZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5oZWlnaHRDb2x1bW5OYW1lcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2xvciA9IFN0YW5kYXJkTGliLmludGVycG9sYXRlQ29sb3IoaW5kZXggLyAodGhpcy5oZWlnaHRDb2x1bW5OYW1lcy5sZW5ndGggLSAxKSwgdGhpcy5jb2xvclJhbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvQ29sb3JbdGhpcy5oZWlnaHRDb2x1bW5zTGFiZWxzW2luZGV4XV0gPSBcIiNcIiArIFN0YW5kYXJkTGliLmRlY2ltYWxUb0hleChjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGl0bGU6c3RyaW5nID0gdGhpcy5zdHJpbmdSZWNvcmRzW2QuaW5kZXhdW1wieExhYmVsXCJdIGFzIHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50b29sVGlwLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLmNoYXJ0LmludGVybmFsLmQzLmV2ZW50LnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMuY2hhcnQuaW50ZXJuYWwuZDMuZXZlbnQucGFnZVksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1Rvb2xUaXA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbk5hbWVzVG9WYWx1ZTogY29sdW1uTmFtZXNUb1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbk5hbWVzVG9Db2xvcjogY29sdW1uTmFtZXNUb0NvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LnNldEtleXMoW3RoaXMuaW5kZXhUb0tleVtkLmluZGV4XV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbm1vdXNlb3V0OiAoZDphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZCAmJiBkLmhhc093blByb3BlcnR5KFwiaW5kZXhcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LnNldEtleXMoW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy50b29sVGlwLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUb29sVGlwOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXhpczoge1xuICAgICAgICAgICAgICAgIHg6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjYXRlZ29yeVwiLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcIm91dGVyLWNlbnRlclwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRpY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZTogLTQ1LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VsbGluZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpbGluZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IChudW06bnVtYmVyKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc3RyaW5nUmVjb3JkcyAmJiB0aGlzLnN0cmluZ1JlY29yZHNbbnVtXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmVsZW1lbnQgJiYgdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHQgPiAwICYmIHRoaXMucGF0aHMubWFyZ2luQm90dG9tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGFiZWxIZWlnaHQ6bnVtYmVyID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luQm90dG9tLmdldFN0YXRlKCkpL01hdGguY29zKDQ1KihNYXRoLlBJLzE4MCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsU3RyaW5nOnN0cmluZyA9ICh0aGlzLnN0cmluZ1JlY29yZHNbbnVtXVtcInhMYWJlbFwiXSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYobGFiZWxTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RyaW5nU2l6ZTpudW1iZXIgPSBTdGFuZGFyZExpYi5nZXRUZXh0V2lkdGgobGFiZWxTdHJpbmcsIHRoaXMuZ2V0Rm9udFN0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWRqdXN0bWVudENoYXJhY3RlcnM6bnVtYmVyID0gbGFiZWxTdHJpbmcubGVuZ3RoIC0gTWF0aC5mbG9vcihsYWJlbFN0cmluZy5sZW5ndGggKiAobGFiZWxIZWlnaHQgLyBzdHJpbmdTaXplKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkanVzdG1lbnRDaGFyYWN0ZXJzID4gMCA/IGxhYmVsU3RyaW5nLnN1YnN0cmluZygwLCBsYWJlbFN0cmluZy5sZW5ndGggLSBhZGp1c3RtZW50Q2hhcmFjdGVycyAtIDMpICsgXCIuLi5cIiA6IGxhYmVsU3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cmluZ1JlY29yZHNbbnVtXVtcInhMYWJlbFwiXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJvdGF0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogKG51bTpudW1iZXIpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLnN0cmluZ1JlY29yZHMgJiYgdGhpcy5zdHJpbmdSZWNvcmRzW251bV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdHJpbmdSZWNvcmRzW251bV1bXCJ4TGFiZWxcIl0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IChuYW1lOnN0cmluZywgcmF0aW86bnVtYmVyLCBpZDpzdHJpbmcsIGluZGV4Om51bWJlcik6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYWJlbEluZGV4Om51bWJlciA9IHRoaXMuaGVpZ2h0Q29sdW1uTmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAodGhpcy5oZWlnaHRDb2x1bW5zTGFiZWxzID8gdGhpcy5oZWlnaHRDb2x1bW5zTGFiZWxzW2xhYmVsSW5kZXhdIDogXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogeyBkdXJhdGlvbjogMCB9LFxuICAgICAgICAgICAgZ3JpZDoge1xuICAgICAgICAgICAgICAgIHg6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeToge1xuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJpbmR0bzogbnVsbCxcbiAgICAgICAgICAgIGJhcjoge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB7XG4gICAgICAgICAgICAgICAgICAgIHJhdGlvOiAwLjhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwiYm90dG9tXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnJlbmRlcmVkOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXN5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTdHlsZSgpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpcnR5KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYzNDb25maWdZQXhpcyA9IHtcbiAgICAgICAgICAgIHNob3c6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgICAgIHRleHQ6XCJcIixcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJvdXRlci1taWRkbGVcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRpY2s6IHtcbiAgICAgICAgICAgICAgICBmaXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG11bHRpbGluZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZm9ybWF0OiAobnVtOm51bWJlcik6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy55TGFiZWxDb2x1bW5QYXRoICYmIHRoaXMueUxhYmVsQ29sdW1uRGF0YVR5cGUgIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnlBeGlzVmFsdWVUb0xhYmVsW251bV0gfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdyb3VwaW5nTW9kZSA9PT0gXCJwZXJjZW50U3RhY2tcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQzLmZvcm1hdChcIi4wJVwiKShudW0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhGb3JtYXRVdGlscy5kZWZhdWx0TnVtYmVyRm9ybWF0dGluZyhudW0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMobmV3U3RhdGU6YW55KVxuXHR7XG5cblx0fVxuXG4gICAgaGFuZGxlUG9pbnRDbGljayhldmVudDpNb3VzZUV2ZW50KTp2b2lkIHtcbiAgICAgICAgdmFyIHByb2JlS2V5czphbnlbXSA9IHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmdldEtleXMoKTtcbiAgICAgICAgdmFyIHNlbGVjdGlvbktleXM6YW55W10gPSB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuZ2V0S2V5cygpO1xuICAgICAgICBpZiAoXy5pc0VxdWFsKHByb2JlS2V5cywgc2VsZWN0aW9uS2V5cykpXG4gICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuc2V0S2V5cyhbXSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5zZXRLZXlzKHByb2JlS2V5cyk7XG4gICAgfVxuXG4gICAgaGFuZGxlU2hvd1ZhbHVlTGFiZWxzICgpIHtcbiAgICAgICAgaWYoIXRoaXMuY2hhcnQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuc2hvd1ZhbHVlTGFiZWxzID0gdGhpcy5wYXRocy5zaG93VmFsdWVMYWJlbHMuZ2V0U3RhdGUoKTtcbiAgICAgICAgdGhpcy5jaGFydC5mbHVzaCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGF0YUNoYW5nZWQoKTp2b2lkXG5cdHtcbiAgICAgICAgdmFyIGxobSA9IHRoaXMucGF0aHMuaGVpZ2h0Q29sdW1ucy5nZXRPYmplY3QoKTtcbiAgICAgICAgdmFyIGNvbHVtbnMgPSBsaG0uZ2V0T2JqZWN0cygpO1xuICAgICAgICB2YXIgbmFtZXMgPSBsaG0uZ2V0TmFtZXMoKTtcblxuXHRcdC8vIHRoZSB5IGxhYmVsIGNvbHVtbiBpcyB0aGUgZmlyc3QgY29sdW1uIGluIGhlaWdodENvbHVtbnNcblx0XHR0aGlzLnlMYWJlbENvbHVtblBhdGggPSBXZWF2ZS5nZXRQYXRoKGNvbHVtbnNbMF0pO1xuXG4gICAgICAgIHZhciBudW1lcmljTWFwcGluZzphbnkgPSB7XG4gICAgICAgICAgICBzb3J0OiB0aGlzLnBhdGhzLnNvcnRDb2x1bW4sXG4gICAgICAgICAgICB4TGFiZWw6IHRoaXMucGF0aHMubGFiZWxDb2x1bW4sXG5cdFx0XHRoZWlnaHRzOiB7fSxcblx0XHRcdHlMYWJlbDogdGhpcy55TGFiZWxDb2x1bW5QYXRoXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHN0cmluZ01hcHBpbmc6YW55ID0ge1xuICAgICAgICAgICAgc29ydDogdGhpcy5wYXRocy5zb3J0Q29sdW1uLFxuICAgICAgICAgICAgY29sb3I6IHRoaXMucGF0aHMuY29sb3JDb2x1bW4sXG4gICAgICAgICAgICB4TGFiZWw6IHRoaXMucGF0aHMubGFiZWxDb2x1bW4sXG5cdFx0XHR5TGFiZWw6IHRoaXMueUxhYmVsQ29sdW1uUGF0aFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGVpZ2h0Q29sdW1uTmFtZXMgPSBbXTtcbiAgICAgICAgdGhpcy5oZWlnaHRDb2x1bW5zTGFiZWxzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaWR4IGluIGNvbHVtbnMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxldCBjb2x1bW4gPSBjb2x1bW5zW2lkeF07XG4gICAgICAgICAgICBsZXQgbmFtZSA9IG5hbWVzW2lkeF07XG4gICAgICAgICAgICBsZXQgdGl0bGUgPSBjb2x1bW4uZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG5cbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0Q29sdW1uc0xhYmVscy5wdXNoKHRpdGxlKTtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0Q29sdW1uTmFtZXMucHVzaChuYW1lKTtcblx0XHRcdG51bWVyaWNNYXBwaW5nLmhlaWdodHNbbmFtZV0gPSBjb2x1bW47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnlMYWJlbENvbHVtbkRhdGFUeXBlID0gdGhpcy55TGFiZWxDb2x1bW5QYXRoLmdldE9iamVjdCgpLmdldE1ldGFkYXRhKCdkYXRhVHlwZScpO1xuXG4gICAgICAgIHRoaXMubnVtZXJpY1JlY29yZHMgPSB0aGlzLnBhdGhzLnBsb3R0ZXIucmV0cmlldmVSZWNvcmRzKG51bWVyaWNNYXBwaW5nLCB7a2V5U2V0OiB0aGlzLnBhdGhzLmZpbHRlcmVkS2V5U2V0LCBkYXRhVHlwZTogXCJudW1iZXJcIn0pO1xuICAgICAgICBpZiAoIXRoaXMubnVtZXJpY1JlY29yZHMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0cmluZ1JlY29yZHMgPSB0aGlzLnBhdGhzLnBsb3R0ZXIucmV0cmlldmVSZWNvcmRzKHN0cmluZ01hcHBpbmcsIHtrZXlTZXQ6IHRoaXMucGF0aHMuZmlsdGVyZWRLZXlTZXQsIGRhdGFUeXBlOiBcInN0cmluZ1wifSk7XG5cbiAgICAgICAgdGhpcy5yZWNvcmRzID0gXy56aXAodGhpcy5udW1lcmljUmVjb3JkcywgdGhpcy5zdHJpbmdSZWNvcmRzKTtcbiAgICAgICAgLy90aGlzLnJlY29yZHMgPSBfLnNvcnRCeU9yZGVyKHRoaXMucmVjb3JkcywgW1wic29ydFwiLCBcImlkXCJdLCBbJ2FzYycsICdhc2MnXSk7XG4gICAgICAgIHRoaXMucmVjb3JkcyA9IF8uc29ydEJ5KHRoaXMucmVjb3JkcywgKHJlY29yZCkgPT57XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkWzBdW1wic29ydFwiXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmKHdlYXZlanMuV2VhdmVBUEkuTG9jYWxlLnJldmVyc2VMYXlvdXQpIHtcbiAgICAgICAgICAgIHRoaXMucmVjb3JkcyA9IHRoaXMucmVjb3Jkcy5yZXZlcnNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnJlY29yZHMubGVuZ3RoKVxuICAgICAgICAgICAgW3RoaXMubnVtZXJpY1JlY29yZHMsIHRoaXMuc3RyaW5nUmVjb3Jkc10gPSBfLnVuemlwKHRoaXMucmVjb3Jkcyk7XG5cbiAgICAgICAgdGhpcy55QXhpc1ZhbHVlVG9MYWJlbCA9IHt9O1xuICAgICAgICB0aGlzLnhBeGlzVmFsdWVUb0xhYmVsID0ge307XG4gICAgICAgIHRoaXMua2V5VG9JbmRleCA9IHt9O1xuICAgICAgICB0aGlzLmluZGV4VG9LZXkgPSB7fTtcblxuICAgICAgICB0aGlzLm51bWVyaWNSZWNvcmRzLmZvckVhY2goKHJlY29yZDpSZWNvcmQsIGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5rZXlUb0luZGV4W3JlY29yZC5pZCBhcyBhbnldID0gaW5kZXg7XG4gICAgICAgICAgICB0aGlzLmluZGV4VG9LZXlbaW5kZXhdID0gcmVjb3JkLmlkO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHRoaXMuc3RyaW5nUmVjb3Jkcy5mb3JFYWNoKChyZWNvcmQ6UmVjb3JkLCBpbmRleDpudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHZhciBudW1lcmljUmVjb3JkOlJlY29yZCA9IHRoaXMubnVtZXJpY1JlY29yZHNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKG51bWVyaWNSZWNvcmQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnlBeGlzVmFsdWVUb0xhYmVsW251bWVyaWNSZWNvcmRbXCJ5TGFiZWxcIl0gYXMgbnVtYmVyXSA9IHJlY29yZFtcInlMYWJlbFwiXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgdGhpcy54QXhpc1ZhbHVlVG9MYWJlbFtudW1lcmljUmVjb3JkW1wieExhYmVsXCJdIGFzIG51bWJlcl0gPSByZWNvcmRbXCJ4TGFiZWxcIl0gYXMgc3RyaW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmdyb3VwaW5nTW9kZSA9IHRoaXMucGF0aHMuZ3JvdXBpbmdNb2RlLmdldFN0YXRlKCk7XG4gICAgICAgIC8vdmFyIGhvcml6b250YWxNb2RlID0gdGhpcy5wYXRocy5wbG90dGVyLnB1c2goXCJob3Jpem9udGFsTW9kZVwiKS5nZXRTdGF0ZSgpO1xuXG4gICAgICAgIC8vIHNldCBheGlzIHJvdGF0aW9uIG1vZGVcbiAgICAgICAgLy90aGlzLmNoYXJ0LmxvYWQoe2F4ZXM6IHsgcm90YXRlZDogaG9yaXpvbnRhbE1vZGUgfX0pO1xuXG4gICAgICAgIGlmICh0aGlzLmdyb3VwaW5nTW9kZSA9PT0gXCJzdGFja1wiIHx8IHRoaXMuZ3JvdXBpbmdNb2RlID09PSBcInBlcmNlbnRTdGFja1wiKVxuICAgICAgICAgICAgLy90aGlzLmMzQ29uZmlnLmRhdGEuZ3JvdXBzID0gW3RoaXMuaGVpZ2h0Q29sdW1uTmFtZXNdO1xuICAgICAgICAgICAgdGhpcy5jaGFydC5ncm91cHMoW3RoaXMuaGVpZ2h0Q29sdW1uTmFtZXNdKTtcbiAgICAgICAgZWxzZSAvL2lmKHRoaXMuZ3JvdXBpbmdNb2RlID09PSBcImdyb3VwXCIpXG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmRhdGEuZ3JvdXBzID0gW107XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBpbmdNb2RlID09PSBcInBlcmNlbnRTdGFja1wiICYmIHRoaXMuaGVpZ2h0Q29sdW1uTmFtZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgLy8gbm9ybWFsaXplIHRoZSBoZWlnaHQgY29sdW1ucyB0byBiZSBwZXJjZW50YWdlcy5cbiAgICAgICAgICAgIHRoaXMubnVtZXJpY1JlY29yZHMuZm9yRWFjaCgocmVjb3JkOlJlY29yZCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHRzOntba2V5OnN0cmluZ106IG51bWJlcn0gPSByZWNvcmRbJ2hlaWdodHMnXSBhcyB7W2tleTpzdHJpbmddOiBudW1iZXJ9O1xuICAgICAgICAgICAgICAgIHZhciBzdW06bnVtYmVyID0gMDtcblx0XHRcdFx0Zm9yIChsZXQga2V5IGluIGhlaWdodHMpXG5cdFx0XHRcdFx0c3VtICs9IGhlaWdodHNba2V5XTtcblx0XHRcdFx0Zm9yIChsZXQga2V5IGluIGhlaWdodHMpXG5cdFx0XHRcdFx0aGVpZ2h0c1trZXldIC89IHN1bTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaW50ZXJmYWNlIEtleXMge3g6c3RyaW5nLCB2YWx1ZTpzdHJpbmdbXX07XG4gICAgICAgIHZhciBrZXlzOktleXMgPSB7eDpcIlwiLCB2YWx1ZTpbXX07XG4gICAgICAgIC8vIGlmIGxhYmVsIGNvbHVtbiBpcyBzcGVjaWZpZWRcbiAgICAgICAgaWYodGhpcy5wYXRocy5sYWJlbENvbHVtbi5nZXRTdGF0ZSgpLmxlbmd0aCkge1xuICAgICAgICAgICAga2V5cy54ID0gXCJ4TGFiZWxcIjtcbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcubGVnZW5kLnNob3cgPSBmYWxzZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmxlZ2VuZC5zaG93ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtleXMudmFsdWUgPSB0aGlzLmhlaWdodENvbHVtbk5hbWVzO1xuICAgICAgICB2YXIgY29sdW1uQ29sb3JzOntbbmFtZTpzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgICAgIHZhciBjb2x1bW5UaXRsZXM6e1tuYW1lOnN0cmluZ106IHN0cmluZ30gPSB7fTtcblxuICAgICAgICBpZih0aGlzLmhlaWdodENvbHVtbk5hbWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMuY29sb3JSYW1wID0gdGhpcy5wYXRocy5jaGFydENvbG9ycy5nZXRTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHRDb2x1bW5OYW1lcy5tYXAoKG5hbWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gU3RhbmRhcmRMaWIuaW50ZXJwb2xhdGVDb2xvcihpbmRleCAvICh0aGlzLmhlaWdodENvbHVtbk5hbWVzLmxlbmd0aCAtIDEpLCB0aGlzLmNvbG9yUmFtcCk7XG4gICAgICAgICAgICAgICAgY29sdW1uQ29sb3JzW25hbWVdID0gXCIjXCIgKyBTdGFuZGFyZExpYi5kZWNpbWFsVG9IZXgoY29sb3IpO1xuICAgICAgICAgICAgICAgIGNvbHVtblRpdGxlc1tuYW1lXSA9IHRoaXMuaGVpZ2h0Q29sdW1uc0xhYmVsc1tpbmRleF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmKHRoaXMucGF0aHMubGFiZWxDb2x1bW4uZ2V0U3RhdGUoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmxlZ2VuZC5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmxlZ2VuZC5zaG93ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSA9IF8uY2xvbmVEZWVwKHRoaXMuYzNDb25maWcuZGF0YSk7XG4gICAgICAgIGRhdGEuanNvbiA9IF8ucGx1Y2sodGhpcy5udW1lcmljUmVjb3JkcywgJ2hlaWdodHMnKTtcbiAgICAgICAgLy9uZWVkIG90aGVyIHN0dWZmIGZvciBkYXRhLmpzb24gdG8gd29ya1xuICAgICAgICB0aGlzLm51bWVyaWNSZWNvcmRzLmZvckVhY2goIChyZWNvcmQsaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGZvcih2YXIgayBpbiByZWNvcmQpIHtcbiAgICAgICAgICAgICAgICBpZihrICE9ICdoZWlnaHRzJylcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5qc29uW2luZGV4XVtrXT1yZWNvcmRba107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRhdGEuY29sb3JzID0gY29sdW1uQ29sb3JzO1xuICAgICAgICBkYXRhLmtleXMgPSBrZXlzO1xuICAgICAgICBkYXRhLm5hbWVzID0gY29sdW1uVGl0bGVzO1xuICAgICAgICBkYXRhLnVubG9hZCA9IHRydWU7XG4gICAgICAgIHRoaXMuYzNDb25maWcuZGF0YSA9IGRhdGE7XG4gICAgfVxuXG4gICAgdXBkYXRlU3R5bGUoKSB7XG4gICAgXHRpZighdGhpcy5jaGFydCB8fCAhdGhpcy5oZWlnaHRDb2x1bW5OYW1lcylcbiAgICBcdFx0cmV0dXJuO1xuXG4gICAgICAgIGQzLnNlbGVjdCh0aGlzLmVsZW1lbnQpXG4gICAgICAgIFx0LnNlbGVjdEFsbChcInBhdGhcIilcbiAgICAgICAgXHQuc3R5bGUoXCJvcGFjaXR5XCIsIDEpXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2VcIiwgXCJibGFja1wiKVxuICAgICAgICAgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMXB4XCIpXG4gICAgICAgICAgICAuc3R5bGUoXCJzdHJva2Utb3BhY2l0eVwiLCAwLjUpO1xuXG4gICAgICAgIHZhciBzZWxlY3RlZEtleXM6c3RyaW5nW10gPSB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuZ2V0S2V5cygpO1xuICAgICAgICB2YXIgcHJvYmVkS2V5czpzdHJpbmdbXSA9IHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmdldEtleXMoKTtcbiAgICAgICAgdmFyIHNlbGVjdGVkSW5kaWNlczpudW1iZXJbXSA9IHNlbGVjdGVkS2V5cy5tYXAoKGtleTpzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIodGhpcy5rZXlUb0luZGV4W2tleV0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHByb2JlZEluZGljZXM6bnVtYmVyW10gPSBwcm9iZWRLZXlzLm1hcCgoa2V5OnN0cmluZykgPT4ge1xuICAgICAgICAgICByZXR1cm4gTnVtYmVyKHRoaXMua2V5VG9JbmRleFtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBrZXlzOnN0cmluZ1tdID0gT2JqZWN0LmtleXModGhpcy5rZXlUb0luZGV4KTtcbiAgICAgICAgdmFyIGluZGljZXM6bnVtYmVyW10gPSBrZXlzLm1hcCgoa2V5OnN0cmluZykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlcih0aGlzLmtleVRvSW5kZXhba2V5XSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdW5zZWxlY3RlZEluZGljZXM6bnVtYmVyW10gPSBfLmRpZmZlcmVuY2UoaW5kaWNlcyxzZWxlY3RlZEluZGljZXMpO1xuICAgICAgICB1bnNlbGVjdGVkSW5kaWNlcyA9IF8uZGlmZmVyZW5jZSh1bnNlbGVjdGVkSW5kaWNlcyxwcm9iZWRJbmRpY2VzKTtcbiAgICAgICAgdGhpcy5oZWlnaHRDb2x1bW5OYW1lcy5mb3JFYWNoKChpdGVtOnN0cmluZykgPT4ge1xuICAgICAgICBcdHZhciBwYXRocyA9IGQzLnNlbGVjdEFsbChcImdcIikuZmlsdGVyKFwiLmMzLXNoYXBlcy1cIitpdGVtK1wiLmMzLWJhcnNcIikuc2VsZWN0QWxsKFwicGF0aFwiKTtcbiAgICAgICAgXHR2YXIgdGV4dHMgPSBkMy5zZWxlY3RBbGwoXCJnXCIpLmZpbHRlcihcIi5jMy10ZXh0cy1cIitpdGVtKS5zZWxlY3RBbGwoXCJ0ZXh0XCIpO1xuICAgICAgICAgICAgaWYoc2VsZWN0ZWRJbmRpY2VzLmxlbmd0aClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbVNlbGVjdG9yU3R5bGUodW5zZWxlY3RlZEluZGljZXMsIHBhdGhzLCB7b3BhY2l0eTogMC4zLCBcInN0cm9rZS1vcGFjaXR5XCI6IDAuMH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tU2VsZWN0b3JTdHlsZShzZWxlY3RlZEluZGljZXMsIHBhdGhzLCB7b3BhY2l0eTogMS4wLCBcInN0cm9rZS1vcGFjaXR5XCI6IDEuMH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tU2VsZWN0b3JTdHlsZSh1bnNlbGVjdGVkSW5kaWNlcywgdGV4dHMsIHtcImZpbGwtb3BhY2l0eVwiOjAuM30pO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tU2VsZWN0b3JTdHlsZShzZWxlY3RlZEluZGljZXMsIHRleHRzLCB7XCJmaWxsLW9wYWNpdHlcIjoxLjB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoIXByb2JlZEluZGljZXMubGVuZ3RoKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tU2VsZWN0b3JTdHlsZShpbmRpY2VzLCBwYXRocywge29wYWNpdHk6IDEuMCwgXCJzdHJva2Utb3BhY2l0eVwiOiAwLjV9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbVNlbGVjdG9yU3R5bGUoaW5kaWNlcywgdGV4dHMsIHtcImZpbGwtb3BhY2l0eVwiOjEuMH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHNlbGVjdGVkSW5kaWNlcy5sZW5ndGgpXG4gICAgICAgICAgICB0aGlzLmNoYXJ0LnNlbGVjdCh0aGlzLmhlaWdodENvbHVtbk5hbWVzLCBzZWxlY3RlZEluZGljZXMsIHRydWUpO1xuICAgICAgICBlbHNlIGlmKCFwcm9iZWRJbmRpY2VzLmxlbmd0aClcbiAgICAgICAgICAgIHRoaXMuY2hhcnQuc2VsZWN0KHRoaXMuaGVpZ2h0Q29sdW1uTmFtZXMsIFtdLCB0cnVlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIGlmKHRoaXMuYzNDb25maWcuc2l6ZS53aWR0aCAhPSB0aGlzLnByb3BzLnN0eWxlLndpZHRoIHx8IHRoaXMuYzNDb25maWcuc2l6ZS5oZWlnaHQgIT0gdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcuc2l6ZSA9IHt3aWR0aDogdGhpcy5wcm9wcy5zdHlsZS53aWR0aCwgaGVpZ2h0OiB0aGlzLnByb3BzLnN0eWxlLmhlaWdodH07XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlKHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIFN0YW5kYXJkTGliLmFkZFBvaW50Q2xpY2tMaXN0ZW5lcih0aGlzLmVsZW1lbnQsIHRoaXMuaGFuZGxlUG9pbnRDbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5zaG93WEF4aXNMYWJlbCA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBwbG90dGVyUGF0aCA9IHRoaXMudG9vbFBhdGgucHVzaFBsb3R0ZXIoXCJwbG90XCIpO1xuICAgICAgICB2YXIgbWFwcGluZyA9IFtcbiAgICAgICAgICAgIHsgbmFtZTogXCJwbG90dGVyXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLCBjYWxsYmFja3M6IHRoaXMudmFsaWRhdGUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJoZWlnaHRDb2x1bW5zXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJoZWlnaHRDb2x1bW5zXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwibGFiZWxDb2x1bW5cIiwgcGF0aDogcGxvdHRlclBhdGgucHVzaChcImxhYmVsQ29sdW1uXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwic29ydENvbHVtblwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwic29ydENvbHVtblwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImNvbG9yQ29sdW1uXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJjb2xvckNvbHVtblwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImNoYXJ0Q29sb3JzXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJjaGFydENvbG9yc1wiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcImdyb3VwaW5nTW9kZVwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiZ3JvdXBpbmdNb2RlXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiaG9yaXpvbnRhbE1vZGVcIiwgcGF0aDogcGxvdHRlclBhdGgucHVzaChcImhvcml6b250YWxNb2RlXCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwic2hvd1ZhbHVlTGFiZWxzXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJzaG93VmFsdWVMYWJlbHNcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJ4QXhpc1wiLCBwYXRoOiB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwieEF4aXNcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJ5QXhpc1wiLCBwYXRoOiB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwieUF4aXNcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5Cb3R0b21cIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpbkJvdHRvbVwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm1hcmdpbkxlZnRcIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpbkxlZnRcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJtYXJnaW5Ub3BcIiwgcGF0aDogdGhpcy5wbG90TWFuYWdlclBhdGgucHVzaChcIm1hcmdpblRvcFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm1hcmdpblJpZ2h0XCIsIHBhdGg6IHRoaXMucGxvdE1hbmFnZXJQYXRoLnB1c2goXCJtYXJnaW5SaWdodFwiKSB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIm92ZXJyaWRlWU1heFwiLCBwYXRoOiB0aGlzLnBsb3RNYW5hZ2VyUGF0aC5wdXNoKFwib3ZlcnJpZGVZTWF4XCIpIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwib3ZlcnJpZGVZTWluXCIsIHBhdGg6IHRoaXMucGxvdE1hbmFnZXJQYXRoLnB1c2goXCJvdmVycmlkZVlNaW5cIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJmaWx0ZXJlZEtleVNldFwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiZmlsdGVyZWRLZXlTZXRcIikgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJzZWxlY3Rpb25LZXlTZXRcIiwgcGF0aDogdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LCBjYWxsYmFja3M6IHRoaXMudXBkYXRlU3R5bGUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJwcm9iZUtleVNldFwiLCBwYXRoOiB0aGlzLnRvb2xQYXRoLnByb2JlX2tleXNldCwgY2FsbGJhY2tzOiB0aGlzLnVwZGF0ZVN0eWxlIH1cbiAgICAgICAgXTtcblxuICAgICAgICB0aGlzLmluaXRpYWxpemVQYXRocyhtYXBwaW5nKTtcblxuICAgICAgICB0aGlzLnBhdGhzLmZpbHRlcmVkS2V5U2V0LmdldE9iamVjdCgpLnNldENvbHVtbktleVNvdXJjZXMoW3RoaXMucGF0aHMuc29ydENvbHVtbi5nZXRPYmplY3QoKV0pO1xuXG4gICAgICAgIHRoaXMuYzNDb25maWcuYmluZHRvID0gdGhpcy5lbGVtZW50O1xuICAgICAgICB0aGlzLnZhbGlkYXRlKHRydWUpO1xuICAgIH1cblxuICAgIHZhbGlkYXRlKGZvcmNlZDpib29sZWFuID0gZmFsc2UpOnZvaWRcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLmJ1c3kpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcblxuICAgICAgICB2YXIgY2hhbmdlRGV0ZWN0ZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgICAgICB2YXIgYXhpc0NoYW5nZTpib29sZWFuID0gdGhpcy5kZXRlY3RDaGFuZ2UoJ2hlaWdodENvbHVtbnMnLCAnbGFiZWxDb2x1bW4nLCAnc29ydENvbHVtbicsICdtYXJnaW5Cb3R0b20nLCAnbWFyZ2luVG9wJywgJ21hcmdpbkxlZnQnLCAnbWFyZ2luUmlnaHQnLCAnb3ZlcnJpZGVZTWF4JywgJ292ZXJyaWRlWU1pbicpO1xuICAgICAgICB2YXIgYXhpc1NldHRpbmdzQ2hhbmdlOmJvb2xlYW4gPSB0aGlzLmRldGVjdENoYW5nZSgneEF4aXMnLCAneUF4aXMnKTtcbiAgICAgICAgaWYgKGF4aXNDaGFuZ2UgfHwgdGhpcy5kZXRlY3RDaGFuZ2UoJ2NvbG9yQ29sdW1uJywgJ2NoYXJ0Q29sb3JzJywgJ2dyb3VwaW5nTW9kZScsICdmaWx0ZXJlZEtleVNldCcpKVxuICAgICAgICB7XG4gICAgICAgICAgICBjaGFuZ2VEZXRlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmRhdGFDaGFuZ2VkKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF4aXNDaGFuZ2UpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNoYW5nZURldGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciB4TGFiZWw6c3RyaW5nID0gdGhpcy5wYXRocy54QXhpcy5wdXNoKFwib3ZlcnJpZGVBeGlzTmFtZVwiKS5nZXRTdGF0ZSgpIHx8IFwiU29ydGVkIGJ5IFwiICsgdGhpcy5wYXRocy5zb3J0Q29sdW1uLmdldE9iamVjdCgpLmdldE1ldGFkYXRhKCd0aXRsZScpO1xuICAgICAgICAgICAgdmFyIHlMYWJlbDpzdHJpbmcgPSB0aGlzLnBhdGhzLnlBeGlzLnB1c2goXCJvdmVycmlkZUF4aXNOYW1lXCIpLmdldFN0YXRlKCkgfHwgKHRoaXMuaGVpZ2h0Q29sdW1uc0xhYmVscyA/IHRoaXMuaGVpZ2h0Q29sdW1uc0xhYmVscy5qb2luKFwiLCBcIikgOiBcIlwiKTtcblxuICAgICAgICAgICAgaWYoIXRoaXMuc2hvd1hBeGlzTGFiZWwpe1xuICAgICAgICAgICAgICAgIHhMYWJlbCA9IFwiIFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5oZWlnaHRDb2x1bW5OYW1lcyAmJiB0aGlzLmhlaWdodENvbHVtbk5hbWVzLmxlbmd0aClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgdGVtcDphbnkgPSAge307XG4gICAgICAgICAgICAgICAgaWYgKHdlYXZlanMuV2VhdmVBUEkuTG9jYWxlLnJldmVyc2VMYXlvdXQpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodENvbHVtbk5hbWVzLmZvckVhY2goIChuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wW25hbWVdID0gJ3kyJztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuZGF0YS5heGVzID0gdGVtcDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLnkyID0gdGhpcy5jM0NvbmZpZ1lBeGlzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueSA9IHtzaG93OiBmYWxzZX07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy54LnRpY2sucm90YXRlID0gNDU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0Q29sdW1uTmFtZXMuZm9yRWFjaCggKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBbbmFtZV0gPSAneSc7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmRhdGEuYXhlcyA9IHRlbXA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy55ID0gdGhpcy5jM0NvbmZpZ1lBeGlzO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jM0NvbmZpZy5heGlzLnkyO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC50aWNrLnJvdGF0ZSA9IC00NTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy54LmxhYmVsID0ge3RleHQ6eExhYmVsLCBwb3NpdGlvbjpcIm91dGVyLWNlbnRlclwifTtcbiAgICAgICAgICAgIHRoaXMuYzNDb25maWdZQXhpcy5sYWJlbCA9IHt0ZXh0OnlMYWJlbCwgcG9zaXRpb246XCJvdXRlci1taWRkbGVcIn07XG5cbiAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy50b3AgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5Ub3AuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICBpZih0aGlzLnBhdGhzLmxhYmVsQ29sdW1uLmdldFN0YXRlKCkubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueC5oZWlnaHQgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5Cb3R0b20uZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcuYXhpcy54LmhlaWdodCA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHdlYXZlanMuV2VhdmVBUEkuTG9jYWxlLnJldmVyc2VMYXlvdXQpe1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy5sZWZ0ID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luUmlnaHQuZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5wYWRkaW5nLnJpZ2h0ID0gTnVtYmVyKHRoaXMucGF0aHMubWFyZ2luTGVmdC5nZXRTdGF0ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5wYWRkaW5nLmxlZnQgPSBOdW1iZXIodGhpcy5wYXRocy5tYXJnaW5MZWZ0LmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYzNDb25maWcucGFkZGluZy5yaWdodCA9IE51bWJlcih0aGlzLnBhdGhzLm1hcmdpblJpZ2h0LmdldFN0YXRlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZighaXNOYU4odGhpcy5wYXRocy5vdmVycmlkZVlNYXguZ2V0U3RhdGUoKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmMzQ29uZmlnLmF4aXMueS5tYXggPSB0aGlzLnBhdGhzLm92ZXJyaWRlWU1heC5nZXRTdGF0ZSgpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLnkubWF4ID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIWlzTmFOKHRoaXMucGF0aHMub3ZlcnJpZGVZTWluLmdldFN0YXRlKCkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLnkubWluID0gdGhpcy5wYXRocy5vdmVycmlkZVlNaW4uZ2V0U3RhdGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLnkubWluID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmRldGVjdENoYW5nZSgnaG9yaXpvbnRhbE1vZGUnKSlcbiAgICAgICAge1xuICAgICAgICAgICAgY2hhbmdlRGV0ZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jM0NvbmZpZy5heGlzLnJvdGF0ZWQgPSB0aGlzLnBhdGhzLmhvcml6b250YWxNb2RlLmdldFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZGV0ZWN0Q2hhbmdlKCdzaG93VmFsdWVMYWJlbHMnKSlcbiAgICAgICAge1xuICAgICAgICAgICAgY2hhbmdlRGV0ZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zaG93VmFsdWVMYWJlbHMgPSB0aGlzLnBhdGhzLnNob3dWYWx1ZUxhYmVscy5nZXRTdGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoYW5nZURldGVjdGVkIHx8IGZvcmNlZClcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5idXN5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2hhcnQgPSBjMy5nZW5lcmF0ZSh0aGlzLmMzQ29uZmlnKTtcbiAgICAgICAgICAgIHRoaXMuY3VsbEF4ZXMoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2VhdmVDM0JhcmNoYXJ0O1xucmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb24oXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnRvb2xzOjpDb21wb3VuZEJhckNoYXJ0VG9vbFwiLCBXZWF2ZUMzQmFyY2hhcnQpO1xuLy9XZWF2ZS5yZWdpc3RlckNsYXNzKFwid2VhdmVqcy50b29scy5Db21wb3VuZEJhckNoYXJ0VG9vbFwiLCBXZWF2ZUMzQmFyY2hhcnQsIFt3ZWF2ZWpzLmFwaS5jb3JlLklMaW5rYWJsZU9iamVjdFdpdGhOZXdQcm9wZXJ0aWVzXSk7XG4iXX0=