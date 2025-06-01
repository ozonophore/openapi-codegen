// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function getResponseBody(response: AxiosResponse): any {\n  try {\n    const contentType = response.headers['content-type'];\n    if (contentType) {\n      const isJSON = typeof contentType === 'string' && contentType.toLowerCase().startsWith('application/json');\n\n      if (isJSON && isString(response.data)) {\n        return JSON.parse(response.data);\n      } else {\n        return response.data;\n      }\n    }\n  } catch (error) {\n    console.error(error);\n  }\n  return null;\n}\n";
},"useData":true}