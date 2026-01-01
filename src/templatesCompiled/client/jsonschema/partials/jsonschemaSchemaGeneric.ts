// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    type: 'string'"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minLength"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":18},"end":{"line":4,"column":37}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxLength"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":37},"end":{"line":5,"column":37}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"pattern"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":37},"end":{"line":6,"column":35}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"format"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":35},"end":{"line":7,"column":33}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":33},"end":{"line":8,"column":25}}})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    minLength: "
    + ((stack1 = container.lambda(container.strict(depth0, "minLength", {"start":{"line":4,"column":18},"end":{"line":4,"column":27}} ), depth0)) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    maxLength: "
    + ((stack1 = container.lambda(container.strict(depth0, "maxLength", {"start":{"line":5,"column":18},"end":{"line":5,"column":27}} ), depth0)) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    pattern: '"
    + ((stack1 = container.lambda(container.strict(depth0, "pattern", {"start":{"line":6,"column":17},"end":{"line":6,"column":24}} ), depth0)) != null ? stack1 : "")
    + "'";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    format: '"
    + ((stack1 = container.lambda(container.strict(depth0, "format", {"start":{"line":7,"column":16},"end":{"line":7,"column":22}} ), depth0)) != null ? stack1 : "")
    + "'";
},"10":function(container,depth0,helpers,partials,data) {
    return ",\n    nullable: true";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"number",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(24, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":37,"column":0}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    type: 'number'"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":18},"end":{"line":11,"column":33}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":33},"end":{"line":12,"column":33}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMinimum"),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":33},"end":{"line":13,"column":51}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMaximum"),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":51},"end":{"line":14,"column":51}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":51},"end":{"line":15,"column":39}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":39},"end":{"line":16,"column":25}}})) != null ? stack1 : "")
    + "\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    minimum: "
    + ((stack1 = container.lambda(container.strict(depth0, "minimum", {"start":{"line":11,"column":16},"end":{"line":11,"column":23}} ), depth0)) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    maximum: "
    + ((stack1 = container.lambda(container.strict(depth0, "maximum", {"start":{"line":12,"column":16},"end":{"line":12,"column":23}} ), depth0)) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    exclusiveMinimum: "
    + ((stack1 = container.lambda(container.strict(depth0, "exclusiveMinimum", {"start":{"line":13,"column":25},"end":{"line":13,"column":41}} ), depth0)) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    exclusiveMaximum: "
    + ((stack1 = container.lambda(container.strict(depth0, "exclusiveMaximum", {"start":{"line":14,"column":25},"end":{"line":14,"column":41}} ), depth0)) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ",\n    multipleOf: "
    + ((stack1 = container.lambda(container.strict(depth0, "multipleOf", {"start":{"line":15,"column":19},"end":{"line":15,"column":29}} ), depth0)) != null ? stack1 : "");
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"integer",{"name":"equals","hash":{},"fn":container.program(25, data, 0),"inverse":container.program(27, data, 0),"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":37,"column":0}}})) != null ? stack1 : "");
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    type: 'integer'"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":19},"end":{"line":19,"column":33}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":33},"end":{"line":20,"column":33}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMinimum"),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":33},"end":{"line":21,"column":51}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"exclusiveMaximum"),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":51},"end":{"line":22,"column":51}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":22,"column":51},"end":{"line":23,"column":39}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":39},"end":{"line":24,"column":25}}})) != null ? stack1 : "")
    + "\n";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"boolean",{"name":"equals","hash":{},"fn":container.program(28, data, 0),"inverse":container.program(30, data, 0),"data":data,"loc":{"start":{"line":25,"column":0},"end":{"line":37,"column":0}}})) != null ? stack1 : "");
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    type: 'boolean'"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":19},"end":{"line":27,"column":25}}})) != null ? stack1 : "")
    + "\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"File",{"name":"equals","hash":{},"fn":container.program(31, data, 0),"inverse":container.program(33, data, 0),"data":data,"loc":{"start":{"line":28,"column":0},"end":{"line":37,"column":0}}})) != null ? stack1 : "");
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    type: 'string',\n    format: 'binary'"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":20},"end":{"line":31,"column":25}}})) != null ? stack1 : "")
    + "\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"null",{"name":"equals","hash":{},"fn":container.program(34, data, 0),"inverse":container.program(36, data, 0),"data":data,"loc":{"start":{"line":32,"column":0},"end":{"line":37,"column":0}}})) != null ? stack1 : "");
},"34":function(container,depth0,helpers,partials,data) {
    return "    type: 'null'\n";
},"36":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    type: 'object'"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":18},"end":{"line":36,"column":25}}})) != null ? stack1 : "")
    + "\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\n"
    + ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"string",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":37,"column":11}}})) != null ? stack1 : "")
    + "}";
},"useData":true}