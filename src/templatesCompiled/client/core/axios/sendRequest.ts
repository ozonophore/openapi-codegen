// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest<T>(options: ApiRequestOptions, url: string, config: TOpenAPIConfig, onCancel: (cancelHandler: () => void) => void): Promise<AxiosResponse<T>> {\n  const source = axios.CancelToken.source();\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "async function sendRequest<T>(options: ApiRequestOptions, url: string, config: TOpenAPIConfig): Promise<AxiosResponse<T>> {\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "    cancelToken: source.token,\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "  onCancel(() => source.cancel('The user aborted a request.'));\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":6,"column":7}}})) != null ? stack1 : "")
    + "  \n  const requestConfig: AxiosRequestConfig = {\n    method: options.method,\n    headers: await getHeaders(options, config),\n    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment\n    data: getRequestBody(options),\n    url,\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":4},"end":{"line":16,"column":11}}})) != null ? stack1 : "")
    + "  };\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":2},"end":{"line":21,"column":9}}})) != null ? stack1 : "")
    + "\n  try {\n		return await axios.request(requestConfig);\n	} catch (error) {\n		const axiosError = error as AxiosError<T>;\n		if (axiosError.response) {\n			return axiosError.response;\n		}\n		throw error;\n	}\n}";
},"useData":true}