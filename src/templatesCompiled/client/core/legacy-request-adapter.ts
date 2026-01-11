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
    + "\nimport type { RequestExecutor, RequestConfig } from './request-executor';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { TOpenAPIConfig } from './OpenAPI';\nimport { OpenAPI } from './OpenAPI';\nimport { request as __request } from './request';\n\n/**\n * Legacy RequestExecutor-адаптер поверх существующего request(ApiRequestOptions, OpenAPI).\n *\n * TOptions — тип рантайм-опций транспорта (IXHROptions, IFetchOptions и т.п.).\n * mapOptions — опциональная функция, которая мапит TOptions → часть ApiRequestOptions.\n */\nexport function createLegacyExecutor<TOptions = unknown>(\n    openApiConfig: TOpenAPIConfig = OpenAPI,\n    mapOptions?: (options: TOptions | undefined) => Partial<ApiRequestOptions>,\n): RequestExecutor<TOptions> {\n    return {\n        request<TResponse>(config: RequestConfig, options?: TOptions): Promise<TResponse> {\n            const baseOptions: ApiRequestOptions = {\n                method: config.method as ApiRequestOptions['method'],\n                path: config.url,         // RequestConfig.url → ApiRequestOptions.path\n                headers: config.headers,\n                query: config.query,\n                body: config.body,\n            };\n\n            const mergedOptions: ApiRequestOptions = {\n                ...baseOptions,\n                ...(mapOptions ? mapOptions(options) : {}),\n            };\n\n            return __request<TResponse>(mergedOptions, openApiConfig);\n        },\n    };\n}";
},"usePartial":true,"useData":true}