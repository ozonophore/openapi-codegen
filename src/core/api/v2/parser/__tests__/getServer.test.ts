import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getServer } from '../getServer';

describe('@unit: getServer', () => {
    test('should produce correct result', () => {
        assert.strictEqual(
            getServer({
                swagger: '2.0',
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                host: 'localhost:8080',
                basePath: '/api',
                schemes: ['http', 'https'],
                paths: {},
            }),
            'http://localhost:8080/api'
        );
    });
});
