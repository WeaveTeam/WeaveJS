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
	
	var showSplash = !!(window as any).SHOW_WEAVE_SPLASH;
	var weave = new Weave();
	ReactDOM.render(
		<LandingPage
			weave={weave}
			initialView={showSplash ? "splash" : "file"}
			weaveAppRef={weaveApp => (window as any).weaveApp = weaveApp} // global var for debugging
		/>,
		document.getElementById(domId)
	);
	
	(window as any).weave = weave; // global var for debugging
});
