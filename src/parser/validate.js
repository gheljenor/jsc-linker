//#include {headers}/underscore
//#load {root}/directives/directives

//#export validateModule
function validateModule(module, root){
    var success = true;
    var fileList = {};
    var file, fileName, dir, dirName, k, l, fLink, fOut, tmp;

    function listFiles(files) {
        for (fileName in files) {
            file = _.pick(files[fileName], depNames);
            tmp = {
                links: {},
                vars: [],
                used: {}
            };

            for (dirName in file) {
                dir = file[dirName];

                for (k = 0, l = dir.length; k < l; k++) {
                    fLink = _.isString(dir[k]) && dir[k] || dir[k].file;
                    fOut = !_.isString(dir[k]) && dir[k].outer;

                    if (fLink) {
                        if (!tmp.links[fLink]) tmp.links[fLink] = [];
                        if (fOut) tmp.links[fLink].push(fOut);
                        if (~fullDeps.indexOf(dirName)) tmp.links[fLink].full = true;
                    } else {
                        if (fOut) {
                            tmp.vars.push(fOut);
                            tmp.used[fOut] = false;
                        }
                    }
                }
            }

            fileList[fileName] = tmp;
        }
    }

    if (module.submodule)   listFiles(module.submodule.files);
    if (module.template)    listFiles(module.template.files);

    var stack = [];
    function walkThu(fileName){
        var fLink, file, k, l;
        var i = stack.indexOf(fileName);

        if (~i) {
            log("Ring structure found: ".bold.red);
            log(stack.slice(i).join("\n").yellow);

            success = false; return false;
        }

        stack.push(fileName);

        file = fileList[fileName];
        for (fLink in file.links){

            if (!fileList[fLink]) {
                log("Not found file: ".bold.red + fLink.yellow + ", required in file ".bold.red + fileName.yellow);

                success = false; return false;
            }

            for (k = 0, l = file.links[fLink].length; k < l; k++){
                if (!~fileList[fLink].vars.indexOf( file.links[fLink][k] )) {
                    log( "Variable ".bold.red + file.links[fLink][k].yellow +
                        " required in file ".bold.red + fileName.yellow +
                        " from file ".bold.red + fLink.yellow +
                        " is not found".bold.red );

                    success = false; return false;
                }

                fileList[fLink].used[ file.links[fLink][k] ] = true;
            }

            if (file.links[fLink].full) for (k in fileList[fLink].used) fileList[fLink].used[k] = true;

            if (!walkThu(fLink)) return false;
        }

        stack.pop();
        return true;
    }

    if (!walkThu(root)) return false;

    for (fileName in fileList) {
        file = fileList[fileName];

        for (fOut in file.used) if (!file.used[fOut]) {
            log("Variable ".bold.blue + fOut.white +
                " exported from ".bold.blue + fileName.white +
                " is not used".bold.blue );

            tmp = _.pick( module.submodule.files[fileName], outDeps );

            _.every(tmp, function(d){
                for (var k = 0, l = d.length; k < l; k++) {
                    if (d[k].outer && d[k].outer == fOut) {
                        d.splice(k, 1);
                        return false;
                    }
                }
                return true;
            });
        }
    }

    if (success) log("Validation success.".bold.cyan);
    return success;
}