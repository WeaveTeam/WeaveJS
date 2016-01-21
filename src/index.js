import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import StandardLib from "../outts/utils/StandardLib.js";
import JSZip from "jszip";
/* eslint-disable */
import WeaveLayoutManager from "../outts/WeaveLayoutManager.jsx";
// import WeaveLayoutManager from "../outts/WeaveLayoutManager.jsx";
/* eslint-enable */

/*global Weave, weavejs*/

// TEMPORARY SOLUTION
weavejs.util.JS.JSZip = JSZip;

var weave = window.weave;
if (weave)
{
	render();
}
else
{
	window.weave = weave = new Weave();
	var urlParams = StandardLib.getUrlParams();
	var weaveExternalTools = window.opener && window.opener.WeaveExternalTools;
	if (urlParams.file)
	{
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

function render() {
	$(() => {
		ReactDOM.render(<WeaveLayoutManager weave={weave}/>, document.getElementById("weaveElt"));
	});
}
