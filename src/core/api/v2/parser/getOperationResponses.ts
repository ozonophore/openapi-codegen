import get from 'lodash-es/get';

import type { OperationResponse } from '../../../types/shared/OperationResponse.model';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiResponse } from '../types/OpenApiResponse.model';
import type { OpenApiResponses } from '../types/OpenApiResponses.model';
import { getOperationResponseCode } from './getOperationResponseCode';

export function getOperationResponses(this: Parser, openApi: OpenApi, responses: OpenApiResponses): OperationResponse[] {
    const operationResponses: OperationResponse[] = [];

    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (get(responses, code, null)) {
            const responseOrReference = responses[code];
            const response = (responseOrReference.$ref ? this.context.get(responseOrReference.$ref) : responseOrReference) as OpenApiResponse;
            const responseCode = getOperationResponseCode(code);

            if (responseCode) {
                const operationResponse = this.getOperationResponse(openApi, response, responseCode, '');
                operationResponses.push(operationResponse);
            }
        }
    }

    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return operationResponses.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
