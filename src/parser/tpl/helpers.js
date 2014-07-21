//#include {headers}/handlebars
//#include {headers}/underscore

//#load {root}/directives/directives

var _module;
//#export setModule
function setModule(module) { _module = module; }

function submoduleBuild(field, separator){
    return function(data){
        var dirs = [];
        for (var k in directives) if (directives[k][field]) dirs.push(k);

        var lists = _.pick(data, dirs);

        return _.map(lists, function(list, type){
            return _.map(list, directives[type][field].bind(null, _module)).join(separator);
        }).join(separator);
    }
}

//--------------------------------------------------------------------------------- SUBMODULE
var submoduleFn = {
    "import_inner": submoduleBuild("import_in", ", "),
    "import_external": submoduleBuild("import_out", ", "),
    "before_export": submoduleBuild("before_export", ";\n"),
    "export": submoduleBuild("export", ", "),
    "after": submoduleBuild("after", ";\n")
};

Handlebars.registerHelper("submodule", function(data, options){
    return submoduleFn[options.hash.type](data);
});

//--------------------------------------------------------------------------------- TEMPLATE
var templateFn = {
    "check_imports": function(data, impTpl, notImpTpl){
        var dirs = [];
        for (var k in directives) if (directives[k]["import_in"]) dirs.push(k);
        var lists = _.pick(data, dirs);

        if(Object.keys(lists).length) return impTpl(data); else return notImpTpl(data);
    },
    "import_inner": submoduleBuild("import_in", ", "),
    "import_external": submoduleBuild("import_out", ", "),
    "name": function(data){ return data.name.slice(0,-4); },
    "precompile": function(data){ return Handlebars.precompile(data.file); }
};

Handlebars.registerHelper("template", function(data, options){
    return templateFn[options.hash.type](data, options.fn, options.inverse);
});