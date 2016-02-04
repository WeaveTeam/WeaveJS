"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _WeaveTool = require("../WeaveTool");

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

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
var SHAPE_TYPE_BOX = "box";

var WeaveC3ColorLegend = function (_React$Component) {
    _inherits(WeaveC3ColorLegend, _React$Component);

    function WeaveC3ColorLegend(props) {
        _classCallCheck(this, WeaveC3ColorLegend);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveC3ColorLegend).call(this, props));

        _this.toolPath = props.toolPath;
        _this.plotterPath = _this.toolPath.pushPlotter("plot");
        _this.dynamicColorColumnPath = _this.plotterPath.push("dynamicColorColumn");
        _this.binningDefinition = _this.dynamicColorColumnPath.push(null, "internalDynamicColumn", null, "binningDefinition", null);
        _this.binnedColumnPath = _this.dynamicColorColumnPath.push(null, "internalDynamicColumn", null);
        _this.maxColumnsPath = _this.plotterPath.push("maxColumns");
        _this.filteredKeySet = _this.plotterPath.push("filteredKeySet");
        _this.selectionKeySet = _this.toolPath.push("selectionKeySet");
        _this.probeKeySet = _this.toolPath.push("probeKeySet");
        _this.state = { selected: [], probed: [] };
        _this.selectedBins = [];
        _this.spanStyle = {
            textAlign: "left",
            verticalAlign: "middle",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            padding: 5,
            userSelect: "none"
        };
        return _this;
    }

    _createClass(WeaveC3ColorLegend, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "setupCallbacks",
        value: function setupCallbacks() {
            this.dynamicColorColumnPath.addCallback(this, this.forceUpdate);
            this.maxColumnsPath.addCallback(this, this.forceUpdate);
            this.filteredKeySet.addCallback(this, this.forceUpdate);
            this.plotterPath.push("shapeSize").addCallback(this, this.forceUpdate);
            this.plotterPath.push("shapeType").addCallback(this, this.forceUpdate);
            this.binnedColumnPath.addCallback(this, this.forceUpdate);
            this.toolPath.selection_keyset.addCallback(this, this.forceUpdate);
            this.toolPath.probe_keyset.addCallback(this, this.forceUpdate);
        }
    }, {
        key: "getSelectedBins",
        value: function getSelectedBins() {
            var keys = this.toolPath.selection_keyset.getKeys();
            var selectedBins = [];
            var binnedColumnObject = this.binnedColumnPath.getObject();
            keys.forEach(function (key) {
                selectedBins.push(binnedColumnObject.getValueFromKey(key, Number));
            });
            return _.unique(selectedBins);
        }
    }, {
        key: "getProbedBins",
        value: function getProbedBins() {
            var keys = this.toolPath.probe_keyset.getKeys();
            var probedBins = [];
            var binnedColumnObject = this.binnedColumnPath.getObject();
            keys.forEach(function (key) {
                probedBins.push(binnedColumnObject.getValueFromKey(key, Number));
            });
            return _.unique(probedBins);
        }
    }, {
        key: "handleClick",
        value: function handleClick(bin, event) {
            var binnedKeys = this.binnedColumnPath.getObject()._binnedKeysArray;
            //setKeys
            if (_.contains(this.selectedBins, bin)) {
                var currentSelection = this.toolPath.selection_keyset.getKeys();
                currentSelection = _.difference(currentSelection, binnedKeys[bin]);
                this.toolPath.selection_keyset.setKeys(currentSelection);
                _.remove(this.selectedBins, function (value) {
                    return value == bin;
                });
            } else {
                if (event.ctrlKey || event.metaKey) {
                    this.toolPath.selection_keyset.addKeys(binnedKeys[bin]);
                    this.selectedBins.push(bin);
                } else {
                    this.toolPath.selection_keyset.setKeys(binnedKeys[bin]);
                    this.selectedBins = [bin];
                }
            }
        }
    }, {
        key: "handleProbe",
        value: function handleProbe(bin, mouseOver) {
            if (mouseOver) {
                var binnedKeys = this.binnedColumnPath.getObject()._binnedKeysArray;
                this.toolPath.probe_keyset.setKeys(binnedKeys[bin]);
            } else {
                this.toolPath.probe_keyset.setKeys([]);
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.setupCallbacks();
        }
    }, {
        key: "getInteractionStyle",
        value: function getInteractionStyle(bin) {
            var probed = this.getProbedBins().indexOf(bin) >= 0;
            var selected = this.getSelectedBins().indexOf(bin) >= 0;
            var borderAlpha;
            if (probed) borderAlpha = 1;else if (selected) borderAlpha = 0.5;else borderAlpha = 0;
            return {
                width: "100%",
                flex: 1.0,
                borderColor: _StandardLib2.default.rgba(0, 0, 0, borderAlpha),
                borderStyle: "solid",
                borderWidth: 1,
                padding: "2px",
                overflow: "hidden"
            };
        }
    }, {
        key: "render",
        value: function render() {
            if (this.numberOfBins) {
                //Binned plot case
                var width = this.props.style.width;
                var height = this.props.style.height;
                var shapeSize = this.plotterPath.getState("shapeSize");
                var shapeType = this.plotterPath.getState("shapeType");
                var maxColumns = 1; //TODO: This should really be "this.maxColumnsPath.getState();" but only supporting 1 column for now
                var columnFlex = 1.0 / maxColumns;
                var extraBins = this.numberOfBins % maxColumns == 0 ? 0 : maxColumns - this.numberOfBins % maxColumns;
                var ramp = this.dynamicColorColumnPath.getState(null, "ramp");
                var yScale = d3.scale.linear().domain([0, this.numberOfBins + 1]).range([0, height]);
                var yMap = function yMap(d) {
                    return yScale(d);
                };
                shapeSize = _.max([1, _.min([shapeSize, height / this.numberOfBins])]);
                var r = shapeSize / 100 * height / this.numberOfBins / 2;
                var bc = this.binnedColumnPath.getObject();
                var textLabelFunction = bc.deriveStringFromNumber.bind(bc);
                var finalElements = [];
                var prefixerStyle = Prefixer.prefix({ styles: this.spanStyle }).styles;
                for (var j = 0; j < maxColumns; j++) {
                    switch (shapeType) {
                        case SHAPE_TYPE_CIRCLE:
                            {
                                var element = [];
                                var elements = [];
                                for (var i = 0; i < this.numberOfBins + extraBins; i++) {
                                    if (i % maxColumns == j) {
                                        if (i < this.numberOfBins) {
                                            element.push(React.createElement(
                                                _ui2.default.HBox,
                                                { key: i, style: this.getInteractionStyle(i), onClick: this.handleClick.bind(this, i), onMouseOver: this.handleProbe.bind(this, i, true), onMouseOut: this.handleProbe.bind(this, i, false) },
                                                React.createElement(
                                                    _ui2.default.HBox,
                                                    { style: { width: "100%", flex: 0.2, minWidth: 10, position: "relative", padding: "0px 0px 0px 0px" } },
                                                    React.createElement(
                                                        "svg",
                                                        { style: { position: "absolute" }, viewBox: "0 0 100 100", width: "100%", height: "100%" },
                                                        React.createElement("circle", { cx: "50%", cy: "50%", r: "45%", style: {
                                                                fill: "#" + _StandardLib2.default.decimalToHex(_StandardLib2.default.interpolateColor(_StandardLib2.default.normalize(i, 0, this.numberOfBins - 1), ramp)),
                                                                stroke: "black",
                                                                strokeOpacity: 0.5
                                                            } })
                                                    )
                                                ),
                                                React.createElement(
                                                    _ui2.default.HBox,
                                                    { style: { width: "100%", flex: 0.8, alignItems: "center" } },
                                                    React.createElement(
                                                        "span",
                                                        { style: prefixerStyle },
                                                        textLabelFunction(i)
                                                    )
                                                )
                                            ));
                                        } else {
                                            element.push(React.createElement(_ui2.default.HBox, { key: i, style: { width: "100%", flex: 1.0 } }));
                                        }
                                    }
                                }
                                if (this.props.style.width > this.props.style.height * 2) {
                                    if (weavejs.WeaveAPI.Locale.reverseLayout) {
                                        element = element.reverse();
                                    }
                                    elements.push(React.createElement(
                                        _ui2.default.HBox,
                                        { key: i, style: { width: "100%", flex: columnFlex } },
                                        " ",
                                        element,
                                        " "
                                    ));
                                } else {
                                    elements.push(React.createElement(
                                        _ui2.default.VBox,
                                        { key: i, style: { height: "100%", flex: columnFlex } },
                                        " ",
                                        element,
                                        " "
                                    ));
                                }
                                finalElements[j] = elements;
                            }
                            break;
                        case SHAPE_TYPE_SQUARE:
                            break;
                        case SHAPE_TYPE_LINE:
                            break;
                        case SHAPE_TYPE_BOX:
                            {
                                var element = [];
                                var elements = [];
                                for (var i = 0; i < this.numberOfBins + extraBins; i++) {
                                    if (i % maxColumns == j) {
                                        if (i < this.numberOfBins) {
                                            element.push(React.createElement(
                                                _ui2.default.HBox,
                                                { key: i, style: this.getInteractionStyle(i), onClick: this.handleClick.bind(this, i), onMouseOver: this.handleProbe.bind(this, i, true), onMouseOut: this.handleProbe.bind(this, i, false) },
                                                React.createElement(
                                                    _ui2.default.HBox,
                                                    { style: {
                                                            width: "100%", flex: 1.0,
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            backgroundColor: _StandardLib2.default.hex2rgba(_StandardLib2.default.decimalToHex(_StandardLib2.default.interpolateColor(_StandardLib2.default.normalize(i, 0, this.numberOfBins - 1), ramp)), 0.5)
                                                        } },
                                                    React.createElement(
                                                        "div",
                                                        { style: {
                                                                stroke: "black",
                                                                strokeOpacity: 0.5,
                                                                backgroundColor: "#FFF"
                                                            } },
                                                        React.createElement(
                                                            "span",
                                                            { style: prefixerStyle },
                                                            textLabelFunction(i)
                                                        )
                                                    )
                                                )
                                            ));
                                        } else {
                                            element.push(React.createElement(_ui2.default.HBox, { key: i, style: { width: "100%", flex: 1.0 } }));
                                        }
                                    }
                                }
                                if (this.props.style.width > this.props.style.height * 2) {
                                    if (weavejs.WeaveAPI.Locale.reverseLayout) {
                                        element = element.reverse();
                                    }
                                    elements.push(React.createElement(
                                        _ui2.default.HBox,
                                        { key: i, style: { width: "100%", flex: columnFlex, padding: "5px" } },
                                        " ",
                                        element,
                                        " "
                                    ));
                                } else {
                                    elements.push(React.createElement(
                                        _ui2.default.VBox,
                                        { key: i, style: { height: "100%", flex: columnFlex, padding: "5px" } },
                                        " ",
                                        element,
                                        " "
                                    ));
                                }
                                finalElements[j] = elements;
                            }
                    }
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
                                this.dynamicColorColumnPath.getObject().getMetadata('title')
                            )
                        ),
                        this.props.style.width > this.props.style.height * 2 ? React.createElement(
                            _ui2.default.HBox,
                            { style: { width: "100%", flex: 0.9 } },
                            " ",
                            finalElements,
                            " "
                        ) : React.createElement(
                            _ui2.default.VBox,
                            { style: { height: "100%", flex: 0.9 } },
                            " ",
                            finalElements,
                            " "
                        )
                    )
                );
            } else {
                //Continuous plot case
                return React.createElement("svg", null);
            }
        }
    }, {
        key: "title",
        get: function get() {
            return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
        }
    }, {
        key: "numberOfBins",
        get: function get() {
            return this.binnedColumnPath.getObject().numberOfBins;
        }
    }]);

    return WeaveC3ColorLegend;
}(React.Component);

