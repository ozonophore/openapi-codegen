// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getRequestBody(options: ApiRequestOptions): BodyInit | undefined {\n    if (options.formData) {\n        return getFormData(options.formData);\n    }\n    if (options.body) {\n        if (options.mediaType?.includes('/json')) {\n            return JSON.stringify(options.body)\n        } else if (isString(options.body) || isBlob(options.body)) {\n            return options.body;\n        } else {\n            return JSON.stringify(options.body);\n        }\n    }\n    return undefined;\n}\n";
},"useData":true}