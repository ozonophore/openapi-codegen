import browser from './scripts/browser';
import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { copyAsset } from './scripts/copyAsset';
import { generate } from './scripts/generate';
import server from './scripts/server';

describe('v3.babel', () => {
    beforeAll(async () => {
        cleanup('v3/babel');
        await generate('v3/babel', 'v3', 'fetch' as any, true, true);
        copyAsset('index.html', 'v3/babel/index.html');
        copyAsset('main.ts', 'v3/babel/main.ts');
        compileWithTypescript('v3/babel');
        await server.start('v3/babel');
        await browser.start();
    }, 30000);

    afterAll(async () => {
        await browser.stop();
        await server.stop();
    });

    it('requests token', async () => {
        await browser.exposeFunction('tokenRequest', jest.fn().mockResolvedValue('MY_TOKEN'));
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = (window as any).tokenRequest;
            OpenAPI.USERNAME = undefined;
            OpenAPI.PASSWORD = undefined;
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('uses credentials', async () => {
        const result = await browser.evaluate(async () => {
            const { OpenAPI, SimpleService } = (window as any).api;
            OpenAPI.TOKEN = undefined;
            OpenAPI.USERNAME = 'username';
            OpenAPI.PASSWORD = 'password';
            return await SimpleService.getCallWithoutParametersAndResponse();
        });
        expect(result.headers.authorization).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });

    it('supports complex params', async () => {
        const result = await browser.evaluate(async () => {
            const { ComplexService } = (window as any).api;
            return await ComplexService.complexTypes({
                parameterObject: {
                    first: {
                        second: {
                            third: 'Hello World!',
                        },
                    },
                },
            });
        });
        expect(result).toBeDefined();
    });
});
