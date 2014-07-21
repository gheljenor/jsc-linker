//#load {root}/directives/directives.list
//#import {root}/fs/read-file#reader

directives.require = {
    before: function(file, current, root, reg){
        return file.replace(reg, function(line, dir, attr){
            if (dir != "require") return line;
            return reader(attr);
        });
    }
};