// import { test as base } from '@playwright/test';
// import { chromium, Page } from 'playwright';

// import { cleanup } from './cleanup';
// import { compileWithTypescript } from './compileWithTypescript';
// import { copyAsset } from './copyAsset';
// import { generate } from './generate';
// import { startServer, stopServer } from './server';

// type TestFixtures = {
//     apiPage: Page;
//     setupEnvironment: void;
//     folder: string;
// };

// export const test = base.extend<TestFixtures>({
//     folder: ['v2/fetch', { option: true }], // Делаем folder параметром теста

//     setupEnvironment: [
//         async ({ folder }, use) => {
//             const [version, library] = folder.split('/').filter(Boolean);

//             await cleanup(folder);
//             await generate(folder, version, library as any);
//             await copyAsset('index.html', `${folder}/index.html`);
//             await copyAsset('main.ts', `${folder}/main.ts`);
//             await compileWithTypescript(folder);

//             await startServer(folder);
//             await use();
//             await stopServer();
//         },
//         { scope: 'test', auto: true },
//     ],

//     apiPage: async ({ browser, folder }, use) => {
//         const page = await browser.newPage();

//         // Добавляем обработчик для отслеживания инициализации API
//         await page.exposeFunction('__apiReady', () => true);

//         // Модифицируем main.js через page.evaluateOnNewDocument
//         // await page.evaluateOnNewDocument(folder => {
//         //     const script = document.createElement('script');
//         //     script.type = 'module';
//         //     script.textContent = `
//         //     import * as api from './index.js';
//         //     window.api = api;
//         //     window.__apiReady();
//         //     `;
//         //     document.head.appendChild(script);
//         // }, folder);

//         // Включаем логирование сети
//         // page.on('request', request => console.log('Request:', request.url()));
//         // page.on('response', response => console.log('Response:', response.status(), response.url()));

//         await page.goto(`http://localhost:3000/${folder}/index.html`);

//         await page.evaluate(() => {
//             console.log('API State:', {
//                 exists: typeof (window as any).api !== 'undefined',
//                 keys: (window as any).api ? Object.keys((window as any).api) : [],
//             });
//         });

//         // Ожидаем загрузки модуля
//         await page.waitForFunction(() => typeof (window as any).api !== 'undefined', { timeout: 10000 });

//         await use(page);
//         await page.close();
//     },

//     browser: async ({}, use) => {
//         const browser = await chromium.launch();
//         await use(browser);
//         await browser.close();
//     },
// });

// export const expect = test.expect;
