import $ from "jquery";
import React from "react";
/* eslint-disable */
import TransDashboard from "./lowelldemo/TransDashboard.jsx";
/* eslint-enable */

$(function() {
    React.render(
		<TransDashboard/>, document.getElementById("dashboard")
    );
});
