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
		weavejs.util.EmbedUtils.embed({element: "weaveElt", mode: "splash"});
	});
}
else
{
	(window as any).weaveapp = {
		embed: weavejs.util.EmbedUtils.embed,
		select,
		highlight
	};
}
