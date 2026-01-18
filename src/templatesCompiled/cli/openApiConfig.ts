// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    \"items\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "items", {"start":{"line":3,"column":15},"end":{"line":3,"column":26}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"httpClient\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "httpClient", {"start":{"line":4,"column":21},"end":{"line":4,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"sortByRequired\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "sortByRequired", {"start":{"line":5,"column":24},"end":{"line":5,"column":44}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"enumPrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "enumPrefix", {"start":{"line":6,"column":21},"end":{"line":6,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"excludeCoreServiceFiles\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "excludeCoreServiceFiles", {"start":{"line":7,"column":33},"end":{"line":7,"column":62}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"interfacePrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "interfacePrefix", {"start":{"line":8,"column":26},"end":{"line":8,"column":47}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"typePrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "typePrefix", {"start":{"line":9,"column":21},"end":{"line":9,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"useCancelableRequest\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useCancelableRequest", {"start":{"line":10,"column":30},"end":{"line":10,"column":56}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useOptions\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useOptions", {"start":{"line":11,"column":20},"end":{"line":11,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useSeparatedIndexes\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useSeparatedIndexes", {"start":{"line":12,"column":29},"end":{"line":12,"column":54}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useUnionTypes\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useUnionTypes", {"start":{"line":13,"column":23},"end":{"line":13,"column":42}} ), depth0)) != null ? stack1 : "")
    + ",\n    "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"request"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":4},"end":{"line":14,"column":62}}})) != null ? stack1 : "")
    + "\n}\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\"request\": \""
    + ((stack1 = container.lambda(container.strict(lookupProperty(data,"root"), "request", {"start":{"line":14,"column":39},"end":{"line":14,"column":52}} ), depth0)) != null ? stack1 : "")
    + "\"";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    \"input\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "input", {"start":{"line":18,"column":16},"end":{"line":18,"column":27}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"output\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "output", {"start":{"line":19,"column":17},"end":{"line":19,"column":29}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"httpClient\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "httpClient", {"start":{"line":20,"column":21},"end":{"line":20,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"sortByRequired\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "sortByRequired", {"start":{"line":21,"column":24},"end":{"line":21,"column":44}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"enumPrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "enumPrefix", {"start":{"line":22,"column":21},"end":{"line":22,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"excludeCoreServiceFiles\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "excludeCoreServiceFiles", {"start":{"line":23,"column":33},"end":{"line":23,"column":62}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"interfacePrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "interfacePrefix", {"start":{"line":24,"column":26},"end":{"line":24,"column":47}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"typePrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "typePrefix", {"start":{"line":25,"column":21},"end":{"line":25,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"useCancelableRequest\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useCancelableRequest", {"start":{"line":26,"column":30},"end":{"line":26,"column":56}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useOptions\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useOptions", {"start":{"line":27,"column":20},"end":{"line":27,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useSeparatedIndexes\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useSeparatedIndexes", {"start":{"line":28,"column":29},"end":{"line":28,"column":54}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useUnionTypes\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useUnionTypes", {"start":{"line":29,"column":23},"end":{"line":29,"column":42}} ), depth0)) != null ? stack1 : "")
    + ",\n    "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"request"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":4},"end":{"line":30,"column":62}}})) != null ? stack1 : "")
    + "\n}\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useMultyOptions"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":32,"column":7}}})) != null ? stack1 : "");
},"useData":true}