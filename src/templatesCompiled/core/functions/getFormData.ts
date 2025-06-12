// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getFormData(params: Record<string, any>): FormData {\n    const formData = new FormData();\n    Object.keys(params).forEach(key => {\n        const value = params[key];\n        if (isDefined(value)) {\n            formData.append(key, value);\n        }\n    });\n    return formData;\n}\n";
},"useData":true}