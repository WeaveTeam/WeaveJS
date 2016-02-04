"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getTooltipContent = getTooltipContent;

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _react = require("react");

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///<reference path="../../typings/weave/weavejs.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>

function getTooltipContent(columnNamesToValue, title, nameFormat, valueFormat, titleFormat, toolTipClass, columnNamesToColor) {
    var _this = this;

    nameFormat = nameFormat || _.identity;
    valueFormat = valueFormat || _.identity;
    titleFormat = titleFormat || _.identity;
    toolTipClass = toolTipClass || "c3-tooltip";
    var template = "";
    var columnNames = Object.keys(columnNamesToValue);
    if (columnNames.length) {
        template += "<table class='" + toolTipClass + "'>" + titleFormat(title ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
        columnNames.forEach(function (columnName) {
            template += "<tr>";
            template += "<td class='name'>";
            if (columnNamesToColor && columnNamesToColor[columnName]) {
                template += "<span style=" + "'background-color': " + _this.state.columnNamesToColor[columnName] + "/>";
            }
            template += "<div style='display':'inline'>" + nameFormat(columnName) + "</div></td>";
            template += "<td class='value'>" + valueFormat(columnNamesToValue[columnName]) + "</td>";
            template += "</tr>";
        });
        template += "</table>";
    }
    return template;
}

var ToolTip = function (_React$Component) {
    _inherits(ToolTip, _React$Component);

    function ToolTip(props) {
        _classCallCheck(this, ToolTip);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(ToolTip).call(this, props));

        _this2.nameFormat = _this2.props.nameFormat || _.identity;
        _this2.valueFormat = _this2.props.valueFormat || _.identity;
        _this2.titleFormat = _this2.props.titleFormat || _.identity;
        _this2.toolTipClass = _this2.props.toolTipClass || "c3-tooltip";
        _this2.tooltipContainerClass = _this2.props.tooltipContainerClass || "c3-tooltip-container";
        _this2.toolTipOffset = 10;
        _this2.state = {
            x: 0,
            y: 0,
            title: "",
            columnNamesToValue: {},
            columnNamesToColor: {},
            showToolTip: false
        };
        _this2.containerStyle = {
            position: "absolute",
            pointerEvents: "none",
            display: "block"
        };
        return _this2;
    }

    _createClass(ToolTip, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            //this.element = ReactDOM.findDOMNode(this);
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (this.state.showToolTip) {
                var container = this.element.parentNode;
                if (!(container.clientHeight < this.element.clientHeight)) {
                    var bottomOverflow = this.element.offsetTop + this.element.offsetHeight - container.offsetHeight;
                    if (bottomOverflow > 0) {
                        this.forceUpdate();
                    }
                }
                if (!(container.clientWidth < this.element.clientWidth)) {
                    if (weavejs.WeaveAPI.Locale.reverseLayout) {
                        //handle left overflow
                        if (this.element.offsetLeft < 0) {
                            this.forceUpdate();
                        }
                    } else {
                        var rightOverflow = this.element.offsetLeft + this.element.offsetWidth - container.offsetWidth;
                        if (rightOverflow > 0) {
                            this.forceUpdate();
                        }
                    }
                }
            }
        }
    }, {
        key: "getToolTipHtml",
        value: function getToolTipHtml() {
            return this.element.innerHTML;
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            if (!(this.element && this.state.showToolTip)) {
                return React.createElement("div", { ref: function ref(c) {
                        _this3.element = c;
                    } });
            } else {
                var style = _.clone(this.containerStyle);
                var tableRows = [];
                style.display = "block";
                var container = this.element.parentNode;
                var rect = container.getBoundingClientRect();
                var left = window.pageXOffset + rect.left;
                var top = window.pageYOffset + rect.top;
                var yPos = this.state.y - top + this.toolTipOffset;
                var xPos = this.state.x - left + this.toolTipOffset;
                var bottomOverflow = yPos + this.element.offsetHeight - container.offsetHeight;
                style.top = yPos;
                if (!(container.clientHeight < this.element.clientHeight)) {
                    if (bottomOverflow > 0) {
                        style.top = yPos - bottomOverflow;
                    } else {
                        style.top = yPos;
                    }
                }
                style.left = xPos;
                if (weavejs.WeaveAPI.Locale.reverseLayout) {
                    style.left = style.left - this.element.clientWidth - this.toolTipOffset * 2;
                    if (style.left < 0 && this.element.getBoundingClientRect().width != rect.width) {
                        style.left = 0;
                    }
                } else {
                    var rightOverflow = this.element.offsetLeft + this.element.offsetWidth - container.offsetWidth;
                    if (!(container.clientWidth < this.element.clientWidth)) {
                        if (rightOverflow > 0) {
                            style.left = xPos - rightOverflow;
                        }
                    }
                }
                var columnNames = Object.keys(this.state.columnNamesToValue);
                if (columnNames.length) {
                    tableRows = columnNames.map(function (columnName) {
                        var colorSpan = _this3.state.columnNamesToColor[columnName] ? React.createElement("span", { style: { backgroundColor: _this3.state.columnNamesToColor[columnName] } }) : null;
                        return React.createElement(
                            "tr",
                            { key: columnName },
                            React.createElement(
                                "td",
                                { className: "name" },
                                colorSpan,
                                React.createElement(
                                    "div",
                                    { style: { display: "inline" } },
                                    _this3.nameFormat(columnName)
                                )
                            ),
                            React.createElement(
                                "td",
                                { className: "value" },
                                _this3.valueFormat(_this3.state.columnNamesToValue[columnName])
                            )
                        );
                    });
                }
                return React.createElement(
                    "div",
                    { style: style, ref: function ref(c) {
                            _this3.element = c;
                        }, className: this.tooltipContainerClass },
                    React.createElement(
                        "table",
                        { className: this.toolTipClass },
                        React.createElement(
                            "tbody",
                            null,
                            React.createElement(
                                "tr",
                                null,
                                React.createElement(
                                    "th",
                                    { colSpan: 2 },
                                    this.state.title ? this.titleFormat(this.state.title) : ""
                                )
                            ),
                            tableRows
                        )
                    )
                );
            }
        }
    }]);

    return ToolTip;
}(React.Component);

