/// <reference path="./_lib-references.ts"/>

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
React = React;
ReactDOM = ReactDOM;
FixedDataTable = FixedDataTable;
ReactDropzone = { Dropzone: (ReactDropzone as any).default };
ReactDOM = ReactDOM;
jquery = jquery;
$ = (jquery as any).default;
jQuery = (jquery as any).default;
moment = (moment as any).default;
ol = ol;
_ = _;
lodash = _;
d3 = (d3 as any).default;
c3 = c3;
proj4 = (proj4 as any).default;
Slider = (Slider as any).default;
ReactColorPicker = ReactColorPicker;
classNames = (classNames as any).default;
Clipboard = (Clipboard as any).default;
JSZip = (JSZip as any).default;
FileSaver = FileSaver;
sparkline = sparkline;
PIXI = PIXI;
// INSERT weavejs HERE
var weavejs:any;
// END weavejs HERE
export default weavejs;
