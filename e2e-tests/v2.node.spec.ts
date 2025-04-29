import { expect, test } from '@playwright/test';
import path from 'path';

import server from './helps/server';

const GENERATED = path.join(__dirname, 'generated/v2/node');

test.describe('v2.node client', () => {
    let tokenCalls = 0;

    test.beforeAll(async () => {
        await server.start('v2/node');
    });

    test.afterAll(async () => {
        await server.stop();
    });

    test('requests token', async () => {
        const { OpenAPI, SimpleService } = require(path.join(GENERATED, 'cjs/index.js'));

        tokenCalls = 0;
        OpenAPI.TOKEN = async () => {
            tokenCalls++;
            return 'MY_TOKEN';
        };

        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenCalls).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    test('complexService', async () => {
        const { ComplexService } = require(path.join(GENERATED, 'cjs/index.js'));
        const payload = { first: { second: { third: 'Hello World!' } } };
        const result = await ComplexService.complexTypes(payload);
        expect(result).toBeDefined();
    });
});
