import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
/* eslint-enable */

/*global Weave*/

var weave = window.weave || (opener && opener.weave);
$(() => {
  ReactDOM.render(<WeaveLayoutManager weave={weave}/>,	document.getElementById("weaveElt"));
});
