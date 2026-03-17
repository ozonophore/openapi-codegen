// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/**\n * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":3,"column":6},"end":{"line":3,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n */\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.program(8, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":25,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isReadOnly"),depth0,{"name":"isReadOnly","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":26,"column":22},"end":{"line":26,"column":26}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","hash":{"parent":lookupProperty(depths[1],"name")},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":10,"column":10},"end":{"line":10,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"diff"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":5},"end":{"line":15,"column":12}}})) != null ? stack1 : "")
    + "     */\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"diff"),"previousType"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":5},"end":{"line":14,"column":12}}})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "     * @info previous type: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"diff"), "previousType", {"start":{"line":13,"column":31},"end":{"line":13,"column":48}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"diff"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":4},"end":{"line":24,"column":11}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"diff"),"previousType"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":4},"end":{"line":23,"column":11}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n     * @info previous type: "
    + ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"diff"), "previousType", {"start":{"line":21,"column":31},"end":{"line":21,"column":48}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"ghostProperties"),{"name":"each","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":4},"end":{"line":34,"column":13}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    /**\n     * @deprecated Removed from API\n     */\n    "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":33,"column":7},"end":{"line":33,"column":11}} ), depth0)) != null ? stack1 : "")
    + "?: unknown;\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"unless","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":38,"column":0},"end":{"line":61,"column":11}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\nexport namespace "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":40,"column":20},"end":{"line":40,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":42,"column":4},"end":{"line":58,"column":13}}})) != null ? stack1 : "")
    + "\n}\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":4},"end":{"line":47,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.program(22, data, 0),"data":data,"loc":{"start":{"line":48,"column":4},"end":{"line":52,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":8},"end":{"line":55,"column":17}}})) != null ? stack1 : "")
    + "    }\n\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":45,"column":10},"end":{"line":45,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":49,"column":19},"end":{"line":49,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":51,"column":19},"end":{"line":51,"column":23}} ), depth0)) != null ? stack1 : "")
    + " {\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "        "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":54,"column":11},"end":{"line":54,"column":15}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":54,"column":24},"end":{"line":54,"column":29}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "export interface "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":6,"column":20},"end":{"line":6,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":27,"column":13}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"ghostProperties"),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":4},"end":{"line":35,"column":11}}})) != null ? stack1 : "")
    + "}\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(15, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":37,"column":0},"end":{"line":62,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true}