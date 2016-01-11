import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
/* eslint-disable */
import PDO from "./pdo.jsx";
/* eslint-enable */
import JSZip from "jszip";
/*global Weave, weavejs*/

//temporary solution
weavejs.util.JS.JSZip = JSZip;

$(() => {
	var weave = window.weave = new Weave();
	ReactDOM.render(<PDO weave={weave}/>, document.getElementById("pdo"));
});
