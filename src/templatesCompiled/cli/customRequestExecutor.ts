// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "import type { CancelablePromise } from './CancelablePromise';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "export const customExecutor: RequestExecutor<MyCustomOptions> = {\n    async request<TResponse>(config: RequestConfig, options?: MyCustomOptions): CancelablePromise<TResponse> {\n        return new CancelablePromise(async (resolve, reject, onCancel) => {\n            try {\n                const abortController = new AbortController();\n                \n                if (options?.timeout) {\n                    const timeoutId = setTimeout(() => abortController.abort(), options.timeout);\n                    onCancel(() => clearTimeout(timeoutId));\n                }\n                \n                onCancel(() => abortController.abort());\n                \n                if (onCancel.isCancelled) {\n                    return;\n                }\n                \n                // Ваша пользовательская логика запросов здесь\n                const response = await fetch(config.url, {\n                    method: config.method,\n                    headers: config.headers,\n                    body: config.body ? JSON.stringify(config.body) : undefined,\n                    signal: abortController.signal,\n                });\n                \n                if (!response.ok) {\n                    throw new Error(`Request failed: ${response.statusText}`);\n                }\n                \n                const data = await response.json();\n                resolve(data);\n            } catch (error) {\n                reject(error);\n            }\n        });\n    },\n};\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "export const customExecutor: RequestExecutor<MyCustomOptions> = {\n    async request<TResponse>(config: RequestConfig, options?: MyCustomOptions): Promise<TResponse> {\n        // Ваша пользовательская логика запросов здесь\n        const response = await fetch(config.url, {\n            method: config.method,\n            headers: config.headers,\n            body: config.body ? JSON.stringify(config.body) : undefined,\n            signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,\n        });\n        \n        if (!response.ok) {\n            throw new Error(`Request failed: ${response.statusText}`);\n        }\n        \n        return response.json();\n    },\n};\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { RequestExecutor, RequestConfig } from './request-executor';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":7}}})) != null ? stack1 : "")
    + "\n/**\n * Определите свой тип опций (опционально)\n * Измените этот интерфейс в соответствии с вашими потребностями\n */\ninterface MyCustomOptions {\n    timeout?: number;\n    retries?: number;\n}\n\n/**\n * Создайте пользовательский executor\n * Реализуйте свою логику запросов здесь\n *\n * @example Пример использования:\n * \n * import { SimpleService } from './generated/services/SimpleService';\n * \n * const simpleService = new SimpleService<MyCustomOptions>(customExecutor);\n * await simpleService.getCallWithoutParametersAndResponse({ timeout: 5000, retries: 3 });\n */\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":28,"column":0},"end":{"line":84,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}