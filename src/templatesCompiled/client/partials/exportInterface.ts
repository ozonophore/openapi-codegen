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

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":12,"column":11}}})) != null ? stack1 : "")
    + "    "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isReadOnly"),depth0,{"name":"isReadOnly","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":13,"column":22},"end":{"line":13,"column":26}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","hash":{"parent":lookupProperty(depths[1],"name")},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":10,"column":10},"end":{"line":10,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useUnionTypes"),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":40,"column":11}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\nexport namespace "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":19,"column":20},"end":{"line":19,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":4},"end":{"line":37,"column":13}}})) != null ? stack1 : "")
    + "\n}\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":22,"column":4},"end":{"line":26,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":27,"column":4},"end":{"line":31,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":8},"end":{"line":34,"column":17}}})) != null ? stack1 : "")
    + "    }\n\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":28,"column":19},"end":{"line":28,"column":24}} ), depth0)) != null ? stack1 : "")
    + " {\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":30,"column":19},"end":{"line":30,"column":23}} ), depth0)) != null ? stack1 : "")
    + " {\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "        "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":33,"column":11},"end":{"line":33,"column":15}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":33,"column":24},"end":{"line":33,"column":29}} ), depth0)) != null ? stack1 : "")
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
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":14,"column":13}}})) != null ? stack1 : "")
    + "}\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(6, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":41,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true}