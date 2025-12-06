// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "\nfunction getRequestBody(options: ApiRequestOptions): any {\n    if (options.formData) {\n        return getFormData(options.formData);\n    }\n    if (options.body) {\n        if (options.mediaType?.includes('/json')) {\n            return JSON.stringify(options.body)\n        } else if (isString(options.body) || isBinary(options.body)) {\n            return options.body;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n    return undefined;\n}\n";
},"useData":true}