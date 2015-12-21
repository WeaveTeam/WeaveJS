import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
/* eslint-disable */
import TransDashboard from "./lowelldemo/TransDashboard.jsx";
/* eslint-enable */

$(function() {
    ReactDOM.render(
		<TransDashboard/>, document.getElementById("dashboard")
    );
});
