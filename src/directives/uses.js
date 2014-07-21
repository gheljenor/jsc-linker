//#load {root}/directives/directives.list
directives.uses = {
    before: null,
    line: function(attr){
        attr = attr.split("#");

        return {
            file: attr[0],
            inner: attr[1]
        };
    },
    block: function(data, controls){
        var files = data.map(function(a){ return a.file });
        controls.parseQueue(files);
    },
    import_in: function(module, line){
        return line.inner;
    },
    import_out: function(module, line){
        return '__m[ '+module.submodule.files[ line.file ].order+' ]';
    }
};

depNames.push("uses");
fullDeps.push("uses");