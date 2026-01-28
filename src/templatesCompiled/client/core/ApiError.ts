// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport class ApiError<TBody = unknown> extends Error {\n    readonly status: number;\n    readonly body?: TBody;\n    readonly headers?: Record<string, string>;\n    readonly request: RequestConfig;\n\n    constructor(params: { status: number; message: string; body?: TBody; headers?: Record<string, string>; request: RequestConfig }) {\n        super(params.message);\n        this.name = 'ApiError';\n        this.status = params.status;\n        this.body = params.body;\n        this.headers = params.headers;\n        this.request = params.request;\n    }\n}\n";
},"usePartial":true,"useData":true}