import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
/* eslint-disable */
import {Layout} from "../lib/WeaveUI.js";
import {ui} from "../lib/WeaveUI.js";
import {MiscUtils} from "../lib/WeaveUI.js";
/* eslint-enable */

/*global Weave, weavejs*/

//weavejs.WeaveAPI.Locale.reverseLayout = true; // for testing

var weave = window.weave;
if (weave)
{
	render();
}
else
{
	window.weave = weave = new Weave();
	var urlParams = MiscUtils.getUrlParams();
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

function render()
{
	$(() => {
		var accordionContent = [
			{
				title: "First section",
				content: "Lorem Ipsum",
				open: false
			},
			{
				title: "Second section",
				open: true,
				content: <div>
							JSX here
							<input type="button" value="button"/>
						</div>
			}
		];

		ReactDOM.render(
			<ui.HBox style={{width: "100%", height: "100%"}}>
				<ui.Accordion title="Accordion test" closeOthers={true} config={accordionContent}/>
				<Layout weave={weave} style={{width: "100%", height: "100%"}}/>
			</ui.HBox>
		, document.getElementById("weaveElt"));
	});
}
