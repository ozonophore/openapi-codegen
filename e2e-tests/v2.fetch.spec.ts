import { BrowserContext, expect, Page, test } from '@playwright/test';

// import path from 'path';
import server from './helps/server';

// const GENERATED = path.join(__dirname, 'generated/v2/fetch');

test.describe('v2.fetch client', () => {
    let context: BrowserContext;
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        await server.start('v2/fetch');

        // Добавляем bypassCSP: true
        context = await browser.newContext({
            bypassCSP: true,
        });
        page = await context.newPage();

        await page.goto('/', { waitUntil: 'networkidle' });
        await page.waitForFunction(() => !!(window as any).api);
    });

    test.afterAll(async () => {
        await context.close();
        await server.stop();
    });

    test('requests token', async () => {
        let tokenCalls = 0;
        const tokenStub = async () => {
            tokenCalls++;
            return 'MY_TOKEN';
        };

        await page.exposeFunction('tokenRequest', tokenStub);

        const result = await page.evaluate(async () => {
            const api = (window as any).api;
            api.OpenAPI.TOKEN = (window as any).tokenRequest;
            return api.SimpleService.getCallWithoutParametersAndResponse();
        });

        expect(tokenCalls).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    test('complexService', async () => {
        const result = await page.evaluate(() => {
            return (window as any).api.ComplexService.complexTypes({
                first: { second: { third: 'Hello World!' } },
            });
        });
        expect(result).toBeDefined();
    });
});
