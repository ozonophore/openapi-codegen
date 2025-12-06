// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;\n\nasync function resolve<T>(options: ApiRequestOptions, resolver?: T | Resolver<T>): Promise<T | undefined> {\n    if (typeof resolver === 'function') {\n        return (resolver as Resolver<T>)(options);\n    }\n    return resolver;\n}\n";
},"useData":true}