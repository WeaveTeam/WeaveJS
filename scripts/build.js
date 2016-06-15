const babel = require("babel-core");
const browserifyInc = require("browserify-incremental");
const argv = require("yargs").argv;
const fs = require("fs");

const libraries = ['react', 'react-dom', 'jquery', 'lodash', 'd3', 'c3', 'openlayers', 'jszip'];

const CACHE_FILE_PATH = "browserifycache.json";

function doBrowserify(target, dev)
{
	var bundle = browserifyInc({
		cacheFile: CACHE_FILE_PATH,
		debug: dev
	});

	var outputFile;

	if (target == "libs")
	{
		/* libs target */
		bundle.require(libraries);
		outputFile = new fs.WriteStream("dist/libs.js");
	}
	else
	{
		/* Default target */
		bundle.external(libraries);
		bundle.add("lib/index.js");
		outputFile = new fs.WriteStream("dist/index.js");
	}

	bundle.bundle().pipe(outputFile);
}

doBrowserify(argv._[0], argv.d);