//#load {root}/directives/directives.list
var allow = ["export", "external", "require"];

directives.module = {
    before: function(file, current, root, reg){
        if (root) return file;
        var t;

        while(t = reg.exec(file)) if (t[1] == "module") {
            current.type = "module";
            return file.replace(reg, function(line, dir){
                if (~allow.indexOf(dir)) return line;
                return "";
            });
        }

        return file;
    }
};