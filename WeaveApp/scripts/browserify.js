const fs = require("fs");
const browserify = require("browserify");
browserify({
	entries: ["./bin/js/index.js"],
	paths: ["./node_modules","./bin/js"],
	debug: true
}).bundle().pipe(fs.createWriteStream("./dist/weave-app.bundle.js"));