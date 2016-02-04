"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _RCSlider = require("./RCSlider");

var _RCSlider2 = _interopRequireDefault(_RCSlider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../../typings/react/react.d.ts"/>

var HSlider = function (_React$Component) {
    _inherits(HSlider, _React$Component);

    function HSlider(props) {
        _classCallCheck(this, HSlider);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(HSlider).call(this, props));
    }

    _createClass(HSlider, [{
        key: "render",
        value: function render() {
            return React.createElement(_RCSlider2.default, this.props);
        }
    }]);

    return HSlider;
}(React.Component);

exports.default = HSlider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSFNsaWRlci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmN0cy9yZWFjdC11aS9SQ1NsaWRlci9IU2xpZGVyLnRzeCJdLCJuYW1lcyI6WyJIU2xpZGVyIiwiSFNsaWRlci5jb25zdHJ1Y3RvciIsIkhTbGlkZXIucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBRVksQUFBSyxBQUFNLEFBQU8sQUFDdkIsQUFBUSxBQUFNLEFBQVksQUFhakM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSSxxQkFBWSxBQUFrQixPQUMxQjs7OzBGQUFNLEFBQUssQUFBQyxBQUFDLEFBQ2pCLEFBQUMsQUFFRCxBQUFNOzs7Ozs7QUFDRixBQUFNLG1CQUFDLEFBQUMsQUFBUSx3Q0FBSyxBQUFJLEtBQUMsQUFBSyxBQUFHLEFBQUMsQUFDdkMsQUFBQyxBQUNMLEFBQUM7Ozs7O0VBVG9DLEFBQUssTUFBQyxBQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUkNTbGlkZXIgZnJvbSBcIi4vUkNTbGlkZXJcIjtcblxuaW50ZXJmYWNlIEhTbGlkZXJQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPEhTbGlkZXI+IHtcbiAgICBtaW4/Om51bWJlcjtcbiAgICBtYXg/Om51bWJlcjtcbiAgICBzdGVwPzpudW1iZXI7XG4gICAgdmFsdWVzPzpzdHJpbmdbXTtcbiAgICBzZWxlY3RlZFZhbHVlcz86c3RyaW5nW107XG4gICAgdHlwZTpzdHJpbmc7XG4gICAgcmV2ZXJzZWQ/OmJvb2xlYW47XG4gICAgb25DaGFuZ2U/OlJlYWN0LkV2ZW50SGFuZGxlcjxSZWFjdC5Gb3JtRXZlbnQ+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIU2xpZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PEhTbGlkZXJQcm9wcywgYW55PiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczpIU2xpZGVyUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxSQ1NsaWRlciB7Li4udGhpcy5wcm9wc30vPjtcbiAgICB9XG59XG4iXX0=