

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var cfg = {
        jslint: {
            lib: {
                directives: {
                    // node environment
                    node: true,
                    // browser environment
                    browser: false,
                    // allow dangling underscores in var names
                    nomen: true,
                    // allow to do statements
                    todo: true,
                    // don't require use strict pragma
                    sloppy: true
                },
                files: {
                    src: [
                        'lib/**/*.js'
                    ]
                }   
            }
        },

        mochacli: {
            options: {
                require: ['should'],
                reporter: 'spec',
                bail: true
            },

            all: ['test/*_spec.js']
        }
    };

    grunt.initConfig(cfg);

    grunt.registerTask('default', ['jslint', 'mochacli']);
};