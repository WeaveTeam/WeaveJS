import WeavePanel from "./WeavePanel.js";
import * as WeavePanelManager from "./WeavePanelManager.js";
import WeaveC3Barchart from "./weave-c3-barchart.js";
import WeaveD3Barchart from "./weave-d3-barchart.js";
import WeaveC3ScatterPlot from "./weave-c3-scatterplot.js";
import WeaveD3ScatterPlot from "./weave-d3-scatterplot.js";
import WeaveC3ColorLegend from "./weave-c3-colorlegend.js";
import WeaveC3LineChart from "./weave-c3-linechart.js";
import SimpleAxisPlotter from "./weave/visualization/plotters/SimpleAxisPlotter.js";
import WeaveTextFilter from "./weave-text-filter.js";
import WeaveC3PieChart from "./weave-c3-piechart.js";
import WeaveC3Histogram from "./weave-c3-histogram.js";
import $ from "jquery";
import React from "react";
import Scatterplot from "./react-scatterplot.jsx";
import Linechart from "./react-linechart.jsx";
import Layout from "./react-flexible-layout/Layout.jsx";
import {WeaveLayoutManager} from "./WeaveLayoutManager.jsx";

$(function() {

    var weave = opener.weave;

    React.render(
        <WeaveLayoutManager weave={weave}/>, document.body
    );
});
