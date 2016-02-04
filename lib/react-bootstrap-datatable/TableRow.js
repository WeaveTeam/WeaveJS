"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _StandardLib = require("../utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

var _reactVendorPrefix = require("react-vendor-prefix");

var Prefixer = _interopRequireWildcard(_reactVendorPrefix);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

;
var baseStyle = {
    userSelect: "none"
};

var TableRow = function (_React$Component) {
    _inherits(TableRow, _React$Component);

    function TableRow(props) {
        _classCallCheck(this, TableRow);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TableRow).call(this, props));

        _this.selectedStyle = {
            backgroundColor: "#80CCFF"
        };
        _this.clear = {};
        _this.probedAndSelected = {
            backgroundColor: "#99D6FF"
        };
        _this.probedStyle = {
            backgroundColor: "rgba(153, 214, 255, 0.4)"
        };
        return _this;
    }

    _createClass(TableRow, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps, nextState) {
            // only update the row if the key has changed
            return this.props.selected != nextProps.selected || this.props.probed != nextProps.probed || !_.isEqual(this.props.row, nextProps.row);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var style = {};
            var selected = this.props.selected;
            var probed = this.props.probed;
            if (selected && probed) {
                style = this.probedAndSelected;
            }
            if (selected && !probed) {
                style = this.selectedStyle;
            }
            if (!selected && probed) {
                style = this.probedStyle;
            }
            if (!selected && !probed) {
                style = this.clear;
            }
            _StandardLib2.default.merge(style, baseStyle);
            var cells = [];
            var keys = Object.keys(this.props.row);
            if (!this.props.showIdColumn) {
                keys.splice(keys.indexOf(this.props.idProperty), 1);
            }
            cells = keys.map(function (key) {
                return React.createElement(
                    "td",
                    { key: key },
                    _this2.props.row[key]
                );
            });
            return React.createElement(
                "tr",
                { style: Prefixer.prefix({ styles: style }).styles, onMouseOver: this.props.onMouseOver.bind(this, true), onMouseOut: this.props.onMouseOver.bind(this, false), onClick: this.props.onClick.bind(this) },
                cells
            );
        }
    }]);

    return TableRow;
}(React.Component);

