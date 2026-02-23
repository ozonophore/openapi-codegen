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

  return ((stack1 = container.invokePartial(lookupProperty(partials,"zod/zodSchema"),lookupProperty(depth0,"link"),{"name":"zod/zodSchema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"zodBaseSchema").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),{"name":"zodBaseSchema","hash":{},"data":data,"loc":{"start":{"line":1,"column":51},"end":{"line":1,"column":73}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minItems", {"start":{"line":1,"column":105},"end":{"line":1,"column":113}} ), depth0)) != null ? stack1 : "")
    + ")";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maxItems", {"start":{"line":1,"column":148},"end":{"line":1,"column":156}} ), depth0)) != null ? stack1 : "")
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
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":8},"end":{"line":1,"column":80}}})) != null ? stack1 : "")
    + ")"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minItems"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":81},"end":{"line":1,"column":124}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxItems"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":124},"end":{"line":1,"column":167}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":167},"end":{"line":1,"column":203}}})) != null ? stack1 : "")
    + "\n";
},"usePartial":true,"useData":true}