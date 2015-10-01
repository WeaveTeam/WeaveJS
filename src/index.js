import React from "react";
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";

window.wlm = React.render(
		<WeaveLayoutManager weave={opener.weave}/>,	document.body
);
