require("colors");
var linker = require("../run/module.js").linker;
var _path = require("path");

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
            var cfg = grunt.file.readJSON(filepath);
            cfg.paths.root = _path.normalize( _path.dirname(filepath) );

            if (/\.test\.json$/.test(filepath) && cfg.paths.i18n) delete cfg.paths.i18n;

            var i18n = cfg.paths.i18n || false;
            if (cfg.paths.i18n) delete cfg.paths.i18n;

            if (!Array.isArray(cfg.build)) cfg.build = [cfg.build];

            for (var k = 0, l = cfg.build.length; k < l; k++) {
                if ((k == l-1) && i18n) cfg.paths.i18n = i18n;
                linker(cfg.paths, cfg.build[k], cfg.encoding || "UTF-8", grunt.log.writeln.bind(grunt.log));
            }
        });

    });
};