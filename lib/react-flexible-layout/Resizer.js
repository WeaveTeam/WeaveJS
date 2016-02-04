"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _reactVendorPrefix = require("react-vendor-prefix");

var VendorPrefix = _interopRequireWildcard(_reactVendorPrefix);

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

var HORIZONTAL = "horizontal";
var resizerStyle = {};
resizerStyle.basic = {
    background: "#000",
    opacity: .1,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding"
};
resizerStyle.vertical = {
    height: "4px",
    cursor: "row-resize",
    width: "100%"
};
resizerStyle.horizontal = {
    width: "4px",
    cursor: "col-resize",
    height: "100%"
};

var Resizer = function (_React$Component) {
    _inherits(Resizer, _React$Component);

    function Resizer(props) {
        _classCallCheck(this, Resizer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Resizer).call(this, props));

        _this.state = {
            active: false
        };
        return _this;
    }

    _createClass(Resizer, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.element.addEventListener("mousedown", this.boundMouseDown = this.onMouseDown.bind(this));
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            this.element.removeEventListener("mousedown", this.boundMouseDown);
        }
    }, {
        key: "onMouseDown",
        value: function onMouseDown() {
            this.setState({
                active: true
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var direction = this.props.direction;
            var style = resizerStyle.basic;
            _StandardLib2.default.merge(style, resizerStyle[direction]);
            var prefixed = VendorPrefix.prefix({ styles: style });
            return React.createElement("span", { ref: function ref(elt) {
                    _this2.element = elt;
                }, style: prefixed.styles });
        }
    }]);

    return Resizer;
}(React.Component);

