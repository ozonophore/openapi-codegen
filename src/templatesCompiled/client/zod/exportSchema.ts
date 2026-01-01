// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { z } from 'zod';\n\nexport const "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":5,"column":16},"end":{"line":5,"column":20}} ), depth0)) != null ? stack1 : "")
    + "Schema = "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"zodSchema"),depth0,{"name":"zodSchema","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ";\n\nexport type "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":7,"column":15},"end":{"line":7,"column":19}} ), depth0)) != null ? stack1 : "")
    + " = z.infer<typeof "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":7,"column":43},"end":{"line":7,"column":47}} ), depth0)) != null ? stack1 : "")
    + "Schema>;\n\nexport function validate"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":9,"column":27},"end":{"line":9,"column":31}} ), depth0)) != null ? stack1 : "")
    + "(data: unknown): "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":9,"column":54},"end":{"line":9,"column":58}} ), depth0)) != null ? stack1 : "")
    + " {\n    return "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":10,"column":14},"end":{"line":10,"column":18}} ), depth0)) != null ? stack1 : "")
    + "Schema.parse(data);\n}\n\nexport function safeValidate"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":13,"column":31},"end":{"line":13,"column":35}} ), depth0)) != null ? stack1 : "")
    + "(data: unknown): { success: true; data: "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":13,"column":81},"end":{"line":13,"column":85}} ), depth0)) != null ? stack1 : "")
    + " } | { success: false; error: z.ZodError } {\n    const result = "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":14,"column":22},"end":{"line":14,"column":26}} ), depth0)) != null ? stack1 : "")
    + "Schema.safeParse(data);\n    if (result.success) {\n        return { success: true, data: result.data };\n    }\n    return { success: false, error: result.error };\n}";
},"usePartial":true,"useData":true}