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

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"needsCoercion"),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":141}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minLength"),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":141},"end":{"line":2,"column":186}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maxLength"),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":186},"end":{"line":2,"column":231}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"pattern"),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":231},"end":{"line":2,"column":278}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"format"),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":278},"end":{"line":2,"column":491}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":491},"end":{"line":2,"column":527}}})) != null ? stack1 : "")
    + "\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "yup.string().transform((value, original) => (original == null ? original : String(original)))";
},"4":function(container,depth0,helpers,partials,data) {
    return "yup.string()";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minLength", {"start":{"line":2,"column":166},"end":{"line":2,"column":175}} ), depth0)) != null ? stack1 : "")
    + ")";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maxLength", {"start":{"line":2,"column":211},"end":{"line":2,"column":220}} ), depth0)) != null ? stack1 : "")
    + ")";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".matches(/"
    + ((stack1 = container.lambda(container.strict(depth0, "pattern", {"start":{"line":2,"column":259},"end":{"line":2,"column":266}} ), depth0)) != null ? stack1 : "")
    + "/)";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"date-time",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":2,"column":292},"end":{"line":2,"column":484}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    return ".date()";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"date",{"name":"equals","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":2,"column":329},"end":{"line":2,"column":473}}})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"email",{"name":"equals","hash":{},"fn":container.program(17, data, 0),"inverse":container.program(19, data, 0),"data":data,"loc":{"start":{"line":2,"column":365},"end":{"line":2,"column":473}}})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    return ".email()";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"uri",{"name":"equals","hash":{},"fn":container.program(20, data, 0),"inverse":container.program(22, data, 0),"data":data,"loc":{"start":{"line":2,"column":403},"end":{"line":2,"column":473}}})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    return ".url()";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"format"),"uuid",{"name":"equals","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":437},"end":{"line":2,"column":473}}})) != null ? stack1 : "");
},"23":function(container,depth0,helpers,partials,data) {
    return ".uuid()";
},"25":function(container,depth0,helpers,partials,data) {
    return ".nullable()";
},"27":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"number",{"name":"equals","hash":{},"fn":container.program(28, data, 0),"inverse":container.program(39, data, 0),"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"needsCoercion"),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.program(31, data, 0),"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":157}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":157},"end":{"line":4,"column":198}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":198},"end":{"line":4,"column":239}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":239},"end":{"line":6,"column":9}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":9},"end":{"line":6,"column":45}}})) != null ? stack1 : "")
    + "\n";
},"29":function(container,depth0,helpers,partials,data) {
    return "yup.number().transform((value, original) => (original == null || original === '' ? value : Number(original)))";
},"31":function(container,depth0,helpers,partials,data) {
    return "yup.number()";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".min("
    + ((stack1 = container.lambda(container.strict(depth0, "minimum", {"start":{"line":4,"column":180},"end":{"line":4,"column":187}} ), depth0)) != null ? stack1 : "")
    + ")";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ".max("
    + ((stack1 = container.lambda(container.strict(depth0, "maximum", {"start":{"line":4,"column":221},"end":{"line":4,"column":228}} ), depth0)) != null ? stack1 : "")
    + ")";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.strict, alias2=container.lambda;

  return ".test('multipleOf', 'Must be a multiple of "
    + ((stack1 = alias2(alias1(depth0, "multipleOf", {"start":{"line":4,"column":303},"end":{"line":4,"column":313}} ), depth0)) != null ? stack1 : "")
    + "', function(value) {\n    return value == null || value % "
    + ((stack1 = alias2(alias1(depth0, "multipleOf", {"start":{"line":5,"column":39},"end":{"line":5,"column":49}} ), depth0)) != null ? stack1 : "")
    + " === 0;\n})";
},"39":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"integer",{"name":"equals","hash":{},"fn":container.program(40, data, 0),"inverse":container.program(45, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"40":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"needsCoercion"),{"name":"if","hash":{},"fn":container.program(41, data, 0),"inverse":container.program(43, data, 0),"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":8,"column":177}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"minimum"),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":177},"end":{"line":8,"column":218}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"maximum"),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":218},"end":{"line":8,"column":259}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"multipleOf"),{"name":"if","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":259},"end":{"line":10,"column":9}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":9},"end":{"line":10,"column":45}}})) != null ? stack1 : "")
    + "\n";
},"41":function(container,depth0,helpers,partials,data) {
    return "yup.number().integer().transform((value, original) => (original == null || original === '' ? value : Number(original)))";
},"43":function(container,depth0,helpers,partials,data) {
    return "yup.number().integer()";
},"45":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"boolean",{"name":"equals","hash":{},"fn":container.program(46, data, 0),"inverse":container.program(48, data, 0),"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"46":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "yup.boolean()"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":13},"end":{"line":12,"column":49}}})) != null ? stack1 : "")
    + "\n";
},"48":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"File",{"name":"equals","hash":{},"fn":container.program(49, data, 0),"inverse":container.program(51, data, 0),"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"49":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "yup.mixed()"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"isNullable"),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":11},"end":{"line":14,"column":47}}})) != null ? stack1 : "")
    + "\n";
},"51":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"null",{"name":"equals","hash":{},"fn":container.program(52, data, 0),"inverse":container.program(49, data, 0),"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":19,"column":0}}})) != null ? stack1 : "");
},"52":function(container,depth0,helpers,partials,data) {
    return "yup.mixed().oneOf([null])\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"equals").call(depth0 != null ? depth0 : (container.nullContext || {}),lookupProperty(depth0,"base"),"string",{"name":"equals","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(27, data, 0),"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":19,"column":11}}})) != null ? stack1 : "");
},"useData":true}