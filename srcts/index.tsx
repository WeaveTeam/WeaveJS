import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "./modules/jquery";
import WeaveApp from "./WeaveApp";
import MiscUtils from "./utils/MiscUtils";

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing
(window as any).weave = new Weave();
var urlParams = MiscUtils.getUrlParams();

$(() => {
	(window as any).weaveApp = ReactDOM.render(
		<WeaveApp
			readUrlParams={true}
			weave={(window as any).weave}
			renderPath={weavejs.WeaveAPI.CSVParser.parseCSVRow(urlParams.layout)}
			style={{width: "100%", height: "100%"}}
		/>,
		document.getElementById("weaveElt")
	);
});