exports.default = WeaveC3ColorLegend;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::ColorBinLegendTool", WeaveC3ColorLegend);
//Weave.registerClass("weavejs.tools.ColorBinLegendTool", WeaveC3ColorLegend, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtYzMtY29sb3JsZWdlbmQuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvd2VhdmUtYzMtY29sb3JsZWdlbmQudHN4Il0sIm5hbWVzIjpbIldlYXZlQzNDb2xvckxlZ2VuZCIsIldlYXZlQzNDb2xvckxlZ2VuZC5jb25zdHJ1Y3RvciIsIldlYXZlQzNDb2xvckxlZ2VuZC50aXRsZSIsIldlYXZlQzNDb2xvckxlZ2VuZC5udW1iZXJPZkJpbnMiLCJXZWF2ZUMzQ29sb3JMZWdlbmQuaGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMiLCJXZWF2ZUMzQ29sb3JMZWdlbmQuc2V0dXBDYWxsYmFja3MiLCJXZWF2ZUMzQ29sb3JMZWdlbmQuZ2V0U2VsZWN0ZWRCaW5zIiwiV2VhdmVDM0NvbG9yTGVnZW5kLmdldFByb2JlZEJpbnMiLCJXZWF2ZUMzQ29sb3JMZWdlbmQuaGFuZGxlQ2xpY2siLCJXZWF2ZUMzQ29sb3JMZWdlbmQuaGFuZGxlUHJvYmUiLCJXZWF2ZUMzQ29sb3JMZWdlbmQuY29tcG9uZW50RGlkTW91bnQiLCJXZWF2ZUMzQ29sb3JMZWdlbmQuZ2V0SW50ZXJhY3Rpb25TdHlsZSIsIldlYXZlQzNDb2xvckxlZ2VuZC5yZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVdZLEFBQUMsQUFBTSxBQUFRLEFBQ3BCOzs7O0lBQUssQUFBRSxBQUFNLEFBQUksQUFDakI7Ozs7SUFBSyxBQUFLLEFBQU0sQUFBTyxBQUN2QixBQUFFLEFBQU0sQUFBZ0IsQUFDeEIsQUFBVyxBQUFNLEFBQXNCLEFBR3ZDOzs7Ozs7Ozs7Ozs7SUFBSyxBQUFRLEFBQU0sQUFBcUI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRS9DLElBQU0sQUFBaUIsb0JBQVUsQUFBUSxBQUFDO0FBQzFDLElBQU0sQUFBaUIsb0JBQVUsQUFBUSxBQUFDO0FBQzFDLElBQU0sQUFBZSxrQkFBVSxBQUFNLEFBQUM7QUFDdEMsSUFBTSxBQUFjLGlCQUFVLEFBQUssQUFBQyxBQUVwQzs7Ozs7QUFlQyxnQ0FBWSxBQUFtQjs7OzBHQUV4QixBQUFLLEFBQUMsQUFBQzs7QUFDYixBQUFJLGNBQUMsQUFBUSxXQUFHLEFBQUssTUFBQyxBQUFRLEFBQUM7QUFDL0IsQUFBSSxjQUFDLEFBQVcsY0FBRyxBQUFJLE1BQUMsQUFBUSxTQUFDLEFBQVcsWUFBQyxBQUFNLEFBQUMsQUFBQztBQUNyRCxBQUFJLGNBQUMsQUFBc0IseUJBQUcsQUFBSSxNQUFDLEFBQVcsWUFBQyxBQUFJLEtBQUMsQUFBb0IsQUFBQyxBQUFDO0FBQzFFLEFBQUksY0FBQyxBQUFpQixvQkFBRyxBQUFJLE1BQUMsQUFBc0IsdUJBQUMsQUFBSSxLQUFDLEFBQUksTUFBRSxBQUF1Qix5QkFBRSxBQUFJLE1BQUUsQUFBbUIscUJBQUUsQUFBSSxBQUFDLEFBQUM7QUFDMUgsQUFBSSxjQUFDLEFBQWdCLG1CQUFHLEFBQUksTUFBQyxBQUFzQix1QkFBQyxBQUFJLEtBQUMsQUFBSSxNQUFFLEFBQXVCLHlCQUFFLEFBQUksQUFBQyxBQUFDO0FBQzlGLEFBQUksY0FBQyxBQUFjLGlCQUFHLEFBQUksTUFBQyxBQUFXLFlBQUMsQUFBSSxLQUFDLEFBQVksQUFBQyxBQUFDO0FBQzFELEFBQUksY0FBQyxBQUFjLGlCQUFHLEFBQUksTUFBQyxBQUFXLFlBQUMsQUFBSSxLQUFDLEFBQWdCLEFBQUMsQUFBQztBQUM5RCxBQUFJLGNBQUMsQUFBZSxrQkFBRyxBQUFJLE1BQUMsQUFBUSxTQUFDLEFBQUksS0FBQyxBQUFpQixBQUFDLEFBQUM7QUFDN0QsQUFBSSxjQUFDLEFBQVcsY0FBRyxBQUFJLE1BQUMsQUFBUSxTQUFDLEFBQUksS0FBQyxBQUFhLEFBQUMsQUFBQztBQUNyRCxBQUFJLGNBQUMsQUFBSyxRQUFHLEVBQUMsQUFBUSxVQUFDLEFBQUUsSUFBRSxBQUFNLFFBQUMsQUFBRSxBQUFDLEFBQUM7QUFDdEMsQUFBSSxjQUFDLEFBQVksZUFBRyxBQUFFLEFBQUM7QUFDdkIsQUFBSSxjQUFDLEFBQVMsWUFBRztBQUNoQixBQUFTLHVCQUFFLEFBQU07QUFDakIsQUFBYSwyQkFBRSxBQUFRO0FBQ3ZCLEFBQVEsc0JBQUUsQUFBUTtBQUNsQixBQUFVLHdCQUFFLEFBQVE7QUFDcEIsQUFBWSwwQkFBRSxBQUFVO0FBQ3hCLEFBQU8scUJBQUUsQUFBQztBQUNWLEFBQVUsd0JBQUUsQUFBTSxBQUNsQixBQUFDLEFBQ0gsQUFBQyxBQUVELEFBQUksQUFBSztVQXZCUjs7Ozs7OzREQWlDZ0QsQUFBWSxVQUc3RCxBQUFDLEFBRU8sQUFBYzs7OztBQUVyQixBQUFJLGlCQUFDLEFBQXNCLHVCQUFDLEFBQVcsWUFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQVcsQUFBQyxBQUFDO0FBQ2hFLEFBQUksaUJBQUMsQUFBYyxlQUFDLEFBQVcsWUFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQVcsQUFBQyxBQUFDO0FBQ3hELEFBQUksaUJBQUMsQUFBYyxlQUFDLEFBQVcsWUFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQVcsQUFBQyxBQUFDO0FBQ3hELEFBQUksaUJBQUMsQUFBVyxZQUFDLEFBQUksS0FBQyxBQUFXLEFBQUMsYUFBQyxBQUFXLFlBQUMsQUFBSSxNQUFFLEFBQUksS0FBQyxBQUFXLEFBQUMsQUFBQztBQUN2RSxBQUFJLGlCQUFDLEFBQVcsWUFBQyxBQUFJLEtBQUMsQUFBVyxBQUFDLGFBQUMsQUFBVyxZQUFDLEFBQUksTUFBRSxBQUFJLEtBQUMsQUFBVyxBQUFDLEFBQUM7QUFDdkUsQUFBSSxpQkFBQyxBQUFnQixpQkFBQyxBQUFXLFlBQUMsQUFBSSxNQUFFLEFBQUksS0FBQyxBQUFXLEFBQUMsQUFBQztBQUMxRCxBQUFJLGlCQUFDLEFBQVEsU0FBQyxBQUFnQixpQkFBQyxBQUFXLFlBQUMsQUFBSSxNQUFFLEFBQUksS0FBQyxBQUFXLEFBQUMsQUFBQztBQUNuRSxBQUFJLGlCQUFDLEFBQVEsU0FBQyxBQUFZLGFBQUMsQUFBVyxZQUFDLEFBQUksTUFBRSxBQUFJLEtBQUMsQUFBVyxBQUFDLEFBQUMsQUFDaEUsQUFBQyxBQUVELEFBQWU7Ozs7O0FBRWQsZ0JBQUksQUFBSSxPQUFHLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBZ0IsaUJBQUMsQUFBTyxBQUFFLEFBQUM7QUFDcEQsZ0JBQUksQUFBWSxlQUFZLEFBQUUsQUFBQztBQUMvQixnQkFBSSxBQUFrQixxQkFBRyxBQUFJLEtBQUMsQUFBZ0IsaUJBQUMsQUFBUyxBQUFFLEFBQUM7QUFDM0QsQUFBSSxpQkFBQyxBQUFPLGtCQUFHLEFBQVU7QUFDeEIsQUFBWSw2QkFBQyxBQUFJLEtBQUMsQUFBa0IsbUJBQUMsQUFBZSxnQkFBQyxBQUFHLEtBQUUsQUFBTSxBQUFDLEFBQUMsQUFBQyxBQUNwRSxBQUFDLEFBQUMsQUFBQzthQUZXO0FBR2QsQUFBTSxtQkFBQyxBQUFDLEVBQUMsQUFBTSxPQUFDLEFBQVksQUFBQyxBQUFDLEFBQy9CLEFBQUMsQUFFRCxBQUFhOzs7OztBQUVaLGdCQUFJLEFBQUksT0FBRyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVksYUFBQyxBQUFPLEFBQUUsQUFBQztBQUNoRCxnQkFBSSxBQUFVLGFBQVksQUFBRSxBQUFDO0FBQzdCLGdCQUFJLEFBQWtCLHFCQUFHLEFBQUksS0FBQyxBQUFnQixpQkFBQyxBQUFTLEFBQUUsQUFBQztBQUMzRCxBQUFJLGlCQUFDLEFBQU8sa0JBQUcsQUFBVTtBQUN4QixBQUFVLDJCQUFDLEFBQUksS0FBQyxBQUFrQixtQkFBQyxBQUFlLGdCQUFDLEFBQUcsS0FBRSxBQUFNLEFBQUMsQUFBQyxBQUFDLEFBQ2xFLEFBQUMsQUFBQyxBQUFDO2FBRlc7QUFHZCxBQUFNLG1CQUFDLEFBQUMsRUFBQyxBQUFNLE9BQUMsQUFBVSxBQUFDLEFBQUMsQUFDN0IsQUFBQyxBQUVELEFBQVc7Ozs7b0NBQUMsQUFBVSxLQUFFLEFBQXNCO0FBRTdDLGdCQUFJLEFBQVUsYUFBUyxBQUFJLEtBQUMsQUFBZ0IsaUJBQUMsQUFBUyxBQUFFLFlBQUMsQUFBZ0IsQUFBQyxBQUMxRSxBQUFTOztnQkFDTCxBQUFDLEVBQUMsQUFBUSxTQUFDLEFBQUksS0FBQyxBQUFZLGNBQUMsQUFBRyxBQUFDLEFBQUM7QUFFckMsb0JBQUksQUFBZ0IsbUJBQVMsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFnQixpQkFBQyxBQUFPLEFBQUUsQUFBQztBQUN0RSxBQUFnQixtQ0FBRyxBQUFDLEVBQUMsQUFBVSxXQUFDLEFBQWdCLGtCQUFDLEFBQVUsV0FBQyxBQUFHLEFBQUMsQUFBQyxBQUFDO0FBQ2xFLEFBQUkscUJBQUMsQUFBUSxTQUFDLEFBQWdCLGlCQUFDLEFBQU8sUUFBQyxBQUFnQixBQUFDLEFBQUM7QUFDekQsQUFBQyxrQkFBQyxBQUFNLE9BQUMsQUFBSSxLQUFDLEFBQVksd0JBQUcsQUFBWTtBQUN4QyxBQUFNLDJCQUFDLEFBQUssU0FBSSxBQUFHLEFBQUMsQUFDckIsQUFBQyxBQUFDLEFBQUMsQUFDSixBQUFDLEFBQ0QsQUFBSTtpQkFKeUIsRUFKN0IsQUFBQzthQURELEFBQUUsQUFBQyxNQVVILEFBQUM7QUFDQSxBQUFFLEFBQUMsQUFBQyxvQkFBQyxBQUFLLE1BQUMsQUFBTyxXQUFJLEFBQUssTUFBQyxBQUFPLEFBQUMsQUFBQztBQUVwQyxBQUFJLHlCQUFDLEFBQVEsU0FBQyxBQUFnQixpQkFBQyxBQUFPLFFBQUMsQUFBVSxXQUFDLEFBQUcsQUFBQyxBQUFDLEFBQUM7QUFDeEQsQUFBSSx5QkFBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQUcsQUFBQyxBQUFDLEFBQzdCLEFBQUMsQUFDRCxBQUFJLEtBSkosQUFBQzt1QkFLRCxBQUFDO0FBQ0EsQUFBSSx5QkFBQyxBQUFRLFNBQUMsQUFBZ0IsaUJBQUMsQUFBTyxRQUFDLEFBQVUsV0FBQyxBQUFHLEFBQUMsQUFBQyxBQUFDO0FBQ3hELEFBQUkseUJBQUMsQUFBWSxlQUFHLENBQUMsQUFBRyxBQUFDLEFBQUMsQUFDM0IsQUFBQyxBQUNGLEFBQUMsQUFDRixBQUFDLEFBRUQsQUFBVzs7Ozs7O29DQUFDLEFBQVUsS0FBRSxBQUFpQjtBQUV4QyxBQUFFLEFBQUMsZ0JBQUMsQUFBUyxBQUFDLFdBQ2QsQUFBQztBQUNBLG9CQUFJLEFBQVUsYUFBUyxBQUFJLEtBQUMsQUFBZ0IsaUJBQUMsQUFBUyxBQUFFLFlBQUMsQUFBZ0IsQUFBQztBQUMxRSxBQUFJLHFCQUFDLEFBQVEsU0FBQyxBQUFZLGFBQUMsQUFBTyxRQUFDLEFBQVUsV0FBQyxBQUFHLEFBQUMsQUFBQyxBQUFDLEFBQ3JELEFBQUMsQUFDRCxBQUFJO21CQUNKLEFBQUM7QUFDQSxBQUFJLHFCQUFDLEFBQVEsU0FBQyxBQUFZLGFBQUMsQUFBTyxRQUFDLEFBQUUsQUFBQyxBQUFDLEFBQ3hDLEFBQUMsQUFDRixBQUFDLEFBRUQsQUFBaUI7Ozs7OztBQUVoQixBQUFJLGlCQUFDLEFBQWMsQUFBRSxBQUFDLEFBQ3ZCLEFBQUMsQUFFRCxBQUFtQjs7Ozs0Q0FBQyxBQUFVO0FBRTdCLGdCQUFJLEFBQU0sU0FBVyxBQUFJLEtBQUMsQUFBYSxBQUFFLGdCQUFDLEFBQU8sUUFBQyxBQUFHLEFBQUMsUUFBSSxBQUFDLEFBQUM7QUFDNUQsZ0JBQUksQUFBUSxXQUFXLEFBQUksS0FBQyxBQUFlLEFBQUUsa0JBQUMsQUFBTyxRQUFDLEFBQUcsQUFBQyxRQUFJLEFBQUMsQUFBQztBQUVoRSxnQkFBSSxBQUFrQixBQUFDO0FBQ3ZCLEFBQUUsQUFBQyxnQkFBQyxBQUFNLEFBQUMsUUFDVixBQUFXLGNBQUcsQUFBQyxBQUFDLEFBQ2pCLEFBQUksT0FBQyxBQUFFLEFBQUMsSUFBQyxBQUFRLEFBQUMsVUFDakIsQUFBVyxjQUFHLEFBQUcsQUFBQyxBQUNuQixBQUFJLFNBQ0gsQUFBVyxjQUFHLEFBQUMsQUFBQztBQUVqQixBQUFNLG1CQUFDO0FBQ04sQUFBSyx1QkFBRSxBQUFNO0FBQ2IsQUFBSSxzQkFBRSxBQUFHO0FBQ1QsQUFBVyw2QkFBRSxBQUFXLHNCQUFDLEFBQUksS0FBQyxBQUFDLEdBQUUsQUFBQyxHQUFFLEFBQUMsR0FBRSxBQUFXLEFBQUM7QUFDbkQsQUFBVyw2QkFBRSxBQUFPO0FBQ3BCLEFBQVcsNkJBQUUsQUFBQztBQUNkLEFBQU8seUJBQUUsQUFBSztBQUNkLEFBQVEsMEJBQUUsQUFBUSxBQUNsQixBQUFDLEFBQ0gsQUFBQyxBQUVELEFBQU07Ozs7OztBQUVMLEFBQUUsQUFBQyxnQkFBQyxBQUFJLEtBQUMsQUFBWSxBQUFDOztBQUdyQixvQkFBSSxBQUFLLFFBQVUsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFLLE1BQUMsQUFBSyxBQUFDO0FBQzFDLG9CQUFJLEFBQU0sU0FBVSxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUssTUFBQyxBQUFNLEFBQUM7QUFDNUMsb0JBQUksQUFBUyxZQUFVLEFBQUksS0FBQyxBQUFXLFlBQUMsQUFBUSxTQUFDLEFBQVcsQUFBQyxBQUFDO0FBQzlELG9CQUFJLEFBQVMsWUFBVSxBQUFJLEtBQUMsQUFBVyxZQUFDLEFBQVEsU0FBQyxBQUFXLEFBQUMsQUFBQztBQUM5RCxvQkFBSSxBQUFVLGFBQVUsQUFBQyxBQUFDLEFBQW9HLEFBQzlIO0FBUEQsQUFBQyxBQUNBLEFBQWtCLG9CQU1kLEFBQVUsYUFBVSxBQUFHLE1BQUMsQUFBVSxBQUFDO0FBQ3ZDLG9CQUFJLEFBQVMsWUFBVSxBQUFJLEtBQUMsQUFBWSxlQUFHLEFBQVUsY0FBSSxBQUFDLElBQUcsQUFBQyxJQUFHLEFBQVUsYUFBRyxBQUFJLEtBQUMsQUFBWSxlQUFHLEFBQVUsQUFBQztBQUM3RyxvQkFBSSxBQUFJLE9BQVMsQUFBSSxLQUFDLEFBQXNCLHVCQUFDLEFBQVEsU0FBQyxBQUFJLE1BQUUsQUFBTSxBQUFDLEFBQUM7QUFDcEUsb0JBQUksQUFBTSxTQUFZLEFBQUUsR0FBQyxBQUFLLE1BQUMsQUFBTSxBQUFFLFNBQUMsQUFBTSxPQUFDLENBQUMsQUFBQyxHQUFFLEFBQUksS0FBQyxBQUFZLGVBQUcsQUFBQyxBQUFDLEFBQUMsSUFBQyxBQUFLLE1BQUMsQ0FBQyxBQUFDLEdBQUUsQUFBTSxBQUFDLEFBQUMsQUFBQztBQUM5RixvQkFBSSxBQUFJLHFCQUFhLEFBQVE7QUFBYyxBQUFNLDJCQUFDLEFBQU0sT0FBQyxBQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQztpQkFBM0M7QUFFcEIsQUFBUyw0QkFBRyxBQUFDLEVBQUMsQUFBRyxJQUFDLENBQUMsQUFBQyxHQUFFLEFBQUMsRUFBQyxBQUFHLElBQUMsQ0FBQyxBQUFTLFdBQUUsQUFBTSxTQUFHLEFBQUksS0FBQyxBQUFZLEFBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQztBQUN2RSxvQkFBSSxBQUFDLElBQVUsU0FBQyxBQUFTLEdBQUcsQUFBRyxNQUFHLEFBQU0sU0FBRyxBQUFJLEtBQUMsQUFBWSxBQUFDLGVBQUcsQUFBQyxBQUFDO0FBQ2xFLG9CQUFJLEFBQUUsS0FBTyxBQUFJLEtBQUMsQUFBZ0IsaUJBQUMsQUFBUyxBQUFFLEFBQUM7QUFDL0Msb0JBQUksQUFBaUIsb0JBQVksQUFBRSxHQUFDLEFBQXNCLHVCQUFDLEFBQUksS0FBQyxBQUFFLEFBQUMsQUFBQztBQUNwRSxvQkFBSSxBQUFhLGdCQUFTLEFBQUUsQUFBQztBQUM3QixvQkFBSSxBQUFhLGdCQUFNLEFBQVEsU0FBQyxBQUFNLE9BQUMsRUFBQyxBQUFNLFFBQUUsQUFBSSxLQUFDLEFBQVMsQUFBQyxBQUFDLGFBQUMsQUFBTSxBQUFDO0FBQ3hFLEFBQUcsQUFBQyxxQkFBQyxBQUFHLElBQUMsQUFBQyxJQUFVLEFBQUMsR0FBRSxBQUFDLElBQUcsQUFBVSxZQUFFLEFBQUMsQUFBRTtBQUV6QyxBQUFNLEFBQUMsNEJBQUMsQUFBUyxBQUFDLEFBQ2xCLEFBQUM7QUFDQSw2QkFBSyxBQUFpQjtBQUN0QixBQUFDO0FBQ0Esb0NBQUksQUFBTyxVQUFpQixBQUFFLEFBQUM7QUFDL0Isb0NBQUksQUFBUSxXQUFpQixBQUFFLEFBQUM7QUFDaEMsQUFBRyxBQUFDLHFDQUFDLEFBQUcsSUFBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQUMsSUFBRyxBQUFJLEtBQUMsQUFBWSxlQUFHLEFBQVMsV0FBRSxBQUFDLEFBQUUsS0FDdEQsQUFBQztBQUNBLEFBQUUsQUFBQyx3Q0FBQyxBQUFDLElBQUcsQUFBVSxjQUFJLEFBQUMsQUFBQyxHQUN4QixBQUFDO0FBRUEsQUFBRSxBQUFDLDRDQUFDLEFBQUMsSUFBRyxBQUFJLEtBQUMsQUFBWSxBQUFDO0FBRXpCLEFBQU8sb0RBQUMsQUFBSTs2REFDUCxBQUFJO2tEQUFDLEFBQUcsQUFBQyxLQUFDLEFBQUMsQUFBQyxHQUFDLEFBQUssQUFBQyxPQUFDLEFBQUksS0FBQyxBQUFtQixvQkFBQyxBQUFDLEFBQUMsQUFBQyxJQUFDLEFBQU8sQUFBQyxTQUFDLEFBQUksS0FBQyxBQUFXLFlBQUMsQUFBSSxLQUFDLEFBQUksTUFBRSxBQUFDLEFBQUMsQUFBQyxJQUFDLEFBQVcsQUFBQyxhQUFDLEFBQUksS0FBQyxBQUFXLFlBQUMsQUFBSSxLQUFDLEFBQUksTUFBRSxBQUFDLEdBQUUsQUFBSSxBQUFDLEFBQUMsT0FBQyxBQUFVLEFBQUMsWUFBQyxBQUFJLEtBQUMsQUFBVyxZQUFDLEFBQUksS0FBQyxBQUFJLE1BQUUsQUFBQyxHQUFFLEFBQUssQUFBQyxBQUFDLEFBQ2pNO2dEQUFBLEFBQUMsQUFBRTtpRUFBQyxBQUFJO3NEQUFDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBSyxPQUFDLEFBQU0sUUFBRSxBQUFJLE1BQUMsQUFBRyxLQUFDLEFBQVEsVUFBQyxBQUFFLElBQUUsQUFBUSxVQUFDLEFBQVUsWUFBRSxBQUFPLFNBQUMsQUFBaUIsQUFBQyxBQUFDLEFBQ3BHO29EQUFBLEFBQUMsQUFBRzs7MERBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFRLFVBQUMsQUFBVSxBQUFDLEFBQUMsY0FDaEMsQUFBTyxTQUFDLEFBQWEsZUFBQyxBQUFLLE9BQUMsQUFBTSxRQUFDLEFBQU0sUUFBQyxBQUFNLEFBQ2pEO3dEQUFBLEFBQUMsQUFBTSxnQ0FBQyxBQUFFLElBQUMsQUFBSyxPQUFDLEFBQUUsSUFBQyxBQUFLLE9BQUMsQUFBQyxHQUFDLEFBQUssY0FBUTtBQUN4QyxBQUFJLHNFQUFFLEFBQUcsTUFBRyxBQUFXLHNCQUFDLEFBQVksYUFBQyxBQUFXLHNCQUFDLEFBQWdCLGlCQUFDLEFBQVcsc0JBQUMsQUFBUyxVQUFDLEFBQUMsR0FBRSxBQUFDLEdBQUUsQUFBSSxLQUFDLEFBQVksZUFBRyxBQUFDLEFBQUMsSUFBRSxBQUFJLEFBQUMsQUFBQztBQUM1SCxBQUFNLHdFQUFFLEFBQU87QUFDZixBQUFhLCtFQUFFLEFBQUcsQUFDbEIsQUFBQyxBQUNILEFBQUUsQUFBRyxBQUNOLEFBQUUsQUFBRSxBQUFDLEFBQUksQUFDVDs2REFQb0MsQUFBSyxBQUFDOztpREFKNUMsQUFBQyxBQUFFO2dEQVdELEFBQUMsQUFBRTtpRUFBQyxBQUFJO3NEQUFDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBSyxPQUFDLEFBQU0sUUFBRSxBQUFJLE1BQUMsQUFBRyxLQUFFLEFBQVUsWUFBQyxBQUFRLEFBQUMsQUFBQyxBQUM1RDtvREFBQSxBQUFDLEFBQUk7OzBEQUFDLEFBQUssQUFBQyxPQUFFLEFBQWEsQUFBRSxBQUFDO3dEQUFFLEFBQWlCLGtCQUFDLEFBQUMsQUFBQyxBQUFFLEFBQUUsQUFBSSxBQUM5RCxBQUFFLEFBQUUsQUFBQyxBQUFJLEFBQ1gsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQ1YsQUFBQyxBQUNILEFBQUMsQUFDRCxBQUFJOzs7K0NBbkJKLEFBQUM7K0NBb0JELEFBQUM7QUFDQSxBQUFPLG9EQUFDLEFBQUksS0FDWCxBQUFDLEFBQUUsaUNBQUMsQUFBSSxRQUFDLEFBQUcsQUFBQyxLQUFDLEFBQUMsQUFBQyxHQUFDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBSyxPQUFDLEFBQU0sUUFBRSxBQUFJLE1BQUMsQUFBRyxBQUFDLEFBQUMsQUFBRSxBQUNuRCxBQUFDLEFBQ0gsQUFBQyxBQUNGLEFBQUMsQUFDRixBQUFDOzs7O0FBRUQsQUFBRSxBQUFDLG9DQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBSyxNQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUssTUFBQyxBQUFNLFNBQUcsQUFBQyxBQUFDO0FBRXhELEFBQUUsd0NBQUMsQUFBTyxRQUFDLEFBQVEsU0FBQyxBQUFNLE9BQUMsQUFBYSxBQUFDO0FBQ3hDLEFBQU8sa0RBQUcsQUFBTyxRQUFDLEFBQU8sQUFBRSxBQUFDLEFBQzdCLEFBQUMsVUFGd0MsQUFBQzs7QUFJMUMsQUFBUSw2Q0FBQyxBQUFJO3FEQUNSLEFBQUk7MENBQUMsQUFBRyxBQUFDLEtBQUMsQUFBQyxBQUFDLEdBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFLLE9BQUMsQUFBTSxRQUFFLEFBQUksTUFBRSxBQUFVLEFBQUMsQUFBQyxBQUFFOzt3Q0FBRSxBQUFPLEFBQUcsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQ2pGLEFBQUMsQUFDSCxBQUFDLEFBQ0QsQUFBSSxPQUhGLEFBQUMsQUFBRTs7dUNBTkwsQUFBQzt1Q0FVRCxBQUFDO0FBQ0EsQUFBUSw2Q0FBQyxBQUFJO3FEQUNSLEFBQUk7MENBQUMsQUFBRyxBQUFDLEtBQUMsQUFBQyxBQUFDLEdBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFNLFFBQUMsQUFBTSxRQUFFLEFBQUksTUFBRSxBQUFVLEFBQUMsQUFBQyxBQUFFOzt3Q0FBRSxBQUFPLEFBQUcsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQ2xGLEFBQUMsQUFDSCxBQUFDLE9BRkMsQUFBQyxBQUFFOzs7O0FBSUwsQUFBYSw4Q0FBQyxBQUFDLEFBQUMsS0FBRyxBQUFRLEFBQUMsQUFDN0IsQUFBQzs7QUFDQSxBQUFLLEFBQUM7NkJBQ0YsQUFBaUI7QUFDckIsQUFBSyxBQUFDLGtDQURQOzZCQUdLLEFBQWU7QUFDbkIsQUFBSyxBQUFDLGtDQURQOzZCQUdLLEFBQWM7QUFDbkIsQUFBQztBQUNBLG9DQUFJLEFBQU8sVUFBaUIsQUFBRSxBQUFDO0FBQy9CLG9DQUFJLEFBQVEsV0FBaUIsQUFBRSxBQUFDO0FBQ2hDLEFBQUcsQUFBQyxxQ0FBQyxBQUFHLElBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFDLElBQUcsQUFBSSxLQUFDLEFBQVksZUFBRyxBQUFTLFdBQUUsQUFBQyxBQUFFLEtBQ3RELEFBQUM7QUFDQSxBQUFFLEFBQUMsd0NBQUMsQUFBQyxJQUFHLEFBQVUsY0FBSSxBQUFDLEFBQUMsR0FDeEIsQUFBQztBQUVBLEFBQUUsQUFBQyw0Q0FBQyxBQUFDLElBQUcsQUFBSSxLQUFDLEFBQVksQUFBQztBQUV6QixBQUFPLG9EQUFDLEFBQUk7NkRBQ1AsQUFBSTtrREFBQyxBQUFHLEFBQUMsS0FBQyxBQUFDLEFBQUMsR0FBQyxBQUFLLEFBQUMsT0FBQyxBQUFJLEtBQUMsQUFBbUIsb0JBQUMsQUFBQyxBQUFDLEFBQUMsSUFBQyxBQUFPLEFBQUMsU0FBQyxBQUFJLEtBQUMsQUFBVyxZQUFDLEFBQUksS0FBQyxBQUFJLE1BQUUsQUFBQyxBQUFDLEFBQUMsSUFBQyxBQUFXLEFBQUMsYUFBQyxBQUFJLEtBQUMsQUFBVyxZQUFDLEFBQUksS0FBQyxBQUFJLE1BQUUsQUFBQyxHQUFFLEFBQUksQUFBQyxBQUFDLE9BQUMsQUFBVSxBQUFDLFlBQUMsQUFBSSxLQUFDLEFBQVcsWUFBQyxBQUFJLEtBQUMsQUFBSSxNQUFFLEFBQUMsR0FBRSxBQUFLLEFBQUMsQUFBQyxBQUNsTTtnREFBQSxBQUFDLEFBQUU7aUVBQUMsQUFBSTtzREFBQyxBQUFLLEFBQUMsT0FBQztBQUNmLEFBQUssbUVBQUMsQUFBTSxRQUFFLEFBQUksTUFBQyxBQUFHO0FBQ3RCLEFBQVUsd0VBQUMsQUFBUTtBQUNuQixBQUFjLDRFQUFDLEFBQVE7QUFDdkIsQUFBZSw2RUFBRSxBQUFXLHNCQUFDLEFBQVEsU0FBQyxBQUFXLHNCQUFDLEFBQVksYUFBQyxBQUFXLHNCQUFDLEFBQWdCLGlCQUFDLEFBQVcsc0JBQUMsQUFBUyxVQUFDLEFBQUMsR0FBRSxBQUFDLEdBQUUsQUFBSSxLQUFDLEFBQVksZUFBRyxBQUFDLEFBQUMsSUFBRSxBQUFJLEFBQUMsQUFBQyxRQUFDLEFBQUcsQUFBQyxBQUMzSixBQUFDLEFBQ0Q7O29EQUFBLEFBQUMsQUFBRzs7MERBQUMsQUFBSyxBQUFDLE9BQUM7QUFDVCxBQUFNLHdFQUFFLEFBQU87QUFDZixBQUFhLCtFQUFFLEFBQUc7QUFDbEIsQUFBZSxpRkFBRSxBQUFNLEFBQ3ZCLEFBQUMsQUFDSDs7d0RBQUEsQUFBQyxBQUFJOzs4REFBQyxBQUFLLEFBQUMsT0FBQyxBQUFhLEFBQUMsQUFBQzs0REFBRSxBQUFpQixrQkFBQyxBQUFDLEFBQUMsQUFBRSxBQUFFLEFBQUksQUFDM0QsQUFBRSxBQUFHLEFBQ04sQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUNWLEFBQUUsQUFBRSxBQUFDLEFBQUksQUFBQyxBQUNWLEFBQUMsQUFDSCxBQUFDLEFBQ0QsQUFBSTs7O2lEQWxCRixBQUFDLEFBQUU7K0NBRkwsQUFBQzsrQ0FxQkQsQUFBQztBQUNBLEFBQU8sb0RBQUMsQUFBSSxLQUNYLEFBQUMsQUFBRSxpQ0FBQyxBQUFJLFFBQUMsQUFBRyxBQUFDLEtBQUMsQUFBQyxBQUFDLEdBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFLLE9BQUMsQUFBTSxRQUFFLEFBQUksTUFBQyxBQUFHLEFBQUMsQUFBQyxBQUFFLEFBQ25ELEFBQUMsQUFDSCxBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUM7Ozs7QUFFRCxBQUFFLEFBQUMsb0NBQUMsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFLLE1BQUMsQUFBSyxRQUFHLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBSyxNQUFDLEFBQU0sU0FBRyxBQUFDLEFBQUM7QUFFeEQsQUFBRSx3Q0FBQyxBQUFPLFFBQUMsQUFBUSxTQUFDLEFBQU0sT0FBQyxBQUFhLEFBQUM7QUFDeEMsQUFBTyxrREFBRyxBQUFPLFFBQUMsQUFBTyxBQUFFLEFBQUMsQUFDN0IsQUFBQyxVQUZ3QyxBQUFDOztBQUkxQyxBQUFRLDZDQUFDLEFBQUk7cURBQ1IsQUFBSTswQ0FBQyxBQUFHLEFBQUMsS0FBQyxBQUFDLEFBQUMsR0FBQyxBQUFLLEFBQUMsT0FBQyxFQUFDLEFBQUssT0FBQyxBQUFNLFFBQUUsQUFBSSxNQUFFLEFBQVUsWUFBRSxBQUFPLFNBQUUsQUFBSyxBQUFDLEFBQUMsQUFBRTs7d0NBQUUsQUFBTyxBQUFHLEFBQUUsQUFBRSxBQUFDLEFBQUksQUFBQyxBQUNqRyxBQUFDLEFBQ0gsQUFBQyxBQUNELEFBQUksT0FIRixBQUFDLEFBQUU7O3VDQU5MLEFBQUM7dUNBVUQsQUFBQztBQUNBLEFBQVEsNkNBQUMsQUFBSTtxREFDUixBQUFJOzBDQUFDLEFBQUcsQUFBQyxLQUFDLEFBQUMsQUFBQyxHQUFDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBTSxRQUFDLEFBQU0sUUFBRSxBQUFJLE1BQUUsQUFBVSxZQUFFLEFBQU8sU0FBRSxBQUFLLEFBQUMsQUFBQyxBQUFFOzt3Q0FBRSxBQUFPLEFBQUcsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQ2xHLEFBQUMsQUFDSCxBQUFDLE9BRkMsQUFBQyxBQUFFOzs7O0FBSUwsQUFBYSw4Q0FBQyxBQUFDLEFBQUMsS0FBRyxBQUFRLEFBQUMsQUFDN0IsQUFBQyxBQUNGLEFBQUMsQUFDRixBQUFDOzZCQTNEQztxQkFuRUYsQUFBQzs7QUFnSUQsQUFBTSxBQUFDOztzQkFBTSxBQUFLLEFBQUMsT0FBQyxFQUFDLEFBQUssT0FBQyxBQUFNLFFBQUUsQUFBTSxRQUFDLEFBQU0sUUFBRSxBQUFPLFNBQUMsQUFBaUIsQUFBQyxBQUFDLEFBQzVFO29CQUFBLEFBQUMsQUFBRTtxQ0FBQyxBQUFJOzBCQUFDLEFBQUssQUFBQyxPQUFDLEVBQUMsQUFBTSxRQUFDLEFBQU0sUUFBQyxBQUFJLE1BQUUsQUFBRyxLQUFFLEFBQVEsVUFBQyxBQUFRLEFBQUMsQUFBQyxBQUM1RDt3QkFBQSxBQUFDLEFBQUU7eUNBQUMsQUFBSTs4QkFBQyxBQUFLLEFBQUMsT0FBQyxFQUFDLEFBQUssT0FBQyxBQUFNLFFBQUUsQUFBSSxNQUFFLEFBQUcsS0FBRSxBQUFVLFlBQUMsQUFBUSxBQUFDLEFBQUMsQUFDOUQ7NEJBQUEsQUFBQyxBQUFJOztrQ0FBQyxBQUFLLEFBQUMsT0FBQyxBQUFhLEFBQUMsQUFBQztnQ0FBQyxBQUFJLEtBQUMsQUFBc0IsdUJBQUMsQUFBUyxBQUFFLFlBQUMsQUFBVyxZQUFDLEFBQU8sQUFBQyxBQUFDLEFBQUUsQUFBSSxBQUNqRyxBQUFFLEFBQUUsQUFBQyxBQUFJLEFBQ1Q7Ozt3QkFDQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUssTUFBQyxBQUFLLFFBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFLLE1BQUMsQUFBTSxTQUFHLEFBQUM7eUNBQzlDLEFBQUk7OEJBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFLLE9BQUMsQUFBTSxRQUFFLEFBQUksTUFBRSxBQUFHLEFBQUMsQUFBQyxBQUFFOzs0QkFBRSxBQUFhLEFBQUcsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLGFBQXhFLEFBQUMsQUFBRTs7NEJBQ0gsQUFBQyxBQUFFO3lDQUFDLEFBQUk7OEJBQUMsQUFBSyxBQUFDLE9BQUMsRUFBQyxBQUFNLFFBQUMsQUFBTSxRQUFFLEFBQUksTUFBRSxBQUFHLEFBQUMsQUFBQyxBQUFFOzs0QkFBRSxBQUFhLEFBQUcsQUFBRSxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBRTdFLEFBQUUsQUFBRSxBQUFDLEFBQUksQUFDVixBQUFFLEFBQUcsQUFBQyxBQUFDLEFBQUMsQUFDVCxBQUFDLEFBQ0QsQUFBSTs7O3FCQWJLLEFBQUMsQUFBRzs7bUJBY2IsQUFBQyxBQUNBLEFBQXNCOztBQUN0QixBQUFNLEFBQUMsdUJBQUMsQUFBQyxBQUFHLEFBQUcsQUFBRyxBQUFDLEFBQUMsQUFBQyxBQUN0QixBQUFDLEFBQ0YsQUFBQyxBQUNGLEFBQUMsQUFHRDs7Ozs7O0FBbFNFLEFBQU0sbUJBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQU8sUUFBQyxBQUFZLEFBQUMsZ0JBQUcsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBWSxBQUFDLGdCQUFHLEFBQUUsQUFBQyxPQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBTyxBQUFFLFVBQUMsQUFBRyxBQUFFLEFBQUMsQUFDM0gsQUFBQyxBQUVELEFBQUksQUFBWTs7Ozs7QUFFZixBQUFNLG1CQUFDLEFBQUksS0FBQyxBQUFnQixpQkFBQyxBQUFTLEFBQUUsWUFBQyxBQUFZLEFBQUMsQUFDdkQsQUFBQyxBQUVZLEFBQW1DOzs7OztFQWxEaEIsQUFBSyxNQUFDLEFBQVM7O2tCQTRVakMsQUFBa0IsQUFBQzs7QUFFbEMsQUFBMEIsMkNBQUMsQUFBK0MsaURBQUUsQUFBa0IsQUFBQyxBQUFDLEFBQ2hHLEFBQW1JIiwic291cmNlc0NvbnRlbnQiOlsiLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9kMy9kMy5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWFjdC11aS91aS50c3hcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LWRvbS5kLnRzXCIvPlxuXG5pbXBvcnQgSUxpbmthYmxlT2JqZWN0ID0gd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3Q7XG5cbmltcG9ydCB7SVZpc1Rvb2wsIElWaXNUb29sUHJvcHMsIElWaXNUb29sU3RhdGV9IGZyb20gXCIuL0lWaXNUb29sXCI7XG5pbXBvcnQge3JlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9ufSBmcm9tIFwiLi4vV2VhdmVUb29sXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIGQzIGZyb20gXCJkM1wiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdWkgZnJvbSBcIi4uL3JlYWN0LXVpL3VpXCI7XG5pbXBvcnQgU3RhbmRhcmRMaWIgZnJvbSBcIi4uL3V0aWxzL1N0YW5kYXJkTGliXCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQge0NTU1Byb3BlcnRpZXN9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUHJlZml4ZXIgZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcblxuY29uc3QgU0hBUEVfVFlQRV9DSVJDTEU6c3RyaW5nID0gXCJjaXJjbGVcIjtcbmNvbnN0IFNIQVBFX1RZUEVfU1FVQVJFOnN0cmluZyA9IFwic3F1YXJlXCI7XG5jb25zdCBTSEFQRV9UWVBFX0xJTkU6c3RyaW5nID0gXCJsaW5lXCI7XG5jb25zdCBTSEFQRV9UWVBFX0JPWDpzdHJpbmcgPSBcImJveFwiO1xuXG5jbGFzcyBXZWF2ZUMzQ29sb3JMZWdlbmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVZpc1Rvb2xQcm9wcywgSVZpc1Rvb2xTdGF0ZT5cbntcblx0cHJpdmF0ZSBwbG90dGVyUGF0aDpXZWF2ZVBhdGg7XG5cdHByaXZhdGUgZHluYW1pY0NvbG9yQ29sdW1uUGF0aDpXZWF2ZVBhdGg7XG5cdHByaXZhdGUgYmlubmluZ0RlZmluaXRpb246V2VhdmVQYXRoO1xuXHRwcml2YXRlIGJpbm5lZENvbHVtblBhdGg6V2VhdmVQYXRoO1xuXHRwcml2YXRlIG1heENvbHVtbnNQYXRoOldlYXZlUGF0aDtcblx0cHJpdmF0ZSBmaWx0ZXJlZEtleVNldDpXZWF2ZVBhdGg7XG5cdHByaXZhdGUgc2VsZWN0aW9uS2V5U2V0OldlYXZlUGF0aDtcblx0cHJpdmF0ZSBwcm9iZUtleVNldDpXZWF2ZVBhdGg7XG5cdHByb3RlY3RlZCB0b29sUGF0aDpXZWF2ZVBhdGg7XG5cdHByaXZhdGUgc3BhblN0eWxlOkNTU1Byb3BlcnRpZXM7XG5cblx0cHJpdmF0ZSBzZWxlY3RlZEJpbnM6bnVtYmVyW107XG5cblx0Y29uc3RydWN0b3IocHJvcHM6SVZpc1Rvb2xQcm9wcylcblx0e1xuXHRcdHN1cGVyKHByb3BzKTtcblx0XHR0aGlzLnRvb2xQYXRoID0gcHJvcHMudG9vbFBhdGg7XG5cdFx0dGhpcy5wbG90dGVyUGF0aCA9IHRoaXMudG9vbFBhdGgucHVzaFBsb3R0ZXIoXCJwbG90XCIpO1xuXHRcdHRoaXMuZHluYW1pY0NvbG9yQ29sdW1uUGF0aCA9IHRoaXMucGxvdHRlclBhdGgucHVzaChcImR5bmFtaWNDb2xvckNvbHVtblwiKTtcblx0XHR0aGlzLmJpbm5pbmdEZWZpbml0aW9uID0gdGhpcy5keW5hbWljQ29sb3JDb2x1bW5QYXRoLnB1c2gobnVsbCwgXCJpbnRlcm5hbER5bmFtaWNDb2x1bW5cIiwgbnVsbCwgXCJiaW5uaW5nRGVmaW5pdGlvblwiLCBudWxsKTtcblx0XHR0aGlzLmJpbm5lZENvbHVtblBhdGggPSB0aGlzLmR5bmFtaWNDb2xvckNvbHVtblBhdGgucHVzaChudWxsLCBcImludGVybmFsRHluYW1pY0NvbHVtblwiLCBudWxsKTtcblx0XHR0aGlzLm1heENvbHVtbnNQYXRoID0gdGhpcy5wbG90dGVyUGF0aC5wdXNoKFwibWF4Q29sdW1uc1wiKTtcblx0XHR0aGlzLmZpbHRlcmVkS2V5U2V0ID0gdGhpcy5wbG90dGVyUGF0aC5wdXNoKFwiZmlsdGVyZWRLZXlTZXRcIik7XG5cdFx0dGhpcy5zZWxlY3Rpb25LZXlTZXQgPSB0aGlzLnRvb2xQYXRoLnB1c2goXCJzZWxlY3Rpb25LZXlTZXRcIik7XG5cdFx0dGhpcy5wcm9iZUtleVNldCA9IHRoaXMudG9vbFBhdGgucHVzaChcInByb2JlS2V5U2V0XCIpO1xuXHRcdHRoaXMuc3RhdGUgPSB7c2VsZWN0ZWQ6W10sIHByb2JlZDpbXX07XG5cdFx0dGhpcy5zZWxlY3RlZEJpbnMgPSBbXTtcblx0XHR0aGlzLnNwYW5TdHlsZSA9IHtcblx0XHRcdHRleHRBbGlnbjogXCJsZWZ0XCIsXG5cdFx0XHR2ZXJ0aWNhbEFsaWduOiBcIm1pZGRsZVwiLFxuXHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG5cdFx0XHR3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiLFxuXHRcdFx0dGV4dE92ZXJmbG93OiBcImVsbGlwc2lzXCIsXG5cdFx0XHRwYWRkaW5nOiA1LFxuXHRcdFx0dXNlclNlbGVjdDogXCJub25lXCJcblx0XHR9O1xuXHR9XG5cblx0Z2V0IHRpdGxlKCk6c3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gKHRoaXMudG9vbFBhdGguZ2V0VHlwZSgncGFuZWxUaXRsZScpID8gdGhpcy50b29sUGF0aC5nZXRTdGF0ZSgncGFuZWxUaXRsZScpIDogJycpIHx8IHRoaXMudG9vbFBhdGguZ2V0UGF0aCgpLnBvcCgpO1xuXHR9XG5cdFxuXHRnZXQgbnVtYmVyT2ZCaW5zKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5iaW5uZWRDb2x1bW5QYXRoLmdldE9iamVjdCgpLm51bWJlck9mQmlucztcblx0fVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZU1pc3NpbmdTZXNzaW9uU3RhdGVQcm9wZXJ0aWVzKG5ld1N0YXRlOmFueSlcblx0e1xuXG5cdH1cblxuXHRwcml2YXRlIHNldHVwQ2FsbGJhY2tzKClcblx0e1xuXHRcdHRoaXMuZHluYW1pY0NvbG9yQ29sdW1uUGF0aC5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLmZvcmNlVXBkYXRlKTtcblx0XHR0aGlzLm1heENvbHVtbnNQYXRoLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHRcdHRoaXMuZmlsdGVyZWRLZXlTZXQuYWRkQ2FsbGJhY2sodGhpcywgdGhpcy5mb3JjZVVwZGF0ZSk7XG5cdFx0dGhpcy5wbG90dGVyUGF0aC5wdXNoKFwic2hhcGVTaXplXCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHRcdHRoaXMucGxvdHRlclBhdGgucHVzaChcInNoYXBlVHlwZVwiKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLmZvcmNlVXBkYXRlKTtcblx0XHR0aGlzLmJpbm5lZENvbHVtblBhdGguYWRkQ2FsbGJhY2sodGhpcywgdGhpcy5mb3JjZVVwZGF0ZSk7XG5cdFx0dGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHRcdHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUpO1xuXHR9XG5cblx0Z2V0U2VsZWN0ZWRCaW5zKCk6bnVtYmVyW11cblx0e1xuXHRcdHZhciBrZXlzID0gdGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LmdldEtleXMoKTtcblx0XHR2YXIgc2VsZWN0ZWRCaW5zOm51bWJlcltdID0gW107XG5cdFx0dmFyIGJpbm5lZENvbHVtbk9iamVjdCA9IHRoaXMuYmlubmVkQ29sdW1uUGF0aC5nZXRPYmplY3QoKTtcblx0XHRrZXlzLmZvckVhY2goIChrZXk6c3RyaW5nKSA9PiB7XG5cdFx0XHRzZWxlY3RlZEJpbnMucHVzaChiaW5uZWRDb2x1bW5PYmplY3QuZ2V0VmFsdWVGcm9tS2V5KGtleSwgTnVtYmVyKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIF8udW5pcXVlKHNlbGVjdGVkQmlucyk7XG5cdH1cblxuXHRnZXRQcm9iZWRCaW5zKCk6bnVtYmVyW11cblx0e1xuXHRcdHZhciBrZXlzID0gdGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuZ2V0S2V5cygpO1xuXHRcdHZhciBwcm9iZWRCaW5zOm51bWJlcltdID0gW107XG5cdFx0dmFyIGJpbm5lZENvbHVtbk9iamVjdCA9IHRoaXMuYmlubmVkQ29sdW1uUGF0aC5nZXRPYmplY3QoKTtcblx0XHRrZXlzLmZvckVhY2goIChrZXk6c3RyaW5nKSA9PiB7XG5cdFx0XHRwcm9iZWRCaW5zLnB1c2goYmlubmVkQ29sdW1uT2JqZWN0LmdldFZhbHVlRnJvbUtleShrZXksIE51bWJlcikpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBfLnVuaXF1ZShwcm9iZWRCaW5zKTtcblx0fVxuXG5cdGhhbmRsZUNsaWNrKGJpbjpudW1iZXIsIGV2ZW50OlJlYWN0Lk1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHZhciBiaW5uZWRLZXlzOmFueVtdID0gdGhpcy5iaW5uZWRDb2x1bW5QYXRoLmdldE9iamVjdCgpLl9iaW5uZWRLZXlzQXJyYXk7XG5cdFx0Ly9zZXRLZXlzXG5cdFx0aWYgKF8uY29udGFpbnModGhpcy5zZWxlY3RlZEJpbnMsYmluKSlcblx0XHR7XG5cdFx0XHR2YXIgY3VycmVudFNlbGVjdGlvbjphbnlbXSA9IHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5nZXRLZXlzKCk7XG5cdFx0XHRjdXJyZW50U2VsZWN0aW9uID0gXy5kaWZmZXJlbmNlKGN1cnJlbnRTZWxlY3Rpb24sYmlubmVkS2V5c1tiaW5dKTtcblx0XHRcdHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5zZXRLZXlzKGN1cnJlbnRTZWxlY3Rpb24pO1xuXHRcdFx0Xy5yZW1vdmUodGhpcy5zZWxlY3RlZEJpbnMsICh2YWx1ZTpudW1iZXIpID0+e1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT0gYmluO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRpZiAoKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMudG9vbFBhdGguc2VsZWN0aW9uX2tleXNldC5hZGRLZXlzKGJpbm5lZEtleXNbYmluXSk7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRCaW5zLnB1c2goYmluKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dGhpcy50b29sUGF0aC5zZWxlY3Rpb25fa2V5c2V0LnNldEtleXMoYmlubmVkS2V5c1tiaW5dKTtcblx0XHRcdFx0dGhpcy5zZWxlY3RlZEJpbnMgPSBbYmluXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRoYW5kbGVQcm9iZShiaW46bnVtYmVyLCBtb3VzZU92ZXI6Ym9vbGVhbik6dm9pZFxuXHR7XG5cdFx0aWYgKG1vdXNlT3Zlcilcblx0XHR7XG5cdFx0XHR2YXIgYmlubmVkS2V5czphbnlbXSA9IHRoaXMuYmlubmVkQ29sdW1uUGF0aC5nZXRPYmplY3QoKS5fYmlubmVkS2V5c0FycmF5O1xuXHRcdFx0dGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhiaW5uZWRLZXlzW2Jpbl0pO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy50b29sUGF0aC5wcm9iZV9rZXlzZXQuc2V0S2V5cyhbXSk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKVxuXHR7XG5cdFx0dGhpcy5zZXR1cENhbGxiYWNrcygpO1xuXHR9XG5cblx0Z2V0SW50ZXJhY3Rpb25TdHlsZShiaW46bnVtYmVyKTpDU1NQcm9wZXJ0aWVzXG5cdHtcblx0XHR2YXIgcHJvYmVkOmJvb2xlYW4gPSB0aGlzLmdldFByb2JlZEJpbnMoKS5pbmRleE9mKGJpbikgPj0gMDtcblx0XHR2YXIgc2VsZWN0ZWQ6Ym9vbGVhbiA9IHRoaXMuZ2V0U2VsZWN0ZWRCaW5zKCkuaW5kZXhPZihiaW4pID49IDA7XG5cdFx0XG5cdFx0dmFyIGJvcmRlckFscGhhOm51bWJlcjtcblx0XHRpZiAocHJvYmVkKVxuXHRcdFx0Ym9yZGVyQWxwaGEgPSAxO1xuXHRcdGVsc2UgaWYgKHNlbGVjdGVkKVxuXHRcdFx0Ym9yZGVyQWxwaGEgPSAwLjU7XG5cdFx0ZWxzZVxuXHRcdFx0Ym9yZGVyQWxwaGEgPSAwO1xuXHRcdFxuXHRcdHJldHVybiB7XG5cdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0XHRmbGV4OiAxLjAsXG5cdFx0XHRib3JkZXJDb2xvcjogU3RhbmRhcmRMaWIucmdiYSgwLCAwLCAwLCBib3JkZXJBbHBoYSksXG5cdFx0XHRib3JkZXJTdHlsZTogXCJzb2xpZFwiLFxuXHRcdFx0Ym9yZGVyV2lkdGg6IDEsXG5cdFx0XHRwYWRkaW5nOiBcIjJweFwiLFxuXHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCJcblx0XHR9O1xuXHR9XG5cblx0cmVuZGVyKClcblx0e1xuXHRcdGlmICh0aGlzLm51bWJlck9mQmlucylcblx0XHR7XG5cdFx0XHQvL0Jpbm5lZCBwbG90IGNhc2Vcblx0XHRcdHZhciB3aWR0aDpudW1iZXIgPSB0aGlzLnByb3BzLnN0eWxlLndpZHRoO1xuXHRcdFx0dmFyIGhlaWdodDpudW1iZXIgPSB0aGlzLnByb3BzLnN0eWxlLmhlaWdodDtcblx0XHRcdHZhciBzaGFwZVNpemU6bnVtYmVyID0gdGhpcy5wbG90dGVyUGF0aC5nZXRTdGF0ZShcInNoYXBlU2l6ZVwiKTtcblx0XHRcdHZhciBzaGFwZVR5cGU6c3RyaW5nID0gdGhpcy5wbG90dGVyUGF0aC5nZXRTdGF0ZShcInNoYXBlVHlwZVwiKTtcblx0XHRcdHZhciBtYXhDb2x1bW5zOm51bWJlciA9IDE7Ly9UT0RPOiBUaGlzIHNob3VsZCByZWFsbHkgYmUgXCJ0aGlzLm1heENvbHVtbnNQYXRoLmdldFN0YXRlKCk7XCIgYnV0IG9ubHkgc3VwcG9ydGluZyAxIGNvbHVtbiBmb3Igbm93XG5cdFx0XHR2YXIgY29sdW1uRmxleDpudW1iZXIgPSAxLjAvbWF4Q29sdW1ucztcblx0XHRcdHZhciBleHRyYUJpbnM6bnVtYmVyID0gdGhpcy5udW1iZXJPZkJpbnMgJSBtYXhDb2x1bW5zID09IDAgPyAwIDogbWF4Q29sdW1ucyAtIHRoaXMubnVtYmVyT2ZCaW5zICUgbWF4Q29sdW1ucztcblx0XHRcdHZhciByYW1wOmFueVtdID0gdGhpcy5keW5hbWljQ29sb3JDb2x1bW5QYXRoLmdldFN0YXRlKG51bGwsIFwicmFtcFwiKTtcblx0XHRcdHZhciB5U2NhbGU6RnVuY3Rpb24gPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oWzAsIHRoaXMubnVtYmVyT2ZCaW5zICsgMV0pLnJhbmdlKFswLCBoZWlnaHRdKTtcblx0XHRcdHZhciB5TWFwOkZ1bmN0aW9uID0gKGQ6bnVtYmVyKTpudW1iZXIgPT4geyByZXR1cm4geVNjYWxlKGQpOyB9O1xuXG5cdFx0XHRzaGFwZVNpemUgPSBfLm1heChbMSwgXy5taW4oW3NoYXBlU2l6ZSwgaGVpZ2h0IC8gdGhpcy5udW1iZXJPZkJpbnNdKV0pO1xuXHRcdFx0dmFyIHI6bnVtYmVyID0gKHNoYXBlU2l6ZSAvIDEwMCAqIGhlaWdodCAvIHRoaXMubnVtYmVyT2ZCaW5zKSAvIDI7XG5cdFx0XHR2YXIgYmM6YW55ID0gdGhpcy5iaW5uZWRDb2x1bW5QYXRoLmdldE9iamVjdCgpO1xuXHRcdFx0dmFyIHRleHRMYWJlbEZ1bmN0aW9uOkZ1bmN0aW9uID0gYmMuZGVyaXZlU3RyaW5nRnJvbU51bWJlci5iaW5kKGJjKTtcblx0XHRcdHZhciBmaW5hbEVsZW1lbnRzOmFueVtdID0gW107XG5cdFx0XHR2YXIgcHJlZml4ZXJTdHlsZTp7fSA9IFByZWZpeGVyLnByZWZpeCh7c3R5bGVzOiB0aGlzLnNwYW5TdHlsZX0pLnN0eWxlcztcblx0XHRcdGZvciAodmFyIGo6bnVtYmVyID0gMDsgaiA8IG1heENvbHVtbnM7IGorKylcblx0XHRcdHtcblx0XHRcdFx0c3dpdGNoIChzaGFwZVR5cGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYXNlIFNIQVBFX1RZUEVfQ0lSQ0xFIDpcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2YXIgZWxlbWVudDpKU1guRWxlbWVudFtdID0gW107XG5cdFx0XHRcdFx0XHR2YXIgZWxlbWVudHM6SlNYLkVsZW1lbnRbXSA9IFtdO1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mQmlucyArIGV4dHJhQmluczsgaSsrKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpZiAoaSAlIG1heENvbHVtbnMgPT0gailcblx0XHRcdFx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGkgPCB0aGlzLm51bWJlck9mQmlucylcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRlbGVtZW50LnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDx1aS5IQm94IGtleT17aX0gc3R5bGU9e3RoaXMuZ2V0SW50ZXJhY3Rpb25TdHlsZShpKX0gb25DbGljaz17dGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMsIGkpfSBvbk1vdXNlT3Zlcj17dGhpcy5oYW5kbGVQcm9iZS5iaW5kKHRoaXMsIGksIHRydWUpfSBvbk1vdXNlT3V0PXt0aGlzLmhhbmRsZVByb2JlLmJpbmQodGhpcywgaSwgZmFsc2UpfT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDx1aS5IQm94IHN0eWxlPXt7d2lkdGg6XCIxMDAlXCIsIGZsZXg6MC4yLG1pbldpZHRoOjEwLCBwb3NpdGlvbjpcInJlbGF0aXZlXCIsIHBhZGRpbmc6XCIwcHggMHB4IDBweCAwcHhcIn19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8c3ZnIHN0eWxlPXt7cG9zaXRpb246XCJhYnNvbHV0ZVwifX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgdmlld0JveD1cIjAgMCAxMDAgMTAwXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxjaXJjbGUgY3g9XCI1MCVcIiBjeT1cIjUwJVwiIHI9XCI0NSVcIiBzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZmlsbDogXCIjXCIgKyBTdGFuZGFyZExpYi5kZWNpbWFsVG9IZXgoU3RhbmRhcmRMaWIuaW50ZXJwb2xhdGVDb2xvcihTdGFuZGFyZExpYi5ub3JtYWxpemUoaSwgMCwgdGhpcy5udW1iZXJPZkJpbnMgLSAxKSwgcmFtcCkpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3Ryb2tlOiBcImJsYWNrXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJva2VPcGFjaXR5OiAwLjVcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9fS8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDwvc3ZnPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC91aS5IQm94PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHVpLkhCb3ggc3R5bGU9e3t3aWR0aDpcIjEwMCVcIiwgZmxleDowLjgsIGFsaWduSXRlbXM6XCJjZW50ZXJcIn19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgPHNwYW4gc3R5bGU9eyBwcmVmaXhlclN0eWxlIH0+eyB0ZXh0TGFiZWxGdW5jdGlvbihpKSB9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC91aS5IQm94PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3VpLkhCb3g+XG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxlbWVudC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8dWkuSEJveCBrZXk9e2l9IHN0eWxlPXt7d2lkdGg6XCIxMDAlXCIsIGZsZXg6MS4wfX0vPlxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKHRoaXMucHJvcHMuc3R5bGUud2lkdGggPiB0aGlzLnByb3BzLnN0eWxlLmhlaWdodCAqIDIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmKHdlYXZlanMuV2VhdmVBUEkuTG9jYWxlLnJldmVyc2VMYXlvdXQpe1xuXHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnJldmVyc2UoKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGVsZW1lbnRzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0PHVpLkhCb3gga2V5PXtpfSBzdHlsZT17e3dpZHRoOlwiMTAwJVwiLCBmbGV4OiBjb2x1bW5GbGV4fX0+IHsgZWxlbWVudCB9IDwvdWkuSEJveD5cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZWxlbWVudHMucHVzaChcblx0XHRcdFx0XHRcdFx0XHQ8dWkuVkJveCBrZXk9e2l9IHN0eWxlPXt7aGVpZ2h0OlwiMTAwJVwiLCBmbGV4OiBjb2x1bW5GbGV4fX0+IHsgZWxlbWVudCB9IDwvdWkuVkJveD5cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZmluYWxFbGVtZW50c1tqXSA9IGVsZW1lbnRzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgU0hBUEVfVFlQRV9TUVVBUkUgOlxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIFNIQVBFX1RZUEVfTElORSA6XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgU0hBUEVfVFlQRV9CT1ggOlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhciBlbGVtZW50OkpTWC5FbGVtZW50W10gPSBbXTtcblx0XHRcdFx0XHRcdHZhciBlbGVtZW50czpKU1guRWxlbWVudFtdID0gW107XG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtYmVyT2ZCaW5zICsgZXh0cmFCaW5zOyBpKyspXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChpICUgbWF4Q29sdW1ucyA9PSBqKVxuXHRcdFx0XHRcdFx0XHR7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoaSA8IHRoaXMubnVtYmVyT2ZCaW5zKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQucHVzaChcblx0XHRcdFx0XHRcdFx0XHRcdFx0PHVpLkhCb3gga2V5PXtpfSBzdHlsZT17dGhpcy5nZXRJbnRlcmFjdGlvblN0eWxlKGkpfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcywgaSl9IG9uTW91c2VPdmVyPXt0aGlzLmhhbmRsZVByb2JlLmJpbmQodGhpcywgaSwgdHJ1ZSl9IG9uTW91c2VPdXQ9e3RoaXMuaGFuZGxlUHJvYmUuYmluZCh0aGlzLCBpLCBmYWxzZSl9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDx1aS5IQm94IHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aWR0aDpcIjEwMCVcIiwgZmxleDoxLjAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhbGlnbkl0ZW1zOlwiY2VudGVyXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqdXN0aWZ5Q29udGVudDpcImNlbnRlclwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBTdGFuZGFyZExpYi5oZXgycmdiYShTdGFuZGFyZExpYi5kZWNpbWFsVG9IZXgoU3RhbmRhcmRMaWIuaW50ZXJwb2xhdGVDb2xvcihTdGFuZGFyZExpYi5ub3JtYWxpemUoaSwgMCwgdGhpcy5udW1iZXJPZkJpbnMgLSAxKSwgcmFtcCkpLDAuNSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9fT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgc3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cm9rZTogXCJibGFja1wiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3Ryb2tlT3BhY2l0eTogMC41LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcIiNGRkZcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH19PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBzdHlsZT17cHJlZml4ZXJTdHlsZX0+eyB0ZXh0TGFiZWxGdW5jdGlvbihpKSB9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC91aS5IQm94PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3VpLkhCb3g+XG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWxlbWVudC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8dWkuSEJveCBrZXk9e2l9IHN0eWxlPXt7d2lkdGg6XCIxMDAlXCIsIGZsZXg6MS4wfX0vPlxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKHRoaXMucHJvcHMuc3R5bGUud2lkdGggPiB0aGlzLnByb3BzLnN0eWxlLmhlaWdodCAqIDIpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmKHdlYXZlanMuV2VhdmVBUEkuTG9jYWxlLnJldmVyc2VMYXlvdXQpe1xuXHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQgPSBlbGVtZW50LnJldmVyc2UoKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGVsZW1lbnRzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0PHVpLkhCb3gga2V5PXtpfSBzdHlsZT17e3dpZHRoOlwiMTAwJVwiLCBmbGV4OiBjb2x1bW5GbGV4LCBwYWRkaW5nOiBcIjVweFwifX0+IHsgZWxlbWVudCB9IDwvdWkuSEJveD5cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZWxlbWVudHMucHVzaChcblx0XHRcdFx0XHRcdFx0XHQ8dWkuVkJveCBrZXk9e2l9IHN0eWxlPXt7aGVpZ2h0OlwiMTAwJVwiLCBmbGV4OiBjb2x1bW5GbGV4LCBwYWRkaW5nOiBcIjVweFwifX0+IHsgZWxlbWVudCB9IDwvdWkuVkJveD5cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZmluYWxFbGVtZW50c1tqXSA9IGVsZW1lbnRzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gKDxkaXYgc3R5bGU9e3t3aWR0aDpcIjEwMCVcIiwgaGVpZ2h0OlwiMTAwJVwiLCBwYWRkaW5nOlwiMHB4IDVweCAwcHggNXB4XCJ9fT5cblx0XHRcdFx0PHVpLlZCb3ggc3R5bGU9e3toZWlnaHQ6XCIxMDAlXCIsZmxleDogMS4wLCBvdmVyZmxvdzpcImhpZGRlblwifX0+XG5cdFx0XHRcdFx0PHVpLkhCb3ggc3R5bGU9e3t3aWR0aDpcIjEwMCVcIiwgZmxleDogMC4xLCBhbGlnbkl0ZW1zOlwiY2VudGVyXCJ9fT5cblx0XHRcdFx0XHRcdDxzcGFuIHN0eWxlPXtwcmVmaXhlclN0eWxlfT57dGhpcy5keW5hbWljQ29sb3JDb2x1bW5QYXRoLmdldE9iamVjdCgpLmdldE1ldGFkYXRhKCd0aXRsZScpfTwvc3Bhbj5cblx0XHRcdFx0XHQ8L3VpLkhCb3g+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5wcm9wcy5zdHlsZS53aWR0aCA+IHRoaXMucHJvcHMuc3R5bGUuaGVpZ2h0ICogMlxuXHRcdFx0XHRcdFx0PyA8dWkuSEJveCBzdHlsZT17e3dpZHRoOlwiMTAwJVwiLCBmbGV4OiAwLjl9fT4geyBmaW5hbEVsZW1lbnRzIH0gPC91aS5IQm94PlxuXHRcdFx0XHRcdFx0OiA8dWkuVkJveCBzdHlsZT17e2hlaWdodDpcIjEwMCVcIiwgZmxleDogMC45fX0+IHsgZmluYWxFbGVtZW50cyB9IDwvdWkuVkJveD5cblx0XHRcdFx0ICAgXHR9XG5cdFx0XHRcdDwvdWkuVkJveD5cblx0XHRcdDwvZGl2Pik7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHQvL0NvbnRpbnVvdXMgcGxvdCBjYXNlXG5cdFx0XHRyZXR1cm4gKDxzdmc+PC9zdmc+KTtcblx0XHR9XG5cdH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBXZWF2ZUMzQ29sb3JMZWdlbmQ7XG5cbnJlZ2lzdGVyVG9vbEltcGxlbWVudGF0aW9uKFwid2VhdmUudmlzdWFsaXphdGlvbi50b29sczo6Q29sb3JCaW5MZWdlbmRUb29sXCIsIFdlYXZlQzNDb2xvckxlZ2VuZCk7XG4vL1dlYXZlLnJlZ2lzdGVyQ2xhc3MoXCJ3ZWF2ZWpzLnRvb2xzLkNvbG9yQmluTGVnZW5kVG9vbFwiLCBXZWF2ZUMzQ29sb3JMZWdlbmQsIFt3ZWF2ZWpzLmFwaS5jb3JlLklMaW5rYWJsZU9iamVjdFdpdGhOZXdQcm9wZXJ0aWVzXSk7XG4iXX0=
