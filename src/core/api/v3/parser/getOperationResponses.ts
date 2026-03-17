import { isAbsolute } from 'path';

import { resolveHelper } from '../../../../common/utils/pathHelpers';
import { safeHasOwn } from '../../../../common/utils/safeHasOwn';
import type { OperationResponse } from '../../../types/shared/OperationResponse.model';
import { getOperationResponseCode } from '../../../utils/getOperationResponseCode';
import { normalizeRef } from '../../../utils/normalizeRef';
import { parseRef } from '../../../utils/parseRef';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiResponse } from '../types/OpenApiResponse.model';
import type { OpenApiResponses } from '../types/OpenApiResponses.model';

export function getOperationResponses(this: Parser, openApi: OpenApi, responses: OpenApiResponses, parentRef: string): OperationResponse[] {
    const operationResponses: OperationResponse[] = [];

    // Iterate over each response code and get the
    // status code and response message (if any).
    for (const code in responses) {
        if (safeHasOwn(responses, code)) {
            const responseOrReference = responses[code];
            const response = (responseOrReference.$ref ? (this.context.get(responseOrReference.$ref, parentRef) as Record<string, any>) : responseOrReference) as OpenApiResponse;
            const responseCode = getOperationResponseCode(code);
            const normalizedParentRef = isAbsolute(parentRef) ? parentRef : resolveHelper(this.context.root?.dirName || process.cwd(), parentRef);
            const responseParentRef = responseOrReference.$ref
                ? parseRef(normalizeRef(responseOrReference.$ref, normalizedParentRef)).filePath || normalizedParentRef
                : parentRef;

            if (responseCode) {
                const operationResponse = this.getOperationResponse(openApi, response, responseCode, responseParentRef);
                operationResponses.push(operationResponse);
            }
        }
    }

    // Sort the responses to 2XX success codes come before 4XX and 5XX error codes.
    return operationResponses.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
