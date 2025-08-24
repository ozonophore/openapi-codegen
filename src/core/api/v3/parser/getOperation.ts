import type { Operation } from '../../../types/shared/Operation.model';
import type { OperationParameters } from '../../../types/shared/OperationParameters.model';
import { getComment } from '../../../utils/getComment';
import { getOperationErrors } from '../../../utils/getOperationErrors';
import { getOperationName } from '../../../utils/getOperationName';
import { getOperationPath } from '../../../utils/getOperationPath';
import { getOperationResponseHeader } from '../../../utils/getOperationResponseHeader';
import { getOperationResults } from '../../../utils/getOperationResults';
import { sortByRequiredExtended } from '../../../utils/sortByRequiredExtended';
import { sortByRequiredSimple } from '../../../utils/sortByRequiredSimple';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiOperation } from '../types/OpenApiOperation.model';
import type { OpenApiRequestBody } from '../types/OpenApiRequestBody.model';

export function getOperation(this: Parser, openApi: OpenApi, url: string, method: string, op: OpenApiOperation, pathParams: OperationParameters, serviceClassName: string, parentFileRef: string): Operation {
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
        const parameters = this.getOperationParameters(openApi, op.parameters, parentFileRef);
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...parameters.parameters);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersBody = parameters.parametersBody;
    }

    if (op.requestBody) {
        const sortByRequired = this.context.sortByRequired ? sortByRequiredExtended : sortByRequiredSimple;
        const requestBodyDef = (op.requestBody.$ref ? this.context.get(op.requestBody.$ref) : op.requestBody) as OpenApiRequestBody;
        const requestBody = this.getOperationRequestBody(openApi, requestBodyDef, parentFileRef);
        operation.imports.push(...requestBody.imports);
        operation.parameters.push(requestBody);
        operation.parameters = operation.parameters.sort(sortByRequired);
        operation.parametersBody = requestBody;
    }

    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = this.getOperationResponses(openApi, op.responses, parentFileRef);
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
