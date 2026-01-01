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

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"imports"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "import { "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":5,"column":12},"end":{"line":5,"column":16}} ), depth0)) != null ? stack1 : "")
    + "Schema"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":25},"end":{"line":5,"column":66}}})) != null ? stack1 : "")
    + " } from '"
    + ((stack1 = lookupProperty(helpers,"normalizePath").call(alias1,lookupProperty(depth0,"path"),{"name":"normalizePath","hash":{},"data":data,"loc":{"start":{"line":5,"column":75},"end":{"line":5,"column":99}}})) != null ? stack1 : "")
    + "';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":5,"column":45},"end":{"line":5,"column":50}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"imports"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + "\nimport Ajv from 'ajv';\nimport addFormats from 'ajv-formats';\n\nconst ajv = new Ajv({ allErrors: true });\naddFormats(ajv);\n\nexport const "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":15,"column":16},"end":{"line":15,"column":20}} ), depth0)) != null ? stack1 : "")
    + "Schema = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"jsonschemaSchema"),depth0,{"name":"jsonschemaSchema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n\nexport type "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":17,"column":15},"end":{"line":17,"column":19}} ), depth0)) != null ? stack1 : "")
    + " = any; // JSON Schema doesn't provide type inference\n\nexport function validate"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":27},"end":{"line":19,"column":31}} ), depth0)) != null ? stack1 : "")
    + "(data: unknown): { valid: true; data: "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":75},"end":{"line":19,"column":79}} ), depth0)) != null ? stack1 : "")
    + " } | { valid: false; errors: Ajv.ErrorObject[] } {\n    const validate = ajv.compile("
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":20,"column":36},"end":{"line":20,"column":40}} ), depth0)) != null ? stack1 : "")
    + "Schema);\n    const valid = validate(data);\n    if (valid) {\n        return { valid: true, data: data as "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":23,"column":47},"end":{"line":23,"column":51}} ), depth0)) != null ? stack1 : "")
    + " };\n    }\n    return { valid: false, errors: validate.errors || [] };\n}\n\nexport function validate"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":28,"column":27},"end":{"line":28,"column":31}} ), depth0)) != null ? stack1 : "")
    + "Sync(data: unknown): "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":28,"column":58},"end":{"line":28,"column":62}} ), depth0)) != null ? stack1 : "")
    + " {\n    const validate = ajv.compile("
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":29,"column":36},"end":{"line":29,"column":40}} ), depth0)) != null ? stack1 : "")
    + "Schema);\n    const valid = validate(data);\n    if (!valid) {\n        throw new Error(ajv.errorsText(validate.errors));\n    }\n    return data as "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":34,"column":22},"end":{"line":34,"column":26}} ), depth0)) != null ? stack1 : "")
    + ";\n}";
},"usePartial":true,"useData":true}