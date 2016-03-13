import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import WeaveApp from "../lib/WeaveApp";
import {MiscUtils} from "../lib/WeaveUI.js";

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing

var urlParams = MiscUtils.getUrlParams();
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
		ReactDOM.render(
			<WeaveApp
				weave={weave}
				renderPath={weavejs.WeaveAPI.CSVParser.parseCSVRow(urlParams.layout)}
				style={{width: "100%", height: "100%"}}
			/>,
			document.getElementById("weaveElt")
		);
	});
}
