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
    + "\nimport { RequestConfig } from '../executor/requestExecutor';\n\nexport type RequestInterceptor =\n  (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;\n\nexport type ResponseInterceptor<T = unknown> =\n  (response: T, context: RequestConfig) => T | Promise<T>;\n\nexport type ErrorInterceptor =\n  (error: unknown, context: RequestConfig) => unknown | Promise<unknown>;";
},"usePartial":true,"useData":true}