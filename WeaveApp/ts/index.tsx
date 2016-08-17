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
import DOMUtils = weavejs.util.DOMUtils;

// exposing jquery to the global scope
// so that semantic can plug into it
(window as any).$ = $;
(window as any).jQuery = $;

var map_session_url_instance = new Map<string, Weave>();

function embed(element:string|Element, weave:Weave, sessionUrl?:string, path?:string[], appMode?:string)
{
	if(typeof element == typeof "")
	{
		element = document.getElementById(element as string);
	}

	if (typeof Symbol === 'undefined')
		return ReactDOM.render(<span>Browser not supported</span>, element as Element);

	if(sessionUrl)
		WeaveArchive.setSessionFromUrl(weave, sessionUrl);

	if(path)
		return ReactDOM.render(<WeaveApp weave={weave} renderPath={path}/>, element as Element);

	else if(appMode == "splash" || appMode == "file")
		return ReactDOM.render(
			<LandingPage
				weave={weave}
				initialView={appMode as "splash"|"file"}
				weaveAppRef={(weaveApp:WeaveApp) => {
					(window as any).weaveApp = weaveApp
				}}
			/>,
			element as Element
		);

	return ReactDOM.render(<WeaveApp weave={weave} readUrlParams={true}/>, element as Element);
};

$(function ()
{
	var weave_elements = $(".weave");
	console.log(weave_elements);
	weave_elements.map((index, weave_element) => {
		var weave_instance:Weave;
		var appMode = $(weave_element).data("appmode");
		var sessionUrl = $(weave_element).data("sessionurl");
		var path = $(weave_element).data("path");
		console.log(appMode, sessionUrl, path);
		weave_instance = map_session_url_instance.get(sessionUrl);
		if(!weave_instance)
		{
			weave_instance = new Weave();
			map_session_url_instance.set(sessionUrl);
		}
		embed(weave_element, weave_instance, sessionUrl, path, appMode);
	});
});

(window as any).embed = embed;
