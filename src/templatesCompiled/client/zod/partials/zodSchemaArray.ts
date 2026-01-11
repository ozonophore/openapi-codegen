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

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"link"),"alias"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":1,"column":20},"end":{"line":1,"column":96}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"link"), "alias", {"start":{"line":1,"column":41},"end":{"line":1,"column":51}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"link"), "type", {"start":{"line":1,"column":71},"end":{"line":1,"column":80}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "z."
    + ((stack1 = container.lambda(container.strict(depth0, "base", {"start":{"line":1,"column":109},"end":{"line":1,"column":113}} ), depth0)) != null ? stack1 : "")
    + "()";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minItems", {"start":{"line":1,"column":150},"end":{"line":1,"column":158}} ), depth0)) != null ? stack1 : "")
    + ")";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maxItems", {"start":{"line":1,"column":193},"end":{"line":1,"column":201}} ), depth0)) != null ? stack1 : "")
    + ")";
},"12":function(container,depth0,helpers,partials,data) {
    return ".nullable()";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "z.array("
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":1,"column":8},"end":{"line":1,"column":125}}})) != null ? stack1 : "")
    + ")"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minItems"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":126},"end":{"line":1,"column":169}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxItems"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":169},"end":{"line":1,"column":212}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":212},"end":{"line":1,"column":248}}})) != null ? stack1 : "");
},"useData":true}