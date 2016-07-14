var debug = false;

var parseArgs = require('minimist');
var fs = require('fs');
var path = require('path').posix;
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
function walkSync(dir, excluded, extensions, filelist)
{
	var files = fs.readdirSync(dir);
	files.forEach(function(file) {
		var fullPath = path.join(dir, file);
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
}

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

var rootPath = path.dirname(importFileName);
var filePaths = walkSync(sourceDir, excludedFiles, extensions, []);
var match;
function fileExists(filePath)
{
	try
	{
		fs.accessSync(filePath);
		return true;
	}
	catch (e)
	{
		return false;
	}
}
function findFilePathFromQName(qname, extensions)
{
	var refNoExt = path.join(rootPath, qname.replace(/\./g, '/'));
	for (var ext of extensions)
	{
		var refext = refNoExt + ext;
		if (fileExists(refext))
			return refext;
	}
}
var getOrInit = (map, key, type) => map.has(key) ? map.get(key) : map.set(key, new type()).get(key);
var map2d_file_dep_chain = new Map();
function initDeps(file)
{
	var map_dep_chain = getOrInit(map2d_file_dep_chain, file, Map);
	var fileContent = fs.readFileSync(file, "utf8");
	var importPattern = /import[\s+].+=[\s+]?(.+);/g;
	while (match = importPattern.exec(fileContent))
	{
		var dep = findFilePathFromQName(match[1], ['.tsx', '.ts']);
		if (dep)
			map_dep_chain.set(dep, [file, dep]);
	}
}
function formatDepChain(chain)
{
	return chain.map(filePath => path.basename(filePath)).join(' -> ');
}
function checkDependency(file, dep, chain)
{
	var map_dep_chain = map2d_file_dep_chain.get(file);
	var hasChain = map_dep_chain.get(dep);
	if (hasChain !== undefined)
		return hasChain;

	if (!chain)
		chain = [];

	// avoid infinite recursion
	if (chain.indexOf(file) >= 0)
		return null;

	chain.push(file);
	hasChain = false;
	for (let [ref, hasRef] of map_dep_chain)
	{
		if (ref == dep || !hasRef)
			continue;
		let subChain = checkDependency(ref, dep, chain);
		if (subChain)
		{
			let newChain = checkDependency(file, ref).concat(subChain.slice(1));
			if (!hasChain || newChain.length < hasChain.length)
				map_dep_chain.set(dep, hasChain = newChain);
		}
	}
	chain.pop();

	map_dep_chain.set(dep, hasChain);
	return hasChain;
}
filePaths.forEach(initDeps);
filePaths.forEach(f => {
	var chain = checkDependency(f, f);
	if (chain)
		console.error(`Found circular dependency: ${formatDepChain(chain)}`);
});
filePaths.sort((f1, f2) => {
	var result = !!checkDependency(f1, f2) - !!checkDependency(f2, f1);
	if (result && debug)
	{
		[f1, f2] = [path.basename(f1), path.basename(f2)];
		console.log(result < 0 ? f1 : f2, '<', result < 0 ? f2 : f1);
	}
	return result;
});

filePaths = filePaths.map(function (filePath) {
	return "./" + path.relative(path.dirname(importFileName), filePath);
});

filePathSet = new Set(filePaths);

/* Get the existing references from the master file */

var referencePattern = /\/\/\/[\s+]<reference path="(.+)"\/>/g;
var importFileContent = "";

if (fileExists(importFileName))
{
	importFileContent = fs.readFileSync(importFileName, "utf8");
	while ((match = referencePattern.exec(importFileContent)) !== null) {
		var referencePath = match[1];
		filePathSet.delete(referencePath);
	}
}
else if (!args.a)
{
	console.error(`No main import file found. Rerun this command with the -a flag to generate one.`);
	process.exit(1);
}

if (filePathSet.size)
{
	if (args.a)
	{
		console.error(`References to the following files were not found in the main import file at '${importFileName}':`)
		filePaths.forEach(function(filePath) {
			console.error(`\t${filePath}`);
		});
		console.error('Adding these files to the main import file.');

		var stream = fs.createWriteStream(importFileName, {flags: 'w'});
		//stream.write(importFileContent);
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