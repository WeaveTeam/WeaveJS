"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _reactVendorPrefix = require("react-vendor-prefix");

var Prefixer = _interopRequireWildcard(_reactVendorPrefix);

var _HBox = require("../HBox");

var _HBox2 = _interopRequireDefault(_HBox);

var _VBox = require("../VBox");

var _VBox2 = _interopRequireDefault(_VBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

var Slider = function (_React$Component) {
    _inherits(Slider, _React$Component);

    function Slider(props) {
        _classCallCheck(this, Slider);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Slider).call(this, props));

        _this.state = {
            value: _this.props.value
        };
        return _this;
    }

    _createClass(Slider, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.setState({
                value: nextProps.value
            });
        }
    }, {
        key: "onChange",
        value: function onChange(event) {
            this.setState({
                value: event.target["value"]
            });
            if (this.props.onChange) this.props.onChange(event);
        }
    }, {
        key: "render",
        value: function render() {
            var sliderStyle = _.clone(this.props.style) || {};
            var otherProps = {};
            for (var key in this.props) {
                if (key !== "style") {
                    otherProps[key] = this.props[key];
                }
            }
            if (this.props.direction == Slider.VERTICAL) {
                sliderStyle.writingMode = "bt-lr";
                sliderStyle.appearance = "slider-vertical";
            }
            sliderStyle = Prefixer.prefix({ styles: sliderStyle }).styles;
            var sliderContent = [React.createElement(
                "span",
                { key: "span" },
                this.props.label
            ), React.createElement("input", { key: "slider", type: "range", min: this.props.min, max: this.props.max, value: String(this.state.value), step: this.props.step, style: sliderStyle, onChange: this.onChange.bind(this) })];
            if (this.props.direction == Slider.VERTICAL) {
                return React.createElement(
                    _HBox2.default,
                    _extends({ style: {
                            width: this.props.style ? this.props.style.width : null,
                            height: this.props.style ? this.props.style.height : null
                        } }, otherProps),
                    sliderContent
                );
            } else {
                return React.createElement(
                    _VBox2.default,
                    _extends({ style: {
                            width: this.props.style ? this.props.style.width : null,
                            height: this.props.style ? this.props.style.height : null
                        } }, otherProps),
                    sliderContent
                );
            }
        }
    }]);

    return Slider;
}(React.Component);

exports.default = Slider;

