//#load {root}/directives/directives.list
directives.load = {
    line: function(attr){ return attr; },
    block: function(data, controls){
        controls.parseQueue(data);
    }
};

depNames.push("load");