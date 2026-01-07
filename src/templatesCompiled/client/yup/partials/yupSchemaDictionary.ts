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

  return ((stack1 = lookupProperty(helpers,"isBasicType").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"link"),{"name":"isBasicType","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":3,"column":35},"end":{"line":3,"column":183}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"yupBaseSchema").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"link"),"base"),{"name":"yupBaseSchema","hash":{},"data":data,"loc":{"start":{"line":3,"column":56},"end":{"line":3,"column":83}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"link"),"alias"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":3,"column":91},"end":{"line":3,"column":167}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"link"), "alias", {"start":{"line":3,"column":112},"end":{"line":3,"column":122}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"link"), "type", {"start":{"line":3,"column":142},"end":{"line":3,"column":151}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"yupBaseSchema").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),{"name":"yupBaseSchema","hash":{},"data":data,"loc":{"start":{"line":3,"column":191},"end":{"line":3,"column":213}}})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    return ".nullable()";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "yup.lazy(() => yup.object().test('dictionary', 'Must be a dictionary', function(value: any) {\n    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;\n    const itemSchema = "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":3,"column":23},"end":{"line":3,"column":220}}})) != null ? stack1 : "")
    + ";\n    const dict = value as Record<string, any>;\n    for (const key in dict) {\n        if (Object.prototype.hasOwnProperty.call(dict, key)) {\n            try {\n                itemSchema.validateSync(dict[key]);\n            } catch {\n                return false;\n            }\n        }\n    }\n    return true;\n}))"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":3},"end":{"line":15,"column":39}}})) != null ? stack1 : "");
},"useData":true}