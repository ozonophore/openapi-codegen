// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.strict, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    \"items\": [\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(lookupProperty(data,"root"),"items"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":10,"column":9}}})) != null ? stack1 : "")
    + "    ],\n    \"httpClient\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "httpClient", {"start":{"line":12,"column":21},"end":{"line":12,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"sortByRequired\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "sortByRequired", {"start":{"line":13,"column":24},"end":{"line":13,"column":44}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"enumPrefix\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "enumPrefix", {"start":{"line":14,"column":21},"end":{"line":14,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"excludeCoreServiceFiles\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "excludeCoreServiceFiles", {"start":{"line":15,"column":33},"end":{"line":15,"column":62}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"interfacePrefix\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "interfacePrefix", {"start":{"line":16,"column":26},"end":{"line":16,"column":47}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"typePrefix\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "typePrefix", {"start":{"line":17,"column":21},"end":{"line":17,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"useCancelableRequest\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "useCancelableRequest", {"start":{"line":18,"column":30},"end":{"line":18,"column":56}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useOptions\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "useOptions", {"start":{"line":19,"column":20},"end":{"line":19,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useSeparatedIndexes\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "useSeparatedIndexes", {"start":{"line":20,"column":29},"end":{"line":20,"column":54}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useUnionTypes\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "useUnionTypes", {"start":{"line":21,"column":23},"end":{"line":21,"column":42}} ), depth0)) != null ? stack1 : "")
    + ","
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"request"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":45},"end":{"line":22,"column":41}}})) != null ? stack1 : "")
    + "\n    \"modelsMode\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "modelsMode", {"start":{"line":23,"column":21},"end":{"line":23,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"useHistory\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "useHistory", {"start":{"line":24,"column":20},"end":{"line":24,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"diffReport\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "diffReport", {"start":{"line":25,"column":21},"end":{"line":25,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"request"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":25,"column":40},"end":{"line":26,"column":41}}})) != null ? stack1 : "")
    + ",\n    \"models\": {\n        \"mode\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "modelsMode", {"start":{"line":28,"column":19},"end":{"line":28,"column":35}} ), depth0)) != null ? stack1 : "")
    + "\"\n    },\n    \"analyze\": {\n        \"useHistory\": "
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "useHistory", {"start":{"line":31,"column":24},"end":{"line":31,"column":40}} ), depth0)) != null ? stack1 : "")
    + ",\n        \"reportPath\": \""
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "diffReport", {"start":{"line":32,"column":25},"end":{"line":32,"column":41}} ), depth0)) != null ? stack1 : "")
    + "\"\n    },\n    \"miracles\": {\n        \"enabled\": true,\n        \"confidence\": 1,\n        \"types\": [\"RENAME\", \"TYPE_COERCION\"]\n    }\n}\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        {\n            \"input\": \""
    + ((stack1 = alias2(alias1(depth0, "input", {"start":{"line":6,"column":24},"end":{"line":6,"column":29}} ), depth0)) != null ? stack1 : "")
    + "\",\n            \"output\": \""
    + ((stack1 = alias2(alias1(depth0, "output", {"start":{"line":7,"column":25},"end":{"line":7,"column":31}} ), depth0)) != null ? stack1 : "")
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,lookupProperty(depth0,"request"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":34},"end":{"line":8,"column":43}}})) != null ? stack1 : "")
    + "\n        }"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias3,lookupProperty(data,"last"),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":9},"end":{"line":9,"column":38}}})) != null ? stack1 : "")
    + "\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n            \"request\": \""
    + ((stack1 = container.lambda(container.strict(depth0, "request", {"start":{"line":8,"column":26},"end":{"line":8,"column":33}} ), depth0)) != null ? stack1 : "")
    + "\"";
},"5":function(container,depth0,helpers,partials,data) {
    return ",";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ",\n    \"request\": \""
    + ((stack1 = container.lambda(container.strict(lookupProperty(data,"root"), "request", {"start":{"line":22,"column":18},"end":{"line":22,"column":31}} ), depth0)) != null ? stack1 : "")
    + "\"";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, alias3=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n    \"input\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "input", {"start":{"line":42,"column":16},"end":{"line":42,"column":27}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"output\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "output", {"start":{"line":43,"column":17},"end":{"line":43,"column":29}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"httpClient\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "httpClient", {"start":{"line":44,"column":21},"end":{"line":44,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"sortByRequired\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "sortByRequired", {"start":{"line":45,"column":24},"end":{"line":45,"column":44}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"enumPrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "enumPrefix", {"start":{"line":46,"column":21},"end":{"line":46,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"excludeCoreServiceFiles\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "excludeCoreServiceFiles", {"start":{"line":47,"column":33},"end":{"line":47,"column":62}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"interfacePrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "interfacePrefix", {"start":{"line":48,"column":26},"end":{"line":48,"column":47}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"typePrefix\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "typePrefix", {"start":{"line":49,"column":21},"end":{"line":49,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"useCancelableRequest\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useCancelableRequest", {"start":{"line":50,"column":30},"end":{"line":50,"column":56}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useOptions\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useOptions", {"start":{"line":51,"column":20},"end":{"line":51,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useSeparatedIndexes\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useSeparatedIndexes", {"start":{"line":52,"column":29},"end":{"line":52,"column":54}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"useUnionTypes\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useUnionTypes", {"start":{"line":53,"column":23},"end":{"line":53,"column":42}} ), depth0)) != null ? stack1 : "")
    + ","
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,lookupProperty(lookupProperty(data,"root"),"request"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":45},"end":{"line":54,"column":41}}})) != null ? stack1 : "")
    + "\n    \"modelsMode\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "modelsMode", {"start":{"line":55,"column":21},"end":{"line":55,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\",\n    \"useHistory\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useHistory", {"start":{"line":56,"column":20},"end":{"line":56,"column":36}} ), depth0)) != null ? stack1 : "")
    + ",\n    \"diffReport\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "diffReport", {"start":{"line":57,"column":21},"end":{"line":57,"column":37}} ), depth0)) != null ? stack1 : "")
    + "\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias3,lookupProperty(lookupProperty(data,"root"),"request"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":57,"column":40},"end":{"line":58,"column":41}}})) != null ? stack1 : "")
    + ",\n    \"models\": {\n        \"mode\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "modelsMode", {"start":{"line":60,"column":19},"end":{"line":60,"column":35}} ), depth0)) != null ? stack1 : "")
    + "\"\n    },\n    \"analyze\": {\n        \"useHistory\": "
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "useHistory", {"start":{"line":63,"column":24},"end":{"line":63,"column":40}} ), depth0)) != null ? stack1 : "")
    + ",\n        \"reportPath\": \""
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "diffReport", {"start":{"line":64,"column":25},"end":{"line":64,"column":41}} ), depth0)) != null ? stack1 : "")
    + "\"\n    },\n    \"miracles\": {\n        \"enabled\": true,\n        \"confidence\": 1,\n        \"types\": [\"RENAME\", \"TYPE_COERCION\"]\n    }\n}\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"items"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":72,"column":7}}})) != null ? stack1 : "");
},"useData":true}