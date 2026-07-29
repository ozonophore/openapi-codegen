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

  return ((stack1 = container.invokePartial(lookupProperty(partials,"exportClassesModel"),depth0,{"name":"exportClassesModel","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
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
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":9}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}