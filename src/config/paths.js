//#include {headers}/path
var paths;
var pattern = /\{(.*)\}/g;

//#export getPaths
function getPaths(){ return paths; }

//#export setPaths
function setPaths(_paths){
    paths = _paths;
    normalizePaths(paths);
}

function normalizePaths(paths){
    var f, k;
    do {
        f = false;
        for(k in paths) {
            paths[k] = paths[k].replace(/\{(.*)\}/g, function(a,b){ f = true; return paths[b] || b });
        }
    }while(f);
    for(k in paths) {
        paths[k] = nodePath.normalize(paths[k]);
    }
}

//#export normalizePath
function normalizePath(path){ return nodePath.normalize(path.replace(pattern, function(a,b){ return paths[b] || b; })); }