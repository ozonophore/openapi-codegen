import { FullConfig } from '@playwright/test';

import { cleanup } from './helps/cleanup';
import { compileWithTypescript } from './helps/compileWithTypescript';
import { copyAsset } from './helps/copyAsset';
import { generate } from './helps/generate';

export default async function globalSetup(_config: FullConfig) {
    // Опционально: можно использовать config, например, для логирования путей или переменных окружения

    const fixtures = [
        { dir: 'v2/axios', version: 'v2', client: 'axios', needsAssets: false },
        { dir: 'v2/node', version: 'v2', client: 'node', needsAssets: false },
        { dir: 'v2/fetch', version: 'v2', client: 'fetch', needsAssets: true },
    ];

    for (const { dir, version, client, needsAssets } of fixtures) {
        // Очистка предыдущей генерации
        cleanup(dir);

        // Генерация клиента
        await generate(dir, version, client as any);

        // Копирование ассетов для fetch-клиента
        if (needsAssets) {
            await copyAsset('index.html', `${dir}/index.html`);
            await copyAsset('main.ts', `${dir}/main.ts`);
        }

        // Компиляция TypeScript → JavaScript
        compileWithTypescript(dir);
    }
}
