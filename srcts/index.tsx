import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "./modules/jquery";
import LandingPage from "./LandingPage";
import MiscUtils from "./utils/MiscUtils";

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing

var domId = "weaveElt";

$(() => {
	if (typeof Symbol === 'undefined')
	{
		ReactDOM.render(<span>Browser not supported</span>, document.getElementById(domId));
		return;
	}
	
	var urlParams = MiscUtils.getUrlParams();
	(window as any).weave = new Weave();
	(window as any).weaveApp = ReactDOM.render(
		<LandingPage />,
		document.getElementById(domId)
	);
});
