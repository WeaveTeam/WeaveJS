var gulp        = require('gulp');
var tscAutoref  = require('gulp-tsc-autoref');

gulp.task('default', function() {
	gulp.src(['srcts/**/*.tsx', 'srcts/**/*.ts'])
		.pipe(tscAutoref())
		.pipe(gulp.dest('outtsref/'));

});