const async = require("async");
const fs = require("fs");
const version = "2.1.3";
const browserify = require('browserify');
const stream = require('stream');


/* Wrapper borrowed from OpenLayers build system */
var umdWrapper = ';(function (root, factory) {\n' +
    '  if (typeof exports === "object") {\n' +
    '    module.exports = factory();\n' +
    '  } else if (typeof define === "function" && define.amd) {\n' +
    '    define([], factory);\n' +
    '  } else {\n' +
    '    root.ol = factory();\n' +
    '  }\n' +
    '}(this, function () {\n' +
    '  var WEAVE = {};\n' +
    '  %output%\n' +
    '  return WEAVE.weavejs;\n' +
    '}));\n';

function concatenate(paths, callback) {
  async.concatSeries(paths, fs.readFile, function(err, results) {
    if (err) {
      var msg = 'Trouble concatenating sources.  ' + err.message;
      callback(new Error(msg));
    } else {
      var parts = umdWrapper.split('%output%');
      var src = parts[0] +
          'var goog = this.goog = {};\n' +
          'this.CLOSURE_NO_DEPS = true;\n' +
          'var weavejs = this.weavejs = {};\n' +
          'var org = this.org = {};\n' +
           results.join('\n') +
          'weavejs.VERSION = \'' + version + '\';\n' +
          'WEAVE.weavejs = weavejs;\n' +
          parts[1];
      callback(null, src);
    }
  });
}

concatenate(['lib/libs-node.js', 'dist/core/WeaveJS.js', 'src/initWeaveJS.js', 'dist/weavejs.js'], function(err, result) {
  if (err) throw err;
  fs.writeFileSync('lib/weavejs-module.js', result);
  var browserifyInstance = browserify();
  var s = new stream.Readable();
  s._read = ()=>{};
  s.push(result);
  s.push(null);
  browserifyInstance.add(s);
  var outStream = new fs.createWriteStream('lib/weavejs-browser.js');
  browserifyInstance.bundle().pipe(outStream);
});