import type { OperationParameters } from '../../../client/interfaces/OperationParameters';
import { ESortStrategy } from '../../../types/Enums';
import { sortByRequired } from '../../../utils/sortByRequired';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { Parser } from '../Parser';

export function getOperationParameters(this: Parser, openApi: OpenApi, parameters: OpenApiParameter[]): OperationParameters {
    const operationParameters: OperationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null, // Not used in V3 -> @see requestBody
    };

    // Iterate over the parameters
    parameters.forEach(parameterOrReference => {
        const parameterDef = (parameterOrReference.$ref ? (this.context.get(parameterOrReference.$ref) as Record<string, any>) : parameterOrReference) as OpenApiParameter;
        const parameter = this.getOperationParameter(openApi, parameterDef);

        // We ignore the "api-version" param, since we do not want to add this
        // as the first / default parameter for each of the service calls.
        if (parameter.prop !== 'api-version') {
            switch (parameterDef.in) {
                case 'path':
                    operationParameters.parametersPath.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;

                case 'query':
                    operationParameters.parametersQuery.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;

                case 'formData':
                    operationParameters.parametersForm.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;

                case 'cookie':
                    operationParameters.parametersCookie.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;

                case 'header':
                    operationParameters.parametersHeader.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
            }
        }
    });

    if (this.context.propSortStrategy === ESortStrategy.REQUIRED_FIRST) {
        operationParameters.parameters = operationParameters.parameters.sort(sortByRequired);
        operationParameters.parametersPath = operationParameters.parametersPath.sort(sortByRequired);
        operationParameters.parametersQuery = operationParameters.parametersQuery.sort(sortByRequired);
        operationParameters.parametersForm = operationParameters.parametersForm.sort(sortByRequired);
        operationParameters.parametersCookie = operationParameters.parametersCookie.sort(sortByRequired);
        operationParameters.parametersHeader = operationParameters.parametersHeader.sort(sortByRequired);
    }
    return operationParameters;
}
