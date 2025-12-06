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
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":12,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"containsSpaces").call(alias1,lookupProperty(depth0,"name"),{"name":"containsSpaces","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(8, data, 0),"data":data,"loc":{"start":{"line":13,"column":4},"end":{"line":17,"column":23}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    /**\n     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":10,"column":10},"end":{"line":10,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n     */\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "    \""
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":14,"column":8},"end":{"line":14,"column":12}} ), depth0)) != null ? stack1 : "")
    + "\" = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":14,"column":22},"end":{"line":14,"column":27}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "    "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":16,"column":7},"end":{"line":16,"column":11}} ), depth0)) != null ? stack1 : "")
    + " = "
    + ((stack1 = alias2(alias1(depth0, "value", {"start":{"line":16,"column":20},"end":{"line":16,"column":25}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "export enum "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":6,"column":15},"end":{"line":6,"column":19}} ), depth0)) != null ? stack1 : "")
    + " {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":18,"column":13}}})) != null ? stack1 : "")
    + "}\n";
},"useData":true}