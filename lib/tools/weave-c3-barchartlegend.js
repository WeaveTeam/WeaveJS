"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _WeaveTool = require("../WeaveTool");

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _ui = require("../react-ui/ui");

var _ui2 = _interopRequireDefault(_ui);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

var _reactVendorPrefix = require("react-vendor-prefix");

var Prefixer = _interopRequireWildcard(_reactVendorPrefix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // <reference path="../../typings/d3/d3.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
///<reference path="../../typings/react/react.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>
///<reference path="../react-ui/ui.tsx"/>
///<reference path="../../typings/react/react-dom.d.ts"/>

var SHAPE_TYPE_CIRCLE = "circle";
var SHAPE_TYPE_SQUARE = "square";
var SHAPE_TYPE_LINE = "line";

var WeaveC3BarChartLegend = function (_React$Component) {
    _inherits(WeaveC3BarChartLegend, _React$Component);

    function WeaveC3BarChartLegend(props) {
        _classCallCheck(this, WeaveC3BarChartLegend);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveC3BarChartLegend).call(this, props));

        _this.toolPath = props.toolPath;
        _this.plotterPath = _this.toolPath.pushPlotter("plot");
        _this.colorRampPath = _this.plotterPath.push("chartColors");
        _this.columnsPath = _this.plotterPath.push("columns");
        _this.maxColumnsPath = _this.plotterPath.push("maxColumns");
        _this.filteredKeySet = _this.plotterPath.push("filteredKeySet");
        _this.state = { selected: [], probed: [] };
        _this.spanStyle = { textAlign: "left", verticalAlign: "middle", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", paddingLeft: 5, userSelect: "none" };
        return _this;
    }

    _createClass(WeaveC3BarChartLegend, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "setupCallbacks",
        value: function setupCallbacks() {
            this.maxColumnsPath.addCallback(this, this.forceUpdate);
            this.filteredKeySet.addCallback(this, this.forceUpdate);
            this.plotterPath.push("shapeSize").addCallback(this, this.forceUpdate);
        }
        //getSelectedBins():number[] {
        //
        //}
        //getProbedBins():number[] {
        //
        //}

    }, {
        key: "handleClick",
        value: function handleClick(label, temp) {}
    }, {
        key: "handleProbe",
        value: function handleProbe(bin, mouseOver) {}
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.setupCallbacks();
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {}
    }, {
        key: "drawContinuousPlot",
        value: function drawContinuousPlot() {}
    }, {
        key: "selectionKeysChanged",
        value: function selectionKeysChanged() {}
    }, {
        key: "probeKeysChanged",
        value: function probeKeysChanged() {}
    }, {
        key: "visualizationChanged",
        value: function visualizationChanged() {}
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {}
    }, {
        key: "getInteractionStyle",
        value: function getInteractionStyle(bin) {
            var selectedStyle = {
                width: "100%",
                flex: 1.0,
                borderWidth: 0,
                borderColor: "black",
                borderStyle: "solid",
                opacity: 1.0
            };
            return selectedStyle;
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var width = this.props.style.width;
            var height = this.props.style.height;
            var shapeSize = this.plotterPath.getState("shapeSize");
            this.numberOfLabels = this.columnsPath.getState().length;
            var maxColumns = 1; //TODO: This should really be "this.maxColumnsPath.getState();" but only supporting 1 column for now
            var columnFlex = 1.0 / maxColumns;
            var extraBins = this.numberOfLabels % maxColumns == 0 ? 0 : maxColumns - this.numberOfLabels % maxColumns;
            var ramp = this.colorRampPath.getState();
            var labels = this.columnsPath.getState().map(function (column) {
                var columnName = column.objectName;
                return _this2.columnsPath.push(columnName).getObject().getMetadata('title');
            });
            var finalElements = [];
            var prefixerStyle = Prefixer.prefix({ styles: this.spanStyle }).styles;
            for (var j = 0; j < maxColumns; j++) {
                var element = [];
                var elements = [];
                for (var i = 0; i < this.numberOfLabels + extraBins; i++) {
                    if (i % maxColumns == j) {
                        if (i < this.numberOfLabels) {
                            element.push(React.createElement(
                                _ui2.default.HBox,
                                { key: i, style: this.getInteractionStyle(i), onClick: this.handleClick.bind(this, i), onMouseOver: this.handleProbe.bind(this, i, true), onMouseOut: this.handleProbe.bind(this, i, false) },
                                React.createElement(
                                    _ui2.default.HBox,
                                    { style: { width: shapeSize, position: "relative", padding: "0px 0px 0px 0px" } },
                                    React.createElement(
                                        "svg",
                                        { style: { position: "absolute" }, width: "100%", height: "100%" },
                                        React.createElement("rect", { x: 0, y: 10, height: "80%", width: shapeSize, style: { fill: "#" + _StandardLib2.default.decimalToHex(_StandardLib2.default.interpolateColor(_StandardLib2.default.normalize(i, 0, this.numberOfLabels - 1), ramp)), stroke: "black", strokeOpacity: 0.5 } })
                                    )
                                ),
                                React.createElement(
                                    _ui2.default.HBox,
                                    { style: { width: "100%", flex: 0.8, alignItems: "center" } },
                                    React.createElement(
                                        "span",
                                        { style: prefixerStyle },
                                        labels[i]
                                    )
                                )
                            ));
                        } else {
                            element.push(React.createElement(_ui2.default.HBox, { key: i, style: { width: "100%", flex: 1.0 } }));
                        }
                    }
                }
                {
                    this.props.style.width > this.props.style.height * 2 ? elements.push(React.createElement(
                        _ui2.default.HBox,
                        { key: i, style: { width: "100%", flex: columnFlex } },
                        element
                    )) : elements.push(React.createElement(
                        _ui2.default.VBox,
                        { key: i, style: { height: "100%", flex: columnFlex } },
                        element
                    ));
                }
                finalElements[j] = elements;
            }
            return React.createElement(
                "div",
                { style: { width: "100%", height: "100%", padding: "0px 5px 0px 5px" } },
                React.createElement(
                    _ui2.default.VBox,
                    { style: { height: "100%", flex: 1.0, overflow: "hidden" } },
                    React.createElement(
                        _ui2.default.HBox,
                        { style: { width: "100%", flex: 0.1, alignItems: "center" } },
                        React.createElement(
                            "span",
                            { style: prefixerStyle },
                            "Bar color"
                        )
                    ),
                    this.props.style.width > this.props.style.height * 2 ? React.createElement(
                        _ui2.default.HBox,
                        { style: { width: "100%", flex: 0.9 } },
                        " ",
                        finalElements
                    ) : React.createElement(
                        _ui2.default.VBox,
                        { style: { height: "100%", flex: 0.9 } },
                        " ",
                        finalElements
                    )
                )
            );
        }
    }, {
        key: "title",
        get: function get() {
            return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
        }
    }]);

    return WeaveC3BarChartLegend;
}(React.Component);

