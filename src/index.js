import React from "react";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
/* eslint-enable */

/*global Weave*/

var weave = window.weave || (opener && opener.weave);
if (!weave)
{
	weave = new Weave();
}
window.wlm = React.render(
		<WeaveLayoutManager weave={weave}/>,	document.body
);
