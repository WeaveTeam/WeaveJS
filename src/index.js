import React from "react";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
/* eslint-enable */

window.wlm = React.render(
		<WeaveLayoutManager weave={opener.weave}/>,	document.body
);
