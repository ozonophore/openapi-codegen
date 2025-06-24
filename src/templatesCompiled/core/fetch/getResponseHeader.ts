// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseHeader(response: Response, responseHeader?: string): string | null {\n    if (responseHeader) {\n        const content = response.headers.get(responseHeader);\n        if (isString(content)) {\n            return content;\n        }\n    }\n    return null;\n}\n";
},"useData":true}