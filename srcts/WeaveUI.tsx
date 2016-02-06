/// <reference path="../typings/jszip/jszip.d.ts"/>
/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

import WeaveLayoutManager from "./WeaveLayoutManager";
import {IWeaveLayoutManagerProps, IWeaveLayoutManagerState} from "./WeaveLayoutManager";
import WeaveC3Barchart from "./tools/weave-c3-barchart";
import WeaveC3ScatterPlot from "./tools/weave-c3-scatterplot";
import WeaveC3ColorLegend from "./tools/weave-c3-colorlegend";
import WeaveC3BarChartLegend from "./tools/weave-c3-barchartlegend";
import WeaveC3LineChart from "./tools/weave-c3-linechart";
import WeaveC3PieChart from "./tools/weave-c3-piechart";
import WeaveC3Histogram from "./tools/weave-c3-histogram";
import WeaveOpenLayersMap from "./tools/OpenLayersMapTool";
import WeaveReactTable from "./tools/weave-react-table";
import SessionStateMenuTool from "./tools/weave-session-state-menu";
import StandardLib from "./utils/StandardLib";
import ui from "./react-ui/ui";
import JSZip from "jszip";

import * as React from "react";
import * as ReactDOM from "react-dom";

var stub:any = React;
weavejs.util.JS.JSZip = JSZip;

var loadLayout = function(weave:Weave,
                          fileName:string,
                          targetEltId:string,
                          callback:(component:React.Component<IWeaveLayoutManagerProps, IWeaveLayoutManagerState>) => any)
                 {

    function render():void
    {
        ReactDOM.render(
            <WeaveLayoutManager weave={weave}/>,
            document.getElementById(targetEltId),
            callback
        );
    }

    weavejs.core.WeaveArchive.loadUrl(weave, fileName).then(render, (e:Error) => {
        console.error(e)
    });

}

export {
    WeaveLayoutManager as Layout,
    WeaveC3Barchart as Barchart,
    WeaveC3ScatterPlot as ScatterPlot,
    WeaveC3ColorLegend as ColorLegend,
    WeaveC3LineChart as LineChart,
    WeaveC3PieChart as PieChart,
    WeaveC3Histogram as Histogram,
    WeaveOpenLayersMap as Map,
    WeaveReactTable as DataTable,
    SessionStateMenuTool as MenuTool,
    StandardLib,
    ui,
    loadLayout
};
