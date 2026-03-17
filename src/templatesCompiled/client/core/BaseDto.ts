// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"header"),depth0,{"name":"header","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\nexport abstract class BaseDto<Raw> {\n    protected readonly _raw: Raw;\n\n    protected constructor(data: Raw) {\n        this._raw = data;\n    }\n\n    public abstract toJSON(): Raw;\n\n    public clone(): this {\n        const ctor = this.constructor as new (data: Raw) => this;\n        return new ctor(this.toJSON());\n    }\n}\n";
},"usePartial":true,"useData":true}