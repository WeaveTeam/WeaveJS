var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var scriptsFolder = 'scripts';
var scriptsOutputFolder = 'outts';

var pattern_ts = /\.ts$/;
var tsFilePath = findFile(path.join(process.cwd(), scriptsFolder, process.argv[2]), ['', '.ts']);
if (tsFilePath && tsFilePath.match(pattern_ts))
	runTypeScript(tsFilePath, process.argv.slice(3));
else
	console.error("Usage: node run-ts <example[.ts]> [exampleArg1 [exampleArg2 [...]]]");

function runTypeScript(tsFilePath, args)
{
	var infile = tsFilePath;
	var outfile = path.join(path.dirname(tsFilePath), scriptsOutputFolder, path.basename(tsFilePath).replace(pattern_ts, '.js'));
	var in_mtime = get_mtime(infile);
	var out_mtime = get_mtime(outfile);

	// if outfile missing or infile modified after outfile, recompile
	if (!isFile(outfile) || in_mtime > out_mtime)
	{
		var tsc = process.cwd().indexOf('/') < 0 ? 'tsc.cmd' : 'tsc';
		run(tsc, ['--project', scriptsFolder]).error;
	}

	// method 1: spawn a new task
	// run('node', [outfile].concat(process.argv.slice(3)));

	// method 2: use require() to run the script
	// make argv look like the outfile script was called directly
	process.argv.splice(1, 2, outfile);
	// load the outfile script
	var outResult = require(outfile);
	// if the outfile script exports a function, call that function
	if (typeof outResult == 'function')
		outResult(process.argv.slice(2));
}

function findFile(fileNoExt, extensions)
{
	for (var ext of extensions)
		if (isFile(fileNoExt + ext))
			return fileNoExt + ext;
	return null;
}

function isFile(file)
{
	try
	{
		return fs.statSync(file).isFile();
	}
	catch (e)
	{
		return false;
	}
}

function get_mtime(file)
{
	try
	{
		return fs.statSync(file).mtime;
	}
	catch (e)
	{
		return NaN;
	}
}

function run(cmd, args)
{
	console.log('>', cmd, args.join(' '));
	var result = child_process.spawnSync(
		cmd,
		args,
		{
			cwd: process.cwd(),
			env: process.env,
			stdio: 'inherit'
		}
	);
	if (result.error)
		throw result.error;
	return result;
}
