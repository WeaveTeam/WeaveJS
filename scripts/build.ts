module.exports = function(args:string[])
{
	const async = require("async");
	const fs = require("fs");
	const path = require("path");
	const version = "2.1.3";
	const Concat = require('concat-with-sourcemaps');

	let target = args[0];
	let filesToConcat:string[];
	let outputPath:string;
	let outputName:string;
	if (target == "weavejs")
	{
		filesToConcat = [
			'scripts/umd-prefix.txt',
			'WeaveTSJS/bin/js/libs.js',
			'WeaveASJS/bin/js-release/WeaveJS.js',
			'WeaveASJS/src/initWeaveJS.js',
			'WeaveTSJS/bin/js/weavejs.js',
			'scripts/umd-suffix.txt'
		];
		outputPath = 'lib/';
		outputName = 'weavejs.js';
	}
	else if (target == "weave-app")
	{
		filesToConcat = [
			'scripts/umd-prefix.txt',
			'WeaveTSJS/bin/js/libs.js',
			'WeaveApp/bin/js/libs.js',
			'WeaveASJS/bin/js-release/WeaveJS.js',
			'WeaveApp/resources/semantic/semantic.min.js',
			'WeaveASJS/src/initWeaveJS.js',
			'WeaveTSJS/bin/js/weavejs.js',
			'scripts/umd-suffix.txt'
		];
		outputPath = 'lib/';
		outputName = 'weave-app.js';
	}
	else
	{
		throw "No target specified."
	}
	
	function build(filesToConcat:string[], outputPath:string, moduleName:string)
	{
		var concat = new Concat(true, moduleName, '\n');
		for (var filename of filesToConcat)
		{
			var sourceMapContent:string = null;
			var content:string;

			try
			{
				sourceMapContent = fs.readFileSync(filename);
			}
			catch (e)
			{
				console.log("No sourcemap found for", filename, ", skipping.");
				sourceMapContent = null;
			}

			content = fs.readFileSync(filename);

			concat.add(filename, content, sourceMapContent);
		}

		fs.writeFileSync(path.join(outputPath, moduleName), concat.content);
		fs.writeFileSync(path.join(outputPath, moduleName + ".map"), concat.sourceMap);
	}
	build(filesToConcat, outputPath, outputName);
}