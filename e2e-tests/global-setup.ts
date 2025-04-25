import { FullConfig } from '@playwright/test';

import { cleanup } from './helps/cleanup';
import { compileWithTypescript } from './helps/compileWithTypescript';
import { generate } from './helps/generate';

export default async function globalSetup(config: FullConfig) {
    const fixtures = [
        { dir: 'v2/axios', version: 'v2', client: 'axios' },
        { dir: 'v2/node', version: 'v2', client: 'node' },
    ];

    for (const { dir, version, client } of fixtures) {
        cleanup(dir);
        await generate(dir, version, client as any);
        compileWithTypescript(dir);
    }
}
