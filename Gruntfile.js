module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        server: {
            port: 8000,
            base: './dist'
        },
        browserify: {
            dist: {
                options: {
                    browserifyOptions: {
                        plugin: [['minifyify', {map: false, exclude: "**/*.jsx"}]]
                    },
                    transform: [["babelify", {"loose": "all"}]]
                },
                files: [{'dist/index.min.js': 'src/index.js'}, {'dist/index2.min.js': 'src/index2.js'}]
            },
            dev: {
                options: {
                    browserifyOptions: {
                        debug: true,
                        plugin: []
                    },
                    transform: [["babelify", {"loose": "all"}]]
                },
                files: [{'dist/index.js': 'src/index.js'}, {'dist/index2.js': 'src/index2.js'}]   
            }
        },
        copy: {
            main: {expand: true, flatten: true, cwd: 'src/', src: '**/*.html', dest: 'dist/'},
            css: {expand: true, flatten: true, cwd: 'src/', src: 'css/*.css', dest: 'dist/'},
            fonts: {expand: true, flatten: true, cwd: 'node_modules/bootstrap', src:'fonts/*.*', dest: 'dist/fonts/'},
            appcss: {expand: true, flatten: true, cwd: 'src/', src: 'app.css', dest: 'dist/'}
        },
        eslint: {
            target: ['src/**/*.js']
        },
        watch: {
            js: {
                files: ['src/**/*.js'],
                tasks: ['eslint', 'browserify'],
                options: {
                    spawn: false,
                }
            },
            html: {
                files: ['src/index.html'],
                tasks: ['copy'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-minifyify');

    grunt.registerTask('default', ['eslint', 'browserify:dev', 'copy']);
    grunt.registerTask('dist', ['eslint', 'browserify:dist', 'copy']);
};
