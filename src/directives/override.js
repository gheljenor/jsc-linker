//#load {root}/directives/directives.list
var map = {};

directives.override = {
    before: function(file, current, root, reg){
        if (root) map = {};

        return file.replace(reg, function(line, dir, attr){
            attr = attr.split("#")[0];
            if (map[ attr ]) return line.replace(attr, map[attr]);
            return line;
        });
    },
    line: function(attr){
        attr = attr.split("#");
        map[ attr[0] ] = attr[1];
        return { inner: attr[0], outer: attr[1] };
    }
};