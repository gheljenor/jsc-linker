//#include {headers}/colors

//#import {root}/config/paths#setPaths
//#import {root}/config/paths#normalizePath

//#import {root}/fs/read-file#setEncoding

//#import {root}/parser/reader#parseFile
//#import {root}/parser/writer#writeModule
//#import {root}/parser/prepare#parseModule
//#import {root}/parser/i18n#i18nReader

//#export linker
function linker(paths, path, encoding, logger, _verbose){
    if (!logger) logger = console.log.bind(console);
    _log = logger;

    verbose = _verbose || false;

    log("Building module: ".cyan.bold, path.cyan);

    setPaths(paths);
    setEncoding(encoding);

    var module = {
        type: "module",
        entry: path,
        paths: paths,
        submodule: { index: 0, files: {} }
    };

    var entry = parseFile(path, module, true);
    module.submodule.files[ entry.name ] = entry;
    entry.order = module.submodule.index++;

    var i18n = i18nReader();
    if (i18n) module.i18n = i18n;

    if (parseModule(module, entry.name)) writeModule(module);
}

//#export getPath
function getPath(path, paths) {
    setPaths(paths);
    return normalizePath(path);
};

var _log;
//#internal log
var log = function(){ return _log.apply(this, arguments); };

//#internal verbose
var verbose = false;
//#internal templateExt
var templateExt = "hbs";
