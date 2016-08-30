module.exports = function()
{
	const async = require("async");
	const fs = require("fs");
	const path = require("path");
	const version = "2.1.3";
	const Concat = require('concat-with-sourcemaps');
	const dataurl = require('dataurl');

	let globalOutput:string[];
	let moduleOutput:string[];
	globalOutput = [
		'WeaveASJS/bin/js-release/WeaveJS.js',
		'WeaveASJS/src/initWeaveJS.js',
		'WeaveTSJS/bin/js/weavejs.js'
	];
	moduleOutput = ['scripts/umd-prefix.txt', 'WeaveTSJS/bin/js/libs.js'].concat(globalOutput).concat(['scripts/umd-suffix.txt']);

	function build(filesToConcat:string[], outputPath:string, moduleName:string, inline:boolean)
	{
		var concat = new Concat(true, moduleName, '\n');
		var cwd = process.cwd();
		for (var filename of filesToConcat)
		{
			var sourceMapContent:string = null;
			var content:string;
			content = fs.readFileSync(filename, 'utf8');

			try
			{
				sourceMapContent = fs.readFileSync(filename+".map", {encoding: "utf-8"});

				var sourceMap = JSON.parse(sourceMapContent);
				if (sourceMap.file == "") /* The ASJS output does not set a file, uses full paths */
				{
					sourceMap.file = "WeaveJS.js";
					sourceMap.sourceRoot = cwd;
					sourceMap.sources = sourceMap.sources.map(
						(fpath:string):string => {
							if (fpath.startsWith(cwd))
							{
								fpath = fpath.slice(cwd.length + 1);
								//fpath = path.join("", fpath);
							}

							return fpath;
						}
					)	
				}
				else if (sourceMap.file == "weavejs.js" || "libs.js") /* ASJS output gives a weird relative path */
				{
					sourceMap.sourceRoot = cwd;
					sourceMap.sources = sourceMap.sources.map(
						(fpath:string):string => {
							var doubleUp = "../../";
							if (fpath.startsWith(doubleUp))
							{
								fpath = fpath.slice(doubleUp.length);
								fpath = path.join("WeaveTSJS", fpath);
							}
							return fpath;
						}
					)
				}

				sourceMapContent = JSON.stringify(sourceMap);
			}
			catch (e)
			{
				console.log("No sourcemap found for", filename, ", skipping.");
				sourceMapContent = null;
			}

			var contentLines = content.split("\n");
			/* Remove old sourceMap comments and trailing blanks */
			var lastLine = contentLines[contentLines.length - 1];
			while (!lastLine || lastLine.startsWith("//# sourceMappingURL="))
			{
				contentLines.length--;
				lastLine = contentLines[contentLines.length - 1];
			}
			content = contentLines.join("\n") + "\n";

			concat.add(filename, content, sourceMapContent);
		}

		var sourceMapUrl:string;
		var sourceContent = concat.content;
		if (inline)
		{
			sourceMapUrl = dataurl.convert({data: concat.sourceMap, mimetype: "application/json", charset: "utf-8"});
		}
		else
		{
			sourceMapUrl = moduleName + ".map";
		}
		sourceContent += "\n//# sourceMappingURL=" + sourceMapUrl;

		fs.writeFileSync(path.join(outputPath, moduleName), sourceContent);
		if (!inline) fs.writeFileSync(path.join(outputPath, moduleName + ".map"), concat.sourceMap);
	}
	build(globalOutput, 'lib/', 'weavejs-global.js', true);
	build(moduleOutput, 'lib/', 'weavejs.js', true);
}