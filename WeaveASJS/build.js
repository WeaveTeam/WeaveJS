const execSync = require('child_process').execSync;

// prevent mxmlc from using FLEX_HOME environment variable
process.env.FLEX_HOME="";

var command = `bash node_modules/flexjs/js/bin/mxmlcnpm -remove-circulars -js-compiler-option="--compilation_level WHITESPACE_ONLY" -fb "${__dirname}"`;
console.log(command);
execSync(command, {stdio: "inherit"});
