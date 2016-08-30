const fs = require("fs");
const browserify = require("browserify");
const path = require("path");
const mold = require("mold-source-map");
var libs = [
	"c3",
	"clipboard",
	"codemirror",
	"d3",
	"filesaver.js",
	"fixed-data-table",
	"jquery",
	"lodash",
	"jszip",
	"openlayers",
	"pixi.js",
	"proj4",
	"rc-slider",
	"react",
	"react-addons-update",
	"react-codemirror",
	"react-color",
	"react-dom",
	"react-dropzone",
	"react-notification-system",
	"react-sparklines",
	"immediate",
	"moment"
];
var mode = process.argv[2];
if(mode == "libs")
{
	browserify({
		paths: ["./node_modules"],
		debug: false
	}).require(libs).bundle().pipe(fs.createWriteStream("./dist/libs.js"));
}
else
{
	browserify({
		entries: ["./WeaveApp/bin/js/index.js"],
		basedir: "../",
		paths: ['./WeaveApp/bin/js','./WeaveApp/node_modules'],
		debug: true
	})
	.require("./lib/weavejs.js", {debug: true, expose: "weavejs"})
	.external(libs).bundle().pipe(mold.transformSourcesRelativeTo(path.join(process.cwd(), ".."))).pipe(fs.createWriteStream("./dist/weave-app.bundle.js"));
}
