// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "import type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { TOpenAPIConfig } from './OpenAPI';\nimport { OpenAPI } from './OpenAPI';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "    openApiConfig: TOpenAPIConfig = OpenAPI,\n    mapOptions?: (options: TRequestOptions | undefined) => Partial<ApiRequestOptions>,\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {\n            return __request(config, options) as Promise<TResponse>;\n        },\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {\n            const baseOptions: ApiRequestOptions = {\n                method: config.method as ApiRequestOptions['method'],\n                path: config.path,\n                headers: config.headers,\n                query: config.query,\n                body: config.body,\n            };\n\n            const mergedOptions: ApiRequestOptions = {\n                ...baseOptions,\n                ...(mapOptions ? mapOptions(options) : {}),\n            };\n\n            return __request<TResponse>(mergedOptions, openApiConfig);\n        },\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { RequestExecutor, RequestConfig } from './request-executor';\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":8,"column":11}}})) != null ? stack1 : "")
    + "import { request as __request } from './request';\n\nexport function createExecutorAdapter<TRequestOptions extends Record<string, any>>(\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":0},"end":{"line":15,"column":11}}})) != null ? stack1 : "")
    + "): RequestExecutor<TRequestOptions> {\n    return {\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":18,"column":8},"end":{"line":39,"column":15}}})) != null ? stack1 : "")
    + "    };\n}\n";
},"usePartial":true,"useData":true}