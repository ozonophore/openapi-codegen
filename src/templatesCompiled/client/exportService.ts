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

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"imports"),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":6,"column":9}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "import type { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":5,"column":17},"end":{"line":5,"column":21}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":24},"end":{"line":5,"column":59}}})) != null ? stack1 : "")
    + " } from '"
    + ((stack1 = alias2(alias1(lookupProperty(data,"root"), "outputModels", {"start":{"line":5,"column":71},"end":{"line":5,"column":89}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(depth0, "path", {"start":{"line":5,"column":95},"end":{"line":5,"column":99}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":5,"column":44},"end":{"line":5,"column":49}} ), depth0)) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "import type { CancelablePromise } from '"
    + ((stack1 = container.lambda(container.strict(lookupProperty(data,"root"), "outputCore", {"start":{"line":9,"column":43},"end":{"line":9,"column":59}} ), depth0)) != null ? stack1 : "")
    + "CancelablePromise';\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "const "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":16,"column":9},"end":{"line":16,"column":13}} ), depth0)) != null ? stack1 : "")
    + " = ("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): ApiRequestOptions => ({\n    "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"serviceOption"),depth0,{"name":"serviceOption","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "});\n\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":24,"column":7},"end":{"line":24,"column":11}} ), depth0)) != null ? stack1 : "")
    + ": ("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parametersDefinition"),depth0,{"name":"parametersDefinition","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ") => ApiRequestOptions;\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "    "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":30,"column":7},"end":{"line":30,"column":11}} ), depth0)) != null ? stack1 : "")
    + ": "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":30,"column":19},"end":{"line":30,"column":23}} ), depth0)) != null ? stack1 : "")
    + ",\n";
},"13":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.strict, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    /**\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"deprecated"),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":38,"column":4},"end":{"line":40,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"summary"),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":4},"end":{"line":43,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"description"),{"name":"if","hash":{},"fn":container.program(18, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":4},"end":{"line":46,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,lookupProperty(lookupProperty(data,"root"),"useOptions"),{"name":"unless","hash":{},"fn":container.program(20, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":47,"column":4},"end":{"line":53,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"results"),{"name":"each","hash":{},"fn":container.program(24, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":54,"column":4},"end":{"line":56,"column":13}}})) != null ? stack1 : "")
    + "     * @throws ApiError\n     */\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(26, data, 0, blockParams, depths),"inverse":container.program(28, data, 0, blockParams, depths),"data":data,"loc":{"start":{"line":59,"column":4},"end":{"line":63,"column":11}}})) != null ? stack1 : "")
    + "        return __request<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","hash":{"default":"void"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ">("
    + ((stack1 = alias3(alias2(depths[1], "originName", {"start":{"line":64,"column":55},"end":{"line":64,"column":68}} ), depth0)) != null ? stack1 : "")
    + "Options."
    + ((stack1 = alias3(alias2(depth0, "name", {"start":{"line":64,"column":81},"end":{"line":64,"column":85}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameterValues"),depth0,{"name":"parameterValues","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "), OpenAPI);\n    }\n";
},"14":function(container,depth0,helpers,partials,data) {
    return "     * @deprecated\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "     * "
    + ((stack1 = container.lambda(container.strict(depth0, "summary", {"start":{"line":42,"column":10},"end":{"line":42,"column":17}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "     * "
    + ((stack1 = container.lambda(container.strict(depth0, "description", {"start":{"line":45,"column":10},"end":{"line":45,"column":21}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":4},"end":{"line":52,"column":11}}})) != null ? stack1 : "");
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"parameters"),{"name":"each","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":49,"column":4},"end":{"line":51,"column":13}}})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "     * @param "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":50,"column":17},"end":{"line":50,"column":21}} ), depth0)) != null ? stack1 : "")
    + " "
    + ((stack1 = alias2(alias1(depth0, "description", {"start":{"line":50,"column":28},"end":{"line":50,"column":39}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "     * @returns "
    + ((stack1 = alias2(alias1(depth0, "type", {"start":{"line":55,"column":19},"end":{"line":55,"column":23}} ), depth0)) != null ? stack1 : "")
    + " "
    + ((stack1 = alias2(alias1(depth0, "description", {"start":{"line":55,"column":30},"end":{"line":55,"column":41}} ), depth0)) != null ? stack1 : "")
    + "\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    public static "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":60,"column":21},"end":{"line":60,"column":25}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): CancelablePromise<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","hash":{"default":"void"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    public static "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":62,"column":21},"end":{"line":62,"column":25}} ), depth0)) != null ? stack1 : "")
    + "("
    + ((stack1 = container.invokePartial(lookupProperty(partials,"parameters"),depth0,{"name":"parameters","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "): Promise<"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"result"),depth0,{"name":"result","hash":{"default":"void"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "> {\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.strict, alias3=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"imports"),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":7,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":10,"column":7}}})) != null ? stack1 : "")
    + "import { request as __request } from '"
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "outputCore", {"start":{"line":11,"column":41},"end":{"line":11,"column":57}} ), depth0)) != null ? stack1 : "")
    + "request';\nimport type { ApiRequestOptions } from '"
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "outputCore", {"start":{"line":12,"column":43},"end":{"line":12,"column":59}} ), depth0)) != null ? stack1 : "")
    + "ApiRequestOptions';\nimport { OpenAPI } from '"
    + ((stack1 = alias3(alias2(lookupProperty(data,"root"), "outputCore", {"start":{"line":13,"column":28},"end":{"line":13,"column":44}} ), depth0)) != null ? stack1 : "")
    + "OpenAPI';\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"operations"),{"name":"each","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":20,"column":9}}})) != null ? stack1 : "")
    + "\nexport type T"
    + ((stack1 = alias3(alias2(depth0, "originName", {"start":{"line":22,"column":16},"end":{"line":22,"column":26}} ), depth0)) != null ? stack1 : "")
    + "Options = {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"operations"),{"name":"each","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":0},"end":{"line":25,"column":9}}})) != null ? stack1 : "")
    + "}\n\nexport const "
    + ((stack1 = alias3(alias2(depth0, "originName", {"start":{"line":28,"column":16},"end":{"line":28,"column":26}} ), depth0)) != null ? stack1 : "")
    + "Options: T"
    + ((stack1 = alias3(alias2(depth0, "originName", {"start":{"line":28,"column":42},"end":{"line":28,"column":52}} ), depth0)) != null ? stack1 : "")
    + "Options = {\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"operations"),{"name":"each","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":31,"column":9}}})) != null ? stack1 : "")
    + "}\n\nexport class "
    + ((stack1 = alias3(alias2(depth0, "name", {"start":{"line":34,"column":16},"end":{"line":34,"column":20}} ), depth0)) != null ? stack1 : "")
    + " {\n\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,lookupProperty(depth0,"operations"),{"name":"each","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":36,"column":4},"end":{"line":66,"column":13}}})) != null ? stack1 : "")
    + "}\n";
},"usePartial":true,"useData":true,"useDepths":true}