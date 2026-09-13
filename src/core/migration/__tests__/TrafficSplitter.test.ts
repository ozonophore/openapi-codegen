import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { generateTrafficSplitterModule } from '../generateTrafficSplitterModule';
import { TrafficSplitter } from '../TrafficSplitter';

function hashClientId(clientId: string): number {
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
        hash = (hash * 31 + clientId.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
}

describe('@unit: TrafficSplitter', () => {
    test('weighted routing uses newClientWeight only', () => {
        const splitter = new TrafficSplitter({ strategy: 'weighted', newClientWeight: 10 });
        const expected = hashClientId('user-1') % 100 < 10;
        assert.equal(splitter.routeRequest({ clientId: 'user-1' }).isNewClient, expected);
    });

    test('round-robin alternates starting with old client', () => {
        const splitter = new TrafficSplitter({ strategy: 'round-robin' });
        assert.deepEqual(
            [0, 1, 2, 3].map(() => splitter.routeRequest({}).isNewClient),
            [false, true, false, true]
        );
    });

    test('header-based routing matches headerValues.new only', () => {
        const splitter = new TrafficSplitter({
            strategy: 'header-based',
            headerName: 'X-Version',
            headerValues: { new: 'v2' },
        });
        assert.equal(splitter.routeRequest({ headers: { 'X-Version': 'v2' } }).isNewClient, true);
        assert.equal(splitter.routeRequest({ headers: { 'X-Version': 'v1' } }).isNewClient, false);
    });

    test('header-and-weighted falls back to weighted when header is absent', () => {
        const splitter = new TrafficSplitter({
            strategy: 'header-and-weighted',
            headerName: 'X-Version',
            headerValues: { new: 'v2' },
            newClientWeight: 10,
        });
        const expected = hashClientId('user-1') % 100 < 10;
        assert.equal(splitter.routeRequest({ clientId: 'user-1', headers: {} }).isNewClient, expected);
    });
});

describe('@unit: generateTrafficSplitterModule', () => {
    test('emitted source does not mention removed canary fields', async () => {
        const dir = mkdtempSync(join(tmpdir(), 'traffic-splitter-emit-'));
        try {
            await generateTrafficSplitterModule({ strategy: 'weighted', newClientWeight: 20, headerValues: { new: 'v2' } }, dir);
            const source = readFileSync(join(dir, 'TrafficSplitter.ts'), 'utf8');
            assert.equal(source.includes('oldClientWeight'), false);
            assert.equal(source.includes('headerValues?: { old:'), false);
            assert.match(source, /headerValues\?: \{ new: string \}/);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
