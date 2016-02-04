"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _rcSlider = require("rc-slider");

var _rcSlider2 = _interopRequireDefault(_rcSlider);

var _reactDom = require("react-dom");

var ReactDOM = _interopRequireWildcard(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../../typings/react/react.d.ts"/>
/// <reference path="../../../typings/rc-slider/rc-slider.d.ts"/>
/// <reference path="../../../typings/react/react-dom.d.ts"/>

var RCSlider = function (_React$Component) {
    _inherits(RCSlider, _React$Component);

    function RCSlider(props) {
        _classCallCheck(this, RCSlider);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RCSlider).call(this, props));

        _this.step = 1;
        return _this;
    }

    _createClass(RCSlider, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.element = ReactDOM.findDOMNode(this);
        }
    }, {
        key: "componentWillUpdate",
        value: function componentWillUpdate() {
            if (this.props.type == RCSlider.NUMERIC && this.element && this.element.clientWidth && this.max && this.min) {
                this.step = (this.max - this.min) / this.element.clientWidth || 1;
            }
        }
    }, {
        key: "onChange",
        value: function onChange(value) {
            if (this.props.type == RCSlider.CATEGORICAL) {
                var selectedValues = [this.indexToValue[value]];
                this.props.onChange(selectedValues);
            }
            if (this.props.type == RCSlider.NUMERIC) {
                var selectedValues = [{
                    min: value[0],
                    max: value[1]
                }];
                this.props.onChange(selectedValues);
            }
            if (this.props.type == RCSlider.NUMERIC_DISCRETE) {
                var selectedValues = [{
                    min: this.indexToValue[value[0]],
                    max: this.indexToValue[value[1]]
                }];
                this.props.onChange(selectedValues);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            this.options = [];
            this.indexToValue = {};
            this.valueToIndex = {};
            this.indexToLabel = {};
            this.props.values.forEach(function (option, index) {
                _this2.options.push(index);
                _this2.indexToValue[index] = option.value;
                _this2.indexToLabel[index] = option.label;
                _this2.valueToIndex[option.value] = index;
            });
            if (this.props.type == RCSlider.CATEGORICAL) {
                return React.createElement(_rcSlider2.default, { min: 0, max: this.options.length ? this.options.length - 1 : 0, step: null, marks: this.indexToLabel, value: this.valueToIndex[this.props.selectedValues[0]], onChange: this.onChange.bind(this) });
            }
            if (this.props.type == RCSlider.NUMERIC) {
                var _ret = function () {
                    var valueToLabel = {};
                    _this2.options = _this2.props.values.map(function (option) {
                        valueToLabel[option.value] = option.label;
                        return option.value;
                    });
                    _this2.min = _this2.options.length ? Math.min.apply(null, _this2.options) : 0;
                    _this2.max = _this2.options.length ? Math.max.apply(null, _this2.options) : 0;
                    var marks = {};
                    marks[_this2.min] = valueToLabel[_this2.min];
                    marks[_this2.max] = valueToLabel[_this2.max];
                    return {
                        v: React.createElement(_rcSlider2.default, { range: true, step: _this2.step, min: _this2.min, max: _this2.max, marks: marks, value: [_this2.props.selectedValues[0]["min"], _this2.props.selectedValues[0]["max"]], onChange: _this2.onChange.bind(_this2) })
                    };
                }();

                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            }
            if (this.props.type == RCSlider.NUMERIC_DISCRETE) {
                return React.createElement(_rcSlider2.default, { range: true, min: 0, max: this.options.length ? this.options.length - 1 : 0, step: null, marks: this.indexToLabel, value: [this.valueToIndex[this.props.selectedValues[0]["min"]], this.valueToIndex[this.props.selectedValues[0]["max"]]], onChange: this.onChange.bind(this) });
            }
        }
    }]);

    return RCSlider;
}(React.Component);

exports.default = RCSlider;

