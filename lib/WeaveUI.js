"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadLayout = exports.ui = exports.StandardLib = exports.MenuTool = exports.DataTable = exports.Map = exports.Histogram = exports.PieChart = exports.LineChart = exports.ColorLegend = exports.ScatterPlot = exports.Barchart = exports.Layout = undefined;

var _WeaveLayoutManager = require("./WeaveLayoutManager");

var _WeaveLayoutManager2 = _interopRequireDefault(_WeaveLayoutManager);

var _weaveC3Barchart = require("./tools/weave-c3-barchart");

var _weaveC3Barchart2 = _interopRequireDefault(_weaveC3Barchart);

var _weaveC3Scatterplot = require("./tools/weave-c3-scatterplot");

var _weaveC3Scatterplot2 = _interopRequireDefault(_weaveC3Scatterplot);

var _weaveC3Colorlegend = require("./tools/weave-c3-colorlegend");

var _weaveC3Colorlegend2 = _interopRequireDefault(_weaveC3Colorlegend);

var _weaveC3Linechart = require("./tools/weave-c3-linechart");

var _weaveC3Linechart2 = _interopRequireDefault(_weaveC3Linechart);

var _weaveC3Piechart = require("./tools/weave-c3-piechart");

var _weaveC3Piechart2 = _interopRequireDefault(_weaveC3Piechart);

var _weaveC3Histogram = require("./tools/weave-c3-histogram");

var _weaveC3Histogram2 = _interopRequireDefault(_weaveC3Histogram);

var _OpenLayersMapTool = require("./tools/OpenLayersMapTool");

var _OpenLayersMapTool2 = _interopRequireDefault(_OpenLayersMapTool);

var _weaveReactTable = require("./tools/weave-react-table");

var _weaveReactTable2 = _interopRequireDefault(_weaveReactTable);

var _weaveSessionStateMenu = require("./tools/weave-session-state-menu");

var _weaveSessionStateMenu2 = _interopRequireDefault(_weaveSessionStateMenu);

var _StandardLib = require("./utils/StandardLib");

var _StandardLib2 = _interopRequireDefault(_StandardLib);

var _ui = require("./react-ui/ui");

var _ui2 = _interopRequireDefault(_ui);

var _jszip = require("jszip");

var _jszip2 = _interopRequireDefault(_jszip);

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _reactDom = require("react-dom");

var ReactDOM = _interopRequireWildcard(_reactDom);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global Weave, weavejs*/
var stub = React; /// <reference path="../typings/jszip/jszip.d.ts"/>
/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

