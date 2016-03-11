/// <reference path="../typings/jszip/jszip.d.ts"/>
/// <reference path="../typings/moment/moment.d.ts"/>
/// <reference path="../typings/react/react.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/weave/weavejs.d.ts"/>

// Tools
import C3BarChart from "./tools/C3BarChart";
import C3ScatterPlot from "./tools/C3ScatterPlot";
import ColorLegend from "./tools/ColorLegend";
import BarChartLegend from "./tools/BarChartLegend"
import C3LineChart from "./tools/C3LineChart";
import C3PieChart from "./tools/C3PieChart";
import C3Histogram from "./tools/C3Histogram";
import SessionStateMenuTool from "./tools/SessionStateMenuTool";
import OpenLayersMapTool from "./tools/OpenLayersMapTool";
import TableTool from "./tools/TableTool";
import TextTool from "./tools/TextTool";
import DataFilterTool from "./tools/DataFilterTool/DataFilterTool";
import C3Gauge from "./tools/C3Gauge";
import BoxWhiskerPlot from "./tools/BoxWhiskerPlot";

// Editors
import WeaveDataSourceEditor from "./editors/WeaveDataSourceEditor";

import WeaveLayoutManager from "./WeaveLayoutManager";
import {IWeaveLayoutManagerProps, IWeaveLayoutManagerState} from "./WeaveLayoutManager";
import MiscUtils from "./utils/MiscUtils";
import DOMUtils from "./utils/DOMUtils";
import ReactUtils from "./utils/ReactUtils";
import * as WeaveReactUtils from "./utils/WeaveReactUtils";
import ui from "./react-ui/ui";
import * as JSZip from "jszip";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as moment from "moment";

weavejs.core.WeaveArchive.JSZip = (JSZip as any)['default'];
weavejs.util.DateUtils.moment = (moment as any)['default'];

export
{
    WeaveLayoutManager,
    C3BarChart,
    C3ScatterPlot,
    ColorLegend,
	BarChartLegend,
    C3LineChart,
    C3PieChart,
    C3Histogram,
    C3Gauge,
	BoxWhiskerPlot,
    OpenLayersMapTool,
    TableTool,
	DataFilterTool,
    SessionStateMenuTool,
	TextTool,
    WeaveDataSourceEditor,
    MiscUtils,
    DOMUtils,
	ReactUtils,
	WeaveReactUtils,
    ui
};
