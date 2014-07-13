'use strict';

var serverRootUri = 'http://127.0.0.1:3010';
var mochaPhantomJsTestRunner = serverRootUri + '/testrunner.html';

/* jshint -W106 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [
      	'index.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // browserify everything
    browserify: {
      // build the tests
      tests: {
        src: [ 'test/test.js' ],
        dest: 'test/browserified_tests.js',
        options: {
          bundleOptions : {
          	debug : true
          }
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['test']
    },

    // run the mocha tests in the browser via PhantomJS
    'mocha_phantomjs': {
	  all: {
        options: {
          urls: [
            mochaPhantomJsTestRunner
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('server', 'Run server side dummy', function(){
    grunt.log.writeln('Starting web server on port 3010.');
      require('./server.js').listen(3010);
	})
  grunt.registerTask('test', ['jshint', 'browserify', 'server', 'mocha_phantomjs']);
}
