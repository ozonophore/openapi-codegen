// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseHeader(xhr: XMLHttpRequest, responseHeader?: string): string | null {\n    if (responseHeader) {\n        const content = xhr.getResponseHeader(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return null;\n}\n";
},"useData":true}