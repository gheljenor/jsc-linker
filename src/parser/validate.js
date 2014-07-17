//#include {headers}/underscore
//#load {root}/directives/directives

//#export validateModule
function validateModule(module, root){
    var files = module.submodule.files;
    var success = true;
    var fileList = {};
    var file, fileName, dir, dirName, k, l, fLink, fOut, tmp;

    for (fileName in files) {
        file = _.pick(files[fileName], depNames);
        tmp = {
            links: {},
            vars: []
        };

        for (dirName in file) {
            dir = file[dirName];

            for (k = 0, l = dir.length; k < l; k++){
                fLink = _.isString(dir[k]) && dir[k] || dir[k].file;
                fOut = !_.isString(dir[k]) && dir[k].outer;

                if (fLink) {
                    if (!tmp.links[fLink]) tmp.links[fLink] = [];
                    if (fOut) tmp.links[fLink].push(fOut);
                }else{
                    if (fOut) tmp.vars.push(fOut);
                }
            }
        }

        fileList[fileName] = tmp;
    }

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

            for (k = 0, l = file.links[fLink].length; k < l; k++)
                if (!~fileList[fLink].vars.indexOf( file.links[fLink][k] )) {
                    log( "Variable ".bold.red + file.links[fLink][k].yellow +
                        " required in file ".bold.red + fileName.yellow +
                        " from file ".bold.red + fLink.yellow +
                        " is not found".bold.red );

                    success = false; return false;
                }

            if (!walkThu(fLink)) return false;
        }

        stack.pop();
        return true;
    }

    walkThu(root);

    if (success) log("Validation success.".bold.cyan);
    return success;
}