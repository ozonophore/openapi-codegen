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
    + "\nimport * as yup from 'yup';\n\nexport const "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":11,"column":16},"end":{"line":11,"column":20}} ), depth0)) != null ? stack1 : "")
    + "Schema = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"yupSchema"),depth0,{"name":"yupSchema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n\nexport type "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":13,"column":15},"end":{"line":13,"column":19}} ), depth0)) != null ? stack1 : "")
    + " = yup.InferType<typeof "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":13,"column":49},"end":{"line":13,"column":53}} ), depth0)) != null ? stack1 : "")
    + "Schema>;\n\nexport async function validate"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":15,"column":33},"end":{"line":15,"column":37}} ), depth0)) != null ? stack1 : "")
    + "(data: unknown): Promise<"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":15,"column":68},"end":{"line":15,"column":72}} ), depth0)) != null ? stack1 : "")
    + "> {\n    return await "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":16,"column":20},"end":{"line":16,"column":24}} ), depth0)) != null ? stack1 : "")
    + "Schema.validate(data);\n}\n\nexport function validate"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":27},"end":{"line":19,"column":31}} ), depth0)) != null ? stack1 : "")
    + "Sync(data: unknown): "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":58},"end":{"line":19,"column":62}} ), depth0)) != null ? stack1 : "")
    + " {\n    return "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":20,"column":14},"end":{"line":20,"column":18}} ), depth0)) != null ? stack1 : "")
    + "Schema.validateSync(data);\n}\n\nexport function validate"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":23,"column":27},"end":{"line":23,"column":31}} ), depth0)) != null ? stack1 : "")
    + "SyncStrict(data: unknown): "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":23,"column":64},"end":{"line":23,"column":68}} ), depth0)) != null ? stack1 : "")
    + " {\n    return "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":24,"column":14},"end":{"line":24,"column":18}} ), depth0)) != null ? stack1 : "")
    + "Schema.validateSync(data, { strict: true });\n}";
},"usePartial":true,"useData":true}