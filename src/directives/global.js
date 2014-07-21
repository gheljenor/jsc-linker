//#load {root}/directives/directives.list
directives.global = {
    line: function(attr){
        attr = attr.split(" as ");
        return {
            inner: attr[0],
            outer: attr[1] || attr[0]
        };
    },
    "before_export": function(module, line){
        return "__g['"+line.outer+"']="+line.inner;
    }
};