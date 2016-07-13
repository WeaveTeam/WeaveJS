var through			= require('through2');
var path			= require('path');
var gutil			= require('gulp-util');
var replace			= require('gulp-replace');
var fs				= require('fs');
var PluginError		= gutil.PluginError;

function gulpRuntimeImportVerify() {

	var searchPattern = /import[\s+](.+)=[\s+]?(.+);/g;

	return through.obj(function(file, enc, callback) {
		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
			return callback();
		}

		if (file.isBuffer()) {
			var match;
			var replacements = [];
			var contents = file.contents.toString();
			while ((match = searchPattern.exec(contents)) !== null) {
				var refNoExt = match[2].replace(/\./g, '/');
				['.tsx', '.ts'].forEach(function(ext) {
					var refext = refNoExt + ext;
					try
					{
						fs.accessSync(path.join(file.base, refext));
						
						var originalText = match[0];
						var importedName = match[1].trim();
						replacements.push(
							[
								originalText,
								originalText + ` if (!${importedName}) throw Error("Import of '${importedName}' failed.");`
							]
						);
					}
					catch (e)
					{
					}
				});
			}

			replacements.forEach(function(replacement) {
				originalText = replacement[0];
				newText = replacement[1];
				var stream = replace(originalText, newText);

				stream.once('data', function(newFile) {
					file.contents = newFile.contents;
				});

				stream.write(file);
			});
		}

		this.push(file);
		callback();
	});
};

module.exports = gulpRuntimeImportVerify;