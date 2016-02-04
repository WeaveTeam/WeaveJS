"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactVendorPrefix = require("react-vendor-prefix");

var VendorPrefix = _interopRequireWildcard(_reactVendorPrefix);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>

var HORIZONTAL = "horizontal";
var mouseevents = ["mouseover", "mouseout", "mouseleave"];
var resizerStyle = {};
resizerStyle.basic = {
    background: "#000",
    opacity: .3,
    zIndex: 1,
    boxSizing: "border-box",
    backgroundClip: "padding",
    position: "absolute"
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
;

var ResizerOverlay = function (_React$Component) {
    _inherits(ResizerOverlay, _React$Component);

    function ResizerOverlay(props) {
        _classCallCheck(this, ResizerOverlay);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ResizerOverlay).call(this, props));

        _this.state = {
            active: false,
            range: [],
            x: NaN,
            y: NaN
        };
        return _this;
    }

    _createClass(ResizerOverlay, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            document.addEventListener("mousemove", this._onMouseMove = this.onMouseMove.bind(this), true);
            mouseevents.forEach(function (mouseevent) {
                return document.addEventListener(mouseevent, _this2._stopEventPropagation = _this2.stopEventPropagation.bind(_this2), true);
            });
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            var _this3 = this;

            document.removeEventListener("mousemove", this._onMouseMove);
            mouseevents.forEach(function (mouseevent) {
                return document.removeEventListener(mouseevent, _this3._stopEventPropagation);
            });
        }
    }, {
        key: "stopEventPropagation",
        value: function stopEventPropagation(event) {
            if (this.state.active) {
                event.stopImmediatePropagation();
            }
        }
    }, {
        key: "onMouseMove",
        value: function onMouseMove(event) {
            if (this.state.active) {
                event.stopImmediatePropagation();
                var container = this.element.parentNode;
                var rect = container.getBoundingClientRect();
                var left = window.pageXOffset + rect.left;
                var top = window.pageYOffset + rect.top;
                var mousePos = this.props.direction === HORIZONTAL ? event.pageX : event.pageY;
                mousePos = Math.max(this.state.range[0], Math.min(mousePos, this.state.range[1]));
                if (this.props.direction === HORIZONTAL) {
                    this.setState({
                        x: mousePos - left,
                        y: NaN
                    });
                } else {
                    this.setState({
                        x: NaN,
                        y: mousePos - top
                    });
                }
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

            var direction = this.props.direction;
            var style = {};
            _StandardLib2.default.merge(style, resizerStyle.basic);
            _StandardLib2.default.merge(style, resizerStyle[direction]);
            if (this.state.active) {
                style.visibility = "visible";
                style.left = !isNaN(this.state.x) ? this.state.x : undefined;
                style.top = !isNaN(this.state.y) ? this.state.y : undefined;
            } else {
                style.visibility = "hidden";
            }
            style = VendorPrefix.prefix({ styles: style }).styles;
            return React.createElement("span", { ref: function ref(elt) {
                    _this4.element = elt;
                }, style: style });
        }
    }]);

    return ResizerOverlay;
}(React.Component);

