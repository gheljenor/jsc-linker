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
    }
};

depNames.push("uses");
fullDeps.push("uses");