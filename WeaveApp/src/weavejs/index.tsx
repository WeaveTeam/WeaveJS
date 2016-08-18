import * as React from "react";
import * as ReactDOM from "react-dom";
import * as weavejs from "weavejs";
import $ from "./modules/jquery";
import Weave = weavejs.Weave;
import WeaveComponentRenderer = weavejs.ui.WeaveComponentRenderer;
import WeaveArchive = weavejs.core.WeaveArchive;
import WeaveAPI = weavejs.WeaveAPI;
import WeaveApp = weavejs.app.WeaveApp;
import LandingPage = weavejs.dialog.LandingPage;

// exposing jquery to the global scope
// so that semantic can plug into it
(window as any).$ = $;
(window as any).jQuery = $;

var map_session_url_instance = new Map<string, Weave>();

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
		weavejs.util.EmbedUtils.embed(weave_element, weave_instance, sessionUrl, path, appMode);
	});
});
