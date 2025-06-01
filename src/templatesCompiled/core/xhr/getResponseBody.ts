// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseBody(xhr: XMLHttpRequest): any {\n    try {\n        const contentType = xhr.getResponseHeader('Content-Type');\n        if (contentType) {\n            const isJSON = contentType.toLowerCase().startsWith('application/json');\n            if (isJSON) {\n                return JSON.parse(xhr.responseText);\n            } else {\n                return xhr.responseText;\n            }\n        }\n    } catch (error) {\n        console.error(error);\n    }\n    return null;\n}\n";
},"useData":true}