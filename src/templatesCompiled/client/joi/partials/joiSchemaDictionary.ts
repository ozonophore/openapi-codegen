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

  return ((stack1 = lookupProperty(helpers,"isBasicType").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"link"),{"name":"isBasicType","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":1,"column":47},"end":{"line":1,"column":195}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"joiBaseSchema").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"link"),"base"),{"name":"joiBaseSchema","hash":{},"data":data,"loc":{"start":{"line":1,"column":68},"end":{"line":1,"column":95}}})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(lookupProperty(depth0,"link"),"alias"),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":1,"column":103},"end":{"line":1,"column":179}}})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"link"), "alias", {"start":{"line":1,"column":124},"end":{"line":1,"column":134}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.lambda(container.strict(lookupProperty(depth0,"link"), "type", {"start":{"line":1,"column":154},"end":{"line":1,"column":163}} ), depth0)) != null ? stack1 : "")
    + "Schema";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"joiBaseSchema").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),{"name":"joiBaseSchema","hash":{},"data":data,"loc":{"start":{"line":1,"column":203},"end":{"line":1,"column":225}}})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    return ".allow(null)";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Joi.object().pattern(Joi.string(), "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"link"),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(9, data, 0),"data":data,"loc":{"start":{"line":1,"column":35},"end":{"line":1,"column":232}}})) != null ? stack1 : "")
    + ")"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":233},"end":{"line":1,"column":270}}})) != null ? stack1 : "");
},"useData":true}