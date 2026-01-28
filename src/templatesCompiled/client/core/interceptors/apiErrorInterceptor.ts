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
    + "\nimport { ErrorInterceptor } from './interceptors';\nimport { ApiError } from '../ApiError';\n\ninterface ExecutorError {\n    status: number;\n    body?: unknown;\n    headers?: Record<string, string>;\n}\n\nexport const apiErrorInterceptor: ErrorInterceptor = (error, request) => {\n    if (typeof error === 'object' && error && 'status' in error) {\n        const e = error as ExecutorError;\n\n        throw new ApiError({\n            status: e.status,\n            message: `Request failed with status ${e.status}`,\n            body: e.body,\n            headers: e.headers,\n            request,\n        });\n    }\n\n    throw error;\n};";
},"usePartial":true,"useData":true}