import * as React from "react";
import * as ReactDOM from "react-dom";
import * as weavejs from "weavejs";
import $ from "./modules/jquery";
import Weave = weavejs.Weave;
import WeaveComponentRenderer = weavejs.ui.WeaveComponentRenderer;
import WeaveArchive = weavejs.core.WeaveArchive;
import {WeaveAPI} from "weavejs";
import WeaveApp from "./app/WeaveApp";
import LandingPage from "./dialog/LandingPage";

// exposing jquery to the global scope
// so that semantic can plug into it
(window as any).$ = $;
(window as any).jQuery = $;

function getElementAndInstance(options:{
	element:string|Element,
	weaveInstance?:Weave
}):{element: Element, weave:Weave}
{
	let element:Element;

	if (typeof options.element == typeof "")
	{
		element = document.getElementById(options.element as string);
	}
	else
	{
		element = options.element as Element;
	}

	(element as HTMLElement).style.display = "flex";

	/* Check if WeaveJS's class registries have been initialized. */
	if (!((WeaveAPI.ClassRegistry as any)['defaultPackages'] as any).length)
	{
		new WeaveJS().start();
	}

	let weave = options.weaveInstance;
	if (!weave)
	{
		/* Check if window.weave exists and is a weave instance, if so, use that. */
		if ((window as any).weave instanceof Weave)
		{
			weave = (window as any).weave;
		}
		else
		{
			weave = new Weave();
			(window as any).weave = weave;
		}
	}

	return {element, weave};
}

function embed(options:{
	element:string|Element,
	sessionUrl?: string,
	path?:string[],
	mode?:"splash"|"file"|"app"|"tool",
	weaveInstance?:Weave}):Weave
{
	let {element, weave} = getElementAndInstance(options);

	if (typeof Symbol === 'undefined')
	{
		ReactDOM.render(<span>Browser not supported</span>, element);
		return;
	}
	let jsxElement:JSX.Element;

	let mode = ( options.mode && options.mode.toLowerCase() ) || "tool";
	switch (mode) {
		case "splash":
		case "file":
			jsxElement = <LandingPage
				weave={weave}
				initialView={mode == "splash" ? "splash" : "file"}
				weaveAppRef={(weaveApp:WeaveApp) => (window as any).weaveApp = weaveApp}
			/>;
			break;
		case "app":
			jsxElement = <WeaveApp weave={weave} renderPath={options.path}/>;
			break;
		case "tool":
			/* Hack: In order to ensure right-click and tooltip work, instantiate a whole WeaveApp. */
			jsxElement = <WeaveApp forceMenuBar={false} weave={weave} renderPath={options.path}/>;
			break;
	}

	ReactDOM.render(
		jsxElement,
		element
	);

	if (options.sessionUrl)
	{
		WeaveArchive.setSessionFromUrl(weave, options.sessionUrl);
	}

	return weave;
};



function select(keyType:string, localNames:string[])
{

}

function highlight(keyType:string, localNames:string[])
{

}

var element = $("#weaveElt");
if(element.length)
{
	$(function() {
		embed({element: "weaveElt", mode: "splash"});
	});
}
else
{
	(window as any).weaveapp = {
		embed,
		select,
		highlight
	};
}
