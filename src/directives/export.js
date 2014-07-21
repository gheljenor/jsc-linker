//#load {root}/directives/directives.list
directives.export = {
    line: function(attr){
        attr = attr.split(" as ");
        return {
            inner: attr[0],
            outer: attr[1] || attr[0]
        };
    },
    "export": function(module, line){
        return "'"+line.outer+"': "+line.inner;
    }
};

depNames.push("export");
outDeps.push("export");