import type { Operation } from '../../../client/interfaces/Operation';
import type { OperationParameters } from '../../../client/interfaces/OperationParameters';
import { Context } from '../../../core/Context';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import type { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import { getComment } from './getComment';
import { getOperationErrors } from './getOperationErrors';
import { getOperationName } from './getOperationName';
import { getOperationParameters } from './getOperationParameters';
import { getOperationPath } from './getOperationPath';
import { getOperationRequestBody } from './getOperationRequestBody';
import { getOperationResponseHeader } from './getOperationResponseHeader';
import { getOperationResponses } from './getOperationResponses';
import { getOperationResults } from './getOperationResults';
import { sortByRequired } from './sortByRequired';
import { GetTypeName } from './getType';

export function getOperation(
    context: Context,
    openApi: OpenApi,
    url: string,
    method: string,
    op: OpenApiOperation,
    pathParams: OperationParameters,
    serviceClassName: string,
    getTypeByRef: GetTypeName
): Operation {
    const operationNameFallback = `${method}${serviceClassName}`;
    const operationName = getOperationName(op.operationId || operationNameFallback);
    const operationPath = getOperationPath(url);

    // Create a new operation object for this method.
    const operation: Operation = {
        service: serviceClassName,
        name: operationName,
        summary: getComment(op.summary),
        description: getComment(op.description),
        deprecated: op.deprecated === true,
        method: method.toUpperCase(),
        path: operationPath,
        parameters: [...pathParams.parameters],
        parametersPath: [...pathParams.parametersPath],
        parametersQuery: [...pathParams.parametersQuery],
        parametersForm: [...pathParams.parametersForm],
        parametersHeader: [...pathParams.parametersHeader],
        parametersCookie: [...pathParams.parametersCookie],
        parametersBody: pathParams.parametersBody,
        imports: [],
        errors: [],
        results: [],
        responseHeader: null,
    };

    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters = getOperationParameters(context, openApi, op.parameters, getTypeByRef);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersBody = parameters.parametersBody;
    }

    // TODO: form data goes wrong here: https://github.com/ferdikoomen/openapi-typescript-codegen/issues/257§
    if (op.requestBody) {
        const requestBodyDef = (op.requestBody.$ref ? context.get(op.requestBody.$ref) : op.requestBody) as OpenApiRequestBody;
        const requestBody = getOperationRequestBody(openApi, requestBodyDef, getTypeByRef, '');
        operation.imports.push(...requestBody.imports);
        operation.parameters.push(requestBody);
        operation.parameters = operation.parameters.sort(sortByRequired);
        operation.parametersBody = requestBody;
    }

    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses(context, openApi, op.responses, getTypeByRef);
        const operationResults = getOperationResults(operationResponses);
        operation.errors = getOperationErrors(operationResponses);
        operation.responseHeader = getOperationResponseHeader(operationResults);

        operationResults.forEach(operationResult => {
            operation.results.push(operationResult);
            operation.imports.push(...operationResult.imports);
        });
    }

    return operation;
}
