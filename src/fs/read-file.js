//#include {headers}/fs
//#include {headers}/colors

//#import {root}/config/paths#normalizePath

//#export setEncoding
function setEncoding(encoding){ _encoding = encoding; };
var _encoding = "UTF-8";

//#export reader
function reader(path, root) {
    path = normalizePath(path);

    if (path.split(".").pop() == "tpl") {
        log("Reading template file: ".bold.green, (path+"."+templateExt).green);
        return fs.readFileSync(path+"."+templateExt, {encoding: _encoding});
    }else{
        if (!root && fs.existsSync(path + ".min.js")) {
            log("Reading minified file: ".bold.green, (path + ".min.js").green);
            return fs.readFileSync(path+".min.js", {encoding: _encoding});
        }else{
            log("Reading file: ".bold.green, (path + ".js").green);
            return fs.readFileSync(path+".js", {encoding: _encoding});
        }
    }
};