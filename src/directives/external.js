directives.external = { line: function(attr){
    attr = attr.split(" as ");
    return {
        inner: attr[0],
        outer: attr[1] || attr[0]
    };
} };