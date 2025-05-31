import type { OperationError } from '../../../types/shared/OperationError.model';
import type { OperationResponse } from '../../../types/shared/OperationResponse.model';
import { escapeDescription } from './escapeDescription';

export function getOperationErrors(operationResponses: OperationResponse[]): OperationError[] {
    return operationResponses
        .filter(operationResponse => {
            return operationResponse.code >= 300 && operationResponse.description;
        })
        .map(response => ({
            code: response.code,
            description: escapeDescription(response.description!),
        }));
}
