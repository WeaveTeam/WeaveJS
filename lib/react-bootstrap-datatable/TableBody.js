"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _TableRow = require("./TableRow");

var _TableRow2 = _interopRequireDefault(_TableRow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

var TableBody = function (_React$Component) {
    _inherits(TableBody, _React$Component);

    function TableBody(props) {
        _classCallCheck(this, TableBody);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TableBody).call(this, props));

        _this.tableRows = {};
        return _this;
    }

    _createClass(TableBody, [{
        key: "componentDidUpdate",
        value: function componentDidUpdate() {}
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "tbody",
                null,
                this.props.rows.map(function (row, index) {
                    return React.createElement(_TableRow2.default, { ref: function ref(tableRow) {
                            _this2.tableRows[row[_this2.props.idProperty]] = tableRow;
                        }, key: index, onMouseOver: _this2.props.onMouseOver.bind(_this2, row[_this2.props.idProperty]), onClick: _this2.props.onClick.bind(_this2, row[_this2.props.idProperty]), idProperty: _this2.props.idProperty, row: row, probed: _this2.props.probedIds.indexOf(row[_this2.props.idProperty]) > -1, selected: _this2.props.selectedIds.indexOf(row[_this2.props.idProperty]) > -1, showIdColumn: _this2.props.showIdColumn });
                })
            );
        }
    }]);

    return TableBody;
}(React.Component);

