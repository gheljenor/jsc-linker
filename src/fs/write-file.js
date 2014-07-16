//#include {headers}/fs
//#include {headers}/colors

//#import {root}/config/paths#normalizePath

//#export writer
function writer(path, file) {
    path = normalizePath(path);
    log("Writing file: ".bold.yellow, path.yellow);
    fs.writeFileSync(path, file);
}