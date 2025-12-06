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
    + "\nimport type { ApiResult } from './ApiResult';\n\nexport class ApiError extends Error {\n    public readonly url: string;\n    public readonly status: number;\n    public readonly statusText: string;\n    public readonly body: any;\n\n    constructor(response: ApiResult, message: string) {\n        super(message);\n\n        this.url = response.url;\n        this.status = response.status;\n        this.statusText = response.statusText;\n        this.body = response.body;\n    }\n}\n";
},"usePartial":true,"useData":true}