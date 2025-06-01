// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport type ApiRequestOptions = {\n    readonly method: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';\n    readonly path: string;\n    readonly cookies?: Record<string, any>;\n    readonly headers?: Record<string, any>;\n    readonly query?: Record<string, any>;\n    readonly formData?: Record<string, any>;\n    readonly body?: any;\n    readonly mediaType?: string;\n    readonly responseHeader?: string;\n    // TODO TS2344: Redesign the logic for generating errors. Use the string value of the error code.\n    // @ts-ignore\n    readonly errors?: Record<number, string>;\n}\n";
},"usePartial":true,"useData":true}