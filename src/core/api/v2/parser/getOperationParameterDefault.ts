import type { OperationParameter } from '../../../types/shared/OperationParameter.model';
import type { OpenApiParameter } from '../types/OpenApiParameter.model';

export function getOperationParameterDefault(parameter: OpenApiParameter, operationParameter: OperationParameter): string | undefined {
    if (parameter.default === undefined) {
        return;
    }

    if (parameter.default === null) {
        return 'null';
    }

    const type = parameter.type || typeof parameter.default;

    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if (operationParameter.export === 'enum' && operationParameter.enum?.[parameter.default]) {
                return operationParameter.enum[parameter.default].value;
            }
            return parameter.default;

        case 'boolean':
            return JSON.stringify(parameter.default);

        case 'string':
            return `'${parameter.default}'`;

        case 'object':
            try {
                return JSON.stringify(parameter.default, null, 4);
            } catch {
                // Ignore
            }
    }

    return;
}
