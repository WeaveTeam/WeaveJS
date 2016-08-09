module.exports = function()
{
	const async = require("async");
	const fs = require("fs");
	const path = require("path");
	const version = "2.1.3";
	const Concat = require('concat-with-sourcemaps');

	let filesToConcat = [
		'scripts/umd-prefix.txt',
		'WeaveTSJS/bin/js/libs.js',
		'WeaveASJS/bin/js-release/WeaveJS.js',
		'WeaveASJS/src/initWeaveJS.js',
		'app/semantic/semantic.min.js',
		'WeaveTSJS/bin/js/weavejs.js',
		'scripts/umd-suffix.txt'
	];
	
	function build(outputPath:string, moduleName:string)
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
	build('lib/', 'weavejs.js');
}