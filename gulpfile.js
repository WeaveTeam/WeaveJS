var gulp        = require('gulp');
var tscAutoref  = require('gulp-tsc-autoref');
var runtimeImportVerify = require('./gulp-runtime-import-verify');

gulp.task('default', function() {
	gulp.src(['srcts/**/*.tsx', 'srcts/**/*.ts'])
		.pipe(tscAutoref())
                .pipe(runtimeImportVerify())
		.pipe(gulp.dest('outtsref/'));
});
