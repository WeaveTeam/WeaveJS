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

// namespace WeaveUI
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

window.WeaveUI = WeaveUI;
export default WeaveUI;
