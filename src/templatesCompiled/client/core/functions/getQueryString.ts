// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getQueryString(params: Record<string, any>): string {\n    const qs: string[] = [];\n    Object.keys(params).forEach(key => {\n        const value = params[key];\n        if (isDefined(value)) {\n            if (Array.isArray(value)) {\n                value.forEach(value => {\n                    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);\n                });\n            } else {\n                qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);\n            }\n        }\n    });\n    if (qs.length > 0) {\n        return `?${qs.join('&')}`;\n    }\n    return '';\n}\n";
},"useData":true}