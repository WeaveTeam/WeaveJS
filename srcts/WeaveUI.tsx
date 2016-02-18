/// <reference path="../typings/jszip/jszip.d.ts"/>
/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

import WeaveLayoutManager from "./WeaveLayoutManager";
import {IWeaveLayoutManagerProps, IWeaveLayoutManagerState} from "./WeaveLayoutManager";
import C3BarChart from "./tools/C3BarChart";
import C3ScatterPlot from "./tools/C3ScatterPlot";
import ColorLegend from "./tools/ColorLegend";
import BarChartLegend from "./tools/BarChartLegend";
import C3LineChart from "./tools/C3LineChart";
import C3PieChart from "./tools/C3PieChart";
import C3Histogram from "./tools/C3Histogram";
import C3Gauge from "./tools/C3Gauge";
import DataFilterTool from "./tools/DataFilterTool/DataFilterTool";
import WeaveOpenLayersMap from "./tools/OpenLayersMapTool";
import TableTool from "./tools/TableTool";
import SessionStateMenuTool from "./tools/SessionStateMenuTool";
import StandardLib from "./utils/StandardLib";
import ui from "./react-ui/ui";
import * as JSZip from "jszip";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as moment from "moment";

var stub:any = React;
weavejs.core.WeaveArchive.JSZip = (JSZip as any)['default'];
weavejs.util.DateUtils.moment = (moment as any)['default'];

Weave.registerAsyncClass(React.Component);

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
    C3BarChart as Barchart,
    C3ScatterPlot as ScatterPlot,
    ColorLegend as ColorLegend,
    C3LineChart as LineChart,
    C3PieChart as PieChart,
    C3Histogram as Histogram,
    C3Gauge as Gauge,
    WeaveOpenLayersMap as Map,
    TableTool as DataTable,
	DataFilterTool as DataFilter,
    SessionStateMenuTool as MenuTool,
    StandardLib,
    ui,
    loadLayout
};
