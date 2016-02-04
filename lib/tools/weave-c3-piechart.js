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

var _c = require("c3");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/c3/c3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

;

var WeaveC3PieChart = function (_AbstractC3Tool) {
    _inherits(WeaveC3PieChart, _AbstractC3Tool);

    function WeaveC3PieChart(props) {
        _classCallCheck(this, WeaveC3PieChart);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveC3PieChart).call(this, props));
    }

    _createClass(WeaveC3PieChart, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "selectionKeysChanged",
        value: function selectionKeysChanged() {
            if (!this.chart) return;
            var keys = this.toolPath.selection_keyset.getKeys();
            if (keys.length) {
                this.chart.focus(keys);
            } else {
                this.chart.focus();
            }
        }
    }, {
        key: "probedKeysChanged",
        value: function probedKeysChanged() {
            var keys = this.toolPath.probe_keyset.getKeys();
            if (keys.length) {
                this.chart.focus(keys);
            } else {
                this.selectionKeysChanged();
            }
        }
    }, {
        key: "updateStyle",
        value: function updateStyle() {}
    }, {
        key: "handleClick",
        value: function handleClick(event) {
            if (!this.flag) {
                this.toolPath.selection_keyset.setKeys([]);
            }
            this.flag = false;
        }
    }, {
        key: "dataChanged",
        value: function dataChanged() {
            var _this2 = this;

            if (!this.chart) return;
            var numericMapping = {
                data: this.paths.data
            };
            var stringMapping = {
                fill: {
                    color: this.paths.fillStyle.push("color")
                },
                line: {},
                label: this.paths.label
            };
            this.numericRecords = this.paths.plotter.retrieveRecords(numericMapping, { keySet: this.paths.filteredKeySet, dataType: "number" });
            this.stringRecords = this.paths.plotter.retrieveRecords(stringMapping, { keySet: this.paths.filteredKeySet, dataType: "string" });
            this.keyToIndex = {};
            this.indexToKey = {};
            this.numericRecords.forEach(function (record, index) {
                _this2.indexToKey[index] = record.id;
                _this2.keyToIndex[record.id] = index;
            });
            var columns = [];
            columns = this.numericRecords.map(function (record) {
                var tempArr = [record.id, record["data"]];
                return tempArr;
            });
            var chartType = "pie";
            if (this.paths.plotter.getState("innerRadius") > 0) {
                chartType = "donut";
            }
            this.colors = {};
            this.stringRecords.forEach(function (record) {
                _this2.colors[record.id] = record["fill"]["color"] || "#C0CDD1";
            });
            this.chart.load({
                columns: columns,
                type: chartType,
                colors: this.colors,
                unload: true
            });
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
            var _this3 = this;

            this.element.addEventListener("click", this.handleClick.bind(this));
            var dataChanged = _.debounce(this.dataChanged.bind(this), 100);
            var selectionKeySetChanged = this.selectionKeysChanged.bind(this);
            var probeKeySetChanged = _.debounce(this.probedKeysChanged.bind(this), 100);
            var plotterPath = this.toolPath.pushPlotter("plot");
            var manifest = [{ name: "plotter", path: plotterPath, callbacks: null }, { name: "data", path: plotterPath.push("data"), callbacks: dataChanged }, { name: "label", path: plotterPath.push("label"), callbacks: dataChanged }, { name: "fillStyle", path: plotterPath.push("fill"), callbacks: dataChanged }, { name: "lineStyle", path: plotterPath.push("line"), callbacks: dataChanged }, { name: "innerRadius", path: plotterPath.push("innerRadius"), callbacks: dataChanged }, { name: "filteredKeySet", path: plotterPath.push("filteredKeySet"), callbacks: dataChanged }, { name: "selectionKeySet", path: this.toolPath.selection_keyset, callbacks: selectionKeySetChanged }, { name: "probeKeySet", path: this.toolPath.probe_keyset, callbacks: probeKeySetChanged }];
            this.initializePaths(manifest);
            this.paths.filteredKeySet.getObject().setSingleKeySource(this.paths.data.getObject());
            this.c3Config = {
                size: {
                    width: this.props.style.width,
                    height: this.props.style.height
                },
                bindto: this.element,
                padding: {
                    top: 20,
                    bottom: 20,
                    right: 30
                },
                tooltip: {
                    show: false
                },
                data: {
                    columns: [],
                    selection: {
                        enabled: true,
                        multiple: true,
                        draggable: true
                    },
                    type: "pie",
                    onclick: function onclick(d) {
                        var event = _this3.chart.internal.d3.event;
                        if (!(event.ctrlKey || event.metaKey) && d && d.hasOwnProperty("index")) {
                            _this3.toolPath.selection_keyset.setKeys([_this3.indexToKey[d.index]]);
                        }
                    },
                    onselected: function onselected(d) {
                        if (d && d.hasOwnProperty("index")) {
                            _this3.toolPath.selection_keyset.addKeys([_this3.indexToKey[d.index]]);
                        }
                    },
                    onunselected: function onunselected(d) {
                        if (d && d.hasOwnProperty("data")) {
                            // d has a different structure than "onselected" argument
                            _this3.toolPath.selection_keyset.setKeys([]);
                        }
                    },
                    onmouseover: function onmouseover(d) {
                        if (d && d.hasOwnProperty("index")) {
                            var columnNamesToValue = {};
                            columnNamesToValue[_this3.paths.data.getObject().getMetadata("title")] = d.value;
                            _this3.toolPath.probe_keyset.setKeys([_this3.indexToKey[d.index]]);
                            _this3.props.toolTip.setState({
                                showToolTip: true,
                                x: _this3.chart.internal.d3.event.pageX,
                                y: _this3.chart.internal.d3.event.pageY,
                                columnNamesToValue: columnNamesToValue
                            });
                        }
                    },
                    onmouseout: function onmouseout(d) {
                        if (d && d.hasOwnProperty("index")) {
                            _this3.toolPath.probe_keyset.setKeys([]);
                            _this3.props.toolTip.setState({
                                showToolTip: false
                            });
                        }
                    }
                },
                pie: {
                    label: {
                        show: true,
                        format: function format(value, ratio, id) {
                            if (_this3.stringRecords && _this3.stringRecords.length) {
                                var record = _this3.stringRecords[_this3.keyToIndex[id]];
                                if (record && record["label"]) {
                                    return record["label"];
                                }
                                return String(value);
                            }
                        }
                    }
                },
                donut: {
                    label: {
                        show: true,
                        format: function format(value, ratio, id) {
                            if (_this3.stringRecords && _this3.stringRecords.length) {
                                var record = _this3.stringRecords[_this3.keyToIndex[id]];
                                if (record && record["label"]) {
                                    return record["label"];
                                }
                                return String(value);
                            }
                        }
                    }
                },
                legend: {
                    show: false
                },
                onrendered: this.updateStyle.bind(this)
            };
            this.chart = (0, _c.generate)(this.c3Config);
        }
    }]);

    return WeaveC3PieChart;
}(_AbstractC3Tool3.default);

