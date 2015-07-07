module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            options: {
                transform: [["babelify", {loose: "all"}]]
            },
            dist: {
                files: {'dist/weavec3.js': 'src/index.js'}
            }
        },
        eslint: {
            target: ['src/**/*.js']
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['eslint', 'browserify'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['eslint', 'browserify']);
};
