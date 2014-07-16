module.exports = function (grunt) {
    var rawCfg = {
        pkg: grunt.file.readJSON('package.json'),
        //------------------------------------------------------------------------------------------- linker dev
        "jsc-linker": { linker: { src: "src/linker.json" } },

        //------------------------------------------------------------------------------------------- uglify
        uglify: {
            options:{ compress: { warnings: false } },
            linker: {
                src: ["src/linker.lib.js", "src/linker.module.js"],
                dest: "src/linker.min.js"
            }
        },

        //------------------------------------------------------------------------------------------- copy
        copy: {
            linker: {
                files: {
                    "run/module.bak.js": "run/module.js",
                    "run/module.js": "src/linker.min.js"
                }
            },
            revert: { files: { "run/module.js": "run/module.bak.js" } }
        },

        //------------------------------------------------------------------------------------------- watch
        watch: {
            gruntfile: {
                files: ["Gruntfile.js"],
                options: { reload: true, livereload: true }
            },

            linker: {
                files: [ 'src/linker.js', 'src/linker.json', 'src/*/**' ],
                tasks: ["build:linker"]
            }
        }
    };

    grunt.initConfig(rawCfg);

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadTasks("./tasks");

    grunt.registerTask('default', ['build:linker', 'watch']);

    grunt.registerTask("build:linker", [ "jsc-linker:linker", "uglify:linker" ]);
    grunt.registerTask("upgrade:linker", [ "jsc-linker:linker", "uglify:linker", "copy:linker" ]);
};