module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: ['src/js/**/*.js']
		},

		connect: {
			testserver: {
				options: {
					port: 3000,
					base: '.'
				}
			}
		},

		karma: {
			unit_dev: {
				configFile: 'karma.unit.conf.js',
				autoWatch: true,
				browsers: ['PhantomJS']
			},
			unit: {
				configFile: 'karma.unit.conf.js',
				singleRun: true,
				browsers: ['PhantomJS']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-karma');


	grunt.registerTask('test', ['jshint', 'karma:unit']);
	grunt.registerTask('unit_dev', ['karma:unit_dev']);
	grunt.registerTask('build', ['test']);
	grunt.registerTask('default', ['build']);
};