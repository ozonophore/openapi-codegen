// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest(options: ApiRequestOptions, url: string, config: TOpenAPIConfig, onCancel: (cancelHandler: () => void) => void): Promise<XMLHttpRequest> {\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest(options: ApiRequestOptions, url: string, config: TOpenAPIConfig): Promise<XMLHttpRequest> {\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "    return new Promise<XMLHttpRequest>((resolve, reject) => {\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "    return new Promise<XMLHttpRequest>((resolve) => {\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "            if (xhr.readyState === XMLHttpRequest.DONE) {\n                reject();\n            }\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "        onCancel(() => xhr.abort());\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":5,"column":7}}})) != null ? stack1 : "")
    + "\n    const xhr = new XMLHttpRequest();\n    xhr.open(options.method, url, true);\n    xhr.withCredentials = config.WITH_CREDENTIALS;\n\n    const headers = await getHeaders(options, config);\n    headers.forEach((value: string, key: string) => {\n        xhr.setRequestHeader(key, value);\n    });\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":16,"column":4},"end":{"line":20,"column":11}}})) != null ? stack1 : "")
    + "        xhr.onreadystatechange = () => {\n            if (xhr.readyState === XMLHttpRequest.DONE) {\n                resolve(xhr);\n            }\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":25,"column":12},"end":{"line":29,"column":19}}})) != null ? stack1 : "")
    + "        };\n        xhr.send(getRequestBody(options));\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":8},"end":{"line":35,"column":15}}})) != null ? stack1 : "")
    + "    });\n}\n";
},"useData":true}