exports.default = ResizerOverlay;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzaXplck92ZXJsYXkuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvcmVhY3QtZmxleGlibGUtbGF5b3V0L1Jlc2l6ZXJPdmVybGF5LnRzeCJdLCJuYW1lcyI6WyJSZXNpemVyT3ZlcmxheSIsIlJlc2l6ZXJPdmVybGF5LmNvbnN0cnVjdG9yIiwiUmVzaXplck92ZXJsYXkuY29tcG9uZW50RGlkTW91bnQiLCJSZXNpemVyT3ZlcmxheS5jb21wb25lbnRXaWxsVW5tb3VudCIsIlJlc2l6ZXJPdmVybGF5LnN0b3BFdmVudFByb3BhZ2F0aW9uIiwiUmVzaXplck92ZXJsYXkub25Nb3VzZU1vdmUiLCJSZXNpemVyT3ZlcmxheS5yZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFJWSxBQUFLLEFBQU0sQUFBTyxBQUV2Qjs7OztJQUFLLEFBQVksQUFBTSxBQUFxQixBQUM1QyxBQUFXLEFBQU0sQUFBc0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUM5QyxJQUFNLEFBQVUsYUFBVyxBQUFZLEFBQUM7QUFFeEMsSUFBTSxBQUFXLGNBQVksQ0FBQyxBQUFXLGFBQUUsQUFBVSxZQUFFLEFBQVksQUFBQyxBQUFDO0FBRXJFLElBQUksQUFBWSxlQUFPLEFBQUUsQUFBQztBQUUxQixBQUFZLGFBQUMsQUFBSyxRQUFHO0FBQ2pCLEFBQVUsZ0JBQUUsQUFBTTtBQUNsQixBQUFPLGFBQUUsQUFBRTtBQUNYLEFBQU0sWUFBRSxBQUFDO0FBQ1QsQUFBUyxlQUFFLEFBQVk7QUFDdkIsQUFBYyxvQkFBRSxBQUFTO0FBQ3pCLEFBQVEsY0FBRSxBQUFVLEFBQ3ZCLEFBQUM7O0FBRUYsQUFBWSxhQUFDLEFBQVEsV0FBRztBQUNwQixBQUFNLFlBQUUsQUFBSztBQUNiLEFBQU0sWUFBRSxBQUFZO0FBQ3BCLEFBQUssV0FBRSxBQUFNLEFBQ2hCLEFBQUM7O0FBRUYsQUFBWSxhQUFDLEFBQVUsYUFBRztBQUN0QixBQUFLLFdBQUUsQUFBSztBQUNaLEFBQU0sWUFB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QyxBQUNMLEFBQUM7Ozs7O0VBaEYyQyxBQUFLLE1BQUMsQUFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QtdmVuZG9yLXByZWZpeC9yZWFjdC12ZW5kb3ItcHJlZml4LmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC1kb20uZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQgKiBhcyBWZW5kb3JQcmVmaXggZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcbmltcG9ydCBTdGFuZGFyZExpYiBmcm9tIFwiLi4vdXRpbHMvU3RhbmRhcmRMaWJcIjtcbmNvbnN0IEhPUklaT05UQUw6IHN0cmluZyA9IFwiaG9yaXpvbnRhbFwiO1xuXG5jb25zdCBtb3VzZWV2ZW50czpzdHJpbmdbXSA9IFtcIm1vdXNlb3ZlclwiLCBcIm1vdXNlb3V0XCIsIFwibW91c2VsZWF2ZVwiXTtcblxudmFyIHJlc2l6ZXJTdHlsZTphbnkgPSB7fTtcblxucmVzaXplclN0eWxlLmJhc2ljID0ge1xuICAgIGJhY2tncm91bmQ6IFwiIzAwMFwiLFxuICAgIG9wYWNpdHk6IC4zLFxuICAgIHpJbmRleDogMSxcbiAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxuICAgIGJhY2tncm91bmRDbGlwOiBcInBhZGRpbmdcIixcbiAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiXG59O1xuXG5yZXNpemVyU3R5bGUudmVydGljYWwgPSB7XG4gICAgaGVpZ2h0OiBcIjRweFwiLFxuICAgIGN1cnNvcjogXCJyb3ctcmVzaXplXCIsXG4gICAgd2lkdGg6IFwiMTAwJVwiXG59O1xuXG5yZXNpemVyU3R5bGUuaG9yaXpvbnRhbCA9IHtcbiAgICB3aWR0aDogXCI0cHhcIixcbiAgICBjdXJzb3I6IFwiY29sLXJlc2l6ZVwiLFxuICAgIGhlaWdodDogXCIxMDAlXCJcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlc2l6ZXJPdmVybGF5UHJvcHMgZXh0ZW5kcyBSZWFjdC5Qcm9wczxSZXNpemVyT3ZlcmxheT4ge1xuICAgIHJlZjogc3RyaW5nO1xuICAgIGRpcmVjdGlvbjogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlc2l6ZXJPdmVybGF5U3RhdGUge1xuICAgIGFjdGl2ZT86IGJvb2xlYW47XG4gICAgcmFuZ2U/OiBudW1iZXJbXTtcbiAgICB4PzogbnVtYmVyO1xuICAgIHk/OiBudW1iZXI7XG59O1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6ZXJPdmVybGF5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElSZXNpemVyT3ZlcmxheVByb3BzLCBJUmVzaXplck92ZXJsYXlTdGF0ZT4ge1xuXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50O1xuICAgIHB1YmxpYyBzdGF0ZTogSVJlc2l6ZXJPdmVybGF5U3RhdGU7XG5cbiAgICBwcml2YXRlIF9vbk1vdXNlTW92ZTogRXZlbnRMaXN0ZW5lcjtcbiAgICBwcml2YXRlIF9zdG9wRXZlbnRQcm9wYWdhdGlvbjogRXZlbnRMaXN0ZW5lcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUmVzaXplck92ZXJsYXlQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcylcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIHJhbmdlOiBbXSxcbiAgICAgICAgICB4OiBOYU4sXG4gICAgICAgICAgeTogTmFOXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5fb25Nb3VzZU1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcyksIHRydWUpO1xuICAgICAgICBtb3VzZWV2ZW50cy5mb3JFYWNoKChtb3VzZWV2ZW50OiBzdHJpbmcpID0+IGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobW91c2VldmVudCwgdGhpcy5fc3RvcEV2ZW50UHJvcGFnYXRpb24gPSB0aGlzLnN0b3BFdmVudFByb3BhZ2F0aW9uLmJpbmQodGhpcyksIHRydWUpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLl9vbk1vdXNlTW92ZSlcbiAgICAgICAgbW91c2VldmVudHMuZm9yRWFjaCgobW91c2VldmVudCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihtb3VzZWV2ZW50LCB0aGlzLl9zdG9wRXZlbnRQcm9wYWdhdGlvbikpO1xuICAgIH1cblxuICAgIHN0b3BFdmVudFByb3BhZ2F0aW9uKGV2ZW50OiBFdmVudCkge1xuICAgICAgICBpZih0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgICBpZih0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB2YXIgY29udGFpbmVyOkVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSBhcyBFbGVtZW50O1xuICAgICAgICAgICAgdmFyIHJlY3Q6Q2xpZW50UmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHZhciBsZWZ0OiBudW1iZXIgPSB3aW5kb3cucGFnZVhPZmZzZXQgKyByZWN0LmxlZnQ7XG4gICAgICAgICAgICB2YXIgdG9wOiBudW1iZXIgPSB3aW5kb3cucGFnZVlPZmZzZXQgKyByZWN0LnRvcDtcbiAgICAgICAgICAgIHZhciBtb3VzZVBvczogbnVtYmVyID0gdGhpcy5wcm9wcy5kaXJlY3Rpb24gPT09IEhPUklaT05UQUwgPyBldmVudC5wYWdlWCA6IGV2ZW50LnBhZ2VZO1xuXG4gICAgICAgICAgICBtb3VzZVBvcyA9IE1hdGgubWF4KHRoaXMuc3RhdGUucmFuZ2VbMF0sIE1hdGgubWluKG1vdXNlUG9zLCB0aGlzLnN0YXRlLnJhbmdlWzFdKSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmRpcmVjdGlvbiA9PT0gSE9SSVpPTlRBTCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB4OiBtb3VzZVBvcyAtIGxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHk6IE5hTlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgeDogTmFOLFxuICAgICAgICAgICAgICAgICAgICB5OiBtb3VzZVBvcyAtIHRvcFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgZGlyZWN0aW9uOiBzdHJpbmcgPSB0aGlzLnByb3BzLmRpcmVjdGlvbjtcbiAgICAgICAgdmFyIHN0eWxlOlJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7fTtcblxuICAgICAgICBTdGFuZGFyZExpYi5tZXJnZShzdHlsZSwgcmVzaXplclN0eWxlLmJhc2ljKTtcbiAgICAgICAgU3RhbmRhcmRMaWIubWVyZ2Uoc3R5bGUsIHJlc2l6ZXJTdHlsZVtkaXJlY3Rpb25dKTtcblxuICAgICAgICBpZih0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgICAgICAgc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgICAgc3R5bGUubGVmdCA9ICFpc05hTih0aGlzLnN0YXRlLngpID8gdGhpcy5zdGF0ZS54IDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgc3R5bGUudG9wID0gIWlzTmFOKHRoaXMuc3RhdGUueSkgPyB0aGlzLnN0YXRlLnkgOiB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlID0gVmVuZG9yUHJlZml4LnByZWZpeCh7IHN0eWxlczogc3R5bGUgfSkuc3R5bGVzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3BhbiByZWY9eyhlbHQ6RWxlbWVudCkgPT4geyB0aGlzLmVsZW1lbnQgPSBlbHQ7IH19IHN0eWxlPXtzdHlsZX0vPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==