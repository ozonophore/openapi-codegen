// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest(options: ApiRequestOptions, url: string, config: TOpenAPIConfig, onCancel: (cancelHandler: () => void) => void): Promise<Response> {\n    const controller = new AbortController();\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest(options: ApiRequestOptions, url: string, config: TOpenAPIConfig): Promise<Response> {\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "        signal: controller.signal,\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    onCancel(() => controller.abort());\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":6,"column":7}}})) != null ? stack1 : "")
    + "\n    const request: RequestInit = {\n        method: options.method,\n        headers: await getHeaders(options, config),\n        body: getRequestBody(options),\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":8},"end":{"line":14,"column":15}}})) != null ? stack1 : "")
    + "    };\n    \n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":4},"end":{"line":19,"column":11}}})) != null ? stack1 : "")
    + "\n    return await fetch(url, request);\n}\n";
},"useData":true}