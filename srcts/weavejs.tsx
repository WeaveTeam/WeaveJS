import WeaveApp from "./weavejs/app/WeaveApp";
import WeaveMenuBar from "./weavejs/ui/menu/WeaveMenuBar";
import WeaveComponentRenderer from "./weavejs/ui/WeaveComponentRenderer";
import DynamicComponent from "./weavejs/ui/DynamicComponent";
import LinkableDynamicComponent from "./weavejs/ui/LinkableDynamicComponent";
import FlexibleLayout from "./weavejs/layout/FlexibleLayout";
import WindowLayout from "./weavejs/layout/WindowLayout";
import TabLayout from "./weavejs/layout/TabLayout";
import WeaveDataSourceEditor from "./weavejs/editor/WeaveDataSourceEditor";
import BarChartLegend from "./weavejs/tool/BarChartLegend";
import BoxWhiskerPlot from "./weavejs/tool/d3tool/BoxWhiskerPlot";
import ColorLegend from "./weavejs/tool/ColorLegend";
import C3BarChart from "./weavejs/tool/c3tool/C3BarChart";
import C3Gauge from "./weavejs/tool/c3tool/C3Gauge";
import C3Histogram from "./weavejs/tool/c3tool/C3Histogram";
import C3ColorHistogram from "./weavejs/tool/c3tool/C3ColorHistogram";
import C3LineChart from "./weavejs/tool/c3tool/C3LineChart";
import C3ScatterPlot from "./weavejs/tool/c3tool/C3ScatterPlot";
import C3PieChart from "./weavejs/tool/c3tool/C3PieChart";
import DataFilterTool from "./weavejs/tool/DataFilterTool";
import AttributeMenuTool from "./weavejs/tool/AttributeMenuTool";
import OpenLayersMapTool from "./weavejs/tool/oltool/OpenLayersMapTool";
import SessionStateMenuTool from "./weavejs/tool/SessionStateMenuTool";
import Sparkline from "./weavejs/tool/Sparkline";
import TableTool from "./weavejs/tool/TableTool";
import TextTool from "./weavejs/tool/TextTool";
import ToolTip from "./weavejs/ui/ToolTip";
import HSlider from "./weavejs/ui/slider/HSlider";
import VSlider from "./weavejs/ui/slider/VSlider";
import CheckBoxList from "./weavejs/ui/CheckBoxList";
import {HBox, VBox, Section, Label} from "./weavejs/ui/flexbox/FlexBox";
import List from "./weavejs/ui/List";
import Menu from "./weavejs/ui/menu/Menu";
import MenuBar from "./weavejs/ui/menu/MenuBar";
import PopupWindow from "./weavejs/dialog/PopupWindow";
import DataSourceManager from "./weavejs/editor/manager/DataSourceManager";
import StatefulTextField from "./weavejs/ui/StatefulTextField";
import WeaveTree from "./weavejs/ui/WeaveTree";
import MouseUtils from "./weavejs/util/MouseUtils";
import MiscUtils from "./weavejs/util/MiscUtils";
import DOMUtils from "./weavejs/util/DOMUtils";
import ReactUtils from "./weavejs/util/ReactUtils";
import WeaveArchive from "./weavejs/core/WeaveArchive";
import * as WeaveReactUtils from "./weavejs/util/WeaveReactUtils";
import * as React from "react";
import * as lodash from "lodash";
import * as moment from "moment";
import * as ol from "openlayers";
import * as jquery from "jquery";
import Div from "./weavejs/ui/Div";
import VendorPrefixer from "./weavejs/css/prefixer";
import IAltText, {AltTextConfig} from "./weavejs/api/ui/IAltText";
import PIXIScatterPlot from "./weavejs/tool/PIXIScatterPlot";

weavejs.util.StandardLib.lodash = lodash;
weavejs.util.StandardLib.ol = ol;
weavejs.util.DateUtils.moment = (moment as any)['default'];

// global jQuery needed for semantic
(window as any).jQuery = (jquery as any)["default"];
(window as any).$ = (jquery as any)["default"];

var cr = weavejs.WeaveAPI.ClassRegistry;
cr.registerClass(HBox, 'weavejs.ui.HBox');
cr.registerClass(VBox, 'weavejs.ui.VBox');
cr.registerClass(Section, 'weavejs.ui.Section');
cr.registerClass(Label, 'weavejs.ui.Label');
cr.registerClass(MouseUtils, 'weavejs.util.MouseUtils');
cr.registerClass(MiscUtils, 'weavejs.util.MiscUtils');
cr.registerClass(ReactUtils, 'weavejs.util.ReactUtils');
cr.registerClass(DOMUtils, 'weavejs.util.DOMUtils');

export
{
	WeaveApp,
	WeaveMenuBar,
	WeaveComponentRenderer,
	DynamicComponent,
	LinkableDynamicComponent,
	FlexibleLayout,
	WindowLayout,
	TabLayout,
	WeaveDataSourceEditor,
	IAltText,
	AltTextConfig,
	BarChartLegend,
	BoxWhiskerPlot,
	ColorLegend,
	C3BarChart,
	C3Gauge,
	C3Histogram,
	C3ColorHistogram,
	C3LineChart,
	C3ScatterPlot,
	C3PieChart,
	PIXIScatterPlot,
	DataFilterTool,
	OpenLayersMapTool,
	AttributeMenuTool,
	SessionStateMenuTool,
	Sparkline,
	TableTool,
	TextTool,
	ToolTip,
	
	HSlider,
	VSlider,
	CheckBoxList,
	HBox,
	VBox,
	Section,
	Label,
	List,
	Menu,
	MenuBar,
	PopupWindow,
	
	DataSourceManager,
	StatefulTextField,
	WeaveTree,
	
	MouseUtils,
	MiscUtils,
	DOMUtils,
	ReactUtils,
	WeaveReactUtils,
	WeaveArchive,
	Div,
	VendorPrefixer
};
