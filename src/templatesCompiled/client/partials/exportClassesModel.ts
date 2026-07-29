// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"rawName"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":44,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"dtoName"),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":0},"end":{"line":89,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exportName"),{"name":"if","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":90,"column":0},"end":{"line":94,"column":7}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(18, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":42,"column":11}}})) != null ? stack1 : "")
    + "\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + "export interface "
    + ((stack1 = container.lambda(container.strict(depth0, "rawName", {"start":{"line":9,"column":20},"end":{"line":9,"column":27}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":4},"end":{"line":30,"column":13}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"ghostProperties"),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":4},"end":{"line":38,"column":11}}})) != null ? stack1 : "")
    + "}\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/**\n * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":6,"column":6},"end":{"line":6,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n */\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":11,"column":4},"end":{"line":28,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":29,"column":7},"end":{"line":29,"column":11}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "rawType", {"start":{"line":29,"column":34},"end":{"line":29,"column":41}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":13,"column":10},"end":{"line":13,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"diff"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":5},"end":{"line":18,"column":12}}})) != null ? stack1 : "")
    + "     */\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"diff"),"previousType"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":5},"end":{"line":17,"column":12}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "     * @info previous type: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"diff"), "previousType", {"start":{"line":16,"column":31},"end":{"line":16,"column":48}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"diff"),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":4},"end":{"line":27,"column":11}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"diff"),"previousType"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":22,"column":4},"end":{"line":26,"column":11}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * @info previous type: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"diff"), "previousType", {"start":{"line":24,"column":31},"end":{"line":24,"column":48}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"ghostProperties"),{"name":"each","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":4},"end":{"line":37,"column":13}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    /**\n     * @deprecated Removed from API\n     */\n    "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":36,"column":7},"end":{"line":36,"column":11}} ), depth0)) != null ? stack1 : "")
    + "?: unknown;\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export type "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":41,"column":15},"end":{"line":41,"column":22}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "rawType", {"start":{"line":41,"column":31},"end":{"line":41,"column":38}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"dtoKind"),"class",{"name":"equals","hash":{},"fn":container.program(21, data, 0),"inverse":container.program(35, data, 0),"data":data,"loc":{"start":{"line":46,"column":0},"end":{"line":87,"column":11}}})) != null ? stack1 : "")
    + "\n";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export class "
    + ((stack1 = alias2(alias1(depth0, "dtoName", {"start":{"line":47,"column":16},"end":{"line":47,"column":23}} ), depth0)) != null ? stack1 : "")
    + " extends BaseDto<"
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":47,"column":46},"end":{"line":47,"column":53}} ), depth0)) != null ? stack1 : "")
    + "> {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":4},"end":{"line":50,"column":13}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,lookupProperty(depth0,"dtoGetters"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":52,"column":4},"end":{"line":63,"column":11}}})) != null ? stack1 : "")
    + "\n    public constructor(data: "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":65,"column":32},"end":{"line":65,"column":39}} ), depth0)) != null ? stack1 : "")
    + ") {\n        super(data);\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":67,"column":8},"end":{"line":69,"column":17}}})) != null ? stack1 : "")
    + "    }\n\n    public toJSON(): "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":72,"column":24},"end":{"line":72,"column":31}} ), depth0)) != null ? stack1 : "")
    + " {\n        return {\n            ...this._raw,\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(30, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":75,"column":12},"end":{"line":81,"column":21}}})) != null ? stack1 : "")
    + "        };\n    }\n}\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    public readonly "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":49,"column":23},"end":{"line":49,"column":27}} ), depth0)) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "dtoType", {"start":{"line":49,"column":35},"end":{"line":49,"column":42}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"dtoGetters"),{"name":"each","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":4},"end":{"line":62,"column":13}}})) != null ? stack1 : "");
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * @miracle: "
    + ((stack1 = alias2(alias1(depth0, "oldName", {"start":{"line":55,"column":20},"end":{"line":55,"column":27}} ), depth0)) != null ? stack1 : "")
    + " -> "
    + ((stack1 = alias2(alias1(depth0, "newName", {"start":{"line":55,"column":37},"end":{"line":55,"column":44}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"confidence"),{"name":"if","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":55,"column":47},"end":{"line":55,"column":103}}})) != null ? stack1 : "")
    + "\n     * @deprecated\n     */\n    public get "
    + ((stack1 = alias2(alias1(depth0, "oldName", {"start":{"line":58,"column":18},"end":{"line":58,"column":25}} ), depth0)) != null ? stack1 : "")
    + "() {\n        return "
    + ((stack1 = alias2(alias1(depth0, "target", {"start":{"line":59,"column":18},"end":{"line":59,"column":24}} ), depth0)) != null ? stack1 : "")
    + ";\n    }\n\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " (confidence: "
    + ((stack1 = container.lambda(container.strict(depth0, "confidence", {"start":{"line":55,"column":82},"end":{"line":55,"column":92}} ), depth0)) != null ? stack1 : "")
    + ")";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "        this"
    + ((stack1 = alias2(alias1(depth0, "dtoTarget", {"start":{"line":68,"column":15},"end":{"line":68,"column":24}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "dtoInit", {"start":{"line":68,"column":33},"end":{"line":68,"column":40}} ), depth0)) != null ? stack1 : "")
    + ";\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"dtoToJSON"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.program(33, data, 0),"data":data,"loc":{"start":{"line":76,"column":12},"end":{"line":80,"column":19}}})) != null ? stack1 : "");
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "            "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":77,"column":15},"end":{"line":77,"column":19}} ), depth0)) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "dtoToJSON", {"start":{"line":77,"column":27},"end":{"line":77,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "            "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":79,"column":15},"end":{"line":79,"column":19}} ), depth0)) != null ? stack1 : "")
    + ": this"
    + ((stack1 = alias2(alias1(depth0, "dtoTarget", {"start":{"line":79,"column":31},"end":{"line":79,"column":40}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export type "
    + ((stack1 = alias2(alias1(depth0, "dtoName", {"start":{"line":86,"column":15},"end":{"line":86,"column":22}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":86,"column":31},"end":{"line":86,"column":38}} ), depth0)) != null ? stack1 : "")
    + ";\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"rawName"),{"name":"if","hash":{},"fn":container.program(38, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":91,"column":0},"end":{"line":93,"column":7}}})) != null ? stack1 : "");
},"38":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export type "
    + ((stack1 = alias2(alias1(depth0, "exportName", {"start":{"line":92,"column":15},"end":{"line":92,"column":25}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":92,"column":34},"end":{"line":92,"column":41}} ), depth0)) != null ? stack1 : "")
    + ";\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isDefinition"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":95,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}