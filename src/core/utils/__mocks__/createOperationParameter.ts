import { OperationParameter } from '../../types/shared/OperationParameter.model';

export function createOperationParameter(name: string, options: Partial<Pick<OperationParameter, 'isRequired' | 'default' | 'description'>> = {}): OperationParameter {
    return {
        name,
        isRequired: options.isRequired ?? false,
        default: options.default,
        description: options.description ?? null,
        in: 'query',
        prop: '',
        export: 'reference',
        alias: '',
        path: '',
        type: 'string',
        base: '',
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
        mediaType: null,
    };
}
