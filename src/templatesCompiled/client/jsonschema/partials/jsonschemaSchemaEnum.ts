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

  return "    enum: [\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"enum"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "")
    + "    ],\n    type: '"
    + ((stack1 = lookupProperty(helpers,"getEnumType").call(alias1,lookupProperty(depth0,"enum"),{"name":"getEnumType","hash":{},"data":data,"loc":{"start":{"line":8,"column":11},"end":{"line":8,"column":31}}})) != null ? stack1 : "")
    + "',\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        "
    + ((stack1 = container.lambda(container.strict(depth0, "value", {"start":{"line":5,"column":11},"end":{"line":5,"column":16}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(data,"last"),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":19},"end":{"line":5,"column":48}}})) != null ? stack1 : "")
    + "\n";
},"3":function(container,depth0,helpers,partials,data) {
    return ",";
},"5":function(container,depth0,helpers,partials,data) {
    return "    type: 'any',\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    nullable: true,\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"enum"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":11,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":0},"end":{"line":14,"column":7}}})) != null ? stack1 : "")
    + "}";
},"useData":true}