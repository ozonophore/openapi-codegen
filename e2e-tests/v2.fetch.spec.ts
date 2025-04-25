// test/e2e/v2-fetch.spec.ts
import { BrowserContext, expect, Page, test } from '@playwright/test';
import path from 'path';

import server from './helps/server';

const GENERATED_DIR = path.join(__dirname, 'generated/v2/fetch');

test.describe('v2.fetch client', () => {
    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        // 1) Запускаем статический сервер
        await server.start('v2/fetch');

        // 2) Создаём новый контекст и страницу
        context = await browser.newContext();
        page = await context.newPage();

        // 3) Переходим на главную страницу вашего index.html
        //    baseURL задан в playwright.config.ts как http://localhost:3000
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.waitForFunction(() => !!(window as any).api);
    });

    test.afterAll(async () => {
        // Закрываем браузерный контекст и сервер
        await context.close();
        await server.stop();
    });

    test('requests token', async () => {
        // Вместо jest.fn() заводим собственный счётчик вызовов
        let tokenCallCount = 0;
        const tokenStub = async () => {
            tokenCallCount++;
            return 'MY_TOKEN';
        };

        // «вкалываем» функцию в window.tokenRequest
        await page.exposeFunction('tokenRequest', tokenStub);

        // Внутри страницы вы, возможно, прикрепляете
        // свой API-клиент к window.api.
        // Если нет — замените window.api на window.OpenAPI/SimpleService.
        const result = await page.evaluate(async () => {
            // Присваиваем OpenAPI.TOKEN нашей фейковой функции из window
            (window as any).api.OpenAPI.TOKEN = (window as any).tokenRequest;
            // Делаем запрос
            return (window as any).api.SimpleService.getCallWithoutParametersAndResponse();
        });

        expect(tokenCallCount).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    test('complexService', async () => {
        const result = await page.evaluate(async () => {
            return (window as any).api.ComplexService.complexTypes({
                first: { second: { third: 'Hello World!' } },
            });
        });
        expect(result).toBeDefined();
    });
});
