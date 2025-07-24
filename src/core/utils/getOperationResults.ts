import { OperationResponse } from "../types/shared/OperationResponse.model";
import { areEqual } from "./areEqual";

export function getOperationResults(operationResponses: OperationResponse[]): OperationResponse[] {
    const operationResults: OperationResponse[] = [];

    // Filter out success response codes, but skip "204 No Content"
    operationResponses.forEach(operationResponse => {
        const { code } = operationResponse;
        if (code && code !== 204 && code >= 200 && code < 300) {
            operationResults.push(operationResponse);
        }
    });

    if (!operationResults.length) {
        operationResults.push({
            in: 'response',
            name: '',
            alias: '',
            path: '',
            code: 200,
            description: '',
            export: 'generic',
            type: 'void',
            base: 'void',
            template: null,
            link: null,
            isDefinition: false,
            isReadOnly: false,
            isRequired: false,
            isNullable: false,
            imports: [],
            enum: [],
            enums: [],
            properties: [],
        });
    }

    return operationResults.filter((operationResult, index, arr) => {
        return (
            arr.findIndex(item => {
                return areEqual(item, operationResult);
            }) === index
        );
    });
}
