import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import StandardLib from "../outts/utils/StandardLib.js";
import JSZip from "jszip";
/* eslint-disable */
import WeaveLayoutManager from "../outts/WeaveLayoutManager.jsx";
// import WeaveLayoutManager from "../outts/WeaveLayoutManager.jsx";
/* eslint-enable */

/*global Weave, weavejs*/

// temporary solution
weavejs.util.JS.JSZip = JSZip;

var weave = window.weave || (opener && opener.weave);

var urlParams = StandardLib.getUrlParams();
if (!weave && urlParams.file) {
    window.weave = weave = new Weave();
    weavejs.core.WeaveArchive.loadUrl(weave, urlParams.file).then(render);
}
else {
    render();
}

function render() {
    if(weave) {
        $(() => {
            ReactDOM.render(<WeaveLayoutManager weave={weave}/>, document.getElementById("weaveElt"));
        });
    } else {
        console.warn("missing weave instance.");
    }
}
