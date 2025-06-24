// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport type { ApiRequestOptions } from './ApiRequestOptions';\n\ntype Resolver<T> = (options: ApiRequestOptions) => Promise<T>;\ntype Headers = Record<string, string>;\n\nexport type TOpenAPIConfig = {\n    BASE: string;\n    VERSION: string;\n    WITH_CREDENTIALS: boolean;\n    TOKEN?: string | Resolver<string>;\n    USERNAME?: string | Resolver<string>;\n    PASSWORD?: string | Resolver<string>;\n    HEADERS?: Headers | Resolver<Headers>;\n}\n\nexport const OpenAPI: TOpenAPIConfig = {\n    BASE: '"
    + ((stack1 = alias2(alias1(depth0, "server", {"start":{"line":19,"column":14},"end":{"line":19,"column":20}} ), depth0)) != null ? stack1 : "")
    + "',\n    VERSION: '"
    + ((stack1 = alias2(alias1(depth0, "version", {"start":{"line":20,"column":17},"end":{"line":20,"column":24}} ), depth0)) != null ? stack1 : "")
    + "',\n    WITH_CREDENTIALS: false,\n    TOKEN: undefined,\n    USERNAME: undefined,\n    PASSWORD: undefined,\n    HEADERS: undefined,\n};\n";
},"usePartial":true,"useData":true}