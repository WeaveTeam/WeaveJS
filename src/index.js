import React from "react";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
import Weave from "./weave-shim.js";
/* eslint-enable */

var weave = window.weave || (opener && opener.weave);
if (!weave)
{
	weave = new Weave();
}
window.wlm = React.render(
		<WeaveLayoutManager weave={weave}/>,	document.body
);
