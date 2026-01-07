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

  return "Joi.string()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minLength"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":12},"end":{"line":2,"column":57}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxLength"),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":57},"end":{"line":2,"column":102}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"pattern"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":102},"end":{"line":2,"column":149}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"format"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":149},"end":{"line":2,"column":365}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":365},"end":{"line":2,"column":402}}})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minLength", {"start":{"line":2,"column":37},"end":{"line":2,"column":46}} ), depth0)) != null ? stack1 : "")
    + ")";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maxLength", {"start":{"line":2,"column":82},"end":{"line":2,"column":91}} ), depth0)) != null ? stack1 : "")
    + ")";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".pattern(/"
    + ((stack1 = container.lambda(container.strict(depth0, "pattern", {"start":{"line":2,"column":130},"end":{"line":2,"column":137}} ), depth0)) != null ? stack1 : "")
    + "/)";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"date-time",{"name":"equals","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":2,"column":163},"end":{"line":2,"column":358}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    return ".isoDate()";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"date",{"name":"equals","hash":{},"fn":container.program(12, data, 0),"inverse":container.program(14, data, 0),"data":data,"loc":{"start":{"line":2,"column":203},"end":{"line":2,"column":347}}})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    return ".date()";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"email",{"name":"equals","hash":{},"fn":container.program(15, data, 0),"inverse":container.program(17, data, 0),"data":data,"loc":{"start":{"line":2,"column":239},"end":{"line":2,"column":347}}})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    return ".email()";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"uri",{"name":"equals","hash":{},"fn":container.program(18, data, 0),"inverse":container.program(20, data, 0),"data":data,"loc":{"start":{"line":2,"column":277},"end":{"line":2,"column":347}}})) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    return ".uri()";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"uuid",{"name":"equals","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":311},"end":{"line":2,"column":347}}})) != null ? stack1 : "");
},"21":function(container,depth0,helpers,partials,data) {
    return ".uuid()";
},"23":function(container,depth0,helpers,partials,data) {
    return ".allow(null)";
},"25":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"number",{"name":"equals","hash":{},"fn":container.program(26, data, 0),"inverse":container.program(33, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.number()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":12},"end":{"line":4,"column":53}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":53},"end":{"line":4,"column":94}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":94},"end":{"line":4,"column":146}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":146},"end":{"line":4,"column":183}}})) != null ? stack1 : "")
    + "\n";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minimum", {"start":{"line":4,"column":35},"end":{"line":4,"column":42}} ), depth0)) != null ? stack1 : "")
    + ")";
},"29":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maximum", {"start":{"line":4,"column":76},"end":{"line":4,"column":83}} ), depth0)) != null ? stack1 : "")
    + ")";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".multiple("
    + ((stack1 = container.lambda(container.strict(depth0, "multipleOf", {"start":{"line":4,"column":125},"end":{"line":4,"column":135}} ), depth0)) != null ? stack1 : "")
    + ")";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"integer",{"name":"equals","hash":{},"fn":container.program(34, data, 0),"inverse":container.program(36, data, 0),"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"34":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.number().integer()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":22},"end":{"line":6,"column":63}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":63},"end":{"line":6,"column":104}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":104},"end":{"line":6,"column":156}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":156},"end":{"line":6,"column":193}}})) != null ? stack1 : "")
    + "\n";
},"36":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"boolean",{"name":"equals","hash":{},"fn":container.program(37, data, 0),"inverse":container.program(39, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.boolean()"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":13},"end":{"line":8,"column":50}}})) != null ? stack1 : "")
    + "\n";
},"39":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"File",{"name":"equals","hash":{},"fn":container.program(40, data, 0),"inverse":container.program(42, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"40":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.any()"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":9},"end":{"line":10,"column":46}}})) != null ? stack1 : "")
    + "\n";
},"42":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"null",{"name":"equals","hash":{},"fn":container.program(43, data, 0),"inverse":container.program(40, data, 0),"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"43":function(container,depth0,helpers,partials,data) {
    return "Joi.any().allow(null)\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"string",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(25, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":15,"column":11}}})) != null ? stack1 : "");
},"useData":true}