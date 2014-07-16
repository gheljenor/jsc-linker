//#include {headers}/handlebars

//#import {root}/fs/write-file#writer

//#export writeModule
function writeModule(module){
    //store config
    writer(module.entry + ".module.json", JSON.stringify(module, true, 2));
    if (module.library) storeLib(module);
    if (module.i18n) storeI18N(module);
    storeModule(module);
}

function storeLib(module) {
    var libCfg = module.library.files;
    var lib = [];

    for (var k in libCfg){
        lib.push( "//! ---- Library file: " + k + "\n" + libCfg[k].file + "\n") ;
    }

    writer(module.entry + ".lib.js", lib.join(";\n"));
}

function storeI18N(module){
    var i18n = "var I18N = "+JSON.stringify(module.i18n) + ";";
    writer(module.entry + ".i18n.js", i18n);
}

function storeModule(module){
    var modules = module.submodule.files;
    var entryIndex = modules[module.entry].order;
    var templates = buildTemplates(module);
    var wrapped = [];
    for (var k in modules) wrapped[ modules[k].order ] = wrapSubmodule(modules[k], module);

    var moduleFile = "(function(window, __module){ var __, __m=[],__export={};\n" +

        "var _runLogger = function(){" +
            "_runLogger.push.apply(this, arguments);" +
            "_runLogger.log.apply(this, arguments);" +
        "};" +
        "_runLogger.logs = [];" +
        "_runLogger.push = function(file, event, state, data){" +
            "_runLogger.logs.unshift({ file: file, event: event, state: state, data: data, time: new Date() });" +
            "if (_runLogger.logs.length > 1000) _runLogger.logs.length = 1000;" +
            "return this;" +
        "};" +
        "_runLogger.log = function(file, event, state, data){" +
            "if (event == 'error') console.error(file, event, state, data);" +
            "return this;" +
        "};try {\n" +

        wrapped.join("\n") + "\n" +
        templates + "\n" +

        "for (__ in __m[" + entryIndex + "]) __export[__] = __m[" + entryIndex + "][__];\n" +
        "for (__ in __export) (__module || window)[__] = __export[__];\n" +
        "__ = __m = __module = null;\n" +
        "return __export;" +
        "}catch(e){ _runLogger('module', 'error', 'startup', e); }" +
        "})(typeof window !== 'undefined' ? window : typeof exports !== 'undefined' ? exports : {}, typeof __module !== 'undefined'?__module:null);";


    writer(module.entry + ".module.js", moduleFile);
}

function wrapSubmodule (submodule, module){
    var wrapped = "__m["+submodule.order+"]=(function("; // начало обёртки модуля

        var imp = [];
        if (submodule.uses) imp = imp.concat( submodule.uses.map(function(a){ return a.inner; }) );
        if (submodule.import) imp = imp.concat( submodule.import.map(function(a){ return a.inner; }) );
        wrapped += imp.join(",");

    addLogger(submodule);

    wrapped += "){ var __, __m, __export, __module;\n"; // конец обёртки импорта

        wrapped +=  "\n//! ---- File: " + submodule.name + "\n" + submodule.file + "\n";

        // декларим глобальные переменные
        if (submodule.global) wrapped += submodule.global.map(function(a){
            return "window."+ a.outer + "=" + a.inner + ";";
        }).join("\n") + "\n";

        // экспортируем переменные
        if (submodule.export || submodule.internal || submodule.external) {
            wrapped += "return {" +
                ( submodule.export || [] )
                .concat( submodule.internal || [] )
                .concat( submodule.external || [] )
                .map(function(a){
                    return a.outer + ": " + a.inner;
                }).join(",") + "};";
        }

    wrapped += "})("; // конец обёртки содержимого модуля

        imp = [];
        if (submodule.uses) imp = imp.concat( submodule.uses.map(function(a){
            return "__m["+ module.submodule.files[ a.file ].order + "]";
        }) );
        if (submodule.import) imp = imp.concat( submodule.import.map(function(a){
            return "__m["+ module.submodule.files[ a.file ].order + "]." + a.outer;
        }) );
        wrapped += imp.join(",");

    wrapped += ");\n"; // конец обёртки импорта

    // запоминаем что нужно экспортить вовне
    if (submodule.external) wrapped += submodule.external.map(function(a){
        return "__export."+ a.outer +"=" + " __m["+submodule.order+"]." + a.outer + ";\n";
    });

    if (submodule.internal || submodule.external) {
        // импортим внутрь модуля
        wrapped += "var " + ( submodule.internal || [] ).concat( submodule.external || []).map(function(a){
            return a.outer + "=__m[" + submodule.order + "]." + a.outer;
        }).join(", ") + ";\n";

        // удаляем из экспорта подмодуля
        wrapped += ( submodule.internal || [] ).concat( submodule.external || []).map(function(a){
            return "delete __m["+submodule.order+"]." + a.outer + ";\n";
        }).join("");
    }

    return wrapped;
}

function buildTemplates(module){
    if (!module.template) return "";
    var tplCfg = module.template.files, tpls = {}, tmp, tmp_1, template;

    for (var k in tplCfg) tpls[k] = handlebars.precompile(tplCfg[k].file);

    var wrapper = "var TPL = (function(){" +
        "_runLogger('module', 'file', 'start', 'templates');" +
        "var tpl," +
            "template = Handlebars.template," +
            "templates = Handlebars.templates = Handlebars.templates || {}," +
            "partials = Handlebars.partials = Handlebars.partials || {};\n";

    for (k in tpls) {
        tmp = k.replace(".tpl", "");
        tmp_1 = k.replace(/\.(open|close)$/, "");

        wrapper += "\n//! ---- Template: " + tmp + "\n";

        if (tplCfg[tmp_1].import) {
            wrapper += "(function(imports){\n";

            wrapper += "var tpl = " + tpls[k] + ";\n";
            wrapper += "var tmp = tpl.main;\n";
            wrapper += "tpl.main = function(depth0, helpers, partials, data){ " +
                    "return tmp.call(this, _.extend(depth0, imports), helpers, partials, data);" +
                "}\n";

            wrapper += "partials['"+tmp+"'] = templates['"+tmp+"'] = template(tpl);\n";

            wrapper += "})({"+ tplCfg[k].import.map(function(a){
                return a.inner + ": __m["+ module.submodule.files[ a.file ].order + "]." + a.outer;
            }).join(",") +"});\n";

        }else {
            wrapper += "partials['"+tmp+"'] = templates['"+tmp+"'] = template("+tpls[k]+");\n";
        }
    }

    wrapper += "_runLogger('module', 'file', 'end', 'templates');";
    wrapper += "return templates;})();";

    return wrapper;
}

function addLogger(submodule){
    submodule.file = "\nvar runLogger = _runLogger.bind(this, '" + submodule.name + "');\n" +
        "try{\n" +
        "runLogger('file', 'start', '" + submodule.name + "');\n" +
        submodule.file +
        "\nrunLogger('file', 'end', '" + submodule.name + "');\n" +
        "}catch(e){ runLogger('error', 'init', e); }";
}