import { FullConfig } from '@playwright/test';

import { cleanup } from './helps/cleanup';
import { compileWithTypescript } from './helps/compileWithTypescript';
import { copyAsset } from './helps/copyAsset';
import { generate } from './helps/generate';

export default async function globalSetup(config: FullConfig) {
    const fixtures = [
        { dir: 'v2/axios', version: 'v2', client: 'axios' },
        { dir: 'v2/node', version: 'v2', client: 'node' },
        { dir: 'v2/fetch', version: 'v2', client: 'fetch' },
    ];

    for (const { dir, version, client } of fixtures) {
        cleanup(dir);
        await generate(dir, version, client as any);
        await copyAsset('index.html', `${dir}/index.html`);
        await copyAsset('main.ts', `${dir}/main.ts`);
        compileWithTypescript(dir);
    }
}
