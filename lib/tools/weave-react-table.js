"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _WeaveTool = require("../WeaveTool");

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _ReactBootStrapTable = require("../react-bootstrap-datatable/ReactBootStrapTable");

var _ReactBootStrapTable2 = _interopRequireDefault(_ReactBootStrapTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../typings/react/react.d.ts"/>
/// <reference path="../../typings/react/react-dom.d.ts"/>
///<reference path="../../typings/weave/weavejs.d.ts"/>

var WeaveReactTable = function (_React$Component) {
    _inherits(WeaveReactTable, _React$Component);

    function WeaveReactTable(props) {
        _classCallCheck(this, WeaveReactTable);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeaveReactTable).call(this, props));

        _this.toolPath = props.toolPath;
        _this.columnsPath = _this.toolPath.push("columns");
        _this.state = {
            data: []
        };
        return _this;
    }

    _createClass(WeaveReactTable, [{
        key: "handleMissingSessionStateProperties",
        value: function handleMissingSessionStateProperties(newState) {}
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.columnsPath.addCallback(this, this.dataChanged, true);
            this.toolPath.push("filteredKeySet").addCallback(this, this.dataChanged, true);
            this.toolPath.push("selectionKeySet").addCallback(this, this.forceUpdate, true);
            this.toolPath.probe_keyset.addCallback(this, this.forceUpdate, true);
            this.toolPath.getObject("filteredKeySet").setColumnKeySources(this.toolPath.getObject("columns").getObjects());
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {}
    }, {
        key: "dataChanged",
        value: function dataChanged() {
            this.setState({
                data: this.columnsPath.retrieveRecords(this.columnsPath.getNames(), { keySet: this.toolPath.push("filteredKeySet"), dataType: "string" })
            });
        }
        // customFormat(cell, row) {
        //     if(typeof cell === "number") {
        //         return round(cell, 2)
        //     } else {
        //         return cell;
        //     }
        // }

    }, {
        key: "handleProbe",
        value: function handleProbe(ids) {
            this.toolPath.probe_keyset.setKeys(ids);
        }
    }, {
        key: "handleSelection",
        value: function handleSelection(ids) {
            this.toolPath.push("selectionKeySet", null).setKeys(ids);
        }
    }, {
        key: "render",
        value: function render() {
            var columns = {};
            columns["id"] = "Key";
            this.columnsPath.getChildren().forEach(function (columnPath) {
                columns[columnPath.getPath().pop()] = columnPath.getObject().getMetadata('title');
            });
            return React.createElement(_ReactBootStrapTable2.default, { columnTitles: columns, rows: this.state.data, idProperty: "id", height: this.props.style.height, striped: true, hover: true, bordered: true, condensed: true, selectedIds: this.toolPath.push("selectionKeySet", null).getKeys(), probedIds: this.toolPath.probe_keyset.getKeys(), onProbe: this.handleProbe.bind(this), onSelection: this.handleSelection.bind(this), showIdColumn: false });
        }
    }, {
        key: "title",
        get: function get() {
            return (this.toolPath.getType('panelTitle') ? this.toolPath.getState('panelTitle') : '') || this.toolPath.getPath().pop();
        }
    }]);

    return WeaveReactTable;
}(React.Component);

exports.default = WeaveReactTable;

