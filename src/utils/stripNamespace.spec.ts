import { stripNamespace } from './stripNamespace';

describe('stripNamespace', () => {
    it('should strip namespace', () => {
        expect(stripNamespace('package/componentClass.yml#/components/TestComponent')).toEqual('package/TestComponent');
        expect(stripNamespace('package/componentClass.yml')).toEqual('package/ComponentClass');
        expect(stripNamespace('#/components/schemas/Item')).toEqual('Item');
        expect(stripNamespace('#/components/responses/Item')).toEqual('Item');
        expect(stripNamespace('#/components/parameters/Item')).toEqual('Item');
        expect(stripNamespace('#/components/examples/Item')).toEqual('Item');
        expect(stripNamespace('#/components/requestBodies/Item')).toEqual('Item');
        expect(stripNamespace('#/components/headers/Item')).toEqual('Item');
        expect(stripNamespace('#/components/securitySchemes/Item')).toEqual('Item');
        expect(stripNamespace('#/components/links/Item')).toEqual('Item');
        expect(stripNamespace('#/components/callbacks/Item')).toEqual('Item');
        expect(stripNamespace('/components/callbacks/item')).toEqual('/components/callbacks/Item');
        expect(stripNamespace('/components/callbacks/some_special_item')).toEqual('/components/callbacks/SomeSpecialItem');
        expect(stripNamespace('#/definitions/Item')).toEqual('Item');
        expect(stripNamespace('#/parameters/Item')).toEqual('Item');
        expect(stripNamespace('#/responses/Item')).toEqual('Item');
        expect(stripNamespace('#/securityDefinitions/Item')).toEqual('Item');
    });
});
