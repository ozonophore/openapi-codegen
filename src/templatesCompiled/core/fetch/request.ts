// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "import { CancelablePromise } from './CancelablePromise';\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "export function request<T>(options: ApiRequestOptions, config: TOpenAPIConfig): CancelablePromise<T> {\n    return new CancelablePromise(async(resolve, reject, onCancel) => {\n        try {\n            const url = getUrl(options, config);\n\n            if (!onCancel.isCancelled) {\n                const response = await sendRequest(options, url, config, onCancel);\n                const responseBody = await getResponseBody(response);\n                const responseHeader = getResponseHeader(response, options.responseHeader);\n                const result: ApiResult = {\n                    url,\n                    ok: response.ok,\n                    status: response.status,\n                    statusText: response.statusText,\n                    body: responseHeader || responseBody,\n                };\n                catchErrors(options, result);\n                resolve(result.body);\n            }\n        } catch (error) {\n            reject(error);\n        }\n    });\n}\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "export async function request<T>(options: ApiRequestOptions, config: TOpenAPIConfig): Promise<T> {\n    return new Promise(async (resolve, reject) => {\n        try {\n            const url = getUrl(options, config);\n            const response = await sendRequest(options, url, config);\n            const responseBody = await getResponseBody(response);\n            const responseHeader = getResponseHeader(response, options.responseHeader);\n\n            const result: ApiResult = {\n                url,\n                ok: response.ok,\n                status: response.status,\n                statusText: response.statusText,\n                body: responseHeader || responseBody,\n            };\n\n            catchErrors(options, result);\n            resolve(result.body);\n        } catch (error) {\n            reject(error);\n        }\n    });\n}\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { ApiError } from './ApiError';\nimport type { ApiRequestOptions } from './ApiRequestOptions';\nimport type { ApiResult } from './ApiResult';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + "import type { TOpenAPIConfig } from './OpenAPI';\nimport { EHTTP_STATUS_CODES, EHTTP_STATUS_NAME } from './HttpStatusCode';\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isDefined"),depth0,{"name":"functions/isDefined","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isString"),depth0,{"name":"functions/isString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isStringWithValue"),depth0,{"name":"functions/isStringWithValue","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/isBlob"),depth0,{"name":"functions/isBlob","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getQueryString"),depth0,{"name":"functions/getQueryString","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getUrl"),depth0,{"name":"functions/getUrl","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/getFormData"),depth0,{"name":"functions/getFormData","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/resolve"),depth0,{"name":"functions/resolve","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getHeaders"),depth0,{"name":"fetch/getHeaders","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getRequestBody"),depth0,{"name":"fetch/getRequestBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/sendRequest"),depth0,{"name":"fetch/sendRequest","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getResponseHeader"),depth0,{"name":"fetch/getResponseHeader","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"fetch/getResponseBody"),depth0,{"name":"fetch/getResponseBody","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"functions/catchErrors"),depth0,{"name":"functions/catchErrors","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n\n/**\n * Request using fetch client\n * @param config The OpenAPI configuration object\n * @param options The request options from the the service\n * @returns ApiResult\n * @throws ApiError\n */\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data,"loc":{"start":{"line":61,"column":0},"end":{"line":110,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true}