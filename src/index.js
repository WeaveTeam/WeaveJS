import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import StandardLib from "../outts/Utils/StandardLib";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
/* eslint-enable */

/*global Weave, weavejs*/

var weave = window.weave || (opener && opener.weave);

var urlParams = StandardLib.getUrlParams();
if (!weave && urlParams.file)
{
	weave = new Weave();
	weavejs.core.WeaveArchive.loadUrl(weave, urlParams.file).then(() => {
		$(() => {
			ReactDOM.render(<WeaveLayoutManager weave={weave}/>,	document.getElementById("weaveElt"));
		});
	});
}
else
{
	$(() => {
		ReactDOM.render(<WeaveLayoutManager weave={weave}/>,	document.getElementById("weaveElt"));
	});
}
