// TODO should we include reference path of 3rd party in weavejs.d.ts?
/// <reference path="../typings/react/react-global.d.ts"/>
/// <reference path="../typings/react/react-dom.d.ts"/>
/// <reference path="../typings/pixi.js/pixi.js.d.ts"/>
/// <reference path="../typings/openlayers/openlayers.d.ts"/>
/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="../typings/c3/c3.d.ts"/>
/// <reference path="../typings/proj4/proj4.d.ts"/>
/// <reference path="../typings/clipboard/clipboard.d.ts"/>

// TODO combine these two d.ts into one
/// <reference path="../typings/weave/weavejs-core.d.ts"/>
/// <reference path="../outts/weavejs.d.ts"/>

var LandingPage = weavejs.dialog.LandingPage;

var domId = "weaveElt";
var weave = new Weave();
$(() => {
	if (typeof Symbol === 'undefined')
	{
		ReactDOM.render(<span>Browser not supported</span>, document.getElementById(domId));
		return;
	}

	var showSplash = !!(window as any).SHOW_WEAVE_SPLASH;
	ReactDOM.render(
		<LandingPage
			weave={weave}
			initialView={showSplash ? "splash" : "file"}
			weaveAppRef={(weaveApp:weavejs.app.WeaveApp) => (window as any).weaveApp = weaveApp} // global var for debugging
		/>,
		document.getElementById(domId)
	);
});
