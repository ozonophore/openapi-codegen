// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "import { requestRaw as legacyRequestRaw } from '../request';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "            return legacyRequestRaw<TResponse>(toMergedOptions(config, options), openApiConfig);\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "            return legacyRequest<TResponse>(toMergedOptions(config, options), openApiConfig).then((body) => ({\n                url: `${openApiConfig.BASE}${config.path}`,\n                ok: true,\n                status: 200,\n                statusText: 'OK',\n                body: body as TResponse,\n            }));\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { ApiResult } from '../ApiResult';\nimport type { ApiRequestOptions } from '../ApiRequestOptions';\nimport type { TOpenAPIConfig } from '../OpenAPI';\nimport { OpenAPI } from '../OpenAPI';\nimport { request as legacyRequest } from '../request';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequestRaw"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":10,"column":7}}})) != null ? stack1 : "")
    + "import type { RequestExecutor, RequestConfig } from './requestExecutor';\n\nfunction toApiRequestOptions(config: RequestConfig): ApiRequestOptions {\n    return {\n        method: config.method as ApiRequestOptions['method'],\n        path: config.path,\n        headers: config.headers,\n        query: config.query,\n        body: config.body,\n        cookies: config.cookies,\n        mediaType: config.requestMediaType,\n        responseType: config.responseType,\n    };\n}\n\n/**\n * Adapts legacy request(options, config) transport to the RequestExecutor contract.\n * Use via createClient({ executorFactory: ({ openApiConfig }) => createLegacyRequestAdapter(openApiConfig) }).\n */\nexport function createLegacyRequestAdapter<TRequestOptions extends Record<string, any>>(\n    openApiConfig: TOpenAPIConfig = OpenAPI,\n    mapOptions?: (options: TRequestOptions | undefined) => Partial<ApiRequestOptions>,\n): RequestExecutor<TRequestOptions> {\n    const toMergedOptions = (config: RequestConfig, options?: TRequestOptions): ApiRequestOptions => ({\n        ...toApiRequestOptions(config),\n        ...(mapOptions ? mapOptions(options) : {}),\n    });\n\n    return {\n        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {\n            return legacyRequest<TResponse>(toMergedOptions(config, options), openApiConfig);\n        },\n\n        requestRaw<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<ApiResult<TResponse>> {\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCustomRequestRaw"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":45,"column":12},"end":{"line":55,"column":19}}})) != null ? stack1 : "")
    + "        },\n    };\n}\n";
},"usePartial":true,"useData":true}