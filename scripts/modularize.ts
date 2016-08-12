module.exports = function()
{
	const async = require("async");
	const fs = require("fs");
	const path = require("path");
	const version = "2.1.3";
	const browserify = require('browserify');
	const stream = require('stream');
	const exorcist = require('exorcist');
	const Concat = require('concat-with-sourcemaps');
	const SourceMapGenerator = require('source-map').SourceMapGenerator;
	const SourceMapConsumer = require('source-map').SourceMapConsumer;
	
	let filesToConcat = [
		'src/umd-prefix.js',
		'out/libs.js',
		'WeaveASJS/bin/js-release/WeaveJS.js',
		'src/initWeaveJS.js',
		'src/semantic/semantic.min.js',
		'out/weavejs-ui.js',
		'src/umd-suffix.js'
	];
	
	function build(outputPath:string, moduleName:string, browserName:string)
	{
		var concat = new Concat(true, moduleName, '\n');
		for (var filename of filesToConcat)
		{
			var sourceMapContent:string = null;
			var content:string;
	
			content = fs.readFileSync(filename, "utf8");
	
			/* Find last non-empty line */
			var lines = content.split("\n");
			var lastLine:string = null;
			while (!lastLine)
			{
				lastLine = lines[lines.length-1];
				lines.length--;
			}
	
			var inlineRegex = /^\/\/# sourceMappingURL=data:application\/json;base64,(.*)/
			var externRegex = /^\/\/# sourceMappingURL=(.*)/
			var match:RegExpMatchArray = null;
	
			try {
				if (match = lastLine.match(inlineRegex))
				{
					sourceMapContent = Buffer.from(match[1], 'base64').toString('utf8');
				}
				else if (match = lastLine.match(externRegex))
				{
					let sourceMapPath = path.resolve(path.dirname(filename), match[1]);
					sourceMapContent = fs.readFileSync(sourceMapPath, 'utf8');
				}
				else
				{
					/* No sourcemap found in lastLine, so we need to push it back onto the lines list. */
					lines.push(lastLine);
					/* Try a reasonable default */
					console.log("No sourceMap specified for", filename, ", attempting default");
					let sourceMapPath = filename + ".map";
					sourceMapContent = fs.readFileSync(sourceMapPath, 'utf8');
				}
			}
			catch (e)
			{
				console.log("Failed to load sourceMap for file:", filename, ", skipping.");
				console.error(e);
				sourceMapContent = null;
			}
	
			/* Remove sourcemapping declarations. */
			if (match)
			{
				content = lines.join("\n");
			}
	
			concat.add(filename, content, sourceMapContent);
		}
	
		console.log("output", concat.content.length, concat.sourceMap.length)
		var modulePath = path.join(outputPath, moduleName);
		var concatToModuleMapPath = modulePath + ".map";
		//var externSourceMappingURL = "//# sourceMappingURL=" + moduleName + ".map\n";
		var sourceMappingURL = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + (new Buffer(concat.sourceMap).toString('base64'));
		var newContent = concat.content + "\n" + sourceMappingURL;
	
		fs.writeFileSync(modulePath, newContent);
		//fs.writeFileSync(concatToModuleMapPath, concat.sourceMap);
	
		var browserPath = path.join(outputPath, browserName);
		var moduleToBrowserMapPath = browserPath + ".map";
	
		var browserifyInstance = browserify({debug: true});
		browserifyInstance.add(path.join(outputPath, moduleName));
		var outStream = new fs.createWriteStream(path.join(outputPath, browserName));
		browserifyInstance.bundle()
			.pipe(exorcist(moduleToBrowserMapPath))
			.pipe(outStream).on('finish', () => {
				var moduleToBrowserMap = JSON.parse(fs.readFileSync(moduleToBrowserMapPath, "utf8"));
				var newMap = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(moduleToBrowserMap));
				newMap.applySourceMap(new SourceMapConsumer(concat.sourceMap));
				fs.writeFileSync(moduleToBrowserMapPath, newMap.toString());
			});
	}
	
	build('dist/', 'weavejs-module.js', 'weavejs-browser.js');
}