exports.default = TableRow;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFibGVSb3cuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvcmVhY3QtYm9vdHN0cmFwLWRhdGF0YWJsZS9UYWJsZVJvdy50c3giXSwibmFtZXMiOlsiVGFibGVSb3ciLCJUYWJsZVJvdy5jb25zdHJ1Y3RvciIsIlRhYmxlUm93LnNob3VsZENvbXBvbmVudFVwZGF0ZSIsIlRhYmxlUm93LnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUtZLEFBQUssQUFBTSxBQUFPLEFBR3ZCLEFBQVcsQUFBTSxBQUFzQixBQUN2Qzs7Ozs7Ozs7SUFBSyxBQUFRLEFBQU0sQUFBcUIsQUFDeEM7Ozs7SUFBSyxBQUFDLEFBQU0sQUFBUTs7Ozs7Ozs7Ozs7Ozs7O0FBSTFCLEFBQUM7QUFlRixnQkFBZ0M7QUFDNUIsQUFBVSxnQkFBRSxBQUFNLEFBQ3JCLEFBQUMsQUFFRjtDQUpNLEFBQVM7Ozs7O0FBV1gsc0JBQVksQUFBb0I7OztnR0FDdEIsQUFBSyxBQUFDLEFBQUM7O0FBRWIsQUFBSSxjQUFDLEFBQWEsZ0JBQUc7QUFDakIsQUFBZSw2QkFBRSxBQUFTLEFBQzdCLEFBQUM7VUFKRjtBQU1BLEFBQUksY0FBQyxBQUFLLFFBQUcsQUFBRSxBQUFDO0FBRWhCLEFBQUksY0FBQyxBQUFpQixvQkFBRztBQUNyQixBQUFlLDZCQUFFLEFBQVMsQUFDN0IsQUFBQzs7QUFFRixBQUFJLGNBQUMsQUFBVyxjQUFHO0FBQ2YsQUFBZSw2QkFBRSxBQUEwQixBQUM5QyxBQUNMLEFBQUMsQUFFRCxBQUFxQjs7Ozs7Ozs4Q0FBQyxBQUF3QixXQUFFLEFBQXdCLFdBQ3BFLEFBQTZDOztBQUM3QyxBQUFNLG1CQUFDLElBQUMsQUFBSSxDQUFDLEFBQUssTUFBQyxBQUFRLFlBQUksQUFBUyxVQUFDLEFBQVEsQUFBQyxBQUMzQyxZQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBTSxVQUFJLEFBQVMsVUFBQyxBQUFNLEFBQUMsQUFDdkMsVUFBQyxDQUFDLEFBQUMsRUFBQyxBQUFPLFFBQUMsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFHLEtBQUUsQUFBUyxVQUFDLEFBQUcsQUFBQyxBQUFDLEFBQUMsQUFDdkQsQUFBQyxBQUVELEFBQU07Ozs7Ozs7QUFDRixnQkFBSSxBQUFLLFFBQUcsQUFBRTtBQUNkLGdCQUFJLEFBQVEsV0FBVyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVEsQUFBQztBQUMzQyxnQkFBSSxBQUFNLFNBQVcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFNLEFBQUM7QUFFdkMsQUFBRSxnQkFBQyxBQUFRLFlBQUksQUFBTSxBQUFDLFFBQUMsQUFBQztBQUNwQixBQUFLLHdCQUFHLEFBQUksS0FBQyxBQUFpQixBQUFDLEFBQ25DLEFBQUM7O0FBQ0QsQUFBRSxnQkFBQyxBQUFRLFlBQUksQ0FBQyxBQUFNLEFBQUMsUUFBQyxBQUFDO0FBQ3JCLEFBQUssd0JBQUcsQUFBSSxLQUFDLEFBQWEsQUFBQyxBQUMvQixBQUFDOztBQUNELEFBQUUsZ0JBQUMsQ0FBQyxBQUFRLFlBQUksQUFBTSxBQUFDLFFBQUMsQUFBQztBQUNyQixBQUFLLHdCQUFHLEFBQUksS0FBQyxBQUFXLEFBQUMsQUFDN0IsQUFBQzs7QUFDRCxBQUFFLGdCQUFDLENBQUMsQUFBUSxZQUFJLENBQUMsQUFBTSxBQUFDO0FBQ3BCLEFBQUssd0JBQUcsQUFBSSxLQUFDLEFBQUssQUFBQyxBQUN2QixBQUFDLE1BRndCLEFBQUM7O0FBSTFCLEFBQVcsa0NBQUMsQUFBSyxNQUFDLEFBQUssT0FBRSxBQUFTLEFBQUMsQUFBQztBQUVwQyxnQkFBSSxBQUFLLFFBQWlCLEFBQUUsQUFBQztBQUU3QixnQkFBSSxBQUFJLE9BQVksQUFBTSxPQUFDLEFBQUksS0FBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUcsQUFBQyxBQUFDO0FBQ2hELEFBQUUsZ0JBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVksQUFBQyxjQUFDLEFBQUM7QUFDMUIsQUFBSSxxQkFBQyxBQUFNLE9BQUMsQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVUsQUFBQyxhQUFFLEFBQUMsQUFBQyxBQUFDLEFBQ3hELEFBQUM7O0FBQ0QsQUFBSyxvQkFBRyxBQUFJLEtBQUMsQUFBRyxjQUFFLEFBQVU7QUFDeEIsQUFBTSx1QkFBQyxBQUFDLEFBQUU7O3NCQUFDLEFBQUcsQUFBQyxLQUFDLEFBQUcsQUFBQyxBQUFDO29CQUFDLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBRyxJQUFDLEFBQUcsQUFBQyxBQUFDLEFBQUUsQUFBRSxBQUFDLEFBQUMsQUFDcEQsQUFBQyxBQUFDLEFBQUM7O2FBRmM7QUFJakIsQUFBTSxBQUFDLG1CQUNILEFBQUMsQUFBRTs7a0JBQUMsQUFBSyxBQUFDLE9BQUMsQUFBUSxTQUFDLEFBQU0sT0FBQyxFQUFDLEFBQU0sUUFBRSxBQUFLLEFBQUMsQUFBQyxTQUFDLEFBQU0sQUFBQyxRQUFDLEFBQVcsQUFBQyxhQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBVyxZQUFDLEFBQUksS0FBQyxBQUFJLE1BQUUsQUFBSSxBQUFDLEFBQUMsT0FBQyxBQUFVLEFBQUMsWUFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBQyxBQUFJLEtBQUMsQUFBSSxNQUFFLEFBQUssQUFBQyxBQUFDLFFBQUMsQUFBTyxBQUFDLFNBQUMsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFPLFFBQUMsQUFBSSxLQUFDLEFBQUksQUFBQyxBQUFDLEFBQ25NO2dCQUNJLEFBQUssQUFFYixBQUFFLEFBQUUsQUFBQyxBQUNSLEFBQUMsQUFDTixBQUFDLEFBQ0wsQUFBQzs7Ozs7O0VBdEVxQyxBQUFLLE1BQUMsQUFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC1ib290c3RyYXAvcmVhY3QtYm9vdHN0cmFwLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC12ZW5kb3ItcHJlZml4L3JlYWN0LXZlbmRvci1wcmVmaXguZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1RhYmxlfSBmcm9tIFwicmVhY3QtYm9vdHN0cmFwXCI7XG5pbXBvcnQge0NTU1Byb3BlcnRpZXN9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuLi91dGlscy9TdGFuZGFyZExpYlwiO1xuaW1wb3J0ICogYXMgUHJlZml4ZXIgZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElSb3cge1xuICAgIFtjb2x1bW5JZDpzdHJpbmddOiBzdHJpbmdcbn07XG5cbmludGVyZmFjZSBJVGFibGVSb3dQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPFRhYmxlUm93PiB7XG4gICAgcm93OklSb3c7XG4gICAgaWRQcm9wZXJ0eTpzdHJpbmc7XG4gICAgb25Nb3VzZU92ZXI6KCkgPT4gdm9pZDtcbiAgICBvbkNsaWNrOigpID0+IHZvaWQ7XG4gICAgcHJvYmVkOmJvb2xlYW47XG4gICAgc2VsZWN0ZWQ6Ym9vbGVhbjtcbiAgICBzaG93SWRDb2x1bW46Ym9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElUYWJsZVJvd1N0YXRlIHtcbn1cblxuY29uc3QgYmFzZVN0eWxlOkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgdXNlclNlbGVjdDogXCJub25lXCJcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmxlUm93IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElUYWJsZVJvd1Byb3BzLCBJVGFibGVSb3dTdGF0ZT4ge1xuXG4gICAgcHJpdmF0ZSBzZWxlY3RlZFN0eWxlOkNTU1Byb3BlcnRpZXM7XG4gICAgcHJpdmF0ZSBjbGVhcjpDU1NQcm9wZXJ0aWVzO1xuICAgIHByaXZhdGUgcHJvYmVkU3R5bGU6Q1NTUHJvcGVydGllcztcbiAgICBwcml2YXRlIHByb2JlZEFuZFNlbGVjdGVkOkNTU1Byb3BlcnRpZXM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczpJVGFibGVSb3dQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZFN0eWxlID0ge1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiM4MENDRkZcIlxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2xlYXIgPSB7fTtcblxuICAgICAgICB0aGlzLnByb2JlZEFuZFNlbGVjdGVkID0ge1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiM5OUQ2RkZcIlxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucHJvYmVkU3R5bGUgPSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxNTMsIDIxNCwgMjU1LCAwLjQpXCJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6SVRhYmxlUm93UHJvcHMsIG5leHRTdGF0ZTpJVGFibGVSb3dTdGF0ZSkge1xuICAgICAgICAvLyBvbmx5IHVwZGF0ZSB0aGUgcm93IGlmIHRoZSBrZXkgaGFzIGNoYW5nZWRcbiAgICAgICAgcmV0dXJuICh0aGlzLnByb3BzLnNlbGVjdGVkICE9IG5leHRQcm9wcy5zZWxlY3RlZCkgfHxcbiAgICAgICAgICAgICAgICh0aGlzLnByb3BzLnByb2JlZCAhPSBuZXh0UHJvcHMucHJvYmVkKSB8fFxuICAgICAgICAgICAgICAgKCFfLmlzRXF1YWwodGhpcy5wcm9wcy5yb3csIG5leHRQcm9wcy5yb3cpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKTpKU1guRWxlbWVudCB7XG4gICAgICAgIHZhciBzdHlsZSA9IHt9XG4gICAgICAgIHZhciBzZWxlY3RlZDpib29sZWFuID0gdGhpcy5wcm9wcy5zZWxlY3RlZDtcbiAgICAgICAgdmFyIHByb2JlZDpib29sZWFuID0gdGhpcy5wcm9wcy5wcm9iZWQ7XG5cbiAgICAgICAgaWYoc2VsZWN0ZWQgJiYgcHJvYmVkKSB7XG4gICAgICAgICAgICBzdHlsZSA9IHRoaXMucHJvYmVkQW5kU2VsZWN0ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYoc2VsZWN0ZWQgJiYgIXByb2JlZCkge1xuICAgICAgICAgICAgc3R5bGUgPSB0aGlzLnNlbGVjdGVkU3R5bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYoIXNlbGVjdGVkICYmIHByb2JlZCkge1xuICAgICAgICAgICAgc3R5bGUgPSB0aGlzLnByb2JlZFN0eWxlO1xuICAgICAgICB9XG4gICAgICAgIGlmKCFzZWxlY3RlZCAmJiAhcHJvYmVkKSB7XG4gICAgICAgICAgICBzdHlsZSA9IHRoaXMuY2xlYXI7XG4gICAgICAgIH1cblxuICAgICAgICBTdGFuZGFyZExpYi5tZXJnZShzdHlsZSwgYmFzZVN0eWxlKTtcblxuICAgICAgICB2YXIgY2VsbHM6SlNYLkVsZW1lbnRbXSA9IFtdO1xuXG4gICAgICAgIHZhciBrZXlzOnN0cmluZ1tdID0gT2JqZWN0LmtleXModGhpcy5wcm9wcy5yb3cpO1xuICAgICAgICBpZighdGhpcy5wcm9wcy5zaG93SWRDb2x1bW4pIHtcbiAgICAgICAgICAgIGtleXMuc3BsaWNlKGtleXMuaW5kZXhPZih0aGlzLnByb3BzLmlkUHJvcGVydHkpLCAxKTtcbiAgICAgICAgfVxuICAgICAgICBjZWxscyA9IGtleXMubWFwKChrZXk6c3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPHRkIGtleT17a2V5fT57dGhpcy5wcm9wcy5yb3dba2V5XX08L3RkPjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDx0ciBzdHlsZT17UHJlZml4ZXIucHJlZml4KHtzdHlsZXM6IHN0eWxlfSkuc3R5bGVzfSBvbk1vdXNlT3Zlcj17dGhpcy5wcm9wcy5vbk1vdXNlT3Zlci5iaW5kKHRoaXMsIHRydWUpfSBvbk1vdXNlT3V0PXt0aGlzLnByb3BzLm9uTW91c2VPdmVyLmJpbmQodGhpcywgZmFsc2UpfSBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2suYmluZCh0aGlzKX0+XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjZWxsc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19