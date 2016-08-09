/// <reference path="./_lib-references.ts"/>

import * as FileSaver_ from "filesaver.js";
import * as JSZip_ from "jszip";
import * as Clipboard_ from "clipboard";
import * as classNames_ from "classnames";
import * as CodeMirror_ from "codemirror";
import * as ReactCodeMirrorNamespace_ from "react-codemirror";
import 'codemirror/mode/javascript/javascript';
import * as ReactColorPicker_ from "react-color";
import * as Slider_ from "rc-slider";
import * as ReactDropzone_ from "react-dropzone";
import * as React_ from "react";
import * as ReactDOM_ from "react-dom";
import * as reactUpdate_ from "react-addons-update";
import * as NotificationSystem_ from "react-notification-system";
import * as jquery_ from "jquery";
import * as sparkline_ from "react-sparklines"
import * as proj4_ from "proj4";
import * as PIXI_ from "pixi.js";
import * as __ from "lodash";
import * as ol_ from "openlayers";
import * as FixedDataTable_ from "fixed-data-table";
import * as moment_ from "moment";
import * as c3_ from "c3";
import * as d3_ from "d3";

var React:any = React_;
React.addons = (React_ as any).addons || {};
React.addons.update = (reactUpdate_ as any).default;
var NotificationSystem:any = { System: (NotificationSystem_ as any).default };
var ReactDOM:any = ReactDOM_;
var FixedDataTable:any = FixedDataTable_;
var ReactDropzone:any = { Dropzone: (ReactDropzone_ as any).default };
var ReactDOM:any = ReactDOM_;
var jquery:any = jquery_;
var $:any = (jquery_ as any).default;
var jQuery:any = (jquery_ as any).default;
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;
var moment:any = (moment_ as any).default;
var ol:any = ol_;
var _:any = __;
var lodash:any = __;
var d3:any = (d3_ as any).default;
var c3:any = c3_;
var proj4:any = (proj4_ as any).default;
var Slider:any = (Slider_ as any).default;
var ReactColorPicker:any = (ReactColorPicker_ as any).default; /* Workaround for incorrect typings. */
var classNames:any = (classNames_ as any).default;
var Clipboard:any = (Clipboard_ as any).default;
var CodeMirror:any = (CodeMirror_ as any);
var ReactCodeMirror:any = (ReactCodeMirrorNamespace_ as any).default;
var JSZip:any = (JSZip_ as any).default;
var FileSaver:any = FileSaver_;
var sparkline:any = sparkline_;
var PIXI:any = PIXI_;
(PIXI as any).utils._saidHello = true;

// temporary solution
/*
var weavejs:any = weavejs || {};
weavejs.util = weavejs.util || {};
weavejs.util.DateUtils = weavejs.util.DateUtils || {};
weavejs.util.StandardLib = weavejs.util.StandardLib || {};
weavejs.util.DateUtils.moment = (moment as any).default;
weavejs.util.StandardLib.lodash = _;
weavejs.util.StandardLib.ol = ol;
*/