Slider.VERTICAL = "vertical";
Slider.HORIZONTAL = "horizontal";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xpZGVyLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyY3RzL3JlYWN0LXVpL1NsaWRlci9TbGlkZXIudHN4Il0sIm5hbWVzIjpbIlNsaWRlciIsIlNsaWRlci5jb25zdHJ1Y3RvciIsIlNsaWRlci5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwiU2xpZGVyLm9uQ2hhbmdlIiwiU2xpZGVyLnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBSVksQUFBSyxBQUFNLEFBQU8sQUFDdkI7Ozs7SUFBSyxBQUFDLEFBQU0sQUFBUSxBQUNwQjs7OztJQUFLLEFBQVEsQUFBTSxBQUFxQixBQUN4QyxBQUFJLEFBQU0sQUFBUyxBQUNuQixBQUFJLEFBQU0sQUFBUyxBQWlCMUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSSxvQkFBWSxBQUFpQjs7OzhGQUNuQixBQUFLLEFBQUMsQUFBQzs7QUFDYixBQUFJLGNBQUMsQUFBSyxRQUFHO0FBQ1QsQUFBSyxtQkFBRSxBQUFJLE1BQUMsQUFBSyxNQUFDLEFBQUssQUFDMUIsQUFBQyxBQUNOLEFBQUMsQUFFRCxBQUF5QjtVQU5yQjs7Ozs7O2tEQU1zQixBQUFxQjtBQUMzQyxBQUFJLGlCQUFDLEFBQVEsU0FBQztBQUNWLEFBQUssdUJBQUUsQUFBUyxVQUFDLEFBQUssQUFDekIsQUFBQyxBQUFDLEFBQ1AsQUFBQyxBQUVELEFBQVE7Ozs7O2lDQUFDLEFBQXFCO0FBQzFCLEFBQUksaUJBQUMsQUFBUSxTQUFDO0FBQ1YsQUFBSyx1QkFBRSxBQUFLLE1BQUMsQUFBTSxPQUFDLEFBQU8sQUFBQyxBQUMvQixBQUFDLEFBQUM7O0FBQ0gsQUFBRSxnQkFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVEsQUFBQyxVQUNuQixBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVEsU0FBQyxBQUFLLEFBQUMsQUFBQyxBQUNuQyxBQUFDLEFBS0QsQUFBTTs7Ozs7QUFDRixnQkFBSSxBQUFXLGNBQXVCLEFB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OztFQTlEb0IsQUFBSyxNQUFDLEFBQVM7Ozs7QUF1QnhDLE9BQVEsV0FBVSxBQUFVLEFBQUM7QUFDN0IsT0FBVSxhQUFTLEFBQVksQUFrRHpDIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi90eXBpbmdzL3JlYWN0LXZlbmRvci1wcmVmaXgvcmVhY3QtdmVuZG9yLXByZWZpeC5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgUHJlZml4ZXIgZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcbmltcG9ydCBIQm94IGZyb20gXCIuLi9IQm94XCI7XG5pbXBvcnQgVkJveCBmcm9tIFwiLi4vVkJveFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNsaWRlclByb3BzIGV4dGVuZHMgUmVhY3QuUHJvcHM8U2xpZGVyPiB7XG4gICAgbWluOm51bWJlcjtcbiAgICBtYXg6bnVtYmVyO1xuICAgIHN0ZXA6bnVtYmVyO1xuICAgIHZhbHVlOm51bWJlcjtcbiAgICBkaXJlY3Rpb246c3RyaW5nO1xuICAgIG9uQ2hhbmdlPzpSZWFjdC5FdmVudEhhbmRsZXI8UmVhY3QuRm9ybUV2ZW50PjtcbiAgICBzdHlsZT86UmVhY3QuQ1NTUHJvcGVydGllcztcbiAgICBsYWJlbD86c3RyaW5nO1xufVxuXG5pbnRlcmZhY2Ugc2xpZGVyU3RhdGUge1xuICAgIHZhbHVlOm51bWJlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2xpZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFNsaWRlclByb3BzLCBzbGlkZXJTdGF0ZT4ge1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6U2xpZGVyUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMucHJvcHMudmFsdWVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczpTbGlkZXJQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZhbHVlOiBuZXh0UHJvcHMudmFsdWVcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoZXZlbnQ6UmVhY3QuRm9ybUV2ZW50KSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldFtcInZhbHVlXCJdXG4gICAgICAgIH0pO1xuICAgICAgICBpZih0aGlzLnByb3BzLm9uQ2hhbmdlKVxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIFZFUlRJQ0FMOnN0cmluZyA9IFwidmVydGljYWxcIjtcbiAgICBzdGF0aWMgSE9SSVpPTlRBTDpzdHJpbmcgPVwiaG9yaXpvbnRhbFwiO1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgc2xpZGVyU3R5bGU6UmVhY3QuQ1NTUHJvcGVydGllcyA9IF8uY2xvbmUodGhpcy5wcm9wcy5zdHlsZSkgfHwge307XG5cbiAgICAgICAgdmFyIG90aGVyUHJvcHM6YW55ID0ge307XG5cbiAgICAgICAgZm9yKHZhciBrZXkgaW4gdGhpcy5wcm9wcykge1xuICAgICAgICAgICAgaWYoa2V5ICE9PSBcInN0eWxlXCIpIHtcbiAgICAgICAgICAgICAgICBvdGhlclByb3BzW2tleV0gPSB0aGlzLnByb3BzW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnByb3BzLmRpcmVjdGlvbiA9PSBTbGlkZXIuVkVSVElDQUwpIHtcbiAgICAgICAgICAgIHNsaWRlclN0eWxlLndyaXRpbmdNb2RlID0gXCJidC1sclwiO1xuICAgICAgICAgICAgc2xpZGVyU3R5bGUuYXBwZWFyYW5jZSA9IFwic2xpZGVyLXZlcnRpY2FsXCI7XG4gICAgICAgIH1cblxuICAgICAgICBzbGlkZXJTdHlsZSA9IFByZWZpeGVyLnByZWZpeCh7c3R5bGVzOiBzbGlkZXJTdHlsZX0pLnN0eWxlcztcblxuICAgICAgICB2YXIgc2xpZGVyQ29udGVudDpKU1guRWxlbWVudFtdID0gWzxzcGFuIGtleT1cInNwYW5cIj57dGhpcy5wcm9wcy5sYWJlbH08L3NwYW4+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBrZXk9XCJzbGlkZXJcIiB0eXBlPVwicmFuZ2VcIiBtaW49e3RoaXMucHJvcHMubWlufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heD17dGhpcy5wcm9wcy5tYXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e1N0cmluZyh0aGlzLnN0YXRlLnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwPXt0aGlzLnByb3BzLnN0ZXB9IHN0eWxlPXtzbGlkZXJTdHlsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpfS8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG5cbiAgICAgICAgaWYodGhpcy5wcm9wcy5kaXJlY3Rpb24gPT0gU2xpZGVyLlZFUlRJQ0FMKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxIQm94IHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5wcm9wcy5zdHlsZSA/IHRoaXMucHJvcHMuc3R5bGUud2lkdGggOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLnN0eWxlID8gdGhpcy5wcm9wcy5zdHlsZS5oZWlnaHQgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5vdGhlclByb3BzfT5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlckNvbnRlbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L0hCb3g+KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoPFZCb3ggc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0aGlzLnByb3BzLnN0eWxlID8gdGhpcy5wcm9wcy5zdHlsZS53aWR0aCA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuc3R5bGUgPyB0aGlzLnByb3BzLnN0eWxlLmhlaWdodCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgey4uLm90aGVyUHJvcHN9PlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVyQ29udGVudFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvVkJveD4pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19