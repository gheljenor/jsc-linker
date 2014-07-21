//#load {root}/directives/directives.list
directives.external = {
    line: function(attr){
        attr = attr.split(" as ");
        return {
            inner: attr[0],
            outer: attr[1] || attr[0]
        };
    },
    "before_export": function(module, line){
        return "this['"+line.outer+"']="+line.inner;
    },
    after: function(module, line){
        return "var " + line.outer + " = this['"+line.outer+"']";
    }
};