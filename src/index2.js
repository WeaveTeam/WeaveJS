import $ from "jquery";
import React from "react";
import App from "./app.jsx";

$(function() {
    React.render(
		<App/>, document.getElementById("app")
    );
});
