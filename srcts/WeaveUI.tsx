/// <reference path="../typings/jszip/jszip.d.ts"/>
/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/weave/Weave.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

import WeaveLayoutManager from "./WeaveLayoutManager";
import WeaveC3Barchart from "./tools/weave-c3-barchart";
import WeaveC3ScatterPlot from "./tools/weave-c3-scatterplot";
import WeaveC3ColorLegend from "./tools/weave-c3-colorlegend";
import WeaveC3LineChart from "./tools/weave-c3-linechart";
import WeaveC3PieChart from "./tools/weave-c3-piechart";
import WeaveC3Histogram from "./tools/weave-c3-histogram";
import WeaveOpenLayersMap from "./tools/OpenLayersMapTool";
import WeaveReactTable from "./tools/weave-react-table";
import SessionStateMenuTool from "./tools/weave-session-state-menu";
import StandardLib from "./utils/StandardLib";
import * as JSZip from "jszip";

import * as React from "react";
import * as ReactDOM from "react-dom";

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

export var loadLayout = function(weave:Weave, fileName:string, targetEltId:string, callback:() => void) {

    function render() {
        ReactDOM.render(
            <Layout weave={weave}/>,
            document.getElementById(targetEltId),
            callback
        );
    }

    if(!fileName && weave) {
        render();
    }

    weavejs.core.WeaveArchive.loadUrl(weave, fileName).then(render, (e:Error) => {
        console.error(e)
    });
};
