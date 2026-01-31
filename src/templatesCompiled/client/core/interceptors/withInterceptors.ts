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
    + "\nimport { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './interceptors';\nimport { RequestConfig, RequestExecutor } from '../executor/requestExecutor';\n\nexport function withInterceptors<TOptions extends Record<string, any> = Record<string, never>>(\n    executor: RequestExecutor<TOptions>,\n    interceptors: {\n        onRequest?: RequestInterceptor[];\n        onResponse?: ResponseInterceptor[];\n        onError?: ErrorInterceptor[];\n    }\n): RequestExecutor<TOptions> {\n    return {\n        async request<TResponse>(config: RequestConfig, options?: TOptions): Promise<TResponse> {\n            let currentConfig = config;\n\n            try {\n                for (const i of interceptors.onRequest ?? []) {\n                    currentConfig = await i(currentConfig);\n                }\n\n                let response: Awaited<TResponse> = await executor.request<TResponse>(config, options);\n\n                for (const interceptor of interceptors.onResponse ?? []) {\n                    response = (await interceptor(response, config)) as Awaited<TResponse>;\n                }\n\n                return response as TResponse;\n            } catch (caught) {\n                let error = caught;\n\n                for (const interceptor of interceptors.onError ?? []) {\n                    error = await interceptor(error, config);\n                }\n\n                throw error;\n            }\n        },\n    };\n}\n";
},"usePartial":true,"useData":true}