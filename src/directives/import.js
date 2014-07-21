//#load {root}/directives/directives.list
directives.import = {
    line: function(attr){
        attr = attr.split("#");
        var alias = attr[1].split(" as ");

        return {
            file: attr[0],
            inner: alias[1] || alias[0],
            outer: alias[0]
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
        return '__m[' + module.submodule.files[ line.file ].order + ']["'+line.outer+'"]';
    }
};

depNames.push("import");