weavejs.util.JS.JSZip = _jszip2.default;
var loadLayout = function loadLayout(weave, fileName, targetEltId, callback) {
    function render() {
        ReactDOM.render(React.createElement(_WeaveLayoutManager2.default, { weave: weave }), document.getElementById(targetEltId), callback);
    }
    weavejs.core.WeaveArchive.loadUrl(weave, fileName).then(render, function (e) {
        console.error(e);
    });
};
exports.Layout = _WeaveLayoutManager2.default;
exports.Barchart = _weaveC3Barchart2.default;
exports.ScatterPlot = _weaveC3Scatterplot2.default;
exports.ColorLegend = _weaveC3Colorlegend2.default;
exports.LineChart = _weaveC3Linechart2.default;
exports.PieChart = _weaveC3Piechart2.default;
exports.Histogram = _weaveC3Histogram2.default;
exports.Map = _OpenLayersMapTool2.default;
exports.DataTable = _weaveReactTable2.default;
exports.MenuTool = _weaveSessionStateMenu2.default;
exports.StandardLib = _StandardLib2.default;
exports.ui = _ui2.default;
exports.loadLayout = loadLayout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2VhdmVVSS5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmN0cy9XZWF2ZVVJLnRzeCJdLCJuYW1lcyI6WyJyZW5kZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFvQlksQUFBSyxBQUFNLEFBQU8sQUFDdkI7Ozs7SUFBSyxBQUFRLEFBQU0sQUFBVyxBQUVyQyxBQUF5Qjs7Ozs7OztBQUN6QixJQUFJLEFBQUksT0FBTyxBQUFLLEFBQUM7Ozs7O0FBQ3JCLEFBQU8sUUFBQyxBQUFJLEtBQUMsQUFBRSxHQUFDLEFBQUssQUFBRyxBQUFLLEFBQUM7QUFFOUIsSUFBSSxBQUFVLGlDQUFZLEFBQUssT0FBRSxBQUFRLFVBQUUsQUFBVyxhQUFFLEFBQVE7QUFFNUQ7QUFDSSxBQUFRLGlCQUFDLEFBQU0sT0FDWCxBQUFDLEFBQWtCLG9EQUFDLEFBQUssQUFBQyxPQUFDLEFBQUssQUFBQyxBQUFFLFVBQ25DLEFBQVEsU0FBQyxBQUFjLGVBQUMsQUFBVyxBQUFDLGNBQ3BDLEFBQVEsQUFDWCxBQUFDLEFBQ04sQUFBQzs7QUFFRCxBQUFPLFlBQUMsQUFBSSxLQUFDLEFBQVksYUFBQyxBQUFPLFFBQUMsQUFBSyxPQUFFLEFBQVEsQUFBQyxVQUFDLEFBQUksS0FBQyxBQUFNO0FBQzFELEFBQU8sZ0JBQUMsQUFBSyxNQUFDLEFBQUMsQUFBQyxBQUNwQixBQUFDLEFBQUMsQUFBQyxBQUVQLEFBQUMsQUFFRCxBQUNJLEFBQWtCO0tBUDhDLEFBQUM7Q0FWcEQ7UUFpQlMsQUFBTSxBQUM1QixBQUFlO1FBQUksQUFBUSxBQUMzQixBQUFrQjtRQUFJLEFBQVcsQUFDakMsQUFBa0I7UUFBSSxBQUFXLEFBQ2pDLEFBQWdCO1FBQUksQUFBUyxBQUM3QixBQUFlO1FBQUksQUFBUSxBQUMzQixBQUFnQjtRQUFJLEFBQVMsQUFDN0IsQUFBa0I7UUFBSSxBQUFHLEFBQ3pCLEFBQWU7UUFBSSxBQUFTLEFBQzVCLEFBQW9CO1FBQUksQUFBUTtRQUNoQyxBQUFXO1FBQ1gsQUFBRTtRQUNGLEFBQVUsQUFDWiIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2pzemlwL2pzemlwLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9yZWFjdC9yZWFjdC5kLnRzXCIvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvcmVhY3QvcmVhY3QtZG9tLmQudHNcIi8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy93ZWF2ZS93ZWF2ZWpzLmQudHNcIi8+XG5cbmltcG9ydCBXZWF2ZUxheW91dE1hbmFnZXIgZnJvbSBcIi4vV2VhdmVMYXlvdXRNYW5hZ2VyXCI7XG5pbXBvcnQgV2VhdmVDM0JhcmNoYXJ0IGZyb20gXCIuL3Rvb2xzL3dlYXZlLWMzLWJhcmNoYXJ0XCI7XG5pbXBvcnQgV2VhdmVDM1NjYXR0ZXJQbG90IGZyb20gXCIuL3Rvb2xzL3dlYXZlLWMzLXNjYXR0ZXJwbG90XCI7XG5pbXBvcnQgV2VhdmVDM0NvbG9yTGVnZW5kIGZyb20gXCIuL3Rvb2xzL3dlYXZlLWMzLWNvbG9ybGVnZW5kXCI7XG5pbXBvcnQgV2VhdmVDM0JhckNoYXJ0TGVnZW5kIGZyb20gXCIuL3Rvb2xzL3dlYXZlLWMzLWJhcmNoYXJ0bGVnZW5kXCI7XG5pbXBvcnQgV2VhdmVDM0xpbmVDaGFydCBmcm9tIFwiLi90b29scy93ZWF2ZS1jMy1saW5lY2hhcnRcIjtcbmltcG9ydCBXZWF2ZUMzUGllQ2hhcnQgZnJvbSBcIi4vdG9vbHMvd2VhdmUtYzMtcGllY2hhcnRcIjtcbmltcG9ydCBXZWF2ZUMzSGlzdG9ncmFtIGZyb20gXCIuL3Rvb2xzL3dlYXZlLWMzLWhpc3RvZ3JhbVwiO1xuaW1wb3J0IFdlYXZlT3BlbkxheWVyc01hcCBmcm9tIFwiLi90b29scy9PcGVuTGF5ZXJzTWFwVG9vbFwiO1xuaW1wb3J0IFdlYXZlUmVhY3RUYWJsZSBmcm9tIFwiLi90b29scy93ZWF2ZS1yZWFjdC10YWJsZVwiO1xuaW1wb3J0IFNlc3Npb25TdGF0ZU1lbnVUb29sIGZyb20gXCIuL3Rvb2xzL3dlYXZlLXNlc3Npb24tc3RhdGUtbWVudVwiO1xuaW1wb3J0IFN0YW5kYXJkTGliIGZyb20gXCIuL3V0aWxzL1N0YW5kYXJkTGliXCI7XG5pbXBvcnQgdWkgZnJvbSBcIi4vcmVhY3QtdWkvdWlcIjtcbmltcG9ydCBKU1ppcCBmcm9tIFwianN6aXBcIjtcblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgKiBhcyBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5cbi8qZ2xvYmFsIFdlYXZlLCB3ZWF2ZWpzKi9cbnZhciBzdHViOmFueSA9IFJlYWN0O1xud2VhdmVqcy51dGlsLkpTLkpTWmlwID0gSlNaaXA7XG5cbnZhciBsb2FkTGF5b3V0ID0gZnVuY3Rpb24od2VhdmUsIGZpbGVOYW1lLCB0YXJnZXRFbHRJZCwgY2FsbGJhY2spIHtcblxuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgICAgICAgPFdlYXZlTGF5b3V0TWFuYWdlciB3ZWF2ZT17d2VhdmV9Lz4sXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRFbHRJZCksXG4gICAgICAgICAgICBjYWxsYmFja1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHdlYXZlanMuY29yZS5XZWF2ZUFyY2hpdmUubG9hZFVybCh3ZWF2ZSwgZmlsZU5hbWUpLnRoZW4ocmVuZGVyLCBlID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgIH0pO1xuXG59XG5cbmV4cG9ydCB7XG4gICAgV2VhdmVMYXlvdXRNYW5hZ2VyIGFzIExheW91dCxcbiAgICBXZWF2ZUMzQmFyY2hhcnQgYXMgQmFyY2hhcnQsXG4gICAgV2VhdmVDM1NjYXR0ZXJQbG90IGFzIFNjYXR0ZXJQbG90LFxuICAgIFdlYXZlQzNDb2xvckxlZ2VuZCBhcyBDb2xvckxlZ2VuZCxcbiAgICBXZWF2ZUMzTGluZUNoYXJ0IGFzIExpbmVDaGFydCxcbiAgICBXZWF2ZUMzUGllQ2hhcnQgYXMgUGllQ2hhcnQsXG4gICAgV2VhdmVDM0hpc3RvZ3JhbSBhcyBIaXN0b2dyYW0sXG4gICAgV2VhdmVPcGVuTGF5ZXJzTWFwIGFzIE1hcCxcbiAgICBXZWF2ZVJlYWN0VGFibGUgYXMgRGF0YVRhYmxlLFxuICAgIFNlc3Npb25TdGF0ZU1lbnVUb29sIGFzIE1lbnVUb29sLFxuICAgIFN0YW5kYXJkTGliLFxuICAgIHVpLFxuICAgIGxvYWRMYXlvdXRcbn07XG4iXX0=
