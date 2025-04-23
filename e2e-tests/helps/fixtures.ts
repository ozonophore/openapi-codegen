import { test as base } from '@playwright/test';
import { chromium, Page } from 'playwright';

import { cleanup } from './cleanup';
import { compileWithTypescript } from './compileWithTypescript';
import { copyAsset } from './copyAsset';
import { generate } from './generate';
import { startServer, stopServer } from './server';

type TestFixtures = {
    apiPage: Page;
    setupEnvironment: void;
    folder: string;
};

export const test = base.extend<TestFixtures>({
    folder: ['v2/fetch', { option: true }], // Делаем folder параметром теста

    setupEnvironment: [
        async ({ folder }, use) => {
            const [version, library] = folder.split('/').filter(Boolean);

            await cleanup(folder);
            await generate(folder, version, library as any);
            await copyAsset('index.html', `${folder}/index.html`);
            await copyAsset('main.ts', `${folder}/main.ts`);
            await compileWithTypescript(folder);

            await startServer(folder);
            await use();
            await stopServer();
        },
        { scope: 'test', auto: true },
    ],

    apiPage: async ({ browser, folder }, use) => {
        const page = await browser.newPage();

        // Добавляем обработчик для инициализации API
        await page.addInitScript(() => {
            // Создаём глобальный объект api
            (window as any).api = {
                SimpleService: new (window as any).SimpleService(),
            };
        });

        // Загружаем сгенерированные скрипты
        await page.goto(`http://localhost:3000/${folder}/index.html`);

        // Ждём инициализации API
        // await page.waitForFunction(() => typeof (window as any).api?.SimpleService !== 'undefined', { timeout: 5000 });

        await use(page);
        await page.close();
    },

    browser: async ({}, use) => {
        const browser = await chromium.launch();
        await use(browser);
        await browser.close();
    },
});

export const expect = test.expect;
