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

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"needsCoercion"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(26, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":878}}})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.alternatives().try(Joi.string()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minLength"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":56},"end":{"line":2,"column":101}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxLength"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":101},"end":{"line":2,"column":146}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"pattern"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":146},"end":{"line":2,"column":193}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"format"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":193},"end":{"line":2,"column":409}}})) != null ? stack1 : "")
    + ", Joi.number())"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":424},"end":{"line":2,"column":461}}})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minLength", {"start":{"line":2,"column":81},"end":{"line":2,"column":90}} ), depth0)) != null ? stack1 : "")
    + ")";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maxLength", {"start":{"line":2,"column":126},"end":{"line":2,"column":135}} ), depth0)) != null ? stack1 : "")
    + ")";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".pattern(/"
    + ((stack1 = container.lambda(container.strict(depth0, "pattern", {"start":{"line":2,"column":174},"end":{"line":2,"column":181}} ), depth0)) != null ? stack1 : "")
    + "/)";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"date-time",{"name":"equals","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":2,"column":207},"end":{"line":2,"column":402}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    return ".isoDate()";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"date",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":2,"column":247},"end":{"line":2,"column":391}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    return ".date()";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"email",{"name":"equals","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(18, data, 0),"data":data,"loc":{"start":{"line":2,"column":283},"end":{"line":2,"column":391}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    return ".email()";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"uri",{"name":"equals","hash":{},"fn":container.program(19, data, 0),"inverse":container.program(21, data, 0),"data":data,"loc":{"start":{"line":2,"column":321},"end":{"line":2,"column":391}}})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    return ".uri()";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"uuid",{"name":"equals","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":355},"end":{"line":2,"column":391}}})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    return ".uuid()";
},"24":function(container,depth0,helpers,partials,data) {
    return ".allow(null)";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.string()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minLength"),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":481},"end":{"line":2,"column":526}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxLength"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":526},"end":{"line":2,"column":571}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"pattern"),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":571},"end":{"line":2,"column":618}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"format"),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":618},"end":{"line":2,"column":834}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":834},"end":{"line":2,"column":871}}})) != null ? stack1 : "");
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"number",{"name":"equals","hash":{},"fn":container.program(29, data, 0),"inverse":container.program(39, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"29":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"needsCoercion"),{"name":"if","hash":{},"fn":container.program(30, data, 0),"inverse":container.program(37, data, 0),"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":440}}})) != null ? stack1 : "")
    + "\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.alternatives().try(Joi.number()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":56},"end":{"line":4,"column":97}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":97},"end":{"line":4,"column":138}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":138},"end":{"line":4,"column":190}}})) != null ? stack1 : "")
    + ", Joi.string())"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":205},"end":{"line":4,"column":242}}})) != null ? stack1 : "");
},"31":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minimum", {"start":{"line":4,"column":79},"end":{"line":4,"column":86}} ), depth0)) != null ? stack1 : "")
    + ")";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maximum", {"start":{"line":4,"column":120},"end":{"line":4,"column":127}} ), depth0)) != null ? stack1 : "")
    + ")";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".multiple("
    + ((stack1 = container.lambda(container.strict(depth0, "multipleOf", {"start":{"line":4,"column":169},"end":{"line":4,"column":179}} ), depth0)) != null ? stack1 : "")
    + ")";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.number()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":262},"end":{"line":4,"column":303}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":303},"end":{"line":4,"column":344}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":344},"end":{"line":4,"column":396}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":396},"end":{"line":4,"column":433}}})) != null ? stack1 : "");
},"39":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"integer",{"name":"equals","hash":{},"fn":container.program(40, data, 0),"inverse":container.program(45, data, 0),"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"40":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"needsCoercion"),{"name":"if","hash":{},"fn":container.program(41, data, 0),"inverse":container.program(43, data, 0),"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":6,"column":460}}})) != null ? stack1 : "")
    + "\n";
},"41":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.alternatives().try(Joi.number().integer()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":66},"end":{"line":6,"column":107}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":107},"end":{"line":6,"column":148}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":148},"end":{"line":6,"column":200}}})) != null ? stack1 : "")
    + ", Joi.string())"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":215},"end":{"line":6,"column":252}}})) != null ? stack1 : "");
},"43":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.number().integer()"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":282},"end":{"line":6,"column":323}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":323},"end":{"line":6,"column":364}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":364},"end":{"line":6,"column":416}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":416},"end":{"line":6,"column":453}}})) != null ? stack1 : "");
},"45":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"boolean",{"name":"equals","hash":{},"fn":container.program(46, data, 0),"inverse":container.program(51, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"46":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"needsCoercion"),{"name":"if","hash":{},"fn":container.program(47, data, 0),"inverse":container.program(49, data, 0),"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":8,"column":174}}})) != null ? stack1 : "")
    + "\n";
},"47":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.alternatives().try(Joi.boolean(), Joi.string())"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":72},"end":{"line":8,"column":109}}})) != null ? stack1 : "");
},"49":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.boolean()"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":130},"end":{"line":8,"column":167}}})) != null ? stack1 : "");
},"51":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"File",{"name":"equals","hash":{},"fn":container.program(52, data, 0),"inverse":container.program(54, data, 0),"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"52":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.any()"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":9},"end":{"line":10,"column":46}}})) != null ? stack1 : "")
    + "\n";
},"54":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"null",{"name":"equals","hash":{},"fn":container.program(55, data, 0),"inverse":container.program(52, data, 0),"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":15,"column":0}}})) != null ? stack1 : "");
},"55":function(container,depth0,helpers,partials,data) {
    return "Joi.any().allow(null)\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"string",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(28, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":15,"column":11}}})) != null ? stack1 : "");
},"useData":true}