exports.default = WeaveC3PieChart;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::PieChartTool", WeaveC3PieChart);
//Weave.registerClass("weavejs.tools.PieChartTool", WeaveC3PieChart, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtYzMtcGllY2hhcnQuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvd2VhdmUtYzMtcGllY2hhcnQudHN4Il0sIm5hbWVzIjpbIldlYXZlQzNQaWVDaGFydCIsIldlYXZlQzNQaWVDaGFydC5jb25zdHJ1Y3RvciIsIldlYXZlQzNQaWVDaGFydC5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIldlYXZlQzNQaWVDaGFydC5zZWxlY3Rpb25LZXlzQ2hhbmdlZCIsIldlYXZlQzNQaWVDaGFydC5wcm9iZWRLZXlzQ2hhbmdlZCIsIldlYXZlQzNQaWVDaGFydC51cGRhdGVTdHlsZSIsIldlYXZlQzNQaWVDaGFydC5oYW5kbGVDbGljayIsIldlYXZlQzNQaWVDaGFydC5kYXRhQ2hhbmdlZCIsIldlYXZlQzNQaWVDaGFydC5jb21wb25lbnRXaWxsVW5tb3VudCIsIldlYXZlQzNQaWVDaGFydC5jb21wb25lbnREaWRNb3VudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQVlZLEFBQUMsQUFBTSxBQUFRLEFBRXBCLEFBQStCLEFBQVEsQUFBQyxBQUFNLEFBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVV4RCxBQUFDLEFBRUY7O0lBQTZDLEFBQWM7OztBQVl2RCw2QkFBWSxBQUFtQixPQUMzQjs7O2tHQUFNLEFBQUssQUFBQyxBQUFDLEFBQ2pCLEFBQUMsQUFFUyxBQUFtQzs7Ozs7NERBQUMsQUFBWSxVQUc3RCxBQUFDLEFBRVUsQUFBb0I7Ozs7QUFDeEIsQUFBRSxnQkFBQyxDQUFDLEFBQUksS0FBQyxBQUFLLEFBQUMsT0FDWCxBQUFNLEFBQUM7QUFFWCxnQkFBSSxBQUFJLE9BQVksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFnQixpQkFBQyxBQUFPLEFBQUUsQUFBQztBQUM3RCxBQUFFLGdCQUFDLEFBQUksS0FBQyxBQUFNLEFBQUMsUUFBQyxBQUFDO0FBQ2IsQUFBSSxxQkFBQyxBQUFLLE1BQUMs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aD1cIi4uLy4uL3R5cGluZ3MvYzMvYzMuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2QzL2QzLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG5cbmltcG9ydCB7SVZpc1Rvb2xQcm9wc30gZnJvbSBcIi4vSVZpc1Rvb2xcIjtcbmltcG9ydCB7SVRvb2xQYXRoc30gZnJvbSBcIi4vQWJzdHJhY3RDM1Rvb2xcIjtcbmltcG9ydCBBYnN0cmFjdEMzVG9vbCBmcm9tIFwiLi9BYnN0cmFjdEMzVG9vbFwiO1xuXG5pbXBvcnQge3JlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi4vV2VhdmVUb29sXCI7XG5pbXBvcnQgKiBhcyBkMyBmcm9tIFwiZDNcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge0NoYXJ0QVBJLCBDaGFydENvbmZpZ3VyYXRpb24sIGdlbmVyYXRlfSBmcm9tIFwiYzNcIjtcblxuaW1wb3J0IElRdWFsaWZpZWRLZXkgPSB3ZWF2ZWpzLmFwaS5kYXRhLklRdWFsaWZpZWRLZXk7XG5cbmludGVyZmFjZSBJUGllQ2hhcnRQYXRocyBleHRlbmRzIElUb29sUGF0aHMge1xuICAgIGRhdGE6IFdlYXZlUGF0aDtcbiAgICBsYWJlbDogV2VhdmVQYXRoO1xuICAgIGZpbGxTdHlsZTpXZWF2ZVBhdGg7XG4gICAgbGluZVN0eWxlOldlYXZlUGF0aDtcbiAgICBpbm5lclJhZGl1czpXZWF2ZVBhdGg7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWF2ZUMzUGllQ2hhcnQgZXh0ZW5kcyBBYnN0cmFjdEMzVG9vbCB7XG5cbiAgICBwcml2YXRlIGtleVRvSW5kZXg6e1trZXk6c3RyaW5nXTogbnVtYmVyfTtcbiAgICBwcml2YXRlIGluZGV4VG9LZXk6e1tpbmRleDpudW1iZXJdOiBJUXVhbGlmaWVkS2V5fTtcbiAgICBwcm90ZWN0ZWQgY2hhcnQ6Q2hhcnRBUEk7XG4gICAgcHJvdGVjdGVkIGMzQ29uZmlnOkNoYXJ0Q29uZmlndXJhdGlvbjtcbiAgICBwcm90ZWN0ZWQgcGF0aHM6SVBpZUNoYXJ0UGF0aHM7XG4gICAgcHJpdmF0ZSBmbGFnOmJvb2xlYW47XG4gICAgcHJpdmF0ZSBudW1lcmljUmVjb3JkczpSZWNvcmRbXTtcbiAgICBwcml2YXRlIHN0cmluZ1JlY29yZHM6UmVjb3JkW107XG4gICAgcHJpdmF0ZSBjb2xvcnM6e1trZXk6c3RyaW5nXSA6IHN0cmluZ307XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczpJVmlzVG9vbFByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMobmV3U3RhdGU6YW55KVxuXHR7XG5cblx0fVxuXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25LZXlzQ2hhbmdlZCgpOnZvaWQge1xuICAgICAgICBpZighdGhpcy5jaGFydClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB2YXIga2V5czpzdHJpbmdbXSA9IHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5nZXRLZXlzKCk7XG4gICAgICAgIGlmKGtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0LmZvY3VzKGtleXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jaGFydC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9iZWRLZXlzQ2hhbmdlZCgpOnZvaWQge1xuICAgICAgICB2YXIga2V5czpzdHJpbmdbXSA9IHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmdldEtleXMoKTtcblxuICAgICAgICBpZihrZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5jaGFydC5mb2N1cyhrZXlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uS2V5c0NoYW5nZWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlU3R5bGUoKTp2b2lkIHtcblxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKGV2ZW50OlJlYWN0Lk1vdXNlRXZlbnQpOnZvaWQge1xuICAgICAgICBpZighdGhpcy5mbGFnKSB7XG4gICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuc2V0S2V5cyhbXSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZsYWcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRhdGFDaGFuZ2VkKCk6dm9pZCB7XG5cbiAgICAgICAgaWYoIXRoaXMuY2hhcnQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgbGV0IG51bWVyaWNNYXBwaW5nOmFueSA9IHtcbiAgICAgICAgICAgIGRhdGE6IHRoaXMucGF0aHMuZGF0YVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBzdHJpbmdNYXBwaW5nOmFueSA9IHtcbiAgICAgICAgICAgIGZpbGw6IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhpcy5wYXRocy5maWxsU3R5bGUucHVzaChcImNvbG9yXCIpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGluZToge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGFiZWw6IHRoaXMucGF0aHMubGFiZWxcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubnVtZXJpY1JlY29yZHMgPSB0aGlzLnBhdGhzLnBsb3R0ZXIucmV0cmlldmVSZWNvcmRzKG51bWVyaWNNYXBwaW5nLCB7a2V5U2V0OiB0aGlzLnBhdGhzLmZpbHRlcmVkS2V5U2V0LCBkYXRhVHlwZTogXCJudW1iZXJcIn0pO1xuICAgICAgICB0aGlzLnN0cmluZ1JlY29yZHMgPSB0aGlzLnBhdGhzLnBsb3R0ZXIucmV0cmlldmVSZWNvcmRzKHN0cmluZ01hcHBpbmcsIHtrZXlTZXQ6IHRoaXMucGF0aHMuZmlsdGVyZWRLZXlTZXQsIGRhdGFUeXBlOiBcInN0cmluZ1wifSk7XG5cbiAgICAgICAgdGhpcy5rZXlUb0luZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW5kZXhUb0tleSA9IHt9O1xuXG4gICAgICAgIHRoaXMubnVtZXJpY1JlY29yZHMuZm9yRWFjaCggKHJlY29yZDpSZWNvcmQsIGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbmRleFRvS2V5W2luZGV4XSA9IHJlY29yZC5pZDtcbiAgICAgICAgICAgIHRoaXMua2V5VG9JbmRleFtyZWNvcmQuaWQgYXMgYW55XSA9IGluZGV4O1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY29sdW1uczpbc3RyaW5nLCBudW1iZXJdW10gPSBbXTtcblxuICAgICAgICBjb2x1bW5zID0gdGhpcy5udW1lcmljUmVjb3Jkcy5tYXAoZnVuY3Rpb24ocmVjb3JkOlJlY29yZCkge1xuICAgICAgICAgICAgdmFyIHRlbXBBcnI6W3N0cmluZywgbnVtYmVyXSA9IFtyZWNvcmQuaWQgYXMgYW55LCByZWNvcmRbXCJkYXRhXCJdIGFzIG51bWJlcl07XG4gICAgICAgICAgICByZXR1cm4gdGVtcEFycjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNoYXJ0VHlwZTpzdHJpbmcgPSBcInBpZVwiO1xuXG4gICAgICAgIGlmKHRoaXMucGF0aHMucGxvdHRlci5nZXRTdGF0ZShcImlubmVyUmFkaXVzXCIpID4gMCkge1xuICAgICAgICAgICAgY2hhcnRUeXBlID0gXCJkb251dFwiXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbG9ycyA9IHt9XG4gICAgICAgIHRoaXMuc3RyaW5nUmVjb3Jkcy5mb3JFYWNoKChyZWNvcmQ6UmVjb3JkKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbG9yc1tyZWNvcmQuaWQgYXMgYW55XSA9IChyZWNvcmRbXCJmaWxsXCJdIGFzIFJlY29yZClbXCJjb2xvclwiXSBhcyBzdHJpbmcgfHwgXCIjQzBDREQxXCI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2hhcnQubG9hZCh7XG4gICAgICAgICAgICBjb2x1bW5zOiBjb2x1bW5zLFxuICAgICAgICAgICAgdHlwZTogY2hhcnRUeXBlLFxuICAgICAgICAgICAgY29sb3JzOiB0aGlzLmNvbG9ycyxcbiAgICAgICAgICAgIHVubG9hZDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpOnZvaWQge1xuICAgICAgICAvKiBDbGVhbnVwIGNhbGxiYWNrcyAqL1xuICAgICAgICAvL3RoaXMudGVhcmRvd25DYWxsYmFja3MoKTtcbiAgICAgICAgdGhpcy5jaGFydC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdmFyIGRhdGFDaGFuZ2VkOkZ1bmN0aW9uID0gXy5kZWJvdW5jZSh0aGlzLmRhdGFDaGFuZ2VkLmJpbmQodGhpcyksIDEwMCk7XG4gICAgICAgIHZhciBzZWxlY3Rpb25LZXlTZXRDaGFuZ2VkOkZ1bmN0aW9uID0gdGhpcy5zZWxlY3Rpb25LZXlzQ2hhbmdlZC5iaW5kKHRoaXMpO1xuICAgICAgICB2YXIgcHJvYmVLZXlTZXRDaGFuZ2VkOkZ1bmN0aW9uID0gXy5kZWJvdW5jZSh0aGlzLnByb2JlZEtleXNDaGFuZ2VkLmJpbmQodGhpcyksIDEwMCk7XG4gICAgICAgIHZhciBwbG90dGVyUGF0aDpXZWF2ZVBhdGggPSB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwicGxvdFwiKTtcbiAgICAgICAgdmFyIG1hbmlmZXN0ID0gW1xuICAgICAgICAgIHsgbmFtZTogXCJwbG90dGVyXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLCBjYWxsYmFja3M6IG51bGx9LFxuICAgICAgICAgIHsgbmFtZTogXCJkYXRhXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJkYXRhXCIpLCBjYWxsYmFja3M6IGRhdGFDaGFuZ2VkIH0sXG4gICAgICAgICAgeyBuYW1lOiBcImxhYmVsXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJsYWJlbFwiKSwgY2FsbGJhY2tzOiBkYXRhQ2hhbmdlZCB9LFxuICAgICAgICAgIHsgbmFtZTogXCJmaWxsU3R5bGVcIiwgcGF0aDogcGxvdHRlclBhdGgucHVzaChcImZpbGxcIiksIGNhbGxiYWNrczogZGF0YUNoYW5nZWQgfSxcbiAgICAgICAgICB7IG5hbWU6IFwibGluZVN0eWxlXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJsaW5lXCIpLCBjYWxsYmFja3M6IGRhdGFDaGFuZ2VkIH0sXG4gICAgICAgICAgeyBuYW1lOiBcImlubmVyUmFkaXVzXCIsIHBhdGg6IHBsb3R0ZXJQYXRoLnB1c2goXCJpbm5lclJhZGl1c1wiKSwgY2FsbGJhY2tzOiBkYXRhQ2hhbmdlZCB9LFxuICAgICAgICAgIHsgbmFtZTogXCJmaWx0ZXJlZEtleVNldFwiLCBwYXRoOiBwbG90dGVyUGF0aC5wdXNoKFwiZmlsdGVyZWRLZXlTZXRcIiksIGNhbGxiYWNrczogZGF0YUNoYW5nZWQgfSxcbiAgICAgICAgICB7IG5hbWU6IFwic2VsZWN0aW9uS2V5U2V0XCIsIHBhdGg6IHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldCwgY2FsbGJhY2tzOiBzZWxlY3Rpb25LZXlTZXRDaGFuZ2VkfSxcbiAgICAgICAgICB7IG5hbWU6IFwicHJvYmVLZXlTZXRcIiwgcGF0aDogdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQsIGNhbGxiYWNrczogcHJvYmVLZXlTZXRDaGFuZ2VkfVxuICAgICAgICBdO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVBhdGhzKG1hbmlmZXN0KTtcblxuICAgICAgIFx0dGhpcy5wYXRocy5maWx0ZXJlZEtleVNldC5nZXRPYmplY3QoKS5zZXRTaW5nbGVLZXlTb3VyY2UodGhpcy5wYXRocy5kYXRhLmdldE9iamVjdCgpKTtcblxuICAgICAgICB0aGlzLmMzQ29uZmlnID0ge1xuICAgICAgICAgICAgc2l6ZToge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnN0eWxlLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBiaW5kdG86IHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgIHBhZGRpbmc6IHtcbiAgICAgICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICAgICAgYm90dG9tOiAyMCxcbiAgICAgICAgICAgICAgcmlnaHQ6IDMwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgIHNob3c6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGNvbHVtbnM6IFtdLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgbXVsdGlwbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgdHlwZTogXCJwaWVcIixcbiAgICAgICAgICAgICAgIG9uY2xpY2s6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICB2YXIgZXZlbnQ6TW91c2VFdmVudCA9IHRoaXMuY2hhcnQuaW50ZXJuYWwuZDMuZXZlbnQgYXMgTW91c2VFdmVudDtcbiAgICAgICAgICAgICAgICAgaWYoIShldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpICYmIGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuc2V0S2V5cyhbdGhpcy5pbmRleFRvS2V5W2QuaW5kZXhdXSk7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25zZWxlY3RlZDogKGQ6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImluZGV4XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuYWRkS2V5cyhbdGhpcy5pbmRleFRvS2V5W2QuaW5kZXhdXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9udW5zZWxlY3RlZDogKGQ6YW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGQgJiYgZC5oYXNPd25Qcm9wZXJ0eShcImRhdGFcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGQgaGFzIGEgZGlmZmVyZW50IHN0cnVjdHVyZSB0aGFuIFwib25zZWxlY3RlZFwiIGFyZ3VtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvb2xQYXRoLnNlbGVjdGlvbl9rZXlzZXQuc2V0S2V5cyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9ubW91c2VvdmVyOiAoZDphbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZCAmJiBkLmhhc093blByb3BlcnR5KFwiaW5kZXhcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb2x1bW5OYW1lc1RvVmFsdWU6e1tjb2x1bW5OYW1lOnN0cmluZ10gOiBzdHJpbmd8bnVtYmVyIH0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbk5hbWVzVG9WYWx1ZVt0aGlzLnBhdGhzLmRhdGEuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoXCJ0aXRsZVwiKV0gPSBkLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhbdGhpcy5pbmRleFRvS2V5W2QuaW5kZXhdXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRvb2xUaXAuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUb29sVGlwOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMuY2hhcnQuaW50ZXJuYWwuZDMuZXZlbnQucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5jaGFydC5pbnRlcm5hbC5kMy5ldmVudC5wYWdlWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvVmFsdWU6IGNvbHVtbk5hbWVzVG9WYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9ubW91c2VvdXQ6IChkOmFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZihkICYmIGQuaGFzT3duUHJvcGVydHkoXCJpbmRleFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRvb2xUaXAuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dUb29sVGlwOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGllOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAodmFsdWU6bnVtYmVyLCByYXRpbzpudW1iZXIsIGlkOnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc3RyaW5nUmVjb3JkcyAmJiB0aGlzLnN0cmluZ1JlY29yZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY29yZDpSZWNvcmQgPSB0aGlzLnN0cmluZ1JlY29yZHNbdGhpcy5rZXlUb0luZGV4W2lkXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVjb3JkICYmIHJlY29yZFtcImxhYmVsXCJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWNvcmRbXCJsYWJlbFwiXSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvbnV0OiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAodmFsdWU6bnVtYmVyLCByYXRpbzpudW1iZXIsIGlkOnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuc3RyaW5nUmVjb3JkcyAmJiB0aGlzLnN0cmluZ1JlY29yZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY29yZCA9IHRoaXMuc3RyaW5nUmVjb3Jkc1t0aGlzLmtleVRvSW5kZXhbaWRdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZWNvcmQgJiYgcmVjb3JkW1wibGFiZWxcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZFtcImxhYmVsXCJdIGFzIHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgc2hvdzogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnJlbmRlcmVkOiB0aGlzLnVwZGF0ZVN0eWxlLmJpbmQodGhpcylcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jaGFydCA9IGdlbmVyYXRlKHRoaXMuYzNDb25maWcpO1xuICAgIH1cbn1cblxucmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb24oXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnRvb2xzOjpQaWVDaGFydFRvb2xcIiwgV2VhdmVDM1BpZUNoYXJ0KTtcbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlanMudG9vbHMuUGllQ2hhcnRUb29sXCIsIFdlYXZlQzNQaWVDaGFydCwgW3dlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlT2JqZWN0V2l0aE5ld1Byb3BlcnRpZXNdKTtcbiJdfQ==