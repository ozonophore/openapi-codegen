import assert from 'node:assert';
import { describe, test } from 'node:test';

import { OperationResponse } from '../../types/shared/OperationResponse.model';
import { getOperationResults } from '../getOperationResults';

function createResponse(code: number, type: string): OperationResponse {
    return {
        in: 'response',
        name: '',
        alias: '',
        path: '',
        code,
        description: '',
        export: 'generic',
        type,
        base: type,
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
    };
}

describe('@unit: getOperationResults', () => {
    test('returns only success responses excluding 204', () => {
        const result = getOperationResults([createResponse(200, 'string'), createResponse(201, 'number'), createResponse(204, 'void'), createResponse(400, 'Error')]);

        assert.deepStrictEqual(
            result.map(item => item.code),
            [200, 201]
        );
    });

    test('returns void 200 response when success responses are missing', () => {
        const result = getOperationResults([createResponse(400, 'Error')]);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].code, 200);
        assert.strictEqual(result[0].type, 'void');
    });
});
