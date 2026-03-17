// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "import type { ApiRequestOptions } from '../ApiRequestOptions';\nimport type { TOpenAPIConfig } from '../OpenAPI';\nimport { OpenAPI } from '../OpenAPI';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "import { request as __request } from '../request';\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "import { request as __request, requestRaw as __requestRaw } from '../request';\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    openApiConfig: TOpenAPIConfig = OpenAPI,\n    mapOptions?: (options: TRequestOptions | undefined) => Partial<ApiRequestOptions>,\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "        requestRaw<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<ApiResult<TResponse>> {\n            return __request(config, options) as Promise<ApiResult<TResponse>>;\n        },\n        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {\n            return __request(config, options) as Promise<TResponse>;\n        },\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "        requestRaw<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<ApiResult<TResponse>> {\n            const baseOptions: ApiRequestOptions = {\n                method: config.method as ApiRequestOptions['method'],\n                path: config.path,\n                headers: config.headers,\n                query: config.query,\n                body: config.body,\n                cookies: config.cookies,\n                mediaType: config.requestMediaType,\n                responseType: config.responseType,\n            };\n\n            const mergedOptions: ApiRequestOptions = {\n                ...baseOptions,\n                ...(mapOptions ? mapOptions(options) : {}),\n            };\n\n            return __requestRaw<TResponse>(mergedOptions, openApiConfig);\n        },\n        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {\n            const baseOptions: ApiRequestOptions = {\n                method: config.method as ApiRequestOptions['method'],\n                path: config.path,\n                headers: config.headers,\n                query: config.query,\n                body: config.body,\n                cookies: config.cookies,\n                mediaType: config.requestMediaType,\n                responseType: config.responseType,\n            };\n\n            const mergedOptions: ApiRequestOptions = {\n                ...baseOptions,\n                ...(mapOptions ? mapOptions(options) : {}),\n            };\n\n            return __request<TResponse>(mergedOptions, openApiConfig);\n        },\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { ApiResult } from '../ApiResult';\nimport type { RequestExecutor, RequestConfig } from './requestExecutor';\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":9,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":14,"column":7}}})) != null ? stack1 : "")
    + "\nexport function createExecutorAdapter<TRequestOptions extends Record<string, any>>(\n"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":20,"column":11}}})) != null ? stack1 : "")
    + "): RequestExecutor<TRequestOptions> {\n    return {\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":23,"column":8},"end":{"line":69,"column":15}}})) != null ? stack1 : "")
    + "    };\n}\n";
},"usePartial":true,"useData":true}