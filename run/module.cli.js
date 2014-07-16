var linker = require("./module.js").linker;
var _path = require("path");

var filepath = process.argv[2];

var cfg = require(filepath);
cfg.paths.root = _path.normalize( _path.dirname(filepath) );

if (/\.test\.json$/.test(filepath) && cfg.paths.i18n) delete cfg.paths.i18n;

var i18n = cfg.paths.i18n || false;
if (cfg.paths.i18n) delete cfg.paths.i18n;

if (!Array.isArray(cfg.build)) cfg.build = [cfg.build];

for (var k = 0, l = cfg.build.length; k < l; k++) {
    if ((k == l-1) && i18n) cfg.paths.i18n = i18n;
    linker(cfg.paths, cfg.build[k], cfg.encoding || "UTF-8");
}