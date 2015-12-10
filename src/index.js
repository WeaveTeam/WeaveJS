import React from "react";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
import Weave from "./weave-shim.js";
/* eslint-enable */

var weave = opener && opener.weave;
if (!weave)
{
	weave = new Weave();
	weave.path().state(WeaveTest.getIrisState());
}
window.wlm = React.render(
		<WeaveLayoutManager weave={weave}/>,	document.body
);