exports.default = TableBody;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFibGVCb2R5LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyY3RzL3JlYWN0LWJvb3RzdHJhcC1kYXRhdGFibGUvVGFibGVCb2R5LnRzeCJdLCJuYW1lcyI6WyJUYWJsZUJvZHkiLCJUYWJsZUJvZHkuY29uc3RydWN0b3IiLCJUYWJsZUJvZHkuY29tcG9uZW50RGlkVXBkYXRlIiwiVGFibGVCb2R5LnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUlZLEFBQUssQUFBTSxBQUFPLEFBRXZCLEFBQVEsQUFBTSxBQUFZLEFBaUJqQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSUksdUJBQVksQUFBcUI7OztpR0FDdkIsQUFBSyxBQUFDLEFBQUM7O0FBRWIsQUFBSSxjQUFDLEFBQVMsWUFBRyxBQUFFLEFBQUMsQUFDeEIsQUFBQyxBQUVELEFBQWtCLEdBTGQ7Ozs7Ozs2Q0FNSixBQUFDLEFBRUQsQUFBTTs7Ozs7O0FBQ0YsQUFBTSxBQUFDOzs7Z0JBR0ssQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFJLEtBQUMsQUFBRyxjQUFFLEFBQVEsS0FBRSxBQUFZO0FBQ3ZDLEFBQU0sMkJBQUMsQUFBQyxBQUFRLDBDQUNILEFBQUcsQUFBQyxrQkFBRSxBQUFpQjtBQUFPLEFBQUksbUNBQUMsQUFBUyxVQUFDLEFBQUcsSUFBQyxBQUFJLE9BQUMsQUFBSyxNQUFDLEFBQVUsQUFBQyxBQUFDLGVBQUcsQUFBUSxBQUFDLEFBQUMsQUFBQzt5QkFBakYsRUFDTCxBQUFHLEFBQUMsS0FBQyxBQUFLLEFBQUMsT0FDWCxBQUFXLEFBQUMsYUFBQyxBQUFJLE9BQUMsQUFBSyxNQUFDLEFBQVcsWUFBQyxBQUFJLEFBQUMsQUFBSSxhQUFFLEFBQUcsSUFBQyxBQUFJLE9BQUMsQUFBSyxNQUFDLEFBQVUsQUFBQyxBQUFDLEFBQUMsY0FDM0UsQUFBTyxBQUFDLFNBQUMsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFPLFFBQUMsQUFBSSxBQUFDLEFBQUksYUFBRSxBQUFHLElBQUMsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFVLEFBQUMsQUFBQyxBQUFDLGNBQ25FLEFBQVUsQUFBQyxZQUFDLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBVSxBQUFDLFlBQ2xDLEFBQUcsQUFBQyxLQUFDLEFBQUcsQUFBQyxLQUNULEFBQU0sQUFBQyxRQUFDLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBUyxVQUFDLEFBQU8sUUFBQyxBQUFHLElBQUMsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFVLEFBQUMsQUFBQyxlQUFHLENBQUMsQUFBQyxBQUFDLEdBQ3RFLEFBQVEsQUFBQyxVQUFDLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBVyxZQUFDLEFBQU8sUUFBQyxBQUFHLElBQUMsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFVLEFBQUMsQUFBQyxlQUFHLENBQUMsQUFBQyxBQUFDLEdBQzFFLEFBQVksQUFBQyxjQUFDLEFBQUksT0FBQyxBQUFLLE1BQUMsQUFBWSxBQUFDLEFBQ3pDLEFBQUMsQUFDZixBQUFDLEFBQUMsQUFFVixBQUFFLEFBQUssQUFBQyxBQUNYLEFBQUMsQUFDTixBQUFDLEFBQ0wsQUFBQztpQkFqQnVDLENBRjVCLEFBQUMsQUFBSyxBQUNGOzs7Ozs7RUFoQnVCLEFBQUssTUFBQyxBQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0LWJvb3RzdHJhcC9yZWFjdC1ib290c3RyYXAuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xvZGFzaC9sb2Rhc2guZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1RhYmxlfSBmcm9tIFwicmVhY3QtYm9vdHN0cmFwXCI7XG5pbXBvcnQgVGFibGVSb3cgZnJvbSBcIi4vVGFibGVSb3dcIjtcbmltcG9ydCB7SVJvd30gZnJvbSBcIi4vVGFibGVSb3dcIjtcblxuaW50ZXJmYWNlIElUYWJsZUJvZHlQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPFRhYmxlQm9keT4ge1xuICAgIHJvd3M6SVJvd1tdO1xuICAgIGlkUHJvcGVydHk6c3RyaW5nO1xuICAgIHNlbGVjdGVkSWRzOnN0cmluZ1tdO1xuICAgIHByb2JlZElkczpzdHJpbmdbXTtcbiAgICBvbk1vdXNlT3ZlcjooaWQ6c3RyaW5nLCBzdGF0dXM6Ym9vbGVhbikgPT4gdm9pZDtcbiAgICBvbkNsaWNrOihpZDpzdHJpbmcpID0+IHZvaWQ7XG4gICAgc2hvd0lkQ29sdW1uOmJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIElUYWJsZUJvZHlTdGF0ZSB7XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVCb2R5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElUYWJsZUJvZHlQcm9wcywgSVRhYmxlQm9keVN0YXRlPiB7XG5cbiAgICBwcml2YXRlIHRhYmxlUm93czp7W2lkOnN0cmluZ106IFRhYmxlUm93fTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklUYWJsZUJvZHlQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy50YWJsZVJvd3MgPSB7fTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6SlNYLkVsZW1lbnQge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yb3dzLm1hcCgocm93OklSb3csIGluZGV4Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxUYWJsZVJvd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17KHRhYmxlUm93OlRhYmxlUm93KSA9PiB7IHRoaXMudGFibGVSb3dzW3Jvd1t0aGlzLnByb3BzLmlkUHJvcGVydHldXSA9IHRhYmxlUm93IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5wcm9wcy5vbk1vdXNlT3Zlci5iaW5kKHRoaXMsIHJvd1t0aGlzLnByb3BzLmlkUHJvcGVydHldKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2suYmluZCh0aGlzLCByb3dbdGhpcy5wcm9wcy5pZFByb3BlcnR5XSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWRQcm9wZXJ0eT17dGhpcy5wcm9wcy5pZFByb3BlcnR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdz17cm93fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2JlZD17dGhpcy5wcm9wcy5wcm9iZWRJZHMuaW5kZXhPZihyb3dbdGhpcy5wcm9wcy5pZFByb3BlcnR5XSkgPiAtMX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZD17dGhpcy5wcm9wcy5zZWxlY3RlZElkcy5pbmRleE9mKHJvd1t0aGlzLnByb3BzLmlkUHJvcGVydHldKSA+IC0xfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dJZENvbHVtbj17dGhpcy5wcm9wcy5zaG93SWRDb2x1bW59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19