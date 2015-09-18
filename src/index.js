import $ from "jquery";
import React from "react";
import App from "./app.jsx";

$(function() {
    var weave = {};
    React.render(
		<App weave={weave}/>, document.getElementById("app")
    );
});
