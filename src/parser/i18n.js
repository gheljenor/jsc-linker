//#include {headers}/fs
//#include {headers}/path
//#include {headers}/underscore
//#include {headers}/colors

//#import {root}/config/paths#getPaths
//#import {root}/config/paths#normalizePath

//#export i18nReader
function i18nReader(){
    var paths = getPaths();
    if (!paths.i18n) return false;
    var i18n = {};
    var i18nPath = normalizePath(paths.i18n);

    fs.readdirSync(i18nPath).filter(function(path){
        if (path.length != 2) return false;
        if (path == ".svn") return false;
        return true;
    }).forEach(function(lang){
        var tmp = i18n[lang] = {};
        var langPath = nodePath.resolve(i18nPath, lang);

        fs.readdirSync(langPath).filter(function(path){
            if (path == ".svn") return false;
            if (path.split(".").pop() != "json") return false;
            return true;
        }).sort(function(a, b){
            if (a == "old.obsolete.json") return -1;
            if (b == "old.obsolete.json") return 1;

            if (a == "old.raw.json") return -1;
            if (b == "old.raw.json") return 1;

            return 0;
        }).forEach(function(filename){

            log("Reading i18n file:".bold.green, lang.green, filename.green);
            _.extend(tmp, JSON.parse(
                fs.readFileSync(nodePath.resolve(langPath, filename), {encoding: "UTF-8"}).replace(/\/\/.*$/mg, "")
            ));

        });
    });

    return i18n;
}