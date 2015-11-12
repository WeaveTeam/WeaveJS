import $ from "jquery";
import React from "react";
/* eslint-disable */
import PDO from "./pdo.jsx";
/* eslint-enable */

$(function() {
    React.render(
		<PDO/>, document.getElementById("pdo")
    );
});
