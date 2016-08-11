const async = require("async");
const fs = require("fs");
const path = require("path");
const version = "2.1.3";
const browserify = require('browserify');
const stream = require('stream');
const Concat = require('concat-with-sourcemaps');

filesToConcat = ['src/umd-prefix.js',
                 'out/libs.js',
                 'WeaveASJS/bin/js-release/WeaveJS.js',
                 'src/initWeaveJS.js',
                 'src/semantic/semantic.min.js',
                 'out/weavejs-ui.js',
                 'src/umd-suffix.js'];


function build(outputPath, moduleName, browserName)
{
  var concat = new Concat(true, moduleName, '\n');
  for (var filename of filesToConcat)
  {
    var sourceMapFilename = filename + ".map";
    var sourceMapContent = null;
    var content;

    try
    {
      sourceMapContent = fs.readFileSync(sourceMapFilename);
    }
    catch (e)
    {
      console.log("No sourcemap found for", filename, ", skipping.");
      sourceMapContent = null; 
    }

    content = fs.readFileSync(filename);

    concat.add(filename, content, sourceMapContent);
  }

  fs.writeFileSync(path.join(outputPath, moduleName), concat.content);
  fs.writeFileSync(path.join(outputPath, moduleName + ".map"), concat.sourceMap);

  var browserifyInstance = browserify({debug: true});
  browserifyInstance.add(path.join(outputPath, moduleName));
  var outStream = new fs.createWriteStream(path.join('dist/weavejs-browser.js'));
  browserifyInstance.bundle().pipe(outStream);
}

build('dist/', 'weavejs-module.js', 'weavejs-browser.js');