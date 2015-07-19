module.exports = function(grunt) {
    var env = require("./config/env.json");

    grunt.initConfig({
        express: {
            dev: {
                options: {
                    script: env.expressPath
                }
            }
        },
        watch: {
            express: {
                files:  ['Gruntfile.js',   
                         'app.js', 
                         'models/**/*.js',
                         'routes/**/*.js',
                         'middleware/*.js',
                         'config/*.json',
                         'test/**/*.js'],
                tasks:  ['express:dev'],
                options: {
                    spawn: false
                }
            },
            css: {
                files: ['scss/**/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: false
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: "compressed"
                },
                files: {
                    'public/build/screen.min.css': 'scss/screen.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    grunt.registerTask('server', ['express:dev', 'watch:express']);
    grunt.registerTask('watchassets', [
        'watch:css'
    ]);
    
    grunt.registerTask('default', ['server']);
};






