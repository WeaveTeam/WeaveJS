/*global module */

var libraries = ['react', 'react-dom', 'jquery', 'lodash', 'd3', 'c3', 'react-bootstrap', 'openlayers', 'jszip'];
var libraries_colon = libraries.map(function (d) { return d + ":"});

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        server: {
            port: 8000,
            base: './dist'
        },
        ts: {
            default: {
                tsconfig: true
            }
        },
        browserify: {
            options: {
                browserifyOptions: {
                    plugin: [['minifyify', {map: false, exclude: "**/*.jsx"}]]
                },
                transform: ["babelify"],
                external: libraries,
                watch: true
            },
            libs: {
                src: ['src/'],
                dest: 'dist/libs.js',
                options: {
                    alias: libraries_colon,
                    external: null,
                    transform: null
                }
            },
            devlibs: {
                src: ['src/'],
                dest: 'dist/libs.js',
                options: {
                    alias: libraries_colon,
                    external: null,
                    transform: null,
                    browserifyOptions: {
                        debug: true,
                        plugin: []
                    }
                }
            },
            module: {
                files: [{'dist/WeaveUI.js':'src/WeaveUI.jsx'}],
                options: {
                    alias: null,
                    external: libraries,
                    browserifyOptions: {
                         standalone: "WeaveUI",
                         debug: true,
                         extensions: ['.jsx'],
                         plugin: []
                    }
                },
            },
            dist: {
                files: [{'dist/index.min.js': 'src/index.js'}, {'dist/pdo-app.min.js': 'src/pdo-app.js'}, {'dist/pdo-app.min.js': 'src/lowelltrans-app.js'}]
            },
            dev: {
                options: {
                    browserifyOptions: {
                        debug: true,
                        plugin: [],
                        extensions: ['.jsx']
                    }
                },
                files: [{'dist/index.js': 'src/index.js'}, {'dist/pdo-app.js': 'src/pdo-app.js'}, {'dist/lowelltrans-app.min.js': 'src/lowelltrans-app.js'}]
            },
        },
        copy: {
            main: {expand: true, flatten: true, cwd: 'src/', src: '**/*.html', dest: 'dist/'},
            css: {expand: true, flatten: true, cwd: 'src/', src: 'css/*.css', dest: 'dist/'},
            olcss: {expand: true, flatten: true, cwd: 'node_modules/openlayers/css', src: 'ol.css', dest: 'dist/'},
            fontawesomecss: {expand: true, flatten: true, cwd: 'node_modules/font-awesome/css', src: 'font-awesome.css', dest: 'dist/css/'},
            fontawesomefont: {expand: true, flatten: true, cwd: 'node_modules/font-awesome/fonts', src: '*', dest: 'dist/fonts/'},
            fonts: {expand: true, flatten: true, cwd: 'node_modules/bootstrap', src: 'fonts/*.*', dest: 'dist/fonts/'},
            images: {expand: true, flatten: true, cwd: 'img/', src: '*', dest: 'dist/img/'},
            weavesessions: {expand: true, flatten: true, cwd: 'weave_sessions', src: "*", dest: "dist/"}
        },
        eslint: {
            target: ['src/**/*.js']
        },
        watch: {
            options: {
                spawn: false
            },
            libs: {
                files: ['node_modules/**/package.json'],
                tasks: ['browserify:libs'],
                options: {
                    'interval': 500
                }
            },
            js: {
                files: ['src/**/*.js*'],
                tasks: ['eslint', 'browserify:dev']
            },
            html: {
                files: ['src/*.html', 'src/**/*.css', 'img/*'],
                tasks: ['copy']
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-minifyify');

    grunt.registerTask('default', ['ts','eslint', 'browserify:dev', 'copy']);
    grunt.registerTask('default-nolint', ['ts', 'browserify:dev', 'copy']);
    grunt.registerTask('dist', ['ts', 'eslint', 'browserify:dist', 'copy']);
    grunt.registerTask('libs', ['browserify:libs']);
    grunt.registerTask('devlibs', ['browserify:devlibs']);
    grunt.registerTask('module', ['browserify:module']);
};
