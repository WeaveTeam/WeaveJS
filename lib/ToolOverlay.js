"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../typings/react/react.d.ts"/>

var toolOverlayStyle = {
    background: "#000",
    opacity: .2,
    zIndex: 3,
    boxSizing: "border-box",
    backgroundClip: "padding",
    position: "fixed",
    visibility: "hidden",
    pointerEvents: "none"
};

var ToolOverlay = function (_React$Component) {
    _inherits(ToolOverlay, _React$Component);

    function ToolOverlay(props) {
        _classCallCheck(this, ToolOverlay);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ToolOverlay).call(this, props));

        _this.state = {
            style: toolOverlayStyle
        };
        return _this;
    }

    _createClass(ToolOverlay, [{
        key: "render",
        value: function render() {
            return React.createElement("div", { style: this.state.style });
        }
    }]);

    return ToolOverlay;
}(React.Component);

exports.default = ToolOverlay;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9vbE92ZXJsYXkuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjdHMvVG9vbE92ZXJsYXkudHN4Il0sIm5hbWVzIjpbIlRvb2xPdmVybGF5IiwiVG9vbE92ZXJsYXkuY29uc3RydWN0b3IiLCJUb29sT3ZlcmxheS5yZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFFWSxBQUFLLEFBQU0sQUFBTzs7Ozs7Ozs7OztBQUU5Qix1QkFBNkM7QUFDekMsQUFBVSxnQkFBRSxBQUFNO0FBQ2xCLEFBQU8sYUFBRSxBQUFFO0FBQ1gsQUFBTSxZQUFFLEFBQUM7QUFDVCxBQUFTLGVBQUUsQUFBWTtBQUN2QixBQUFjLG9CQUFFLEFBQVM7QUFDekIsQUFBUSxjQUFFLEFBQU87QUFDakIsQUFBVSxnQkFBRSxBQUFRO0FBQ3BCLEFBQWEsbUJBQUUsQUFBTSxBQUN4QixBQUFDLEFBU0Y7Q0FsQk0sQUFBZ0I7Ozs7O0FBb0JsQix5QkFBWSxBQUF1Qjs7O21HQUN6QixBQUFLLEFBQUMsQUFBQzs7QUFDYixBQUFJLGNBQUMsQUFBSyxRQUFHO0FBQ1QsQUFBSyxtQkFBRSxBQUFnQixBQUMxQixBQUFDLEFBQ04sQUFBQyxBQUVELEFBQU07VUFORjs7Ozs7OztBQU9BLEFBQU0sbUJBQUMsQUFBQyxBQUFHLDZCQUFDLEFBQUssQUFBQyxPQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBSyxBQUFDLEFBQUUsQUFBQyxBQUMzQyxBQUFDLEFBQ0wsQUFBQyxBQUVEOzs7OztFQWQwQixBQUFLLE1BQUMsQUFBUzs7a0JBYzFCLEFBQVcsQUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5jb25zdCB0b29sT3ZlcmxheVN0eWxlOlJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgYmFja2dyb3VuZDogXCIjMDAwXCIsXG4gICAgb3BhY2l0eTogLjIsXG4gICAgekluZGV4OiAzLFxuICAgIGJveFNpemluZzogXCJib3JkZXItYm94XCIsXG4gICAgYmFja2dyb3VuZENsaXA6IFwicGFkZGluZ1wiLFxuICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgdmlzaWJpbGl0eTogXCJoaWRkZW5cIixcbiAgICBwb2ludGVyRXZlbnRzOiBcIm5vbmVcIlxufTtcblxuZXhwb3J0IGludGVyZmFjZSBJVG9vbE92ZXJsYXlQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPFRvb2xPdmVybGF5PiB7XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVG9vbE92ZXJsYXlTdGF0ZSB7XG4gICAgc3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXM7XG59XG5jbGFzcyBUb29sT3ZlcmxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJVG9vbE92ZXJsYXlQcm9wcywgSVRvb2xPdmVybGF5U3RhdGU+IHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklUb29sT3ZlcmxheVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHN0eWxlOiB0b29sT3ZlcmxheVN0eWxlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiBzdHlsZT17dGhpcy5zdGF0ZS5zdHlsZX0vPjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRvb2xPdmVybGF5O1xuIl19