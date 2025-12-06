// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "async function getResponseBody(response: Response): Promise<any> {\n    try {\n        const contentType = response.headers.get('Content-Type');\n        if (contentType) {\n            const isJSON = contentType.toLowerCase().startsWith('application/json');\n            if (isJSON) {\n                return await response.json();\n            } else {\n                return await response.text();\n            }\n        }\n    } catch (error) {\n        console.error(error);\n    }\n    return null;\n}\n";
},"useData":true}