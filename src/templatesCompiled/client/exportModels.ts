// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isDefinition"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":43,"column":7}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"rawName"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":42,"column":7}}})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"interface",{"name":"equals","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":40,"column":11}}})) != null ? stack1 : "")
    + "\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":14,"column":7}}})) != null ? stack1 : "")
    + "export interface "
    + ((stack1 = container.lambda(container.strict(depth0, "rawName", {"start":{"line":15,"column":20},"end":{"line":15,"column":27}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":4},"end":{"line":36,"column":13}}})) != null ? stack1 : "")
    + "}\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/**\n * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":12,"column":6},"end":{"line":12,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n */\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":17,"column":4},"end":{"line":34,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":35,"column":7},"end":{"line":35,"column":11}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "rawType", {"start":{"line":35,"column":34},"end":{"line":35,"column":41}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":19,"column":10},"end":{"line":19,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"diff"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":5},"end":{"line":24,"column":12}}})) != null ? stack1 : "")
    + "     */\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"diff"),"previousType"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":5},"end":{"line":23,"column":12}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "     * @info previous type: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"diff"), "previousType", {"start":{"line":22,"column":31},"end":{"line":22,"column":48}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"diff"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":4},"end":{"line":33,"column":11}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"diff"),"previousType"),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":4},"end":{"line":32,"column":11}}})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * @info previous type: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"diff"), "previousType", {"start":{"line":30,"column":31},"end":{"line":30,"column":48}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export type "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":39,"column":15},"end":{"line":39,"column":22}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "rawType", {"start":{"line":39,"column":31},"end":{"line":39,"column":38}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isDefinition"),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":47,"column":0},"end":{"line":93,"column":7}}})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"dtoName"),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":0},"end":{"line":92,"column":7}}})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"dtoKind"),"class",{"name":"equals","hash":{},"fn":container.program(21, data, 0),"inverse":container.program(35, data, 0),"data":data,"loc":{"start":{"line":49,"column":0},"end":{"line":90,"column":11}}})) != null ? stack1 : "")
    + "\n";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export class "
    + ((stack1 = alias2(alias1(depth0, "dtoName", {"start":{"line":50,"column":16},"end":{"line":50,"column":23}} ), depth0)) != null ? stack1 : "")
    + " extends BaseDto<"
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":50,"column":46},"end":{"line":50,"column":53}} ), depth0)) != null ? stack1 : "")
    + "> {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":51,"column":4},"end":{"line":53,"column":13}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,lookupProperty(depth0,"dtoGetters"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":55,"column":4},"end":{"line":66,"column":11}}})) != null ? stack1 : "")
    + "\n    public constructor(data: "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":68,"column":32},"end":{"line":68,"column":39}} ), depth0)) != null ? stack1 : "")
    + ") {\n        super(data);\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":70,"column":8},"end":{"line":72,"column":17}}})) != null ? stack1 : "")
    + "    }\n\n    public toJSON(): "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":75,"column":24},"end":{"line":75,"column":31}} ), depth0)) != null ? stack1 : "")
    + " {\n        return {\n            ...this._raw,\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias3,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(30, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":78,"column":12},"end":{"line":84,"column":21}}})) != null ? stack1 : "")
    + "        };\n    }\n}\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    public readonly "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":52,"column":23},"end":{"line":52,"column":27}} ), depth0)) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "dtoType", {"start":{"line":52,"column":35},"end":{"line":52,"column":42}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isNullable"),depth0,{"name":"isNullable","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"dtoGetters"),{"name":"each","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":56,"column":4},"end":{"line":65,"column":13}}})) != null ? stack1 : "");
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * @miracle: "
    + ((stack1 = alias2(alias1(depth0, "oldName", {"start":{"line":58,"column":20},"end":{"line":58,"column":27}} ), depth0)) != null ? stack1 : "")
    + " -> "
    + ((stack1 = alias2(alias1(depth0, "newName", {"start":{"line":58,"column":37},"end":{"line":58,"column":44}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"confidence"),{"name":"if","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":58,"column":47},"end":{"line":58,"column":103}}})) != null ? stack1 : "")
    + "\n     * @deprecated\n     */\n    public get "
    + ((stack1 = alias2(alias1(depth0, "oldName", {"start":{"line":61,"column":18},"end":{"line":61,"column":25}} ), depth0)) != null ? stack1 : "")
    + "() {\n        return "
    + ((stack1 = alias2(alias1(depth0, "target", {"start":{"line":62,"column":18},"end":{"line":62,"column":24}} ), depth0)) != null ? stack1 : "")
    + ";\n    }\n\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " (confidence: "
    + ((stack1 = container.lambda(container.strict(depth0, "confidence", {"start":{"line":58,"column":82},"end":{"line":58,"column":92}} ), depth0)) != null ? stack1 : "")
    + ")";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "        this"
    + ((stack1 = alias2(alias1(depth0, "dtoTarget", {"start":{"line":71,"column":15},"end":{"line":71,"column":24}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "dtoInit", {"start":{"line":71,"column":33},"end":{"line":71,"column":40}} ), depth0)) != null ? stack1 : "")
    + ";\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"dtoToJSON"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.program(33, data, 0),"data":data,"loc":{"start":{"line":79,"column":12},"end":{"line":83,"column":19}}})) != null ? stack1 : "");
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "            "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":80,"column":15},"end":{"line":80,"column":19}} ), depth0)) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "dtoToJSON", {"start":{"line":80,"column":27},"end":{"line":80,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "            "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":82,"column":15},"end":{"line":82,"column":19}} ), depth0)) != null ? stack1 : "")
    + ": this"
    + ((stack1 = alias2(alias1(depth0, "dtoTarget", {"start":{"line":82,"column":31},"end":{"line":82,"column":40}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export type "
    + ((stack1 = alias2(alias1(depth0, "dtoName", {"start":{"line":89,"column":15},"end":{"line":89,"column":22}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "rawName", {"start":{"line":89,"column":31},"end":{"line":89,"column":38}} ), depth0)) != null ? stack1 : "")
    + ";\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { BaseDto } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"BaseDto",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":3,"column":25},"end":{"line":3,"column":66}}})) != null ? stack1 : "")
    + "';\nimport { fromArray } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"dtoUtils",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":4,"column":27},"end":{"line":4,"column":69}}})) != null ? stack1 : "")
    + "';\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":44,"column":9}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":46,"column":0},"end":{"line":94,"column":9}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}