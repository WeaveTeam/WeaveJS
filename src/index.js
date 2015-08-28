import WeavePanel from "./WeavePanel.js";
import * as WeavePanelManager from "./WeavePanelManager.js";
import WeaveC3Barchart from "./weave-c3-barchart.js";
import WeaveD3Barchart from "./weave-d3-barchart.js";
import WeaveC3ScatterPlot from "./weave-c3-scatterplot.js";
import WeaveD3ScatterPlot from "./weave-d3-scatterplot.js";
import WeaveC3ColorLegend from "./weave-c3-colorlegend.js";
import WeaveC3LineChart from "./weave-c3-linechart.js";
import SimpleAxisPlotter from "./weave/visualization/plotters/SimpleAxisPlotter.js";
import WeaveC3PieChart from "./weave-c3-piechart.js";
import WeaveC3Histogram from "./weave-c3-histogram.js";
import $ from "jquery";
import React from "react";
import Scatterplot from "./react-scatterplot.jsx";

$(function() {

	var data = {
		bindTo: "",
        data: {
           columns: [
                ["data1", 30, 200, 100, 400, 150, 250],
                ["data2", 50, 20, 10, 40, 15, 25]
            ],
            type: "scatter"
        },
        size: {
            width: 500,
            height: 500
        }
    };

	React.render(
		<div>
		<Scatterplot config = {data}/>
		</div>, $("#react")[0]
	);
});

window.WeavePanelManager = WeavePanelManager;
