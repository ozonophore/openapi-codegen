// Это автоматически сгенерированный файл для hbs шаблона.
// Не нужно его изменять, для обновления запусти npm run build:hbs
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
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"core"),{"name":"each","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":11,"column":9}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { ApiError"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":17},"end":{"line":5,"column":87}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(depth0, depth0)) != null ? stack1 : "")
    + "ApiError';\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(lookupProperty(data,"root"),"useCancelableRequest"),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":8,"column":7}}})) != null ? stack1 : "")
    + "export { OpenAPI"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":16},"end":{"line":9,"column":86}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(depth0, depth0)) != null ? stack1 : "")
    + "OpenAPI';\nexport type { TOpenAPIConfig"
    + ((stack1 = lookupProperty(helpers,"notEquals").call(alias1,lookupProperty(lookupProperty(depths[1],"core"),"length"),1,{"name":"notEquals","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":28},"end":{"line":10,"column":104}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(depth0, depth0)) != null ? stack1 : "")
    + "OpenAPI';\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as ApiError$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":5,"column":64},"end":{"line":5,"column":70}} ), depth0)) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "export { CancelablePromise } from './"
    + ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + "CancelablePromise';\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  as OpenAPI$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":9,"column":63},"end":{"line":9,"column":69}} ), depth0)) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as TOpenAPIConfig$"
    + ((stack1 = container.lambda(container.strict(data, "index", {"start":{"line":10,"column":81},"end":{"line":10,"column":87}} ), depth0)) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"models"),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":25,"column":9}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enum"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":24,"column":7}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":17,"column":12},"end":{"line":17,"column":16}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":19},"end":{"line":17,"column":55}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(alias1(depth0, "package", {"start":{"line":17,"column":69},"end":{"line":17,"column":76}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(depth0, "path", {"start":{"line":17,"column":82},"end":{"line":17,"column":86}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":17,"column":40},"end":{"line":17,"column":45}} ), depth0)) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"useUnionTypes"),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":18,"column":0},"end":{"line":24,"column":0}}})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export type { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":19,"column":17},"end":{"line":19,"column":21}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":24},"end":{"line":19,"column":60}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(alias1(depth0, "package", {"start":{"line":19,"column":74},"end":{"line":19,"column":81}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(depth0, "path", {"start":{"line":19,"column":87},"end":{"line":19,"column":91}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"enums"),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(17, data, 0),"data":data,"loc":{"start":{"line":20,"column":0},"end":{"line":24,"column":0}}})) != null ? stack1 : "");
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"schemas"),{"name":"each","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":31,"column":9}}})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":30,"column":12},"end":{"line":30,"column":16}} ), depth0)) != null ? stack1 : "")
    + "Schema"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"alias"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":25},"end":{"line":30,"column":67}}})) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(alias1(depth0, "package", {"start":{"line":30,"column":81},"end":{"line":30,"column":88}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(depth0, "path", {"start":{"line":30,"column":94},"end":{"line":30,"column":98}} ), depth0)) != null ? stack1 : "")
    + "Schema';\n";
},"23":function(container,depth0,helpers,partials,data) {
    var stack1;

  return " as "
    + ((stack1 = container.lambda(container.strict(depth0, "alias", {"start":{"line":30,"column":46},"end":{"line":30,"column":51}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"services"),{"name":"each","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":0},"end":{"line":37,"column":9}}})) != null ? stack1 : "");
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return "export { "
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":36,"column":12},"end":{"line":36,"column":16}} ), depth0)) != null ? stack1 : "")
    + " } from './"
    + ((stack1 = alias2(alias1(depth0, "package", {"start":{"line":36,"column":33},"end":{"line":36,"column":40}} ), depth0)) != null ? stack1 : "")
    + ((stack1 = alias2(alias1(depth0, "name", {"start":{"line":36,"column":46},"end":{"line":36,"column":50}} ), depth0)) != null ? stack1 : "")
    + "';\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"core"),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":12,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"models"),{"name":"if","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":26,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"schemas"),{"name":"if","hash":{},"fn":container.program(21, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":0},"end":{"line":32,"column":7}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"services"),{"name":"if","hash":{},"fn":container.program(25, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":0},"end":{"line":38,"column":7}}})) != null ? stack1 : "");
},"usePartial":true,"useData":true,"useDepths":true}