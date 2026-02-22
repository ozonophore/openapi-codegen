// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "import { createExecutorAdapter as createCustomExecutorAdapter } from '"
    + ((stack1 = container.lambda(container.strict(lookupProperty(data,"root"), "customExecutorPath", {"start":{"line":11,"column":73},"end":{"line":11,"column":97}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "import { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":15,"column":11},"end":{"line":15,"column":15}} ), depth0)) != null ? stack1 : "")
    + " } from './services/"
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":15,"column":39},"end":{"line":15,"column":43}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    createCustomExecutorAdapter<TExecutorOptions>("
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"unless","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":50},"end":{"line":41,"column":108}}})) != null ? stack1 : "")
    + ");\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "openApiConfig";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    createExecutorAdapter<TExecutorOptions>("
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"useCustomRequest"),{"name":"unless","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":44},"end":{"line":43,"column":102}}})) != null ? stack1 : "")
    + ");\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    "
    + ((stack1 = lookupProperty(helpers,"camelCase").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"name"),{"name":"camelCase","hash":{},"data":data,"loc":{"start":{"line":59,"column":4},"end":{"line":59,"column":22}}})) != null ? stack1 : "")
    + ": new "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":59,"column":30},"end":{"line":59,"column":34}} ), depth0)) != null ? stack1 : "")
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
    + "';\nimport { createExecutorAdapter } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"./executor/createExecutorAdapter",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":5,"column":39},"end":{"line":5,"column":105}}})) != null ? stack1 : "")
    + "';\nimport type { RequestExecutor } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"./executor/requestExecutor",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":6,"column":38},"end":{"line":6,"column":98}}})) != null ? stack1 : "")
    + "';\nimport type { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"./interceptors/interceptors",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":7,"column":80},"end":{"line":7,"column":141}}})) != null ? stack1 : "")
    + "';\nimport { withInterceptors } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"./interceptors/withInterceptors",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":8,"column":34},"end":{"line":8,"column":99}}})) != null ? stack1 : "")
    + "';\nimport { apiErrorInterceptor } from '"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(lookupProperty(data,"root"),"outputCore"),"./interceptors/apiErrorInterceptor",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":9,"column":37},"end":{"line":9,"column":105}}})) != null ? stack1 : "")
    + "';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"customExecutorPath"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":16,"column":9}}})) != null ? stack1 : "")
    + "\nexport interface ClientOptions {\n  openApi?: Partial<TOpenAPIConfig>;\n  interceptors?: {\n    onRequest?: RequestInterceptor[];\n    onResponse?: ResponseInterceptor[];\n    onError?: ErrorInterceptor[];\n  };\n  executorFactory?: <TExecutorOptions extends Record<string, any>>(params: {\n    openApiConfig: TOpenAPIConfig;\n    createDefaultExecutor: () => RequestExecutor<TExecutorOptions>;\n  }) => RequestExecutor<TExecutorOptions>;\n}\n\nexport function createClient<TExecutorOptions extends Record<string, any>>(\n  options: ClientOptions = {},\n) {\n  const openApiConfig: TOpenAPIConfig = {\n    ...OpenAPI,\n    ...options.openApi,\n  };\n\n  const createDefaultExecutor = (): RequestExecutor<TExecutorOptions> =>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"customExecutorPath"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(8, data, 0),"data":data,"loc":{"start":{"line":40,"column":4},"end":{"line":44,"column":11}}})) != null ? stack1 : "")
    + "\n  let executor = options.executorFactory\n    ? options.executorFactory<TExecutorOptions>({ openApiConfig, createDefaultExecutor })\n    : createDefaultExecutor();\n  if (options?.interceptors) {\n    executor = withInterceptors(executor, {\n      onError: [apiErrorInterceptor, ...(options.interceptors?.onError ?? [])],\n      onRequest: options.interceptors?.onRequest,\n      onResponse: options.interceptors?.onResponse,\n    });\n  }\n\n  return {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":58,"column":4},"end":{"line":60,"column":13}}})) != null ? stack1 : "")
    + "  };\n}\n";
},"usePartial":true,"useData":true}