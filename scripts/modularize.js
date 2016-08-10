const async = require("async");
const fs = require("fs");
const version = "2.1.3";
const browserify = require('browserify');
const stream = require('stream');


function concatenate(paths, callback) {
  async.concatSeries(paths, fs.readFile, function(err, results) {
    if (err) {
      var msg = 'Trouble concatenating sources.  ' + err.message;
      callback(new Error(msg));
    } else {
      var src = results.join('\n');
      callback(null, src);
    }
  });
}

concatenate(['src/umd-prefix.js', 'lib/libs-node.js', 'dist/core/WeaveJS.js', 'src/initWeaveJS.js', 'src/semantic/semantic.min.js', 'dist/weavejs.js', 'src/umd-suffix.js'], function(err, result) {
  if (err) throw err;
  fs.writeFileSync('dist/weavejs-module.js', result);
  var browserifyInstance = browserify();
  var s = new stream.Readable();
  s._read = ()=>{};
  s.push(result);
  s.push(null);
  browserifyInstance.add(s);
  var outStream = new fs.createWriteStream('dist/weavejs-browser.js');
  browserifyInstance.bundle().pipe(outStream);
});