"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>

var HBox = function (_React$Component) {
    _inherits(HBox, _React$Component);

    function HBox(props, state) {
        _classCallCheck(this, HBox);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(HBox).call(this, props));
    }

    _createClass(HBox, [{
        key: "render",
        value: function render() {
            var style = this.props.style || {};
            var otherProps = {};
            for (var key in this.props) {
                if (key !== "style") {
                    otherProps[key] = this.props[key];
                }
            }
            style.display = "flex";
            style.flexDirection = "row";
            return React.createElement(
                "div",
                _extends({ style: style }, otherProps),
                this.props.children
            );
        }
    }]);

    return HBox;
}(React.Component);

exports.default = HBox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSEJveC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmN0cy9yZWFjdC11aS9IQm94LnRzeCJdLCJuYW1lcyI6WyJIQm94IiwiSEJveC5jb25zdHJ1Y3RvciIsIkhCb3gucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFFWSxBQUFLLEFBQU0sQUFBTyxBQUU5Qjs7Ozs7Ozs7Ozs7OztBQUVJLGtCQUFZLEFBQVMsT0FBRSxBQUFTLE9BQzVCOzs7dUZBQU0sQUFBSyxBQUFDLEFBQUMsQUFDakIsQUFBQyxBQUVELEFBQU07Ozs7OztBQUNGLGdCQUFJLEFBQUssUUFBTyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUssU0FBSSxBQUFFLEFBQUM7QUFDdkMsZ0JBQUksQUFBVSxhQUFPLEFBQUUsQUFBQztBQUN4QixBQUFHLGlCQUFDLEFBQUcsSUFBQyxBQUFHLE9BQUksQUFBSSxLQUFDLEFBQUssQUFBQyxPQUFDLEFBQUM7QUFDeEIsQUFBRSxvQkFBQyxBQUFHLFFBQUssQUFBTyxBQUFDLFNBQUMsQUFBQztBQUNqQixBQUFVLCtCQUFDLEFBQUcsQUFBQyxPQUFHLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBRyxBQUFDLEFBQUMsQUFDdEMsQUFBQyxBQUNMLEFBQUM7OztBQUVELEFBQUssa0JBQUMsQUFBTyxVQUFHLEFBQU0sQUFBQztBQUN2QixBQUFLLGtCQUFDLEFBQWEsZ0JBQUcsQUFBSyxBQUFDO0FBRTVCLEFBQU0sQUFBQyxtQkFDSCxBQUFDLEFBQUc7OzJCQUFDLEFBQUssQUFBQyxPQUFDLEFBQUssQUFBQyxTQUFLLEFBQVUsQUFDN0I7Z0JBQ0ksQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFRLEFBRTNCLEFBQUUsQUFBRyxBQUFDLEFBQ1QsQUFDTCxBQUFDLEFBQ0wsQUFBQzs7Ozs7O0VBMUJpQyxBQUFLLE1BQUMsQUFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PGFueSwgYW55PiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczphbnksIHN0YXRlOmFueSkge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgc3R5bGU6YW55ID0gdGhpcy5wcm9wcy5zdHlsZSB8fCB7fTtcbiAgICAgICAgdmFyIG90aGVyUHJvcHM6YW55ID0ge307XG4gICAgICAgIGZvcih2YXIga2V5IGluIHRoaXMucHJvcHMpIHtcbiAgICAgICAgICAgIGlmKGtleSAhPT0gXCJzdHlsZVwiKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJQcm9wc1trZXldID0gdGhpcy5wcm9wc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICBzdHlsZS5mbGV4RGlyZWN0aW9uID0gXCJyb3dcIjtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBzdHlsZT17c3R5bGV9IHsuLi5vdGhlclByb3BzfT5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgIH1cbn1cbiJdfQ==
