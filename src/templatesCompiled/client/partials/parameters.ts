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

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useOptions"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":35,"column":7}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":11,"column":9}}})) != null ? stack1 : "")
    + "}: {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":23,"column":9}}})) != null ? stack1 : "")
    + "}";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"containsSystemName").call(alias1,lookupProperty(depth0,"name"),{"name":"containsSystemName","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":9,"column":23}}})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":10,"column":3},"end":{"line":10,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"default"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":10},"end":{"line":10,"column":48}}})) != null ? stack1 : "")
    + ",\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "/**\n* [WARN] Be careful! A reserved system word is used!\n*/\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " = "
    + ((stack1 = container.lambda(container.strict(depth0, "default", {"start":{"line":10,"column":31},"end":{"line":10,"column":38}} ), depth0)) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":16,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"containsSystemName").call(alias1,lookupProperty(depth0,"name"),{"name":"containsSystemName","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":21,"column":23}}})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":22,"column":3},"end":{"line":22,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ",\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "/** "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":15,"column":7},"end":{"line":15,"column":18}} ), depth0)) != null ? stack1 : "")
    + " **/\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":0},"end":{"line":34,"column":9}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"containsSystemName").call(alias1,lookupProperty(depth0,"name"),{"name":"containsSystemName","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":0},"end":{"line":32,"column":23}}})) != null ? stack1 : "")
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":33,"column":3},"end":{"line":33,"column":7}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(lookupProperty(partials,"isRequired"),depth0,{"name":"isRequired","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"type"),depth0,{"name":"type","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"default"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":36},"end":{"line":33,"column":74}}})) != null ? stack1 : "")
    + ",\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":36,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}