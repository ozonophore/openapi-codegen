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

  return ((stack1 = container.invokePartial(lookupProperty(partials,"zodSchema"),lookupProperty(depth0,"link"),{"name":"zodSchema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "z."
    + ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":1,"column":52},"end":{"line":1,"column":56}} ), depth0)) != null ? stack1 : "")
    + "()";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minItems", {"start":{"line":1,"column":93},"end":{"line":1,"column":101}} ), depth0)) != null ? stack1 : "")
    + ")";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maxItems", {"start":{"line":1,"column":136},"end":{"line":1,"column":144}} ), depth0)) != null ? stack1 : "")
    + ")";
},"9":function(container,depth0,helpers,partials,data) {
    return ".nullable()";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "z.array("
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":8},"end":{"line":1,"column":68}}})) != null ? stack1 : "")
    + ")"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minItems"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":69},"end":{"line":1,"column":112}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxItems"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":112},"end":{"line":1,"column":155}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":155},"end":{"line":1,"column":191}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}