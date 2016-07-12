/// <reference path="../typings/FileSaver/FileSaver.d.ts"/>
/// <reference path="../typings/jszip/jszip.d.ts"/>
/// <reference path="../typings/clipboard/clipboard.d.ts"/>
/// <reference path="../typings/classnames/classnames.d.ts"/>
/// <reference path="../typings/react-color/react-color.d.ts"/>
/// <reference path="../typings/rc-slider/rc-slider.d.ts"/>
/// <reference path="../typings/react-dropzone/react-dropzone.d.ts"/>
/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/react/react-addons-update.d.ts"/>
/// <reference path="../typings/react-sparklines/react-sparklines.d.ts"/>
/// <reference path="../typings/openlayers/openlayers.d.ts"/>
/// <reference path="../typings/proj4/proj4.d.ts"/>
/// <reference path="../typings/lodash/lodash.d.ts"/>
/// <reference path="../typings/pixi.js/pixi.js.d.ts"/>
/// <reference path="../typings/fixed-data-table/fixed-data-table.d.ts"/>
/// <reference path="../typings/moment/moment.d.ts"/>
/// <reference path="../typings/c3/c3.d.ts"/>
/// <reference path="../typings/d3/d3.d.ts"/>

import * as FileSaver from "filesaver.js";
import * as JSZip from "jszip";
import * as Clipboard from "clipboard";
import * as classNames from "classnames";
import * as ReactColorPicker from "react-color";
import * as Slider from "rc-slider";
import * as ReactDropzone from "react-dropzone";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as reactUpdate from "react-addons-update";
import * as jquery from "jquery";
import * as sparkline from "react-sparklines"
import * as proj4 from "proj4";
import * as PIXI from "pixi.js";
import * as _ from "lodash";
import * as ol from "openlayers";
import * as FixedDataTable from "fixed-data-table";
import * as moment from "moment";
import * as c3 from "c3";
import * as d3 from "d3";

(React as any).addons = (React as any).addons || {};
(React as any).addons.update = (reactUpdate as any).default;
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).FixedDataTable = FixedDataTable;
(window as any).ReactDropzone = { Dropzone: (ReactDropzone as any).default };
(window as any).ReactDOM = ReactDOM;
(window as any).jquery = jquery;
(window as any).$ = (jquery as any).default;
(window as any).jQuery = (jquery as any).default;
(window as any).moment = (moment as any).default;
(window as any).ol = ol;
(window as any)._ = _;
(window as any).lodash = _;
(window as any).d3 = (d3 as any).default;
(window as any).c3 = c3;
(window as any).proj4 = (proj4 as any).default;
(window as any).Slider = (Slider as any).default;
(window as any).ReactColorPicker = ReactColorPicker;
(window as any).classNames = (classNames as any).default;
(window as any).Clipboard = (Clipboard as any).default;
(window as any).JSZip = (JSZip as any).default;
(window as any).FileSaver = FileSaver;
(window as any).sparkline = sparkline;
(window as any).PIXI = PIXI;

// temporary solution
var weavejs:any = (window as any).weavejs || {};
weavejs.util = weavejs.util || {};
weavejs.util.DateUtils = weavejs.util.DateUtils || {};
weavejs.util.StandardLib = weavejs.util.StandardLib || {};
weavejs.util.DateUtils.moment = (moment as any).default;
weavejs.util.StandardLib.lodash = _;
