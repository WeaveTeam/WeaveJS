import WeaveLayoutManager from "./WeaveLayoutManager";
import WeaveC3Barchart from "../outts/tools/weave-c3-barchart.jsx";
import WeaveC3ScatterPlot from "../outts/tools/weave-c3-scatterplot.jsx";
import WeaveC3ColorLegend from "../outts/tools/weave-c3-colorlegend.jsx";
import WeaveC3LineChart from "../outts/tools/weave-c3-linechart.jsx";
import WeaveC3PieChart from "../outts/tools/weave-c3-piechart.jsx";
import WeaveC3Histogram from "../outts/tools/weave-c3-histogram.jsx";
import WeaveOpenLayersMap from "./tools/map.js";
import WeaveReactTable from "./tools/weave-react-table.jsx";
import SessionStateMenuTool from "../outts/tools/weave-session-state-menu.jsx";
import StandardLib from "../outts/utils/StandardLib.js";
import JSZip from "jszip";

import React from "react";
import ReactDOM from "react-dom";

/*global Weave, weavejs*/

weavejs.util.JS.JSZip = JSZip;

// var WeaveUI = {
//     Layout: WeaveLayoutManager,
//     Barchart: WeaveC3Barchart,
//     ScatterPlot: WeaveC3ScatterPlot,
//     ColorLegend: WeaveC3ColorLegend,
//     LineChart: WeaveC3LineChart,
//     PieChart: WeaveC3PieChart,
//     Histogram: WeaveC3Histogram,
//     Map: WeaveOpenLayersMap,
//     DataTable: WeaveReactTable,
//     MenuTool: SessionStateMenuTool,
//     getUrlParams: StandardLib.getUrlParams,
//     loadLayout: function(weave, fileName, targetEltId, callback) {
//
//         function render() {
//             ReactDOM.render(
//                 <WeaveUI.Layout weave={weave}/>,
//                 document.getElementById(targetEltId),
//                 callback
//             );
//         }
//
//         weavejs.core.WeaveArchive.loadUrl(weave, fileName).then(render, e => {
//             console.error(e)
//         });
//
//     }
// };
//
// // namespace WeaveUI
// export default WeaveUI;

export var Layout = WeaveLayoutManager;
export var Barchart = WeaveC3Barchart;
export var ScatterPlot = WeaveC3ScatterPlot;
export var ColorLegend = WeaveC3ColorLegend;
export var LineChart = WeaveC3LineChart;
export var PieChart = WeaveC3PieChart;
export var Histogram = WeaveC3Histogram;
export var Map = WeaveOpenLayersMap;
export var DataTable = WeaveReactTable;
export var MenuTool = SessionStateMenuTool;
export var getUrlParams = StandardLib.getUrlParams;

export var loadLayout = function(weave, fileName, targetEltId, callback) {

    function render() {
        ReactDOM.render(
            <WeaveUI.Layout weave={weave}/>,
            document.getElementById(targetEltId),
            callback
        );
    }

    if(!fileName && weave) {
        render();
    }

    weavejs.core.WeaveArchive.loadUrl(weave, fileName).then(render, e => {
        console.error(e)
    });
};
