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
    + "\nimport type { ApiResult } from './ApiResult';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { TOpenAPIConfig } from './OpenAPI';\nimport { OpenAPI } from './OpenAPI';\nimport type { RequestExecutor, RequestConfig } from './executor/requestExecutor';\nimport { request as transportRequest, requestRaw as transportRequestRaw } from './request';\n\n/**\n * Typed per-request options mapped into ApiRequestOptions via mapOptions.\n */\nexport interface MyCustomOptions {\n    timeout?: number;\n}\n\nfunction toApiRequestOptions(config: RequestConfig): ApiRequestOptions {\n    return {\n        method: config.method as ApiRequestOptions['method'],\n        path: config.path,\n        headers: config.headers,\n        query: config.query,\n        body: config.body,\n        cookies: config.cookies,\n        mediaType: config.requestMediaType,\n        responseType: config.responseType,\n    };\n}\n\n/**\n * Custom createExecutorAdapter for openapi.config.json \"customExecutorPath\".\n * Must export a function named createExecutorAdapter.\n */\nexport function createExecutorAdapter<TRequestOptions extends MyCustomOptions = MyCustomOptions>(\n    openApiConfig: TOpenAPIConfig = OpenAPI,\n    mapOptions?: (options: TRequestOptions | undefined) => Partial<ApiRequestOptions>,\n): RequestExecutor<TRequestOptions> {\n    const toMergedOptions = (config: RequestConfig, options?: TRequestOptions): ApiRequestOptions => ({\n        ...toApiRequestOptions(config),\n        ...(mapOptions ? mapOptions(options) : {}),\n    });\n\n    return {\n        request<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<TResponse> {\n            return transportRequest<TResponse>(toMergedOptions(config, options), openApiConfig);\n        },\n\n        requestRaw<TResponse>(config: RequestConfig, options?: TRequestOptions): Promise<ApiResult<TResponse>> {\n            return transportRequestRaw<TResponse>(toMergedOptions(config, options), openApiConfig);\n        },\n    };\n}\n";
},"usePartial":true,"useData":true}