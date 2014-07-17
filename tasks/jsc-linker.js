require("colors");
var build = require("../run/module.js").build;

module.exports = function (grunt) {
    // Please see the grunt documentation for more information regarding task and
    // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

    // ==========================================================================
    // TASKS
    // ==========================================================================
    grunt.registerMultiTask('jsc-linker', 'build project structure', function () {

        this.filesSrc.filter(function(filepath) {
            // Remove nonexistent files (it's up to you to filter or warn here).
            if (!grunt.file.exists(filepath)) {
                grunt.log.warn('Source file "' + filepath + '" not found.');
                return false;
            } else {
                return true;
            }
        }).forEach(function(filepath) {
            // Read and return the file's source.
            build(filepath, grunt.log.writeln.bind(grunt.log));
        });

    });
};