(0, _WeaveTool.registerToolImplementation)("weave.visualization.tools::TableTool", WeaveReactTable);
//Weave.registerClass("weavejs.tools.TableTool", WeaveReactTable, [weavejs.api.core.ILinkableObjectWithNewProperties]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VhdmUtcmVhY3QtdGFibGUuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjdHMvdG9vbHMvd2VhdmUtcmVhY3QtdGFibGUudHN4Il0sIm5hbWVzIjpbIldlYXZlUmVhY3RUYWJsZSIsIldlYXZlUmVhY3RUYWJsZS5jb25zdHJ1Y3RvciIsIldlYXZlUmVhY3RUYWJsZS5oYW5kbGVNaXNzaW5nU2Vzc2lvblN0YXRlUHJvcGVydGllcyIsIldlYXZlUmVhY3RUYWJsZS50aXRsZSIsIldlYXZlUmVhY3RUYWJsZS5jb21wb25lbnREaWRNb3VudCIsIldlYXZlUmVhY3RUYWJsZS5jb21wb25lbnREaWRVcGRhdGUiLCJXZWF2ZVJlYWN0VGFibGUuZGF0YUNoYW5nZWQiLCJXZWF2ZVJlYWN0VGFibGUuaGFuZGxlUHJvYmUiLCJXZWF2ZVJlYWN0VGFibGUuaGFuZGxlU2VsZWN0aW9uIiwiV2VhdmVSZWFjdFRhYmxlLnJlbmRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBVVksQUFBSyxBQUFNLEFBQU8sQUFHdkIsQUFBbUIsQUFBTSxBQUFrRCxBQU1sRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtJLDZCQUFZLEFBQW1COzs7dUdBQ3JCLEFBQUssQUFBQyxBQUFDOztBQUNiLEFBQUksY0FBQyxBQUFRLFdBQUcsQUFBSyxNQUFDLEFBQVEsQUFBQztBQUMvQixBQUFJLGNBQUMsQUFBVyxjQUFHLEFBQUksTUFBQyxBQUFRLFNBQUMsQUFBSSxLQUFDLEFBQVMsQUFBQyxBQUFDO0FBQ2pELEFBQUksY0FBQyxBQUFLLFFBQUc7QUFDVCxBQUFJLGtCQUFFLEFBQUUsQUFDWCxBQUFDLEFBQ04sQUFBQyxBQUVTLEFBQW1DO1VBUnpDOzs7Ozs7NERBUTBDLEFBQVksVUFHN0QsQUFBQyxBQUVFLEFBQUksQUFBSzs7OztBQUtMLEFBQUksaUJBQUMsQUFBVyxZQUFDLEFBQVcsWUFBQyxBQUFJLE1BQUUsQUFBSSxLQUFDLEFBQVcsYUFBRSxBQUFJLEFBQUMs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QUMsQUFBSSxLQUFDLEFBQVcsWUFBQyxBQUFJLEtBQUMsQUFBSSxBQUFDLEFBQUMsT0FDckMsQUFBVyxBQUFDLGFBQUMsQUFBSSxLQUFDLEFBQWUsZ0JBQUMsQUFBSSxLQUFDLEFBQUksQUFBQyxBQUFDLE9BQzdDLEFBQVksQUFBQyxjQUFDLEFBQUssQUFBQyxBQUN0QyxBQUNkLEFBQUMsQUFDTCxBQUFDLEFBRUQ7Ozs7O0FBakVPLEFBQU0sbUJBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQU8sUUFBQyxBQUFZLEFBQUMsZ0JBQUcsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBWSxBQUFDLGdCQUFHLEFBQUUsQUFBQyxPQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBTyxBQUFFLFVBQUMsQUFBRyxBQUFFLEFBQUMsQUFDN0gsQUFBQyxBQUVELEFBQWlCOzs7OztFQXZCUyxBQUFLLE1BQUMsQUFBUzs7a0JBcUY5QixBQUFlLEFBQUM7O0FBRS9CLEFBQTBCLDJDQUFDLEFBQXNDLHdDQUFFLEFBQWUsQUFBQyxBQUFDLEFBQ3BGLEFBQXVIIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbG9kYXNoL2xvZGFzaC5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvcmVhY3QvcmVhY3QuZC50c1wiLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3JlYWN0L3JlYWN0LWRvbS5kLnRzXCIvPlxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG5cblxuaW1wb3J0IHtJVmlzVG9vbCwgSVZpc1Rvb2xQcm9wcywgSVZpc1Rvb2xTdGF0ZX0gZnJvbSBcIi4vSVZpc1Rvb2xcIjtcblxuaW1wb3J0IHtyZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbn0gZnJvbSBcIi4uL1dlYXZlVG9vbFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCAqIGFzIFJlYWN0RE9NIGZyb20gXCJyZWFjdC1kb21cIjtcbmltcG9ydCB7cm91bmR9IGZyb20gXCJkM1wiO1xuaW1wb3J0IFJlYWN0Qm9vdHN0cmFwVGFibGUgZnJvbSBcIi4uL3JlYWN0LWJvb3RzdHJhcC1kYXRhdGFibGUvUmVhY3RCb290U3RyYXBUYWJsZVwiO1xuXG5pbnRlcmZhY2UgSURhdGFUYWJsZVN0YXRlIGV4dGVuZHMgSVZpc1Rvb2xTdGF0ZSB7XG4gICAgZGF0YTp7W2tleTpzdHJpbmddOiBzdHJpbmd9W11cbn1cblxuY2xhc3MgV2VhdmVSZWFjdFRhYmxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElWaXNUb29sUHJvcHMsIElEYXRhVGFibGVTdGF0ZT4gaW1wbGVtZW50cyBJVmlzVG9vbCB7XG5cbiAgICBwcml2YXRlIHRvb2xQYXRoOldlYXZlUGF0aDtcbiAgICBwcml2YXRlIGNvbHVtbnNQYXRoOldlYXZlUGF0aDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOklWaXNUb29sUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnRvb2xQYXRoID0gcHJvcHMudG9vbFBhdGg7XG4gICAgICAgIHRoaXMuY29sdW1uc1BhdGggPSB0aGlzLnRvb2xQYXRoLnB1c2goXCJjb2x1bW5zXCIpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZGF0YTogW11cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlTWlzc2luZ1Nlc3Npb25TdGF0ZVByb3BlcnRpZXMobmV3U3RhdGU6YW55KVxuXHR7XG5cblx0fVxuXG4gICAgZ2V0IHRpdGxlKCk6c3RyaW5nIHtcbiAgICAgICByZXR1cm4gKHRoaXMudG9vbFBhdGguZ2V0VHlwZSgncGFuZWxUaXRsZScpID8gdGhpcy50b29sUGF0aC5nZXRTdGF0ZSgncGFuZWxUaXRsZScpIDogJycpIHx8IHRoaXMudG9vbFBhdGguZ2V0UGF0aCgpLnBvcCgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmNvbHVtbnNQYXRoLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZGF0YUNoYW5nZWQsIHRydWUpO1xuICAgICAgICB0aGlzLnRvb2xQYXRoLnB1c2goXCJmaWx0ZXJlZEtleVNldFwiKS5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLmRhdGFDaGFuZ2VkLCB0cnVlKTtcbiAgICAgICAgdGhpcy50b29sUGF0aC5wdXNoKFwic2VsZWN0aW9uS2V5U2V0XCIpLmFkZENhbGxiYWNrKHRoaXMsIHRoaXMuZm9yY2VVcGRhdGUsIHRydWUpO1xuICAgICAgICB0aGlzLnRvb2xQYXRoLnByb2JlX2tleXNldC5hZGRDYWxsYmFjayh0aGlzLCB0aGlzLmZvcmNlVXBkYXRlLCB0cnVlKTtcblxuICAgICAgICB0aGlzLnRvb2xQYXRoLmdldE9iamVjdChcImZpbHRlcmVkS2V5U2V0XCIpLnNldENvbHVtbktleVNvdXJjZXModGhpcy50b29sUGF0aC5nZXRPYmplY3QoXCJjb2x1bW5zXCIpLmdldE9iamVjdHMoKSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuXG4gICAgfVxuXG4gICAgZGF0YUNoYW5nZWQoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZGF0YTogdGhpcy5jb2x1bW5zUGF0aC5yZXRyaWV2ZVJlY29yZHModGhpcy5jb2x1bW5zUGF0aC5nZXROYW1lcygpLCB7a2V5U2V0OiB0aGlzLnRvb2xQYXRoLnB1c2goXCJmaWx0ZXJlZEtleVNldFwiKSwgZGF0YVR5cGU6IFwic3RyaW5nXCJ9KVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBjdXN0b21Gb3JtYXQoY2VsbCwgcm93KSB7XG4gICAgLy8gICAgIGlmKHR5cGVvZiBjZWxsID09PSBcIm51bWJlclwiKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gcm91bmQoY2VsbCwgMilcbiAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBjZWxsO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuXG4gICAgaGFuZGxlUHJvYmUoaWRzOnN0cmluZ1tdKSB7XG4gICAgICAgIHRoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LnNldEtleXMoaWRzKTtcbiAgICB9XG5cbiAgICBoYW5kbGVTZWxlY3Rpb24oaWRzOnN0cmluZ1tdKSB7XG4gICAgICAgIHRoaXMudG9vbFBhdGgucHVzaChcInNlbGVjdGlvbktleVNldFwiLCBudWxsKS5zZXRLZXlzKGlkcyk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuXG4gICAgICAgIHZhciBjb2x1bW5zOntbY29sdW1uSWQ6c3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuXG4gICAgICAgIGNvbHVtbnNbXCJpZFwiXSA9IFwiS2V5XCI7XG5cbiAgICAgICAgdGhpcy5jb2x1bW5zUGF0aC5nZXRDaGlsZHJlbigpLmZvckVhY2goKGNvbHVtblBhdGg6V2VhdmVQYXRoKSA9PiB7XG4gICAgICAgICAgICBjb2x1bW5zW2NvbHVtblBhdGguZ2V0UGF0aCgpLnBvcCgpXSA9IGNvbHVtblBhdGguZ2V0T2JqZWN0KCkuZ2V0TWV0YWRhdGEoJ3RpdGxlJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8UmVhY3RCb290c3RyYXBUYWJsZSBjb2x1bW5UaXRsZXM9e2NvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dzPXt0aGlzLnN0YXRlLmRhdGF9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZFByb3BlcnR5PVwiaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXt0aGlzLnByb3BzLnN0eWxlLmhlaWdodH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmlwZWQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3Zlcj17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcmVkPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZGVuc2VkPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJZHM9e3RoaXMudG9vbFBhdGgucHVzaChcInNlbGVjdGlvbktleVNldFwiLCBudWxsKS5nZXRLZXlzKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9iZWRJZHM9e3RoaXMudG9vbFBhdGgucHJvYmVfa2V5c2V0LmdldEtleXMoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJvYmU9e3RoaXMuaGFuZGxlUHJvYmUuYmluZCh0aGlzKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0aW9uPXt0aGlzLmhhbmRsZVNlbGVjdGlvbi5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0lkQ29sdW1uPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2VhdmVSZWFjdFRhYmxlO1xuXG5yZWdpc3RlclRvb2xJbXBsZW1lbnRhdGlvbihcIndlYXZlLnZpc3VhbGl6YXRpb24udG9vbHM6OlRhYmxlVG9vbFwiLCBXZWF2ZVJlYWN0VGFibGUpO1xuLy9XZWF2ZS5yZWdpc3RlckNsYXNzKFwid2VhdmVqcy50b29scy5UYWJsZVRvb2xcIiwgV2VhdmVSZWFjdFRhYmxlLCBbd2VhdmVqcy5hcGkuY29yZS5JTGlua2FibGVPYmplY3RXaXRoTmV3UHJvcGVydGllc10pO1xuIl19
