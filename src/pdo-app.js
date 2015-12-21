import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
/* eslint-disable */
import PDO from "./pdo.jsx";
/* eslint-enable */

$(function() {
    ReactDOM.render(
		<PDO/>, document.getElementById("pdo")
    );
});
