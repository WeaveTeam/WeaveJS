import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
/* eslint-disable */
import {Layout} from "../lib/WeaveUI.js";
import {MiscUtils} from "../lib/WeaveUI.js";
/* eslint-enable */

/*global Weave, weavejs*/

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing

var urlParams = MiscUtils.getUrlParams();
var layoutName = urlParams.layout || 'Layout';
var weave = window.weave;
if (weave)
{
	render();
}
else
{
	window.weave = weave = new Weave();
	var weaveExternalTools = window.opener && window.opener.WeaveExternalTools;
	if (urlParams.file)
	{
		// read from url
		weavejs.core.WeaveArchive.loadUrl(weave, urlParams.file).then(render);
	}
	else if (weaveExternalTools && weaveExternalTools[window.name])
	{
		// read content from flash
		var ownerPath = weaveExternalTools[window.name].path;
		var content = atob(ownerPath.getValue('btoa(Weave.createWeaveFileContent())'));
		weavejs.core.WeaveArchive.loadFileContent(weave, content);
		render();
	}
	else
	{
		render();
	}
}

function render()
{
	$(() => {
		var layout = weave.root.requestObject(layoutName, Weave.getDefinition("FlexibleLayout"));
		ReactDOM.render(<Layout layout={layout} style={{width: "100%", height: "100%"}}/>, document.getElementById("weaveElt"));
	});
}
