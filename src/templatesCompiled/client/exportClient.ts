// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "import { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":9,"column":11},"end":{"line":9,"column":15}} ), depth0)) != null ? stack1 : "")
    + " } from './services/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":9,"column":39},"end":{"line":9,"column":43}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    "
    + ((stack1 = lookupProperty(helpers,"camelCase").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"name"),{"name":"camelCase","hash":{},"data":data,"loc":{"start":{"line":29,"column":4},"end":{"line":29,"column":22}}})) != null ? stack1 : "")
    + ": new "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":29,"column":30},"end":{"line":29,"column":34}} ), depth0)) != null ? stack1 : "")
    + "(executor),\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nimport { OpenAPI } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"OpenAPI",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":3,"column":25},"end":{"line":3,"column":66}}})) != null ? stack1 : "")
    + "';\nimport type { TOpenAPIConfig } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"OpenAPI",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":4,"column":37},"end":{"line":4,"column":78}}})) != null ? stack1 : "")
    + "';\nimport type { RequestExecutor } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"request-executor",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":5,"column":38},"end":{"line":5,"column":88}}})) != null ? stack1 : "")
    + "';\nimport { createExecutorAdapter } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"createExecutorAdapter",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":6,"column":39},"end":{"line":6,"column":94}}})) != null ? stack1 : "")
    + "';\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":10,"column":9}}})) != null ? stack1 : "")
    + "\nexport interface ClientOptions<TExecutorOptions extends Record<string, any>> {\n  openApi?: Partial<TOpenAPIConfig>;\n  executor?: RequestExecutor<TExecutorOptions>;\n}\n\nexport function createClient<TExecutorOptions extends Record<string, any>>(\n  options: ClientOptions<TExecutorOptions> = {},\n) {\n  const openApiConfig: TOpenAPIConfig = {\n    ...OpenAPI,\n    ...options.openApi,\n  };\n\n  const executor = createExecutorAdapter<TExecutorOptions>(openApiConfig);\n\n  return {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":4},"end":{"line":30,"column":13}}})) != null ? stack1 : "")
    + "  };\n}\n";
},"usePartial":true,"useData":true}