import { safeHasOwn } from '../../../../common/utils/safeHasOwn';
import type { OperationResponse } from '../../../types/shared/OperationResponse.model';
import { splitCanonicalRef, toParentSourceFile } from '../../../utils/canonicalRef';
import { getOperationResponseCode } from '../../../utils/getOperationResponseCode';
import { Parser } from '../Parser';
import type { OpenApi } from '../types/OpenApi.model';
import type { OpenApiResponse } from '../types/OpenApiResponse.model';
import type { OpenApiResponses } from '../types/OpenApiResponses.model';

export function getOperationResponses(this: Parser, openApi: OpenApi, responses: OpenApiResponses, parentRef: string): OperationResponse[] {
    const operationResponses: OperationResponse[] = [];
    const parentSourceFile = toParentSourceFile(parentRef) || '';

    for (const code in responses) {
        if (safeHasOwn(responses, code)) {
            const responseOrReference = responses[code];
            const response = (responseOrReference.$ref ? (this.context.get(responseOrReference.$ref, parentSourceFile) as Record<string, any>) : responseOrReference) as OpenApiResponse;
            const responseCode = getOperationResponseCode(code);
            const responseParentRef = responseOrReference.$ref
                ? splitCanonicalRef(this.context.toCanonicalRef(responseOrReference.$ref, parentSourceFile)).sourceFile || parentSourceFile
                : parentSourceFile;

            if (responseCode) {
                const operationResponse = this.getOperationResponse(openApi, response, responseCode, responseParentRef);
                operationResponses.push(operationResponse);
            }
        }
    }

    return operationResponses.sort((a, b): number => {
        return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
    });
}
