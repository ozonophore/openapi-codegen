// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "import { request as __request } from '../request';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "import { request as __request, requestRaw as __requestRaw } from '../request';\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "            return __request<TResponse>(toMergedOptions(config, options), openApiConfig).then((body) => ({\n                url: `${openApiConfig.BASE}${config.path}`,\n                ok: true,\n                status: 200,\n                statusText: 'OK',\n                body: body as TResponse,\n            }));\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "            return __requestRaw<TResponse>(toMergedOptions(config, options), openApiConfig);\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { ApiResult } from '../ApiResult';\nimport type { RequestExecutor, RequestConfig } from './requestExecutor';\nimport type { ApiRequestOptions } from '../ApiRequestOptions';\nimport type { TOpenAPIConfig } from '../OpenAPI';\nimport { OpenAPI } from '../OpenAPI';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"omitRequestRaw"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + "\nfunction toApiRequestOptions(config: RequestConfig): ApiRequestOptions {\n    return {\n        method: config.method as ApiRequestOptions['method'],\n        path: config.path,\n        headers: config.headers,\n        query: config.query,\n        body: config.body,\n        cookies: config.cookies,\n        mediaType: config.requestMediaType,\n        responseType: config.responseType,\n    };\n}\n\n/**\n * Creates the default RequestExecutor bridging RequestConfig to the HTTP transport.\n *\n * @param openApiConfig - Runtime OpenAPI settings (BASE, TOKEN, HEADERS, etc.)\n * @param mapOptions - Maps typed per-request options (TRequestOptions) into transport-specific ApiRequestOptions\n */\nexport function createExecutorAdapter<TRequestOptions extends Record<string, any>>(\n    openApiConfig: TOpenAPIConfig = OpenAPI,\n    mapOptions?: (options: TRequestOptions | undefined) => Partial<ApiRequestOptions>,\n): RequestExecutor<TRequestOptions> {\n    const toMergedOptions = (config: RequestConfig, options?: TRequestOptions): ApiRequestOptions => ({\n        ...toApiRequestOptions(config),\n        ...(mapOptions ? mapOptions(options) : {}),\n    });\n\n    return {\n        requestRaw<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<ApiResult<TResponse>> {\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"omitRequestRaw"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":44,"column":12},"end":{"line":54,"column":19}}})) != null ? stack1 : "")
    + "        },\n        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {\n            return __request<TResponse>(toMergedOptions(config, options), openApiConfig);\n        },\n    };\n}\n";
},"usePartial":true,"useData":true}