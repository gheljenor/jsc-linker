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
    }
};

depNames.push("import");