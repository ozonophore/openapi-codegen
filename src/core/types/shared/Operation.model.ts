import type { OperationError } from './OperationError.model';
import type { OperationParameters } from './OperationParameters.model';
import type { OperationResponse } from './OperationResponse.model';

export interface Operation extends OperationParameters {
    service: string;
    name: string;
    summary: string | null;
    description: string | null;
    deprecated: boolean;
    method: string;
    path: string;
    errors: OperationError[];
    results: OperationResponse[];
    responseHeader: string | null;
}
