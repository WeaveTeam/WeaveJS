import * as weavejs from "weavejs";
import * as jquery from "jquery";
var $ = (jquery as any).default as typeof jquery;

$(function () {
	weavejs.util.EmbedUtils.embed({element: "weaveElt", mode: "splash"});
});
