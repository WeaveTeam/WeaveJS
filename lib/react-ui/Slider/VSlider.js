"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _Slider = require("./Slider");

var _Slider2 = _interopRequireDefault(_Slider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../../typings/react/react.d.ts"/>

var VSlider = function (_React$Component) {
    _inherits(VSlider, _React$Component);

    function VSlider(props) {
        _classCallCheck(this, VSlider);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(VSlider).call(this, props));
    }

    _createClass(VSlider, [{
        key: "render",
        value: function render() {
            return React.createElement(_Slider2.default, _extends({ direction: _Slider2.default.VERTICAL }, this.props));
        }
    }]);

    return VSlider;
}(React.Component);

exports.default = VSlider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNsaWRlci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmN0cy9yZWFjdC11aS9TbGlkZXIvVlNsaWRlci50c3giXSwibmFtZXMiOlsiVlNsaWRlciIsIlZTbGlkZXIuY29uc3RydWN0b3IiLCJWU2xpZGVyLnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBRVksQUFBSyxBQUFNLEFBQU8sQUFDdkIsQUFBTSxBQUFNLEFBQVUsQUFjN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSSxxQkFBWSxBQUFrQixPQUMxQjs7OzBGQUFNLEFBQUssQUFBQyxBQUFDLEFBQ2pCLEFBQUMsQUFFRCxBQUFNOzs7Ozs7QUFDRixBQUFNLG1CQUFDLEFBQUMsQUFBTSxpREFBQyxBQUFTLEFBQUMsV0FBQyxBQUFNLGlCQUFDLEFBQVEsQUFBQyxZQUFLLEFBQUksS0FBQyxBQUFLLEFBQUcsQUFBQyxBQUNqRSxBQUFDLEFBQ0wsQUFBQzs7Ozs7RUFUb0MsQUFBSyxNQUFDLEFBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBTbGlkZXIgZnJvbSBcIi4vU2xpZGVyXCI7XG5pbXBvcnQge1NsaWRlclByb3BzfSBmcm9tIFwiLi9TbGlkZXJcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuXG5pbnRlcmZhY2UgVlNsaWRlclByb3BzIGV4dGVuZHMgUmVhY3QuUHJvcHM8VlNsaWRlcj4ge1xuICAgIG1pbjpudW1iZXI7XG4gICAgbWF4Om51bWJlcjtcbiAgICBzdGVwOm51bWJlcjtcbiAgICB2YWx1ZTpudW1iZXI7XG4gICAgb25DaGFuZ2U/OlJlYWN0LkV2ZW50SGFuZGxlcjxSZWFjdC5Gb3JtRXZlbnQ+O1xuICAgIHN0eWxlPzpSZWFjdC5DU1NQcm9wZXJ0aWVzO1xuICAgIGxhYmVsPzpzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZTbGlkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8VlNsaWRlclByb3BzLCBhbnk+IHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOlZTbGlkZXJQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPFNsaWRlciBkaXJlY3Rpb249e1NsaWRlci5WRVJUSUNBTH0gey4uLnRoaXMucHJvcHN9Lz47XG4gICAgfVxufVxuIl19