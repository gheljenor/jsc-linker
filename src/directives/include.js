directives.include = {
    line: function(attr){ return attr; },
    block: function(data, controls){
        controls.parseQueue(data, "library");
    }
};