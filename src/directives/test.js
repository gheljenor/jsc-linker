directives.test = {
    line: function(attr){ return attr; },
    block: function(data, controls, current){
        data.forEach(function(a){
            controls.add("test", { tests: {file: current.name}, name: a });
        });
    }
};