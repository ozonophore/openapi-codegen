import { OperationParameter } from '../client/interfaces/OperationParameter';
import { getPropertyGroup } from './getPropertyGroup';

describe('getPropertyGroup', () => {
    it('should return "optional"', () => {
        const paramOptional: OperationParameter = {
            in: 'query',
            prop: 'parameterOptionalStringWithNoDefault',
            export: 'generic',
            name: 'parameterOptionalStringWithNoDefault',
            alias: '',
            path: '',
            type: 'string',
            base: 'string',
            template: null,
            link: null,
            description: '3. This is a optional string with no default',
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
            mediaType: null,
        };
        expect(getPropertyGroup(paramOptional)).toEqual('optional');
    });

    it('should return "optional-with-default"', () => {
        const paramOptionalWithDefault: OperationParameter = {
            in: 'query',
            prop: 'parameterOptionalStringWithNoDefault',
            export: 'generic',
            name: 'parameterOptionalStringWithNoDefault',
            alias: '',
            path: '',
            type: 'string',
            base: 'string',
            template: null,
            link: null,
            description: '3. This is a optional string with no default',
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
            mediaType: null,
            default: 'Hello World!',
        };
        expect(getPropertyGroup(paramOptionalWithDefault)).toEqual('optional-with-default');
    });

    it('should return "required-with-default"', () => {
        const paramRequiredWithDefault: OperationParameter = {
            in: 'query',
            prop: 'parameterStringWithDefault',
            export: 'generic',
            name: 'parameterStringWithDefault',
            alias: '',
            path: '',
            type: 'string',
            base: 'string',
            template: null,
            link: null,
            description: '2. This is a string with default',
            isDefinition: false,
            isReadOnly: false,
            isRequired: true,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
            mediaType: null,
            default: 'Hello World!',
        };
        expect(getPropertyGroup(paramRequiredWithDefault)).toEqual('required-with-default');
    });

    it('should return "required"', () => {
        const paramRequiredWithoutDefault: OperationParameter = {
            in: 'query',
            prop: 'parameterStringWithoutDefault',
            export: 'generic',
            name: 'parameterStringWithoutDefault',
            alias: '',
            path: '',
            type: 'string',
            base: 'string',
            template: null,
            link: null,
            description: '1. This is a string without default',
            isDefinition: false,
            isReadOnly: false,
            isRequired: true,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
            mediaType: null,
        };
        expect(getPropertyGroup(paramRequiredWithoutDefault)).toEqual('required');
    });
});
