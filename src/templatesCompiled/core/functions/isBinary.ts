// This is an automatically generated file for the hbs template.
// You don't need to change it, run npm run build:hbs to update it.
/* istanbul ignore file */
/* tslint: disable */
/* eslint: disable */
// @ts-nocheck
export default {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "function isBinary(value: any): value is Buffer | ArrayBuffer | ArrayBufferView {\n    const isBuffer = Buffer.isBuffer(value);\n    const isArrayBuffer = types.isArrayBuffer(value);\n    const isArrayBufferView = types.isArrayBufferView(value);\n    return isBuffer || isArrayBuffer || isArrayBufferView;\n}\n";
},"useData":true}