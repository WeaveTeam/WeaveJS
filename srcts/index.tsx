/// <reference path="./_lib-references.ts"/>

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
			weaveAppRef={(weaveApp:weavejs.app.WeaveApp) => (window as any).weaveApp = weaveApp}
		/>,
		document.getElementById(domId)
	);
});
