const split = require('split');
const fs = require('fs');
const stream = require('stream');
const lodash = require('lodash');
process.stdin.pipe(split()).on('data', processErrorLine).on('end', processReplacements);

var d_filename_lines_replacements = new Map();

function processErrorLine(line/*:string*/)
{
	// srcts/weavejs/plot/LineChartPlotter.ts(118,75): error TS2663: Cannot find name 'plotter'. Did you mean the instance member 'this.plotter'?

	let pattern = /([A-Za-z0-9\/\.\-\_]+)\(([\d]+),([\d]+)\): error TS266\d\: Cannot find name '([A-Za-z0-9\.\_]+)'. Did you mean the (?:static|instance) member '([A-Za-z0-9\.\_]+)'?/;
	let match = pattern.exec(line);
	if (match)
	{
		let [/* skip */, fileName, line, column, original, replacement] = match;
		
		let lineNum = parseInt(line);
		let columnNum = parseInt(column);

		if (!d_filename_lines_replacements.has(fileName))
		{
			d_filename_lines_replacements.set(fileName, new Map());
		}
		let d_line_replacements = d_filename_lines_replacements.get(fileName);

		if (!d_line_replacements.has(lineNum))
		{
			d_line_replacements.set(lineNum, [])
		}
		let replacements = d_line_replacements.get(lineNum);
		replacements.push({columnNum, original, replacement});
	}
}

function multiReplace(inputString/*:string*/, replacementObjects/*:{column:number, original:string, replacement:string}[]*/)
{
	lodash.sortBy(replacementObjects, 'column');
	let offset = 0;
	for (let replacementObject of replacementObjects)
	{
		let {column, original, replacement} = replacementObject;
		column += offset;
		inputString = inputString.substr(0, column-1) + replacement + inputString.substr(column+original.length-1);
		offset += replacement.length - original.length;
	}
	return inputString;
}

function processReplacements()
{
	for (let [fileName, lines] of d_filename_lines_replacements)
	{
		let lineNumber = 0;
		let tmpOutStream = new stream.Readable();
		tmpOutStream._read = lodash.noop;

		fs.createReadStream(fileName).pipe(split()).on('data', (line/*:string*/) => {
			lineNumber++;
			if (lines.has(lineNumber))
			{
				let replacements = lines.get(lineNumber);
				line = multiReplace(line, replacements);
				//console.log(line, multiReplace(line, replacements));
			}

			tmpOutStream.push(line + '\n');
		}).on('end', () => {
			let outStream = fs.createWriteStream(fileName);
			tmpOutStream.pipe(outStream);
		});
	}
}