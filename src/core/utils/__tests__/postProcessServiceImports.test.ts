import assert from 'node:assert';
import { describe, test } from 'node:test';

import type { Service } from '../../types/shared/Service.model';
import { postProcessServiceImports } from '../postProcessServiceImports';

describe('@unit: postProcessServiceImports', () => {
    test('keeps import when model name equals service name', () => {
        const service: Service = {
            name: 'UserService',
            originName: 'UserService',
            operations: [],
            imports: [
                { name: 'UserService', alias: '', path: '../models/UserService' },
                { name: 'UserService', alias: 'UserService$1', path: '../models/path/UserService' },
            ],
        };

        const result = postProcessServiceImports(service);

        assert.deepStrictEqual(
            result.map(item => `${item.name}:${item.alias}:${item.path}`),
            [
                'UserService:UserService$1:../models/path/UserService',
                'UserService::../models/UserService',
            ],
        );
    });
});
