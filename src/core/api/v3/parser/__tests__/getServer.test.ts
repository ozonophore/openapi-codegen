import assert from 'node:assert';
import { describe, test } from 'node:test';

import { getServer } from '../getServer';

describe('@unit: getServer', () => {
    test('should produce correct result', () => {
        assert.strictEqual(
            getServer({
                openapi: '3.0',
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                paths: {},
                servers: [
                    {
                        url: 'https://localhost:8080/api',
                    },
                ],
            }),
            'https://localhost:8080/api'
        );
    });

    test('should produce correct result with variables', () => {
        assert.strictEqual(
            getServer({
                openapi: '3.0',
                info: {
                    title: 'dummy',
                    version: '1.0',
                },
                paths: {},
                servers: [
                    {
                        url: '{scheme}://localhost:{port}/api',
                        variables: {
                            scheme: {
                                default: 'https',
                            },
                            port: {
                                default: '8080',
                            },
                        },
                    },
                ],
            }),
            'https://localhost:8080/api'
        );
    });
});
