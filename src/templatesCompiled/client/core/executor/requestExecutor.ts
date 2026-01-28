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
    + "\nexport interface RequestConfig {\n  method: string;\n  path: string;\n\n  headers?: Record<string, string>;\n  query?: Record<string, any>;\n  body?: unknown;\n\n  requestMediaType?: string;\n  cookies?: Record<string, string>;\n}\n\nexport interface RequestExecutor<TOptions = unknown> {\n  request<TResponse>(\n    config: RequestConfig,\n    options?: TOptions\n  ): Promise<TResponse>;\n}";
},"usePartial":true,"useData":true}