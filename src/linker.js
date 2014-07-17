//#include {headers}/colors
//#include {headers}/path

//#import {root}/config/paths#setPaths
//#import {root}/config/paths#normalizePath

//#import {root}/fs/read-file#setEncoding

//#import {root}/parser/reader#parseFile
//#import {root}/parser/writer#writeModule
//#import {root}/parser/validate#validateModule
//#import {root}/parser/i18n#i18nReader

//#export build
function build(path, logger, _verbose){

    var configPath = nodePath.resolve(path);

    var cfg = require(configPath);
    cfg.paths.root = nodePath.normalize( nodePath.dirname(path) );

    if (/\.test\.json$/.test(path) && cfg.paths.i18n) delete cfg.paths.i18n;

    var i18n = cfg.paths.i18n || false;
    if (cfg.paths.i18n) delete cfg.paths.i18n;

    if (!Array.isArray(cfg.build)) cfg.build = [cfg.build];

    for (var k = 0, l = cfg.build.length; k < l; k++) {
        if ((k == l-1) && i18n) cfg.paths.i18n = i18n;

        linker({
            paths: cfg.paths,
            path: cfg.build[k],
            encoding: cfg.encoding || "UTF-8",
            templateExt: cfg.templateExt || "hbs"
        }, logger, _verbose);
    }
}

//#export linker
function linker(config, logger, _verbose){
    if (!logger) logger = console.log.bind(console);
    _log = logger;

    verbose = _verbose || false;

    log("Building module: ".cyan.bold, config.path.cyan);

    setPaths(config.paths);
    setEncoding(config.encoding);
    templateExt = config.templateExt || "hbs";

    var module = {
        type: "module",
        entry: config.path,
        paths: config.paths,
        submodule: { index: 0, files: {} }
    };

    var entry = parseFile(config.path, module, true);
    module.submodule.files[ entry.name ] = entry;
    entry.order = module.submodule.index++;

    var i18n = i18nReader();
    if (i18n) module.i18n = i18n;

    if (validateModule(module, entry.name)) writeModule(module);
}

var _log;
//#internal log
var log = function(){ return _log.apply(this, arguments); };

//#internal verbose
var verbose = false;
//#internal templateExt
var templateExt = "hbs";
