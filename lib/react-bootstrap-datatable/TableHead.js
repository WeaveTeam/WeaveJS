"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactVendorPrefix = require("react-vendor-prefix");

var Prefixer = _interopRequireWildcard(_reactVendorPrefix);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react-bootstrap/react-bootstrap.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react-vendor-prefix/react-vendor-prefix.d.ts"/>

var baseStyle = {
    userSelect: "none"
};

var TableHead = function (_React$Component) {
    _inherits(TableHead, _React$Component);

    function TableHead(props) {
        _classCallCheck(this, TableHead);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(TableHead).call(this, props));
    }

    _createClass(TableHead, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var headers = [];
            var keys = Object.keys(this.props.columnTitles);
            if (!this.props.showIdColumn) {
                keys.splice(keys.indexOf(this.props.idProperty), 1);
            }
            headers = keys.map(function (columnId) {
                return React.createElement(
                    "th",
                    { key: columnId },
                    _this2.props.columnTitles[columnId]
                );
            });
            return React.createElement(
                "thead",
                { className: "table-header", style: Prefixer.prefix({ styles: baseStyle }).styles },
                React.createElement(
                    "tr",
                    null,
                    headers
                )
            );
        }
    }]);

    return TableHead;
}(React.Component);

exports.default = TableHead;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFibGVIZWFkLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyY3RzL3JlYWN0LWJvb3RzdHJhcC1kYXRhdGFibGUvVGFibGVIZWFkLnRzeCJdLCJuYW1lcyI6WyJUYWJsZUhlYWQiLCJUYWJsZUhlYWQuY29uc3RydWN0b3IiLCJUYWJsZUhlYWQucmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBS1ksQUFBSyxBQUFNLEFBQU8sQUFHdkI7Ozs7SUFBSyxBQUFRLEFBQU0sQUFBcUI7Ozs7Ozs7Ozs7Ozs7QUFnQi9DLGdCQUFnQztBQUM1QixBQUFVLGdCQUFFLEFBQU0sQUFDckIsQUFBQyxBQUVGO0NBSk0sQUFBUzs7Ozs7QUFNWCx1QkFBWSxBQUFxQixPQUM3Qjs7OzRGQUFNLEFBQUssQUFBQyxBQUFDLEFBQ2pCLEFBQUMsQUFFRCxBQUFNOzs7Ozs7OztBQUVGLGdCQUFJLEFBQU8sVUFBaUIsQUFBRSxBQUFDO0FBRS9CLGdCQUFJLEFBQUksT0FBWSxBQUFNLE9BQUMsQUFBSSxLQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBWSxBQUFDLEFBQUM7QUFDekQsQUFBRSxnQkFBQyxDQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBWSxBQUFDLGNBQUMsQUFBQztBQUMxQixBQUFJLHFCQUFDLEFBQU0sT0FBQyxBQUFJLEtBQUMsQUFBTyxRQUFDLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBVSxBQUFDLGFBQUUsQUFBQyxBQUFDLEFBQUMsQUFDeEQsQUFBQzs7QUFDRCxBQUFPLHNCQUFHLEFBQUksS0FBQyxBQUFHLGNBQUUsQUFBZTtBQUMvQixBQUFNLHVCQUFDLEFBQUMsQUFBRTs7c0JBQUMsQUFBRyxBQUFDLEtBQUMsQUFBUSxBQUFDLEFBQUM7b0JBQUMsQUFBSSxPQUFDLEFBQUssTUFBQyxBQUFZLGFBQUMsQUFBUSxBQUFDLEFBQUMsQUFBRSxBQUFFLEFBQUMsQUFBQyxBQUN2RSxBQUFDLEFBQUMsQUFBQzs7YUFGZ0I7QUFJbkIsQUFBTSxBQUFDOztrQkFDSSxBQUFTLFdBQUMsQUFBYyxnQkFBQyxBQUFLLEFBQUMsT0FBQyxBQUFRLFNBQUMsQUFBTSxPQUFDLEVBQUMsQUFBTSxRQUFFLEFBQVMsQUFBQyxBQUFDLGFBQUMsQUFBTSxBQUFDLEFBQy9FO2dCQUFBLEFBQUMsQUFBRSxBQUNDOzs7b0JBQ0ksQUFBTyxBQUVmLEFBQUUsQUFBRSxBQUNSLEFBQUUsQUFBSyxBQUFDLEFBQ1gsQUFBQyxBQUNOLEFBQUMsQUFDTCxBQUFDO2lCQVRXLEFBQUMsQUFBSzs7Ozs7O0VBbkJxQixBQUFLLE1BQUMsQUFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC1ib290c3RyYXAvcmVhY3QtYm9vdHN0cmFwLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9sb2Rhc2gvbG9kYXNoLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9yZWFjdC12ZW5kb3ItcHJlZml4L3JlYWN0LXZlbmRvci1wcmVmaXguZC50c1wiLz5cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1RhYmxlfSBmcm9tIFwicmVhY3QtYm9vdHN0cmFwXCI7XG5pbXBvcnQge0NTU1Byb3BlcnRpZXN9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUHJlZml4ZXIgZnJvbSBcInJlYWN0LXZlbmRvci1wcmVmaXhcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJQ29sdW1uVGl0bGVzIHtcbiAgICBbY29sdW1uSWQ6IHN0cmluZ10gOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIElUYWJsZUhlYWRQcm9wcyBleHRlbmRzIFJlYWN0LlByb3BzPFRhYmxlSGVhZD4ge1xuICAgIGNvbHVtblRpdGxlczpJQ29sdW1uVGl0bGVzO1xuICAgIHNob3dJZENvbHVtbjpib29sZWFuO1xuICAgIGlkUHJvcGVydHk6c3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVRhYmxlSGVhZFN0YXRlIHtcblxufVxuXG5jb25zdCBiYXNlU3R5bGU6Q1NTUHJvcGVydGllcyA9IHtcbiAgICB1c2VyU2VsZWN0OiBcIm5vbmVcIlxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVIZWFkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElUYWJsZUhlYWRQcm9wcywgSVRhYmxlSGVhZFN0YXRlPiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczpJVGFibGVIZWFkUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cblxuICAgIHJlbmRlcigpOkpTWC5FbGVtZW50IHtcblxuICAgICAgICB2YXIgaGVhZGVyczpKU1guRWxlbWVudFtdID0gW107XG5cbiAgICAgICAgdmFyIGtleXM6c3RyaW5nW10gPSBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmNvbHVtblRpdGxlcyk7XG4gICAgICAgIGlmKCF0aGlzLnByb3BzLnNob3dJZENvbHVtbikge1xuICAgICAgICAgICAga2V5cy5zcGxpY2Uoa2V5cy5pbmRleE9mKHRoaXMucHJvcHMuaWRQcm9wZXJ0eSksIDEpO1xuICAgICAgICB9XG4gICAgICAgIGhlYWRlcnMgPSBrZXlzLm1hcCgoY29sdW1uSWQ6c3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPHRoIGtleT17Y29sdW1uSWR9Pnt0aGlzLnByb3BzLmNvbHVtblRpdGxlc1tjb2x1bW5JZF19PC90aD47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8dGhlYWQgY2xhc3NOYW1lPVwidGFibGUtaGVhZGVyXCIgc3R5bGU9e1ByZWZpeGVyLnByZWZpeCh7c3R5bGVzOiBiYXNlU3R5bGV9KS5zdHlsZXN9ID5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==
