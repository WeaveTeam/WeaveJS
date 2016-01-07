import WeaveLayoutManager from "./WeaveLayoutManager";
import WeaveC3Barchart from "../outts/tools/weave-c3-barchart.jsx";
import WeaveC3ScatterPlot from "../outts/tools/weave-c3-scatterplot.jsx";
import WeaveC3ColorLegend from "../outts/tools/weave-c3-colorlegend.jsx";
import WeaveC3LineChart from "./tools/weave-c3-linechart.jsx";
import WeaveC3PieChart from "../outts/tools/weave-c3-piechart.jsx";
import WeaveC3Histogram from "../outts/tools/weave-c3-histogram.jsx";
import WeaveOpenLayersMap from "./tools/map.js";
import WeaveReactTable from "./tools/weave-react-table.jsx";
import SessionStateMenuTool from "./tools/weave-session-state-menu.jsx";
import JSZip from "jszip";

import React from "react";
import ReactDOM from "react-dom";

/*global Weave, weavejs*/

weavejs.util.JS.JSZip = JSZip;

var WeaveUI = {
    Layout: WeaveLayoutManager,
    Barchart: WeaveC3Barchart,
    ScatterPlot: WeaveC3ScatterPlot,
    ColorLegend: WeaveC3ColorLegend,
    LineChart: WeaveC3LineChart,
    PieChart: WeaveC3PieChart,
    Histogram: WeaveC3Histogram,
    Map: WeaveOpenLayersMap,
    DataTable: WeaveReactTable,
    MenuTool: SessionStateMenuTool
};

WeaveUI.loadLayout = function(weave, fileName, targetEltId) {

    function render() {
        ReactDOM.render(
            <WeaveUI.Layout weave={weave}/>, document.getElementById(targetEltId)
        );
    }

    weavejs.core.WeaveArchive.loadUrl(weave, fileName).then(render, e => {
        console.error(e)
    });

}

// namespace WeaveUI
window.WeaveUI = WeaveUI;

export default WeaveUI;
