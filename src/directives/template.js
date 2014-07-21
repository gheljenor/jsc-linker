//#load {root}/directives/directives.list
directives.template = {
    before: null,
    line: function(attr){ return attr; },
    block: function(data, controls){
        controls.parseQueue(data, "template");
    }
};

depNames.push("template");