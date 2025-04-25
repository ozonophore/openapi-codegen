import { expect, test } from '@playwright/test';
import path from 'path';

import server from './helps/server';

const GENERATED = path.join(__dirname, 'generated/v2/axios');

test.describe('v2.axios client', () => {
    let tokenCalls = 0;

    test.beforeAll(async () => {
        // Запускаем сервер, который отдаёт статические файлы и API-прокси
        await server.start('v2/axios');
    });

    test.afterAll(async () => {
        await server.stop();
    });

    test.skip('requests token', async () => {
        const importPath = path.join(GENERATED, 'index.js');
        console.log('=== ', importPath, ' ===');
        // Подключаем сгенерированный JS-клиент
        const { OpenAPI, SimpleService } = require(path.join(GENERATED, 'index.js'));

        // Мокаем выдачу токена
        tokenCalls = 0;
        OpenAPI.TOKEN = async () => {
            tokenCalls++;
            return 'MY_TOKEN';
        };

        // Выполняем запрос
        const result = await SimpleService.getCallWithoutParametersAndResponse();

        expect(tokenCalls).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    test.skip('complexService', async () => {
        const { ComplexService } = require(path.join(GENERATED, 'index.js'));
        const payload = { first: { second: { third: 'Hello World!' } } };
        const result = await ComplexService.complexTypes(payload);
        expect(result).toBeDefined();
    });
});
