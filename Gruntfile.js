module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        server: {
            port: 8000,
            base: './dist'
        },

        browserify: {
            options: {
                    browserifyOptions: {
                        plugin: [['minifyify', {map: false, exclude: "**/*.jsx"}]]
                    },
                    transform: [["babelify", {"loose": "all"}]],
                    external: [
                        'react', 'react-datagrid', 'lodash', 'jquery', 'd3', 'c3',
                        'openlayers', 'react-bootstrap',
                    ],
                    watch: true
            },
            libs: {
                src: ['src/'],
                dest: 'dist/libs.js',
                options: {
                    alias: [
                        'react:', 'react-datagrid:', 'jquery:', 'lodash:', 'd3:', 'c3:', 'react-bootstrap:', 'openlayers:'
                    ],
                    external: null,
                    transform: null
                },
            },
            dist: {
                files: [{'dist/index.min.js': 'src/index.js'}, {'dist/index2.min.js': 'src/index2.js'}]
            },
            dev: {
                options: {
                    browserifyOptions: {
                        debug: true,
                        plugin: []
                    },
                },
                files: [{'dist/index.js': 'src/index.js'}, {'dist/pdo-app.js': 'src/pdo-app.js'}]   
            }
        },
        copy: {
            main: {expand: true, flatten: true, cwd: 'src/', src: '**/*.html', dest: 'dist/'},
            css: {expand: true, flatten: true, cwd: 'src/', src: 'css/*.css', dest: 'dist/'},
            fonts: {expand: true, flatten: true, cwd: 'node_modules/bootstrap', src:'fonts/*.*', dest: 'dist/fonts/'},
            images: {expand: true, flatten: true, cwd: 'img/', src: '*', dest: 'dist/img/'}
        },
        eslint: {
            target: ['src/**/*.js']
        },
        watch: {
            options: {
                spawn: false,
            },
            libs: {
                files: ['node_modules/**/package.json'],
                tasks: ['browserify:libs'],
                options: {
                    'interval': 500,
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

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-minifyify');

    grunt.registerTask('default', ['eslint', 'browserify:dev', 'copy']);
    grunt.registerTask('dist', ['eslint', 'browserify:dist', 'copy']);
    grunt.registerTask('libs', ['browserify:libs']);
};