exports.default = WeaveC3BarChartLegend;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::BarChartLegendTool", WeaveC3BarChartLegend);
//Weave.registerClass("weavejs.tools.ColorBinLegendTool", WeaveC3ColorLegend, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtYzMtYmFyY2hhcnRsZWdlbmQuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvd2VhdmUtYzMtYmFyY2hhcnRsZWdlbmQudHN4Il0sIm5hbWVzIjpbIldlYXZlQzNCYXJDaGFydExlZ2VuZCIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5jb25zdHJ1Y3RvciIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC50aXRsZSIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5zZXR1cENhbGxiYWNrcyIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5oYW5kbGVDbGljayIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5oYW5kbGVQcm9iZSIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5jb21wb25lbnREaWRNb3VudCIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5jb21wb25lbnREaWRVcGRhdGUiLCJXZWF2ZUMzQmFyQ2hhcnRMZWdlbmQuZHJhd0NvbnRpbnVvdXNQbG90IiwiV2VhdmVDM0JhckNoYXJ0TGVnZW5kLnNlbGVjdGlvbktleXNDaGFuZ2VkIiwiV2VhdmVDM0JhckNoYXJ0TGVnZW5kLnByb2JlS2V5c0NoYW5nZWQiLCJXZWF2ZUMzQmFyQ2hhcnRMZWdlbmQudmlzdWFsaXphdGlvbkNoYW5nZWQiLCJXZWF2ZUMzQmFyQ2hhcnRMZWdlbmQuY29tcG9uZW50V2lsbFVubW91bnQiLCJXZWF2ZUMzQmFyQ2hhcnRMZWdlbmQuZ2V0SW50ZXJhY3Rpb25TdHlsZSIsIldlYXZlQzNCYXJDaGFydExlZ2VuZC5yZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVlZLEFBQUssQUFBTSxBQUFPLEFBQ3ZCLEFBQUUsQUFBTSxBQUFnQixBQUN4QixBQUFXLEFBQU0sQUFBc0IsQUFHdkM7Ozs7Ozs7Ozs7OztJQUFLLEFBQVEsQUFBTSxBQUFx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LEFBRU8sQUFBYzs7Ozs7RUFoQ1UsQUFBSyxNQUFDLEFBQVM7O2tCQXdMcEMsQUFBcUIsQUFBQzs7QUFFckMsQUFBMEIsMkNBQUMsQUFBK0MsaURBQUUsQUFBcUIsQUFBQyxBQUFDLEFBQ25HLEFBQW1JIiwic291cmNlc0NvbnRlbnQiOlsiLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9kMy9kMy5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWFjdC11aS91aS50c3hcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LWRvbS5kLnRzXCIvPlxuXG5pbXBvcnQge0lWaXNUb29sLCBJVmlzVG9vbFByb3BzLCBJVmlzVG9vbFN0YXRlfSBmcm9tIFwiLi9JVmlzVG9vbFwiO1xuXG5pbXBvcnQge3JlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi4vV2VhdmVUb29sXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIGQzIGZyb20gXCJkM1wiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdWkgZnJvbSBcIi4uL3JlYWN0LXVpL3VpXCI7XG5pbXBvcnQgU3RhbmRhcmRMaWIgZnJvbSBcIi4uL3V0aWxzL1N0YW5kYXJkTGliXCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQge0NTU1Byb3BlcnRpZXN9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUHJlZml4ZXIgZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcblxuY29uc3QgU0hBUEVfVFlQRV9DSVJDTEU6c3RyaW5nID0gXCJjaXJjbGVcIjtcbmNvbnN0IFNIQVBFX1RZUEVfU1FVQVJFOnN0cmluZyA9IFwic3F1YXJlXCI7XG5jb25zdCBTSEFQRV9UWVBFX0xJTkU6c3RyaW5nID0gXCJsaW5lXCI7XG5cbmNsYXNzIFdlYXZlQzNCYXJDaGFydExlZ2VuZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJVmlzVG9vbFByb3BzLCBJVmlzVG9vbFN0YXRlPiBpbXBsZW1lbnRzIElWaXNUb29sIHtcblxuICAgIHByaXZhdGUgcGxvdHRlclBhdGg6V2VhdmVQYXRoO1xuICAgIHByaXZhdGUgY29sb3JSYW1wUGF0aDpXZWF2ZVBhdGg7XG4gICAgcHJpdmF0ZSBjb2x1bW5zUGF0aDpXZWF2ZVBhdGg7XG4gICAgcHJpdmF0ZSBtYXhDb2x1bW5zUGF0aDpXZWF2ZVBhdGg7XG4gICAgcHJpdmF0ZSBmaWx0ZXJlZEtleVNldDpXZWF2ZVBhdGg7XG4gICAgcHJpdmF0ZSB0b29sUGF0aDpXZWF2ZVBhdGg7XG4gICAgcHJpdmF0ZSBzcGFuU3R5bGU6Q1NTUHJvcGVydGllcztcbiAgICBwcml2YXRlIG51bWJlck9mTGFiZWxzOm51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklWaXNUb29sUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnRvb2xQYXRoID0gcHJvcHMudG9vbFBhdGg7XG4gICAgICAgIHRoaXMucGxvdHRlclBhdGggPSB0aGlzLnRvb2xQYXRoLnB1c2hQbG90dGVyKFwicGxvdFwiKTtcbiAgICAgICAgdGhpcy5jb2xvclJhbXBQYXRoID0gdGhpcy5wbG90dGVyUGF0aC5wdXNoKFwiY2hhcnRDb2xvcnNcIik7XG4gICAgICAgIHRoaXMuY29sdW1uc1BhdGggPSB0aGlzLnBsb3R0ZXJQYXRoLnB1c2goXCJjb2x1bW5zXCIpO1xuICAgICAgICB0aGlzLm1heENvbHVtbnNQYXRoID0gdGhpcy5wbG90dGVyUGF0aC5wdXNoKFwibWF4Q29sdW1uc1wiKTtcbiAgICAgICAgdGhpcy5maWx0ZXJlZEtleVNldCA9IHRoaXMucGxvdHRlclBhdGgucHVzaChcImZpbHRlcmVkS2V5U2V0XCIpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge3NlbGVjdGVkOltdLCBwcm9iZWQ6W119O1xuICAgICAgICB0aGlzLnNwYW5TdHlsZSA9IHt0ZXh0QWxpZ246XCJsZWZ0XCIsdmVydGljYWxBbGlnbjpcIm1pZGRsZVwiLCBvdmVyZmxvdzpcImhpZGRlblwiLCB3aGl0ZVNwYWNlOlwibm93cmFwXCIsIHRleHRPdmVyZmxvdzpcImVsbGlwc2lzXCIsIHBhZGRpbmdMZWZ0OjUsIHVzZXJTZWxlY3Q6XCJub25lXCJ9O1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyhuZXdTdGF0ZTphbnkpXG4gICAge1xuXG4gICAgfVxuXG4gICAgZ2V0IHRpdGxlKCk6c3RyaW5nIHtcbiAgICAgICByZXR1cm4gKHRoaXMudG9vbFBhdGguZ2V0VHlwZSgncGFuZWxUaXRsZScpID8gdGhpcy50b29sUGF0aC5nZXRTdGF0ZSgncGFuZWxUaXRsZScpIDogJycpIHx8IHRoaXMudG9vbFBhdGguZ2V0UGF0aCgpLnBvcCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0dXBDYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMubWF4Q29sdW1uc1BhdGguYWRkQ2FsbGJhY2sodGhpcywgdGhpcy5mb3JjZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuZmlsdGVyZWRLZXlTZXQuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy5mb3JjZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMucGxvdHRlclBhdGgucHVzaChcInNoYXBlU2l6ZVwiKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLmZvcmNlVXBkYXRlKTtcbiAgICB9XG5cbiAgICAvL2dldFNlbGVjdGVkQmlucygpOm51bWJlcltdIHtcbiAgICAvL1xuICAgIC8vfVxuXG4gICAgLy9nZXRQcm9iZWRCaW5zKCk6bnVtYmVyW10ge1xuICAgIC8vXG4gICAgLy99XG5cbiAgICBoYW5kbGVDbGljayhsYWJlbDpudW1iZXIsdGVtcDphbnkpOnZvaWQge1xuXG4gICAgfVxuXG4gICAgaGFuZGxlUHJvYmUoYmluOm51bWJlciwgbW91c2VPdmVyOmJvb2xlYW4pOnZvaWQge1xuXG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuc2V0dXBDYWxsYmFja3MoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgfVxuXG4gICAgZHJhd0NvbnRpbnVvdXNQbG90KCkge1xuXG4gICAgfVxuXG4gICAgc2VsZWN0aW9uS2V5c0NoYW5nZWQoKSB7XG5cbiAgICB9XG5cbiAgICBwcm9iZUtleXNDaGFuZ2VkKCkge1xuXG4gICAgfVxuXG4gICAgdmlzdWFsaXphdGlvbkNoYW5nZWQoKSB7XG5cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB9XG5cbiAgICBnZXRJbnRlcmFjdGlvblN0eWxlKGJpbjpudW1iZXIpOkNTU1Byb3BlcnRpZXMge1xuICAgICAgICB2YXIgc2VsZWN0ZWRTdHlsZTpDU1NQcm9wZXJ0aWVzID0ge1xuICAgICAgICAgICAgd2lkdGg6XCIxMDAlXCIsXG4gICAgICAgICAgICBmbGV4OjEuMCxcbiAgICAgICAgICAgIGJvcmRlcldpZHRoOjAsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjpcImJsYWNrXCIsXG4gICAgICAgICAgICBib3JkZXJTdHlsZTpcInNvbGlkXCIsXG4gICAgICAgICAgICBvcGFjaXR5OiAxLjBcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHNlbGVjdGVkU3R5bGU7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgd2lkdGg6bnVtYmVyID0gdGhpcy5wcm9wcy5zdHlsZS53aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodDpudW1iZXIgPSB0aGlzLnByb3BzLnN0eWxlLmhlaWdodDtcbiAgICAgICAgdmFyIHNoYXBlU2l6ZTpudW1iZXIgPSB0aGlzLnBsb3R0ZXJQYXRoLmdldFN0YXRlKFwic2hhcGVTaXplXCIpO1xuICAgICAgICB0aGlzLm51bWJlck9mTGFiZWxzID0gdGhpcy5jb2x1bW5zUGF0aC5nZXRTdGF0ZSgpLmxlbmd0aDtcbiAgICAgICAgdmFyIG1heENvbHVtbnM6bnVtYmVyID0gMTsvL1RPRE86IFRoaXMgc2hvdWxkIHJlYWxseSBiZSBcInRoaXMubWF4Q29sdW1uc1BhdGguZ2V0U3RhdGUoKTtcIiBidXQgb25seSBzdXBwb3J0aW5nIDEgY29sdW1uIGZvciBub3dcbiAgICAgICAgdmFyIGNvbHVtbkZsZXg6bnVtYmVyID0gMS4wL21heENvbHVtbnM7XG4gICAgICAgIHZhciBleHRyYUJpbnM6bnVtYmVyID0gdGhpcy5udW1iZXJPZkxhYmVscyVtYXhDb2x1bW5zID09IDAgPyAwIDogbWF4Q29sdW1ucy0odGhpcy5udW1iZXJPZkxhYmVscyVtYXhDb2x1bW5zKTtcbiAgICAgICAgdmFyIHJhbXA6YW55W10gPSB0aGlzLmNvbG9yUmFtcFBhdGguZ2V0U3RhdGUoKTtcblxuICAgICAgICB2YXIgbGFiZWxzOnN0cmluZ1tdID0gdGhpcy5jb2x1bW5zUGF0aC5nZXRTdGF0ZSgpLm1hcCggKGNvbHVtbjphbnkpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICB2YXIgY29sdW1uTmFtZTpzdHJpbmcgPSBjb2x1bW4ub2JqZWN0TmFtZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbHVtbnNQYXRoLnB1c2goY29sdW1uTmFtZSkuZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZmluYWxFbGVtZW50czphbnlbXSA9IFtdO1xuICAgICAgICB2YXIgcHJlZml4ZXJTdHlsZTp7fSA9IFByZWZpeGVyLnByZWZpeCh7c3R5bGVzOiB0aGlzLnNwYW5TdHlsZX0pLnN0eWxlcztcbiAgICAgICAgZm9yKHZhciBqOm51bWJlciA9IDA7IGo8bWF4Q29sdW1uczsgaisrKSB7XG5cbiAgICAgICAgICAgIHZhciBlbGVtZW50OkpTWC5FbGVtZW50W10gPSBbXTtcbiAgICAgICAgICAgIHZhciBlbGVtZW50czpKU1guRWxlbWVudFtdID0gW107XG4gICAgICAgICAgICBmb3IodmFyIGk9MDsgaTx0aGlzLm51bWJlck9mTGFiZWxzK2V4dHJhQmluczsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYoaSVtYXhDb2x1bW5zID09IGopIHtcblxuICAgICAgICAgICAgICAgICAgICBpZihpPHRoaXMubnVtYmVyT2ZMYWJlbHMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1aS5IQm94IGtleT17aX0gc3R5bGU9e3RoaXMuZ2V0SW50ZXJhY3Rpb25TdHlsZShpKX0gb25DbGljaz17dGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMsIGkpfSBvbk1vdXNlT3Zlcj17dGhpcy5oYW5kbGVQcm9iZS5iaW5kKHRoaXMsIGksIHRydWUpfSBvbk1vdXNlT3V0PXt0aGlzLmhhbmRsZVByb2JlLmJpbmQodGhpcywgaSwgZmFsc2UpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVpLkhCb3ggc3R5bGU9e3t3aWR0aDpzaGFwZVNpemUsIHBvc2l0aW9uOlwicmVsYXRpdmVcIiwgcGFkZGluZzpcIjBweCAwcHggMHB4IDBweFwifX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHN0eWxlPXt7cG9zaXRpb246XCJhYnNvbHV0ZVwifX0gd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9ezB9IHk9ezEwfSBoZWlnaHQ9XCI4MCVcIiB3aWR0aD17c2hhcGVTaXplfSBzdHlsZT17e2ZpbGw6XCIjXCIgKyBTdGFuZGFyZExpYi5kZWNpbWFsVG9IZXgoU3RhbmRhcmRMaWIuaW50ZXJwb2xhdGVDb2xvcihTdGFuZGFyZExpYi5ub3JtYWxpemUoaSwgMCwgdGhpcy5udW1iZXJPZkxhYmVscyAtIDEpLCByYW1wKSksIHN0cm9rZTpcImJsYWNrXCIsIHN0cm9rZU9wYWNpdHk6MC41fX0+PC9yZWN0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWkuSEJveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVpLkhCb3ggc3R5bGU9e3t3aWR0aDpcIjEwMCVcIiwgZmxleDowLjgsIGFsaWduSXRlbXM6XCJjZW50ZXJcIn19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3ByZWZpeGVyU3R5bGV9PntsYWJlbHNbaV19PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VpLkhCb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91aS5IQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVpLkhCb3gga2V5PXtpfSBzdHlsZT17e3dpZHRoOlwiMTAwJVwiLCBmbGV4OjEuMH19Lz5cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zdHlsZS53aWR0aCA+IHRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0ICogMiA/XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICA8dWkuSEJveCBrZXk9e2l9IHN0eWxlPXt7d2lkdGg6XCIxMDAlXCIsIGZsZXg6IGNvbHVtbkZsZXh9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC91aS5IQm94PlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIDpcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIDx1aS5WQm94IGtleT17aX0gc3R5bGU9e3toZWlnaHQ6XCIxMDAlXCIsIGZsZXg6IGNvbHVtbkZsZXh9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC91aS5WQm94PlxuICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZpbmFsRWxlbWVudHNbal0gPSBlbGVtZW50cztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoPGRpdiBzdHlsZT17e3dpZHRoOlwiMTAwJVwiLCBoZWlnaHQ6XCIxMDAlXCIsIHBhZGRpbmc6XCIwcHggNXB4IDBweCA1cHhcIn19PlxuICAgICAgICAgICAgPHVpLlZCb3ggc3R5bGU9e3toZWlnaHQ6XCIxMDAlXCIsZmxleDogMS4wLCBvdmVyZmxvdzpcImhpZGRlblwifX0+XG4gICAgICAgICAgICAgICAgPHVpLkhCb3ggc3R5bGU9e3t3aWR0aDpcIjEwMCVcIiwgZmxleDogMC4xLCBhbGlnbkl0ZW1zOlwiY2VudGVyXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3ByZWZpeGVyU3R5bGV9PkJhciBjb2xvcjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3VpLkhCb3g+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnN0eWxlLndpZHRoID4gdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHQgKiAyID9cbiAgICAgICAgICAgICAgICAgICAgPHVpLkhCb3ggc3R5bGU9e3t3aWR0aDpcIjEwMCVcIiwgZmxleDogMC45fX0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsRWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPC91aS5IQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgOlxuICAgICAgICAgICAgICAgICAgICA8dWkuVkJveCBzdHlsZT17e2hlaWdodDpcIjEwMCVcIiwgZmxleDogMC45fX0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsRWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgPC91aS5WQm94PlxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvdWkuVkJveD5cbiAgICAgICAgPC9kaXY+KTtcbiAgICB9XG59XG5cblxuXG5cbmV4cG9ydCBkZWZhdWx0IFdlYXZlQzNCYXJDaGFydExlZ2VuZDtcblxucmVnaXN0ZXJUb29sSW1wbGVtZW50YXRpb24oXCJ3ZWF2ZS52aXN1YWxpemF0aW9uLnRvb2xzOjpCYXJDaGFydExlZ2VuZFRvb2xcIiwgV2VhdmVDM0JhckNoYXJ0TGVnZW5kKTtcbi8vV2VhdmUucmVnaXN0ZXJDbGFzcyhcIndlYXZlanMudG9vbHMuQ29sb3JCaW5MZWdlbmRUb29sXCIsIFdlYXZlQzNDb2xvckxlZ2VuZCwgW3dlYXZlanMuYXBpLmNvcmUuSUxpbmthYmxlT2JqZWN0V2l0aE5ld1Byb3BlcnRpZXNdKTtcbiJdfQ==
