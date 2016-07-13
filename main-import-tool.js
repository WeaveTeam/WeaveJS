var parseArgs = require('minimist');
var fs = require('fs');
var path = require('path');
var lodash = require('lodash');
/**
* main-import-tool
* -f: Filename for main import file.
* -d: Base source directory.
* -a: Append missing imports, or generate new list of imports if main import file does not exist.
* -x: A comma-separated list of paths to exclude from the output.
* --ext: A comma-separated list of extensions to include in the output. Default: .tsx,.ts
* (Default behavior): Print error and return non-zero if not all files are referenced.
*/

/* Cribbed from https://gist.github.com/kethinov/6658166 */
var walkSync = function(dir, excluded, extensions, filelist) {
	var files = fs.readdirSync(dir);
	files.forEach(function(file) {
		var fullPath = path.posix.join(dir, file);
		if (lodash.includes(excluded, fullPath))
		{
			return;
		}
		if (fs.statSync(fullPath).isDirectory())
		{
			walkSync(fullPath, excluded, extensions, filelist);
		}
		else
		{
			var extension = path.extname(file);
			if (lodash.includes(extensions, extension))
			{
				filelist.push(fullPath);	
			}
		}
	});
	return filelist;
};

var args = parseArgs(process.argv, {string: ["d", "f", "x", "ext"], boolean: "a"});
var sourceDir = args.d;
var importFileName = args.f;
var appendImports = args.a;
var excludedFiles = args.x ? args.x.split(",") : [];
var extensions = args.ext ? args.ext.split(",") : [".tsx", ".ts"];

excludedFiles.push(importFileName);

if (!sourceDir || !fs.statSync(sourceDir).isDirectory())
{
	console.error("A base source directory must be specified with -d.");
	process.exit(-1);
}

if (!importFileName)
{
	console.error("A main import file must be specified.");
	process.exit(-1);
}

var rootPath = path.posix.dirname(importFileName);
var filePaths = walkSync(sourceDir, excludedFiles, extensions, []);
var match;
var fileExists = function(filePath) {
	try
	{
		fs.accessSync(filePath);
		return true;
	}
	catch (e)
	{
		return false;
	}
};
var findFilePathFromQName = function(qname, extensions) {
	var refNoExt = path.posix.join(rootPath, qname.replace(/\./g, '/'));
	for (var ext of extensions)
	{
		var refext = refNoExt + ext;
		if (fileExists(refext))
			return refext;
	}
};
var getOrInit = (map, key, type) => map.has(key) ? map.get(key) : map.set(key, new type()).get(key);
var depsTree = new Map();
var initDeps = function(filePath) {
	var deps = getOrInit(depsTree, filePath, Set);
	var fileContent = fs.readFileSync(filePath, "utf8");
	var importPattern = /import[\s+].+=[\s+]?(.+);/g;
	while (match = importPattern.exec(fileContent))
	{
		var ref = findFilePathFromQName(match[1], ['.tsx', '.ts']);
		if (ref)
			deps.add(ref);
	}
};
var propagateDeps = function(filePath, chain) {
	//console.log('propagate',filePath, chain);
	var index = chain.indexOf(filePath);
	if (index >= 0)
		throw new Error(`Found circular dependency: ${
			chain
				.slice(index)
				.concat(filePath)
				.map(filePath => path.posix.basename(filePath))
				.join(' -> ')
		}`);

	chain.push(filePath);
	for (var ref of depsTree.get(filePath))
	{
		for (var link of chain)
			if (link != ref)
				depsTree.get(link).add(ref); // automatically adds more iterations to outer loop
		propagateDeps(ref, chain);
	}
	chain.pop();
};
filePaths.forEach(initDeps);
filePaths.forEach(filePath => console.log('prop',filePath)||propagateDeps(filePath, []));
filePaths.sort((f1, f2) => depsTree.get(f1).has(f2) - depsTree.get(f2).has(f1));

filePaths = filePaths.map(function (filePath) {
	return "./" + path.posix.relative(path.posix.dirname(importFileName), filePath);
});

filePaths = new Set(filePaths);

/* Get the existing references from the master file */

var referencePattern = /\/\/\/[\s+]<reference path="(.+)"\/>/g;
var importFileContent = "";

if (fileExists(importFileName))
{
	importFileContent = fs.readFileSync(importFileName, "utf8");
	while ((match = referencePattern.exec(importFileContent)) !== null) {
		var referencePath = match[1];
		filePaths.delete(referencePath);
	}
}
else if (!args.a)
{
	console.error(`No main import file found. Rerun this command with the -a flag to generate one.`);
	process.exit(1);
}

if (filePaths.size)
{
	if (args.a)
	{
		console.error(`References to the following files were not found in the main import file at '${importFileName}':`)
		filePaths.forEach(function(filePath) {
			console.error(`\t${filePath}`);
		});
		console.error('Adding these files to the main import file.');

		var stream = fs.createWriteStream(importFileName, {flags: 'w'});
		stream.write(importFileContent);
		filePaths.forEach(
			function (filePath) {
				stream.write(`/// <reference path="${filePath}"/>\n`);
			}
		);
		stream.end();
	}
	else
	{
		console.error(`References to the following files were not found in the main import file at '${importFileName}':`)
		filePaths.forEach(function(filePath) {
			console.error(`\t${filePath}`);
		});
		console.error('To naively append these references to the main import file, rerun this command with the -a flag.');
		process.exit(1);
	}
}