RCSlider.VERTICAL = "vertical";
RCSlider.HORIZONTAL = "horizontal";
RCSlider.NUMERIC = "numeric";
RCSlider.CATEGORICAL = "categorical";
RCSlider.NUMERIC_DISCRETE = "numeric-discrete";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUkNTbGlkZXIuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjdHMvcmVhY3QtdWkvUkNTbGlkZXIvUkNTbGlkZXIudHN4Il0sIm5hbWVzIjpbIlJDU2xpZGVyIiwiUkNTbGlkZXIuY29uc3RydWN0b3IiLCJSQ1NsaWRlci5jb21wb25lbnREaWRNb3VudCIsIlJDU2xpZGVyLmNvbXBvbmVudFdpbGxVcGRhdGUiLCJSQ1NsaWRlci5vbkNoYW5nZSIsIlJDU2xpZGVyLnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBSVksQUFBSyxBQUFNLEFBQU8sQUFDdkIsQUFBTSxBQUFNLEFBQVcsQUFDdkI7Ozs7Ozs7O0lBQUssQUFBUSxBQUFNLEFBQVcsQUFXckM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUJJLHNCQUFZLEFBQWlCOzs7Z0dBQ25CLEFBQUssQUFBQyxBQUFDOztBQUNiLEFBQUksY0FBQyxBQUFJLE9BQUcsQUFBQyxBQUFDLEFBQ2xCLEFBQUMsQUFFRCxBQUFpQixFQUpiOzs7Ozs7O0FBS0EsQUFBSSxpQkFBQyxBQUFPLFVBQUcsQUFBUSxTQUFDLEFBQVcsWUFBQyxBQUFJLEFBQUMsQUFBQyxBQUM5QyxBQUFDLEFBQ0QsQUFBbUI7Ozs7O0FBQ2YsQUFBRSxnQkFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUksUUFBSSxBQUFRLFNBQUMsQUFBTyxXQUFJLEFBQUksS0FBQyxBQUFPLFdBQUksQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFXLGVBQUksQUFBSSxLQUFDLEFBQUcsT0FBSSxBQUFJLEtBQUMsQUFBRyxBQUFDO0FBQ3ZHLEFBQUkscUJBQUMsQUFBSSxPQUFHLENBQUMsQUFBSSxLQUFDLEFBQUcsTUFBRyxBQUFJLEtBQUMsQUFBRyxBQUFDLE9BQUcsQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFXLGVBQUksQUFBQyxBQUFDLEFBQ3RFLEFBQUMsQUFDTCxBQUFDLEFBRUQsQUFBUSxFQUx3RyxBQUFDOzs7OztpQ0FLeEcsQUFB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LEFBQUMsQUFDTCxBQUFDLEFBQ0wsQUFBQzs7Ozs7O0VBckhxQyxBQUFLLE1BQUMsQUFBUzs7OztBQUUxQyxTQUFRLFdBQVUsQUFBVSxBQUFDO0FBQzdCLFNBQVUsYUFBUyxBQUFZLEFBQUM7QUFFaEMsU0FBTyxVQUFVLEFBQVM7QUFDMUIsU0FBVyxjQUFVLEFBQWEsQUFBQztBQUNuQyxTQUFnQixtQkFBVSxBQUFrQixBQThHdEQiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3MvcmMtc2xpZGVyL3JjLXNsaWRlci5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QtZG9tLmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFNsaWRlciBmcm9tIFwicmMtc2xpZGVyXCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2xpZGVyUHJvcHMge1xuICAgIG1pbj86bnVtYmVyO1xuICAgIG1heD86bnVtYmVyO1xuICAgIHN0ZXA/Om51bWJlcjtcbiAgICB2YWx1ZXM/OnN0cmluZ1tdIHwgeyB2YWx1ZTogbnVtYmVyLCBsYWJlbDogc3RyaW5nIH1bXTtcbiAgICBzZWxlY3RlZFZhbHVlczpzdHJpbmdbXTtcbiAgICBvbkNoYW5nZTpGdW5jdGlvblxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSQ1NsaWRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxhbnksIGFueT4ge1xuXG4gICAgc3RhdGljIFZFUlRJQ0FMOnN0cmluZyA9IFwidmVydGljYWxcIjtcbiAgICBzdGF0aWMgSE9SSVpPTlRBTDpzdHJpbmcgPVwiaG9yaXpvbnRhbFwiO1xuXG4gICAgc3RhdGljIE5VTUVSSUM6c3RyaW5nID0gXCJudW1lcmljXCJcbiAgICBzdGF0aWMgQ0FURUdPUklDQUw6c3RyaW5nID0gXCJjYXRlZ29yaWNhbFwiO1xuICAgIHN0YXRpYyBOVU1FUklDX0RJU0NSRVRFOnN0cmluZyA9IFwibnVtZXJpYy1kaXNjcmV0ZVwiO1xuXG4gICAgcHJpdmF0ZSBvcHRpb25zOm51bWJlcltdO1xuICAgIHByaXZhdGUgaW5kZXhUb1ZhbHVlOntbaW5kZXg6bnVtYmVyXTogc3RyaW5nfTtcbiAgICBwcml2YXRlIHZhbHVlVG9JbmRleDp7W3ZhbHVlOnN0cmluZ106IG51bWJlcn07XG5cbiAgICBwcml2YXRlIGluZGV4VG9MYWJlbDp7W2luZGV4Om51bWJlcl06IHN0cmluZ307XG5cbiAgICBwcml2YXRlIG1pbjpudW1iZXI7XG4gICAgcHJpdmF0ZSBtYXg6bnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBlbGVtZW50OkVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBzdGVwOm51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOlNsaWRlclByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGVwID0gMTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgfVxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUoKSB7XG4gICAgICAgIGlmKHRoaXMucHJvcHMudHlwZSA9PSBSQ1NsaWRlci5OVU1FUklDICYmIHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQuY2xpZW50V2lkdGggJiYgdGhpcy5tYXggJiYgdGhpcy5taW4pIHtcbiAgICAgICAgICAgIHRoaXMuc3RlcCA9ICh0aGlzLm1heCAtIHRoaXMubWluKSAvIHRoaXMuZWxlbWVudC5jbGllbnRXaWR0aCB8fCAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25DaGFuZ2UodmFsdWU6bnVtYmVyfG51bWJlcltdKSB7XG4gICAgICAgIGlmKHRoaXMucHJvcHMudHlwZSA9PSBSQ1NsaWRlci5DQVRFR09SSUNBTCkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWVzOnN0cmluZ1tdID0gW3RoaXMuaW5kZXhUb1ZhbHVlW3ZhbHVlIGFzIG51bWJlcl1dO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShzZWxlY3RlZFZhbHVlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnByb3BzLnR5cGUgPT0gUkNTbGlkZXIuTlVNRVJJQykge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWVzOk9iamVjdFtdID0gW3tcbiAgICAgICAgICAgICAgICBtaW46IHZhbHVlWzBdLFxuICAgICAgICAgICAgICAgIG1heDogdmFsdWVbMV1cbiAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShzZWxlY3RlZFZhbHVlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLnByb3BzLnR5cGUgPT0gUkNTbGlkZXIuTlVNRVJJQ19ESVNDUkVURSkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWVzOk9iamVjdFtdID0gW3tcbiAgICAgICAgICAgICAgICBtaW46IHRoaXMuaW5kZXhUb1ZhbHVlW3ZhbHVlWzBdXSxcbiAgICAgICAgICAgICAgICBtYXg6IHRoaXMuaW5kZXhUb1ZhbHVlW3ZhbHVlWzFdXVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHNlbGVjdGVkVmFsdWVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgICAgIHRoaXMuaW5kZXhUb1ZhbHVlID0ge307XG4gICAgICAgIHRoaXMudmFsdWVUb0luZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW5kZXhUb0xhYmVsID0ge307XG5cbiAgICAgICAgdGhpcy5wcm9wcy52YWx1ZXMuZm9yRWFjaCgob3B0aW9uOnsgdmFsdWU6IHN0cmluZywgbGFiZWw6IHN0cmluZ30sIGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnB1c2goaW5kZXgpO1xuICAgICAgICAgICAgdGhpcy5pbmRleFRvVmFsdWVbaW5kZXhdID0gb3B0aW9uLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5pbmRleFRvTGFiZWxbaW5kZXhdID0gb3B0aW9uLmxhYmVsO1xuICAgICAgICAgICAgdGhpcy52YWx1ZVRvSW5kZXhbb3B0aW9uLnZhbHVlXSA9IGluZGV4O1xuICAgICAgICB9KTtcblxuICAgICAgICBpZih0aGlzLnByb3BzLnR5cGUgPT0gUkNTbGlkZXIuQ0FURUdPUklDQUwpIHtcbiAgICAgICAgICAgIHJldHVybiA8U2xpZGVyIG1pbj17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heD17dGhpcy5vcHRpb25zLmxlbmd0aCA/IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxIDogMH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9e251bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrcz17dGhpcy5pbmRleFRvTGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy52YWx1ZVRvSW5kZXhbdGhpcy5wcm9wcy5zZWxlY3RlZFZhbHVlc1swXV19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICAgICAgICAvPjtcblxuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5wcm9wcy50eXBlID09IFJDU2xpZGVyLk5VTUVSSUMpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZVRvTGFiZWw6e1t2YWx1ZTpudW1iZXJdOiBzdHJpbmd9ID0ge307XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzLnZhbHVlcy5tYXAoKG9wdGlvbjp7IHZhbHVlOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmd9KSA9PiB7XG4gICAgICAgICAgICAgICAgdmFsdWVUb0xhYmVsW29wdGlvbi52YWx1ZV0gPSBvcHRpb24ubGFiZWw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi52YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLm1pbiA9IHRoaXMub3B0aW9ucy5sZW5ndGggPyBNYXRoLm1pbi5hcHBseShudWxsLCB0aGlzLm9wdGlvbnMpIDogMDtcbiAgICAgICAgICAgIHRoaXMubWF4ID0gdGhpcy5vcHRpb25zLmxlbmd0aCA/IE1hdGgubWF4LmFwcGx5KG51bGwsIHRoaXMub3B0aW9ucykgOiAwO1xuXG4gICAgICAgICAgICBsZXQgbWFya3M6T2JqZWN0ID0ge307XG4gICAgICAgICAgICBtYXJrc1t0aGlzLm1pbl0gPSB2YWx1ZVRvTGFiZWxbdGhpcy5taW5dO1xuICAgICAgICAgICAgbWFya3NbdGhpcy5tYXhdID0gdmFsdWVUb0xhYmVsW3RoaXMubWF4XTtcblxuICAgICAgICAgICAgcmV0dXJuICA8U2xpZGVyIHJhbmdlPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9e3RoaXMuc3RlcH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW49e3RoaXMubWlufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heD17dGhpcy5tYXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya3M9e21hcmtzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtbdGhpcy5wcm9wcy5zZWxlY3RlZFZhbHVlc1swXVtcIm1pblwiXSwgdGhpcy5wcm9wcy5zZWxlY3RlZFZhbHVlc1swXVtcIm1heFwiXV19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2UuYmluZCh0aGlzKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMucHJvcHMudHlwZSA9PSBSQ1NsaWRlci5OVU1FUklDX0RJU0NSRVRFKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNsaWRlciByYW5nZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heD17dGhpcy5vcHRpb25zLmxlbmd0aCA/IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxIDogMH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9e251bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrcz17dGhpcy5pbmRleFRvTGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17W3RoaXMudmFsdWVUb0luZGV4W3RoaXMucHJvcHMuc2VsZWN0ZWRWYWx1ZXNbMF1bXCJtaW5cIl1dLCB0aGlzLnZhbHVlVG9JbmRleFt0aGlzLnByb3BzLnNlbGVjdGVkVmFsdWVzWzBdW1wibWF4XCJdXV19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICB9XG4gICAgfVxufVxuIl19
