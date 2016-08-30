const babel = require('babel-core');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');

var args = minimist(process.argv.slice(2));

var inputFile = args.i;
var outputFile = args.o;
var inputSourceMap = args.m;

var config = {
    "sourceMaps": "true",
    "presets": ["es2015", "react"],
    "plugins": ["transform-object-rest-spread"],
    "compact": true,
    "comments": false,
    "minified": true
};

sourceMapObject = JSON.parse(fs.readFileSync(inputSourceMap, 'utf8'));
config.inputSourceMap = sourceMapObject;

var result = babel.transformFileSync(inputFile, config);
var code_result = result.code;

code_result += "\n//# sourceMappingURL=" + path.basename(outputFile) + ".map\n";

fs.writeFileSync(outputFile, code_result);
fs.writeFileSync(outputFile + ".map", JSON.stringify(result.map));
