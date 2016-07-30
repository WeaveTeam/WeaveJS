module.exports = function()
{
	let debug = false;

	let FileUtils = require('./FileUtils');
	let fs = require('fs');
	let minimist = require('minimist');
	let path = require('path').posix;
	let lodash = require('lodash');
	let tsort = require('tsort');

	/**
	 * main-import-tool
	 * -f: Filename for main import file.
	 * -d: Base source directory.
	 * -x: A comma-separated list of paths to exclude from the output.
	 * --ext: A comma-separated list of extensions to include in the output. Default: .tsx,.ts
	 */

	let args = minimist(process.argv, {string: ["d", "f", "x", "ext"]});
	let sourceDir = args.d;
	let importFileName = args.f;
	let excludedFiles = args.x ? args.x.split(",") : [];
	let extensions = args.ext ? args.ext.split(",") : [".tsx", ".ts"];

	excludedFiles.push(importFileName);

	if (!sourceDir || !fs.statSync(sourceDir).isDirectory())
	{
		console.error("A base source directory must be specified with -d.");
		process.exit(-1);
	}

	if (!importFileName)
	{
		console.error("A main import file must be specified with -f.");
		process.exit(-1);
	}

	let rootPath = path.dirname(importFileName);
	let filePaths:string[] = FileUtils.listFiles(sourceDir, excludedFiles, extensions, []);
	let graph = tsort();

	function getOrInit<K,V>(map:Map<K,V>, key:K, type:new(..._:any[])=>V):V
	{
		return map.has(key) ? map.get(key) : map.set(key, new type()).get(key);
	}

	let map2d_file_dep_chain = new Map();

	function initDeps(file:string)
	{
		if (debug)
			console.log(file);

		var map_dep_chain = getOrInit(map2d_file_dep_chain, file, Map);
		var fileContent = fs.readFileSync(file, "utf8");
		let match:string[];

		// check for import statements
		// Example: import Baz = foo.bar.Baz;
		var importPattern = /^\s*import\s+(?:[^\s]+)\s*=\s*([^\s]+);/gm;
		while (match = importPattern.exec(fileContent))
		{
			let fileNoExt = path.join(rootPath, match[1].replace(/\./g, '/'));
			let dep:string = null;
			while (fileNoExt)
			{
				dep = FileUtils.findFileWithExtension(fileNoExt, extensions);
				if (dep)
					break;
				fileNoExt = fileNoExt.substr(0, fileNoExt.lastIndexOf('/'));
			}
			if (dep && dep != file)
			{
				if (debug)
					console.log(file, '>', path.basename(dep));

				map_dep_chain.set(dep, [file, dep]);
				graph.add(file, dep);
			}
		}

		// check for extends class in same package
		// Example: export class Foo extends Bar<Baz>
		var extendsPattern = /^\s*(?:export\s+)?(?:abstract\s+)?(?:class|interface)\s+(?:[^\s]+)\s+(?:implements\s+(?:[^\s]+)\s+)?extends\s+([^\s<]+)/gm;
		while (match = extendsPattern.exec(fileContent))
		{
			let fileNoExt = path.join(path.dirname(file), match[1]);
			let dep = FileUtils.findFileWithExtension(fileNoExt, ['.tsx', '.ts']);
			if (dep)
			{
				if (debug)
					console.log(file, 'extends', path.basename(dep));

				map_dep_chain.set(dep, [file, dep]);
				graph.add(file, dep);
			}
		}
	}

	function formatDepChain(chain:string[])
	{
		return chain.map(filePath => path.basename(filePath)).join(' -> ');
	}

	function checkDependency(file:string, dep:string, chain:string[] = null):string[]
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
		hasChain = null;
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

	// get direct dependencies
	filePaths.sort().forEach(initDeps);

	// topological sort
	let ordered = graph.sort().reverse() as string[];
	filePaths = Array.from(new Set(ordered.concat(filePaths)));
	filePaths = filePaths.slice(ordered.length).concat(ordered);

	// check for circular dependencies
	filePaths.forEach(f =>
	{
		var chain = checkDependency(f, f);
		if (chain)
			console.error(`Found circular dependency: ${formatDepChain(chain)}`);
	});

	// generate output file
	let stream = fs.createWriteStream(importFileName, {flags: 'w'});
	for (let filePath of filePaths)
		stream.write(`/// <reference path="${"./" + path.relative(path.dirname(importFileName), filePath)}"/>\n`);
	stream.end();
}