exports.default = Resizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzaXplci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmN0cy9yZWFjdC1mbGV4aWJsZS1sYXlvdXQvUmVzaXplci50c3giXSwibmFtZXMiOlsiUmVzaXplciIsIlJlc2l6ZXIuY29uc3RydWN0b3IiLCJSZXNpemVyLmNvbXBvbmVudERpZE1vdW50IiwiUmVzaXplci5jb21wb25lbnRXaWxsVW5tb3VudCIsIlJlc2l6ZXIub25Nb3VzZURvd24iLCJSZXNpemVyLnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUlZLEFBQVksQUFBTSxBQUFxQixBQUM1Qzs7OztJQUFLLEFBQUssQUFBTSxBQUFPLEFBRXZCLEFBQVcsQUFBTSxBQUFzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRTlDLElBQU0sQUFBVSxhQUFXLEFBQVksQUFBQztBQUV4QyxJQUFJLEFBQVksZUFBUSxBQUFFLEFBQUM7QUFFM0IsQUFBWSxhQUFDLEFBQUssUUFBRztBQUNwQixBQUFVLGdCQUFFLEFBQU07QUFDZixBQUFPLGFBQUUsQUFBRTtBQUNYLEFBQU0sWUFBRSxBQUFDO0FBQ1QsQUFBUyxlQUFFLEFBQVk7QUFDdkIsQUFBYyxvQkFBRSxBQUFTLEFBQzVCLEFBQUM7O0FBRUYsQUFBWSxhQUFDLEFBQVEsV0FBRztBQUNwQixBQUFNLFlBQUUsQUFBSztBQUNiLEFBQU0sWUFBRSxBQUFZO0FBQ3BCLEFBQUssV0FBRSxBQUFNLEFBQ2hCLEFBQUM7O0FBRUYsQUFBWSxhQUFDLEFBQVUsYUFBRztBQUN0QixBQUFLLFdBQUUsQUFBSztBQUNaLEFBQU0sWUFBRSxBQUFZO0FBQ3BCLEFBQU0sWUFBRSxBQUFNLEFBQ2pCLEFBQUMsQUFjRjs7Ozs7O0FBTUUscUJBQVksQUFBbUI7OzsrRkFDeEIsQUFBSyxBQUFDLEFBQUM7O0FBQ2IsQUFBSSxjQUFDLEFBQUssUUFBRztBQUNaLEFBQU0sb0JBQUUsQUFBSyxBQUNiLEFBQUMsQUFDSCxBQUFDLEFBRUQsQUFBaUI7VUFOaEI7Ozs7Ozs7QUFPQSxBQUFJLGlCQUFDLEFBQU8sUUFBQyxBQUFnQixpQkFBQyxBQUFXLGFBQUUsQUFBSSxLQUFDLEFBQWMsaUJBQUcsQUFBSSxLQUFDLEFBQVcsWUFBQyxBQUFJLEtBQUMsQUFBSSxBQUFDLEFBQUMsQUFBQyxBQUMvRixBQUFDLEFBRUQsQUFBb0I7Ozs7O0FBQ25CLEFBQUksaUJBQUMsQUFBTyxRQUFDLEFBQW1CLG9CQUFDLEFBQVcsYUFBRSxBQUFJLEtBQUMsQUFBYyxBQUFDLEFBQUMsQUFDcEUsQUFBQyxBQUVELEFBQVc7Ozs7O0FBQ1YsQUFBSSxpQkFBQyxBQUFRLFNBQUM7QUFDYixBQUFNLHdCQUFDLEFBQUksQUFDWCxBQUFDLEFBQUMsQUFDSixBQUFDLEFBRUQsQUFBTTs7Ozs7Ozs7QUFDTCxnQkFBSSxBQUFTLFlBQVUsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFTLEFBQUM7QUFDNUMsZ0JBQUksQUFBSyxRQUFPLEFBQVksYUFBQyxBQUFLLEFBQUM7QUFFbkMsQUFBVyxrQ0FBQyxBQUFLLE1BQUMsQUFBSyxPQUFFLEFBQVksYUFBQyxBQUFTLEFBQUMsQUFBQyxBQUFDO0FBRWxELGdCQUFJLEFBQVEsV0FBRyxBQUFZLGFBQUMsQUFBTSxPQUFDLEVBQUMsQUFBTSxRQUFFLEFBQUssQUFBQyxBQUFDLEFBQUM7QUFDcEQsQUFBTSxtQkFBQyxBQUFDLEFBQUksOEJBQUMsQUFBRyxBQUFDLGtCQUFFLEFBQVc7QUFBTyxBQUFJLDJCQUFDLEFBQU8sVUFBRyxBQUFHLEFBQUMsQUFBQyxBQUFDO2lCQUF4QyxFQUF5QyxBQUFLLEFBQUMsT0FBQyxBQUFRLFNBQUMsQUFBTSxBQUFDLEFBQUUsQUFBQyxBQUN0RixBQUFDLEFBQ0gsQUFBQzs7Ozs7RUFwQ29DLEFBQUssTUFBQyxBQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC1kb20uZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0LXZlbmRvci1wcmVmaXgvcmVhY3QtdmVuZG9yLXByZWZpeC5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBWZW5kb3JQcmVmaXggZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3RET00gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuLi91dGlscy9TdGFuZGFyZExpYlwiO1xuXG5jb25zdCBIT1JJWk9OVEFMOiBzdHJpbmcgPSBcImhvcml6b250YWxcIjtcblxudmFyIHJlc2l6ZXJTdHlsZTogYW55ID0ge307XG5cbnJlc2l6ZXJTdHlsZS5iYXNpYyA9IHtcblx0YmFja2dyb3VuZDogXCIjMDAwXCIsXG4gICAgb3BhY2l0eTogLjEsXG4gICAgekluZGV4OiAxLFxuICAgIGJveFNpemluZzogXCJib3JkZXItYm94XCIsXG4gICAgYmFja2dyb3VuZENsaXA6IFwicGFkZGluZ1wiXG59O1xuXG5yZXNpemVyU3R5bGUudmVydGljYWwgPSB7XG4gICAgaGVpZ2h0OiBcIjRweFwiLFxuICAgIGN1cnNvcjogXCJyb3ctcmVzaXplXCIsXG4gICAgd2lkdGg6IFwiMTAwJVwiXG59O1xuXG5yZXNpemVyU3R5bGUuaG9yaXpvbnRhbCA9IHtcbiAgICB3aWR0aDogXCI0cHhcIixcbiAgICBjdXJzb3I6IFwiY29sLXJlc2l6ZVwiLFxuICAgIGhlaWdodDogXCIxMDAlXCJcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlc2l6ZXJQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPFJlc2l6ZXI+IHtcblx0cmVmOiBzdHJpbmc7XG5cdGtleTogbnVtYmVyO1xuXHRkaXJlY3Rpb246IHN0cmluZztcblx0cGFuZTE6IHN0cmluZztcblx0cGFuZTI6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVzaXplclN0YXRlIHtcblx0YWN0aXZlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXplciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUmVzaXplclByb3BzLCBJUmVzaXplclN0YXRlPiB7XG5cblx0XHRwcml2YXRlIGVsZW1lbnQ6RWxlbWVudDtcblxuXHRcdHByaXZhdGUgYm91bmRNb3VzZURvd246YW55O1xuXG5cdFx0Y29uc3RydWN0b3IocHJvcHM6SVJlc2l6ZXJQcm9wcykge1xuXHRcdFx0c3VwZXIocHJvcHMpO1xuXHRcdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdFx0YWN0aXZlOiBmYWxzZVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb21wb25lbnREaWRNb3VudCAoKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLmJvdW5kTW91c2VEb3duID0gdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcblx0XHR9XG5cblx0XHRjb21wb25lbnRXaWxsVW5tb3VudCAoKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLmJvdW5kTW91c2VEb3duKTtcblx0XHR9XG5cblx0XHRvbk1vdXNlRG93biAoKSB7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0YWN0aXZlOnRydWVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJlbmRlcigpIHtcblx0XHRcdHZhciBkaXJlY3Rpb246c3RyaW5nID0gdGhpcy5wcm9wcy5kaXJlY3Rpb247XG5cdFx0XHR2YXIgc3R5bGU6YW55ID0gcmVzaXplclN0eWxlLmJhc2ljO1xuXG5cdFx0XHRTdGFuZGFyZExpYi5tZXJnZShzdHlsZSwgcmVzaXplclN0eWxlW2RpcmVjdGlvbl0pO1xuXG5cdFx0XHR2YXIgcHJlZml4ZWQgPSBWZW5kb3JQcmVmaXgucHJlZml4KHtzdHlsZXM6IHN0eWxlfSk7XG5cdFx0XHRyZXR1cm4gPHNwYW4gcmVmPXsoZWx0OkVsZW1lbnQpID0+IHsgdGhpcy5lbGVtZW50ID0gZWx0IH19IHN0eWxlPXtwcmVmaXhlZC5zdHlsZXN9Lz47XG5cdFx0fVxufVxuIl19