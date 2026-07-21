// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"core"),{"name":"each","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":13,"column":9}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { ApiError"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":17},"end":{"line":5,"column":87}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,depth0,"ApiError",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":5,"column":98},"end":{"line":5,"column":128}}})) != null ? stack1 : "")
    + "';\nexport type { RequestConfig"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":27},"end":{"line":6,"column":102}}})) != null ? stack1 : "")
    + ", RequestExecutor"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":119},"end":{"line":6,"column":196}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,depth0,"./executor/requestExecutor",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":6,"column":207},"end":{"line":6,"column":255}}})) != null ? stack1 : "")
    + "';\nexport { createExecutorAdapter"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":30},"end":{"line":7,"column":113}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,depth0,"./executor/createExecutorAdapter",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":7,"column":124},"end":{"line":7,"column":178}}})) != null ? stack1 : "")
    + "';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":10,"column":7}}})) != null ? stack1 : "")
    + "export { OpenAPI"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(13, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":16},"end":{"line":11,"column":86}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,depth0,"OpenAPI",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":11,"column":97},"end":{"line":11,"column":126}}})) != null ? stack1 : "")
    + "';\nexport type { TOpenAPIConfig"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(15, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":28},"end":{"line":12,"column":104}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,depth0,"OpenAPI",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":12,"column":115},"end":{"line":12,"column":144}}})) != null ? stack1 : "")
    + "';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as ApiError$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":5,"column":64},"end":{"line":5,"column":70}} ), depth0)) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as RequestConfig$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":6,"column":79},"end":{"line":6,"column":85}} ), depth0)) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as RequestExecutor$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":6,"column":173},"end":{"line":6,"column":179}} ), depth0)) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as createExecutorAdapter$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":7,"column":90},"end":{"line":7,"column":96}} ), depth0)) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { CancelablePromise } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,"CancelablePromise",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":9,"column":37},"end":{"line":9,"column":76}}})) != null ? stack1 : "")
    + "';\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  as OpenAPI$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":11,"column":63},"end":{"line":11,"column":69}} ), depth0)) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as TOpenAPIConfig$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":12,"column":81},"end":{"line":12,"column":87}} ), depth0)) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"modelsMode"),"classes",{"name":"equals","hash":{},"fn":container.program(18, data, 0),"inverse":container.program(24, data, 0),"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":37,"column":11}}})) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"modelsLayout"),"per-file",{"name":"equals","hash":{},"fn":container.program(19, data, 0),"inverse":container.program(22, data, 0),"data":data,"loc":{"start":{"line":18,"column":0},"end":{"line":24,"column":11}}})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":21,"column":9}}})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export * from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"package"),lookupProperty(depth0,"path"),{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":20,"column":17},"end":{"line":20,"column":44}}})) != null ? stack1 : "")
    + "';\n";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export * from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(data,"root"),"modelsPackage"),"models",{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":23,"column":17},"end":{"line":23,"column":60}}})) != null ? stack1 : "")
    + "'';\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":0},"end":{"line":36,"column":9}}})) != null ? stack1 : "");
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enum"),{"name":"if","hash":{},"fn":container.program(26, data, 0),"inverse":container.program(29, data, 0),"data":data,"loc":{"start":{"line":27,"column":0},"end":{"line":35,"column":7}}})) != null ? stack1 : "");
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":28,"column":12},"end":{"line":28,"column":16}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":19},"end":{"line":28,"column":55}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(depth0,"package"),lookupProperty(depth0,"path"),{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":28,"column":66},"end":{"line":28,"column":93}}})) != null ? stack1 : "")
    + "';\n";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":28,"column":40},"end":{"line":28,"column":45}} ), depth0)) != null ? stack1 : "");
},"29":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"useUnionTypes"),{"name":"if","hash":{},"fn":container.program(30, data, 0),"inverse":container.program(32, data, 0),"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":35,"column":0}}})) != null ? stack1 : "");
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export type { "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":30,"column":17},"end":{"line":30,"column":21}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":24},"end":{"line":30,"column":60}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(depth0,"package"),lookupProperty(depth0,"path"),{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":30,"column":71},"end":{"line":30,"column":98}}})) != null ? stack1 : "")
    + "';\n";
},"32":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(26, data, 0),"inverse":container.program(30, data, 0),"data":data,"loc":{"start":{"line":31,"column":0},"end":{"line":35,"column":0}}})) != null ? stack1 : "");
},"34":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"schemas"),{"name":"each","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":0},"end":{"line":43,"column":9}}})) != null ? stack1 : "");
},"35":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":42,"column":12},"end":{"line":42,"column":16}} ), depth0)) != null ? stack1 : "")
    + "Schema"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(36, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":42,"column":25},"end":{"line":42,"column":67}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(alias1,lookupProperty(depth0,"package"),lookupProperty(depth0,"path"),{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":42,"column":78},"end":{"line":42,"column":105}}})) != null ? stack1 : "")
    + "Schema';\n";
},"36":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":42,"column":46},"end":{"line":42,"column":51}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"38":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(39, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":47,"column":0},"end":{"line":49,"column":9}}})) != null ? stack1 : "");
},"39":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { "
    + ((stack1 = container.lambda(container.strict(depth0, "name", {"start":{"line":48,"column":12},"end":{"line":48,"column":16}} ), depth0)) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = lookupProperty(helpers,"joinPath").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"package"),lookupProperty(depth0,"name"),{"name":"joinPath","hash":{},"data":data,"loc":{"start":{"line":48,"column":30},"end":{"line":48,"column":57}}})) != null ? stack1 : "")
    + "';\n";
},"41":function(container,depth0,helpers,partials,data) {
    return "export type { ClientOptions }  from './createClient';\nexport { createClient } from './createClient';\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"core"),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":14,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"models"),{"name":"if","hash":{},"fn":container.program(17, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":38,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"schemas"),{"name":"if","hash":{},"fn":container.program(34, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":39,"column":0},"end":{"line":44,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"services"),{"name":"if","hash":{},"fn":container.program(38, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":0},"end":{"line":50,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"core"),{"name":"if","hash":{},"fn":container.program(41, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":52,"column":0},"end":{"line":55,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true}