import React from "react";
import $ from "jquery";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
/* eslint-enable */

/*global Weave*/

var weave = window.weave || (opener && opener.weave);
$(() => {
  React.render(<WeaveLayoutManager weave={weave}/>,	document.getElementById("weaveElt"));
});
