//#include {headers}/underscore

//#import {root}/fs/read-file#reader
//#load {root}/directives/directives

var regJS = /\/\/\#([^ \n]+) ?(.*?)\s*$/gm;
var regTPL = /\{\{!\#([^ \}]*) ?(.*?)\}\}/g;

var parsed = {};

//#export parseFile
function parseFile(path, module, root){
    if (root) parsed = {};
    if (parsed[path]) return parsed[path]; // не повторяем процесс парсинга дважды

    var isTpl =  path.split(".").pop() == "tpl";
    var reg = isTpl ? regTPL : regJS;
    var file = reader(path, root);

    var current = {
        name: path,
        type: isTpl ? "template" : "submodule"
    };
    // парсим директивы module, require и прочие меняющие содержимое файла
    current.file = beforeParse(file, current, root, reg);

    // запоминаем новый путь прежде чем продолжить
    parsed[path] = current;

    // читаем директивы
    var r, dir, dat;
    while (r = reg.exec(current.file)) {
        if (!directives[ r[1] ]) throw new TypeError("Unknown directive: " + r[1]);
        dir = directives[ r[1] ];
        if (!dir.line) continue;

        if (!current[ r[1] ]) current[ r[1] ] = [];
        dat = current[ r[1] ];
        dat.push( dir.line(r[2], root) );
    }

    var queue = [], fileList = {};
    var controls = {
        parseQueue: function(files, cb){
            if (!cb) cb = function(file) { controls.add(file.type || "submodule", file); };
            if (_.isString(cb)){
                var _cb = cb;
                cb = function(file) { controls.add(_cb, file) };
            }

            files.forEach(function(file){
                if (!fileList[file]) {
                    fileList[file] = { name: file, cbs: [] };
                    queue.push(fileList[file]);
                }

                fileList[file].cbs.push(cb);
            });
        },
        add: function(storage, data){
            if (!module[storage]) module[storage] = { files: {}, index: 0 };
            if (module[storage].files[data.name]) return;
            module[storage].files[data.name] = data;
            data.order = module[storage].index++;
        }
    };

    // выполняем директивы
    for (var d in directives) {
        if (!directives[d].block || !current[d]) continue;
        directives[d].block( current[d], controls, current, module );
    }

    // выдаём отладочную инфу о модуле
    if (verbose) for (var k in current){
        if (k == "file") continue;
        log(k.bold.blue, JSON.stringify( current[k], null, 2).white );
    }

    // грузим очередь, записываем данные
    afterParse(queue, module);

    return current;
}

var before = {};
for (var d in directives) if (directives[d].before) before[d] = directives[d].before;

var beforeParse = function(file, current, root, reg){
    for (var d in before) {
        var res = before[d](file, current, root, reg);
        if (res !== file) return beforeParse(res, current, root, reg);
    }
    return file;
}

var afterParse = function(queue, module){
    var k, l, loaded;
    for (k = 0, l = queue.length; k < l; k++) {
        loaded = parseFile(queue[k].name, module, false);
        queue[k].cbs.forEach(function(cb){ cb(loaded); });
    }
};