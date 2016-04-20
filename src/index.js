import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import WeaveApp from "../lib/WeaveApp";
import {MiscUtils} from "../lib/WeaveUI.js";
window.proj4 = require("proj4");
//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing
window.weave = new Weave;
var urlParams = MiscUtils.getUrlParams();
$(() => {
	window.weaveApp = ReactDOM.render(
		<WeaveApp
			readUrlParams={true}
			weave={weave}
			renderPath={weavejs.WeaveAPI.CSVParser.parseCSVRow(urlParams.layout)}
			style={{width: "100%", height: "100%"}}
		/>,
		document.getElementById("weaveElt")
	);
});
