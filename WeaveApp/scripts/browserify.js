const fs = require("fs");
const browserify = require("browserify");
var libs = [
	"c3",
	"clipboard",
	"codemirror",
	"d3",
	"filesaver.js",
	"fixed-data-table",
	"jquery",
	"lodash",
	"openlayers",
	"pixi.js",
	"proj4",
	"rc-slider",
	"react",
	"react-codemirror",
	"react-color",
	"react-dom",
	"react-dropzone",
	"react-notification-system",
	"react-sparklines"
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
		entries: ["./bin/js/index.js"],
		paths: ["./bin/js"],
		debug: true
	}).external(libs).bundle().pipe(fs.createWriteStream("./dist/weave-app.bundle.js"));
}
