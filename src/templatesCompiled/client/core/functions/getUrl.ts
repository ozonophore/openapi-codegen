// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getUrl(options: ApiRequestOptions, config: TOpenAPIConfig): string {\n    const path = options.path.replace('{api-version}', config.VERSION).replace(/[:]/g, '_');\n    const url = `${config.BASE}${path}`;\n\n    if (options.query) {\n        return `${url}${getQueryString(options.query)}`;\n    }\n    return url;\n}\n";
},"useData":true}