var fs = require('fs');
var path = require('path').posix;
var exec = require('child_process').exec;

var scriptsFolder = 'scripts';
var outFolder = 'scripts/outts';

var scriptFile = process.argv[2];

if (!scriptFile || !scriptFile.match(/^[^/]+\.ts$/))
	return console.log("Usage: node run-ts.js <example.ts> [exampleArg1 [exampleArg2 [...]]]");

/*
const TSCONFIG = 'tsconfig.json';
var tsconfig = JSON.parse(fs.readFileSync(path.join(scriptsFolder, TSCONFIG), "utf8"));
tsconfig.compilerOptions.outDir = '.';
tsconfig.files = [
	path.join(path.relative(outFolder, scriptsFolder), 'node.d.ts'),
	path.join(path.relative(outFolder, scriptsFolder), scriptFile)
];
fs.writeFileSync(path.join(outFolder, TSCONFIG), JSON.stringify(tsconfig, null, '\t'));
*/

var infile = path.join(scriptsFolder, scriptFile);
var outfile = path.join(outFolder, scriptFile.replace(/\.ts$/, '.js'));
var in_mtime = get_mtime(infile);
var out_mtime = get_mtime(outfile);

run(!out_mtime || in_mtime > out_mtime ? `tsc --project ${scriptsFolder}` : null)
	.then(() => run(`node ${outfile} ${process.argv.slice(3).join(' ')}`));

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
function run(cmd)
{
	return new Promise((resolve, reject) => {
		if (!cmd)
			return resolve();

		exec(
			cmd,
			(err, stdout, stderr) => {
				if (stdout || stderr)
					console.log('>', cmd);
				if (stdout)
					console.log(stdout);
				if (stderr)
					console.error(stderr);
				if (err)
					reject(err);
				else
					resolve();
			}
		);
	});
}
