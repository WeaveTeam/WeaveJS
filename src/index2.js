import $ from "jquery";
import React from "react";
/* eslint-disable */
import App from "./app.jsx";
/* eslint-enable */

$(function() {
    React.render(
		<App/>, document.getElementById("app")
    );
});
