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
                    debug: true,
                    plugin: [['minifyify', {map: true}]]
                },
                transform: [["babelify", {"loose": "all"}]]
            },
            dist: {
                files: {'dist/weavec3.js': 'src/index.js'}
            }
        },
        copy: {
            main: {expand: true, flatten: true, cwd: 'src/', src: '**/*.html', dest: 'dist/'},
            c3css: {expand: true, flatten: true, cwd: 'node_modules/', src: ['c3/c3.css', 'bootstrap/dist/css/bootstrap.min.css', 'react-datagrid/dist/index.css'], dest: 'dist/'},
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

    grunt.registerTask('default', ['eslint', 'browserify', 'copy']);
};
