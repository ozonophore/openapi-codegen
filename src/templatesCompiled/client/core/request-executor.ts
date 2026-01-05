// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "export interface RequestConfig {\n  method: string;\n  url: string;\n  headers?: Record<string, string>;\n  query?: Record<string, any>;\n  body?: unknown;\n}\n\nexport interface RequestExecutor<TOptions = unknown> {\n  request<TResponse>(\n    config: RequestConfig,\n    options?: TOptions\n  ): Promise<TResponse>;\n}";
},"useData":true}