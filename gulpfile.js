var gulp        = require('gulp');
var runtimeImportVerify = require('./gulp-runtime-import-verify');

gulp.task('default', function() {
	gulp.src(['srcts/**/*.tsx', 'srcts/**/*.ts'])
        .pipe(runtimeImportVerify())
		.pipe(gulp.dest('srcts-verify/'));
});
