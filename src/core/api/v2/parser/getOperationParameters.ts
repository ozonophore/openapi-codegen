import type { OperationParameters } from '../../../types/shared/OperationParameters.model';
import { sortByRequiredExtended } from '../../../utils/sortByRequiredExtended';
import { sortByRequiredSimple } from '../../../utils/sortByRequiredSimple';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiParameter } from '../types/OpenApiParameter.model';

export function getOperationParameters(this: Parser, openApi: OpenApi, parameters: OpenApiParameter[]): OperationParameters {
    const operationParameters: OperationParameters = {
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null,
    };

    // Iterate over the parameters
    parameters.forEach(parameterOrReference => {
        const parameterDef = (parameterOrReference.$ref ? this.context.get(parameterOrReference.$ref) : parameterOrReference) as OpenApiParameter;
        const parameter = this.getOperationParameter(openApi, parameterDef);

        // We ignore the "api-version" param, since we do not want to add this
        // as the first / default parameter for each of the service calls.
        if (parameter.prop !== 'api-version') {
            switch (parameter.in) {
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

                case 'header':
                    operationParameters.parametersHeader.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;

                case 'formData':
                    operationParameters.parametersForm.push(parameter);
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;

                case 'body':
                    operationParameters.parametersBody = parameter;
                    operationParameters.parameters.push(parameter);
                    operationParameters.imports.push(...parameter.imports);
                    break;
            }
        }
    });

    const sortByRequired = this.context.sortByRequired ? sortByRequiredExtended : sortByRequiredSimple;

    operationParameters.parameters = operationParameters.parameters.sort(sortByRequired);
    operationParameters.parametersPath = operationParameters.parametersPath.sort(sortByRequired);
    operationParameters.parametersQuery = operationParameters.parametersQuery.sort(sortByRequired);
    operationParameters.parametersForm = operationParameters.parametersForm.sort(sortByRequired);
    operationParameters.parametersCookie = operationParameters.parametersCookie.sort(sortByRequired);
    operationParameters.parametersHeader = operationParameters.parametersHeader.sort(sortByRequired);
    return operationParameters;
}
