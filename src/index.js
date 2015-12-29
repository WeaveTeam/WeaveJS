import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import StandardLib from "../outts/Utils/StandardLib";
/* eslint-disable */
import WeaveLayoutManager from "./WeaveLayoutManager.jsx";
/* eslint-enable */

/*global Weave*/

var weave = window.weave || (opener && opener.weave);

console.log(StandardLib.getUrlParams());

$(() => {
  ReactDOM.render(<WeaveLayoutManager weave={weave}/>,	document.getElementById("weaveElt"));
});
