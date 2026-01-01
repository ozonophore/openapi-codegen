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

  return "{\n    oneOf: [\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "")
    + "    ]"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":5},"end":{"line":8,"column":25}}})) != null ? stack1 : "")
    + "\n}\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"jsonschemaSchema"),depth0,{"name":"jsonschemaSchema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(data,"last"),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":29},"end":{"line":5,"column":58}}})) != null ? stack1 : "")
    + "\n";
},"3":function(container,depth0,helpers,partials,data) {
    return ",";
},"5":function(container,depth0,helpers,partials,data) {
    return ",\n    nullable: true";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"any-of",{"name":"equals","hash":{},"fn":container.program(8, data, 0),"inverse":container.program(10, data, 0),"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":28,"column":0}}})) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    anyOf: [\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":15,"column":9}}})) != null ? stack1 : "")
    + "    ]"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":5},"end":{"line":17,"column":25}}})) != null ? stack1 : "")
    + "\n}\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"all-of",{"name":"equals","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":28,"column":0}}})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    allOf: [\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"properties"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":22,"column":0},"end":{"line":24,"column":9}}})) != null ? stack1 : "")
    + "    ]"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":25,"column":5},"end":{"line":26,"column":25}}})) != null ? stack1 : "")
    + "\n}\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"export"),"one-of",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":28,"column":11}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}