exports.default = ToolTip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmN0cy90b29scy90b29sdGlwLnRzeCJdLCJuYW1lcyI6WyJnZXRUb29sdGlwQ29udGVudCIsIlRvb2xUaXAiLCJUb29sVGlwLmNvbnN0cnVjdG9yIiwiVG9vbFRpcC5jb21wb25lbnREaWRNb3VudCIsIlRvb2xUaXAuY29tcG9uZW50RGlkVXBkYXRlIiwiVG9vbFRpcC5nZXRUb29sVGlwSHRtbCIsIlRvb2xUaXAucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUlZLEFBQUMsQUFBTSxBQUFRLEFBQ3BCOzs7O0lBQUssQUFBSyxBQUFNLEFBQU8sQUFHOUI7Ozs7Ozs7Ozs7OzsyQkFDb0MsQUFBdUQsb0JBQ3ZELEFBQWEsT0FDYixBQUFvQixZQUNwQixBQUFxQixhQUNyQixBQUFxQixhQUNyQixBQUFvQixjQUNwQixBQUFpRDs7O0FBR2pGLEFBQVUsaUJBQUcsQUFBVSxjQUFJLEFBQUMsRUFBQyxBQUFRLEFBQUM7QUFDdEMsQUFBVyxrQkFBRyxBQUFXLGVBQUksQUFBQyxFQUFDLEFBQVEsQUFBQztBQUN4QyxBQUFXLGtCQUFHLEFBQVcsZUFBSSxBQUFDLEVBQUMsQUFBUSxBQUFDO0FBQ3hDLEFBQVksbUJBQUcsQUFBWSxnQkFBSSxBQUFZLEFBQUM7QUFFNUMsUUFBSSxBQUFRLFdBQVUsQUFBRSxBQUFDO0FBRXpCLFFBQUksQUFBVyxjQUFZLEFBQU0sT0FBQyxBQUFJLEtBQUMsQUFBa0IsQUFBQyxBQUFDO0FBQzNELEFBQUUsUUFBQyxBQUFXLFlBQUMsQUFBTSxBQUFDO0FBQ2xCLEFBQVEsb0JBQUksQUFBZ0IsbUJBQUcsQUFBWSxlQUFHLEFBQUksT0FBSSxBQUFXLEFBQUMsWUFBQyxBQUFLLFFBQUcsQUFBc0IseUJBQUcsQUFBSyxRQUFHLEFBQVksZUFBRyxBQUFFLEFBQUMsQUFBQztBQUUvSCxBQUFXLG9CQUFDLEFBQU8sa0JBQUUsQUFBaUI7QUFDbEMsQUFBUSx3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QUFFOztzQ0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFDLEFBQUMsQUFBQztvQ0FBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBVyxZQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBSyxBQUFDLFNBQUUsQUFBRSxBQUFDLEFBQUUsQUFBRSxBQUFDLEFBQUUsQUFBRSxBQUFDLEFBRTdGOzs7NEJBQ0ksQUFBUyxBQUVqQixBQUFFLEFBQUssQUFDWCxBQUFFLEFBQUssQUFDUCxBQUFFLEFBQUcsQUFBQyxBQUNULEFBQ0wsQUFBQyxBQUNMLEFBQUMsQUFFTCxBQUFDOztxQkFoQmUsQUFBQyxBQUFHO2tCQXBETCxBQUFDOzs7Ozs7RUExRXFCLEFBQUssTUFBQyxBQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9vbHRpcENvbnRlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvVmFsdWU6e1tjb2x1bW5OYW1lOnN0cmluZ106IHN0cmluZ3xudW1iZXJ9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU/OnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVGb3JtYXQ/OkZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXQ/OkZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVGb3JtYXQ/OkZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFRpcENsYXNzPzpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OYW1lc1RvQ29sb3I/OntbY29sdW1uTmFtZTpzdHJpbmddOiBzdHJpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6c3RyaW5nXG57XG4gICAgbmFtZUZvcm1hdCA9IG5hbWVGb3JtYXQgfHwgXy5pZGVudGl0eTtcbiAgICB2YWx1ZUZvcm1hdCA9IHZhbHVlRm9ybWF0IHx8IF8uaWRlbnRpdHk7XG4gICAgdGl0bGVGb3JtYXQgPSB0aXRsZUZvcm1hdCB8fCBfLmlkZW50aXR5O1xuICAgIHRvb2xUaXBDbGFzcyA9IHRvb2xUaXBDbGFzcyB8fCBcImMzLXRvb2x0aXBcIjtcblxuICAgIHZhciB0ZW1wbGF0ZTpzdHJpbmcgPSBcIlwiO1xuXG4gICAgdmFyIGNvbHVtbk5hbWVzOnN0cmluZ1tdID0gT2JqZWN0LmtleXMoY29sdW1uTmFtZXNUb1ZhbHVlKTtcbiAgICBpZihjb2x1bW5OYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgdGVtcGxhdGUgKz0gXCI8dGFibGUgY2xhc3M9J1wiICsgdG9vbFRpcENsYXNzICsgXCInPlwiICsgIHRpdGxlRm9ybWF0KCh0aXRsZSA/IFwiPHRyPjx0aCBjb2xzcGFuPScyJz5cIiArIHRpdGxlICsgXCI8L3RoPjwvdHI+XCIgOiBcIlwiKSlcblxuICAgICAgICBjb2x1bW5OYW1lcy5mb3JFYWNoKChjb2x1bW5OYW1lOnN0cmluZykgPT4ge1xuICAgICAgICAgICAgdGVtcGxhdGUgKz0gXCI8dHI+XCI7XG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBcIjx0ZCBjbGFzcz0nbmFtZSc+XCI7XG4gICAgICAgICAgICBpZihjb2x1bW5OYW1lc1RvQ29sb3IgJiYgY29sdW1uTmFtZXNUb0NvbG9yW2NvbHVtbk5hbWVdKXtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSArPSBcIjxzcGFuIHN0eWxlPVwiICsgXCInYmFja2dyb3VuZC1jb2xvcic6IFwiICsgdGhpcy5zdGF0ZS5jb2x1bW5OYW1lc1RvQ29sb3JbY29sdW1uTmFtZV0gKyBcIi8+XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZW1wbGF0ZSArPSBcIjxkaXYgc3R5bGU9J2Rpc3BsYXknOidpbmxpbmUnPlwiICsgbmFtZUZvcm1hdChjb2x1bW5OYW1lKSArIFwiPC9kaXY+PC90ZD5cIjtcbiAgICAgICAgICAgIHRlbXBsYXRlICs9IFwiPHRkIGNsYXNzPSd2YWx1ZSc+XCIgKyB2YWx1ZUZvcm1hdChjb2x1bW5OYW1lc1RvVmFsdWVbY29sdW1uTmFtZV0pICsgXCI8L3RkPlwiO1xuICAgICAgICAgICAgdGVtcGxhdGUgKz0gXCI8L3RyPlwiO1xuICAgICAgICB9KTtcbiAgICAgICAgdGVtcGxhdGUgKz0gXCI8L3RhYmxlPlwiO1xuICAgIH1cblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVG9vbFRpcFByb3BzIGV4dGVuZHMgUmVhY3QuUHJvcHM8VG9vbFRpcD57XG4gICAgdG9vbFRpcENsYXNzPzpzdHJpbmc7XG4gICAgdG9vbHRpcENvbnRhaW5lckNsYXNzPzpzdHJpbmc7XG4gICAgbmFtZUZvcm1hdD86RnVuY3Rpb247XG4gICAgdmFsdWVGb3JtYXQ/OkZ1bmN0aW9uO1xuICAgIHRpdGxlRm9ybWF0PzpGdW5jdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVG9vbFRpcFN0YXRlIHtcbiAgICB4PzpudW1iZXI7XG4gICAgeT86bnVtYmVyO1xuICAgIHRpdGxlPzpzdHJpbmc7XG4gICAgY29sdW1uTmFtZXNUb1ZhbHVlPzp7W2NvbHVtbk5hbWU6c3RyaW5nXTogc3RyaW5nfG51bWJlcn07XG4gICAgY29sdW1uTmFtZXNUb0NvbG9yPzp7W2NvbHVtbk5hbWU6c3RyaW5nXTogc3RyaW5nfTtcbiAgICBzaG93VG9vbFRpcD86Ym9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9vbFRpcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJVG9vbFRpcFByb3BzLCBJVG9vbFRpcFN0YXRlPiB7XG5cbiAgICBwcml2YXRlIG5hbWVGb3JtYXQ6RnVuY3Rpb247XG4gICAgcHJpdmF0ZSB2YWx1ZUZvcm1hdDpGdW5jdGlvbjtcbiAgICBwcml2YXRlIHRpdGxlRm9ybWF0OkZ1bmN0aW9uO1xuICAgIHByaXZhdGUgdG9vbFRpcENsYXNzOnN0cmluZztcbiAgICBwcml2YXRlIHRvb2x0aXBDb250YWluZXJDbGFzczpzdHJpbmc7XG4gICAgcHJpdmF0ZSB0b29sVGlwT2Zmc2V0Om51bWJlcjtcbiAgICBwcml2YXRlIGNvbnRhaW5lclN0eWxlOlJlYWN0LkNTU1Byb3BlcnRpZXM7XG4gICAgcHJpdmF0ZSBlbGVtZW50OkhUTUxFbGVtZW50O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6SVRvb2xUaXBQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5uYW1lRm9ybWF0ID0gdGhpcy5wcm9wcy5uYW1lRm9ybWF0IHx8IF8uaWRlbnRpdHk7XG4gICAgICAgIHRoaXMudmFsdWVGb3JtYXQgPSB0aGlzLnByb3BzLnZhbHVlRm9ybWF0IHx8IF8uaWRlbnRpdHk7XG4gICAgICAgIHRoaXMudGl0bGVGb3JtYXQgPSB0aGlzLnByb3BzLnRpdGxlRm9ybWF0IHx8IF8uaWRlbnRpdHk7XG4gICAgICAgIHRoaXMudG9vbFRpcENsYXNzID0gdGhpcy5wcm9wcy50b29sVGlwQ2xhc3MgfHwgXCJjMy10b29sdGlwXCI7XG4gICAgICAgIHRoaXMudG9vbHRpcENvbnRhaW5lckNsYXNzID0gdGhpcy5wcm9wcy50b29sdGlwQ29udGFpbmVyQ2xhc3MgfHwgXCJjMy10b29sdGlwLWNvbnRhaW5lclwiO1xuICAgICAgICB0aGlzLnRvb2xUaXBPZmZzZXQgPSAxMDtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB0aXRsZTogXCJcIixcbiAgICAgICAgICAgIGNvbHVtbk5hbWVzVG9WYWx1ZToge30sXG4gICAgICAgICAgICBjb2x1bW5OYW1lc1RvQ29sb3I6IHt9LFxuICAgICAgICAgICAgc2hvd1Rvb2xUaXA6IGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbnRhaW5lclN0eWxlID0ge1xuICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIHBvaW50ZXJFdmVudHM6IFwibm9uZVwiLFxuICAgICAgICAgICAgZGlzcGxheTogXCJibG9ja1wiLFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIC8vdGhpcy5lbGVtZW50ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICBpZih0aGlzLnN0YXRlLnNob3dUb29sVGlwKSB7XG4gICAgICAgICAgICB2YXIgY29udGFpbmVyOkhUTUxFbGVtZW50ID0gdGhpcy5lbGVtZW50LnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoIShjb250YWluZXIuY2xpZW50SGVpZ2h0IDwgdGhpcy5lbGVtZW50LmNsaWVudEhlaWdodCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgYm90dG9tT3ZlcmZsb3c6bnVtYmVyID0gdGhpcy5lbGVtZW50Lm9mZnNldFRvcCArIHRoaXMuZWxlbWVudC5vZmZzZXRIZWlnaHQgLSBjb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgIGlmIChib3R0b21PdmVyZmxvdyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKCEoY29udGFpbmVyLmNsaWVudFdpZHRoIDwgdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoKSl7XG4gICAgICAgICAgICAgICAgaWYod2VhdmVqcy5XZWF2ZUFQSS5Mb2NhbGUucmV2ZXJzZUxheW91dCl7XG4gICAgICAgICAgICAgICAgICAgIC8vaGFuZGxlIGxlZnQgb3ZlcmZsb3dcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5lbGVtZW50Lm9mZnNldExlZnQgPCAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByaWdodE92ZXJmbG93Om51bWJlciA9IHRoaXMuZWxlbWVudC5vZmZzZXRMZWZ0ICsgdGhpcy5lbGVtZW50Lm9mZnNldFdpZHRoIC0gY29udGFpbmVyLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBpZihyaWdodE92ZXJmbG93ID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRUb29sVGlwSHRtbCgpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MO1xuICAgIH1cblxuICAgIHJlbmRlcigpOkpTWC5FbGVtZW50IHtcblxuICAgICAgICBpZighKHRoaXMuZWxlbWVudCAmJiB0aGlzLnN0YXRlLnNob3dUb29sVGlwKSkge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsoYzpIVE1MRWxlbWVudCkgPT4geyB0aGlzLmVsZW1lbnQgPSBjIH19PjwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBzdHlsZTpSZWFjdC5DU1NQcm9wZXJ0aWVzID0gXy5jbG9uZSh0aGlzLmNvbnRhaW5lclN0eWxlKTtcbiAgICAgICAgICAgIHZhciB0YWJsZVJvd3M6SlNYLkVsZW1lbnRbXSA9IFtdO1xuICAgICAgICAgICAgc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lcjpIVE1MRWxlbWVudCA9IHRoaXMuZWxlbWVudC5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgdmFyIHJlY3Q6Q2xpZW50UmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHZhciBsZWZ0OiBudW1iZXIgPSB3aW5kb3cucGFnZVhPZmZzZXQgKyByZWN0LmxlZnQ7XG4gICAgICAgICAgICB2YXIgdG9wOiBudW1iZXIgPSB3aW5kb3cucGFnZVlPZmZzZXQgKyByZWN0LnRvcDtcblxuICAgICAgICAgICAgdmFyIHlQb3M6bnVtYmVyID0gdGhpcy5zdGF0ZS55IC0gdG9wICsgdGhpcy50b29sVGlwT2Zmc2V0O1xuICAgICAgICAgICAgdmFyIHhQb3M6bnVtYmVyID0gdGhpcy5zdGF0ZS54IC0gbGVmdCArIHRoaXMudG9vbFRpcE9mZnNldDtcblxuICAgICAgICAgICAgdmFyIGJvdHRvbU92ZXJmbG93Om51bWJlciA9IHlQb3MgKyB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gY29udGFpbmVyLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIHN0eWxlLnRvcCA9IHlQb3M7XG4gICAgICAgICAgICBpZighKGNvbnRhaW5lci5jbGllbnRIZWlnaHQgPCB0aGlzLmVsZW1lbnQuY2xpZW50SGVpZ2h0KSkge1xuICAgICAgICAgICAgICAgIGlmKGJvdHRvbU92ZXJmbG93ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZS50b3AgPSAgeVBvcyAtIGJvdHRvbU92ZXJmbG93O1xuICAgICAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUudG9wID0geVBvcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0eWxlLmxlZnQgPSB4UG9zO1xuICAgICAgICAgICAgaWYod2VhdmVqcy5XZWF2ZUFQSS5Mb2NhbGUucmV2ZXJzZUxheW91dCkge1xuICAgICAgICAgICAgICAgIHN0eWxlLmxlZnQgPSBzdHlsZS5sZWZ0IC0gdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoIC0gdGhpcy50b29sVGlwT2Zmc2V0KjI7XG4gICAgICAgICAgICAgICAgaWYoc3R5bGUubGVmdCA8IDAgJiYgKHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCAhPSByZWN0LndpZHRoKSl7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmxlZnQgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJpZ2h0T3ZlcmZsb3c6bnVtYmVyID0gdGhpcy5lbGVtZW50Lm9mZnNldExlZnQgKyB0aGlzLmVsZW1lbnQub2Zmc2V0V2lkdGggLSBjb250YWluZXIub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICAgICAgaWYoIShjb250YWluZXIuY2xpZW50V2lkdGggPCB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGgpKXtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJpZ2h0T3ZlcmZsb3cgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZS5sZWZ0ID0geFBvcyAtIHJpZ2h0T3ZlcmZsb3c7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb2x1bW5OYW1lczpzdHJpbmdbXSA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuY29sdW1uTmFtZXNUb1ZhbHVlKTtcbiAgICAgICAgICAgIGlmKGNvbHVtbk5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRhYmxlUm93cyA9IGNvbHVtbk5hbWVzLm1hcCgoY29sdW1uTmFtZTpzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yU3BhbjpKU1guRWxlbWVudCA9IHRoaXMuc3RhdGUuY29sdW1uTmFtZXNUb0NvbG9yW2NvbHVtbk5hbWVdID8gKDxzcGFuIHN0eWxlPXt7YmFja2dyb3VuZENvbG9yOiB0aGlzLnN0YXRlLmNvbHVtbk5hbWVzVG9Db2xvcltjb2x1bW5OYW1lXX19Lz4pIDogKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17Y29sdW1uTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwibmFtZVwiPntjb2xvclNwYW59PGRpdiBzdHlsZT17e2Rpc3BsYXk6XCJpbmxpbmVcIn19Pnt0aGlzLm5hbWVGb3JtYXQoY29sdW1uTmFtZSl9PC9kaXY+PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJ2YWx1ZVwiPnt0aGlzLnZhbHVlRm9ybWF0KHRoaXMuc3RhdGUuY29sdW1uTmFtZXNUb1ZhbHVlW2NvbHVtbk5hbWVdKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3N0eWxlfSByZWY9eyhjOkhUTUxFbGVtZW50KSA9PiB7IHRoaXMuZWxlbWVudCA9IGMgfX0gY2xhc3NOYW1lPXt0aGlzLnRvb2x0aXBDb250YWluZXJDbGFzc30+XG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT17dGhpcy50b29sVGlwQ2xhc3N9PlxuICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPjx0aCBjb2xTcGFuPXsyfT57dGhpcy5zdGF0ZS50aXRsZSA/IHRoaXMudGl0bGVGb3JtYXQodGhpcy5zdGF0ZS50aXRsZSk6IFwiXCJ9PC90aD48L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlUm93c1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiJdfQ==