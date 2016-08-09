{
    let fs = require('fs');
    let realpath = require('path');
    let path = require('path').posix;
    let lodash = require('lodash');
    module.exports = class FileUtils {
        static get_mtime(file) {
            try {
                return fs.statSync(file).mtime;
            }
            catch (e) {
                return NaN;
            }
        }
        static isFile(filePath) {
            try {
                return path.basename(filePath) == realpath.basename(fs.realpathSync(filePath))
                    && fs.statSync(filePath).isFile();
            }
            catch (e) {
                return false;
            }
        }
        static findFileWithExtension(fileNoExt, extensions) {
            for (var ext of extensions) {
                var refext = fileNoExt + ext;
                if (FileUtils.isFile(refext))
                    return refext;
            }
        }
        /* Cribbed from https://gist.github.com/kethinov/6658166 */
        static listFiles(dir, excluded, extensions, filelist) {
            var files = fs.readdirSync(dir);
            files.forEach(file => {
                var fullPath = path.join(dir, file);
                if (lodash.includes(excluded, fullPath))
                    return;
                if (fs.statSync(fullPath).isDirectory())
                    FileUtils.listFiles(fullPath, excluded, extensions, filelist);
                else if (lodash.includes(extensions, path.extname(file)))
                    filelist.push(fullPath);
            });
            return filelist;
        }
    }
    ;
}
