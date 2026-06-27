import assert from 'node:assert';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, mock, test, type TestContext } from 'node:test';

import { installSilenceLoggers } from '../../../test/helpers/silenceLoggers';
import { SelfHealingClient } from '../SelfHealingClient';

function createTempDir(t: TestContext): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    const tempDir = mkdtempSync(path.join(generatedRoot, 'self-healing-'));
    const previousCwd = process.cwd();
    process.chdir(tempDir);
    t.after(() => {
        process.chdir(previousCwd);
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}

function createBaseSpec(extraPaths: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        openapi: '3.0.0',
        info: {
            title: 'Test API',
            version: '1.0.0',
        },
        paths: {
            '/items': {
                get: {
                    operationId: 'listItems',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
            ...extraPaths,
        },
    };
}

function writeLocalSpec(relativePath: string, spec: Record<string, unknown>): void {
    writeFileSync(relativePath, JSON.stringify(spec, null, 2), 'utf8');
}

function mockFetchJson(spec: Record<string, unknown>): void {
    globalThis.fetch = mock.fn(async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {
            get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
        },
        text: async () => JSON.stringify(spec),
    })) as unknown as typeof fetch;
}

describe('@unit: SelfHealingClient', () => {
    let restoreLoggers: (() => void) | undefined;
    let originalFetch: typeof globalThis.fetch;
    let client: SelfHealingClient;

    beforeEach(() => {
        restoreLoggers = installSilenceLoggers();
        originalFetch = globalThis.fetch;
        client = new SelfHealingClient();
    });

    afterEach(() => {
        restoreLoggers?.();
        globalThis.fetch = originalFetch;
        client.clearHistory();
    });

    test('apply writes spec and creates backup when remote adds an endpoint', async t => {
        createTempDir(t);
        const localSpec = createBaseSpec();
        const remoteSpec = createBaseSpec({
            '/pets': {
                get: {
                    operationId: 'listPets',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
        });

        writeLocalSpec('./spec.json', localSpec);

        const events = await client.checkAndApplyChanges(localSpec, remoteSpec, {}, './spec.json');

        const applied = events.find(event => event.type === 'auto-applied' && event.status === 'success');
        assert.ok(applied, 'expected auto-applied success event');
        assert.equal(applied?.specWritten, true);

        const updatedContent = JSON.parse(readFileSync('./spec.json', 'utf8'));
        assert.ok(updatedContent.paths['/pets'], 'local spec should include the new /pets endpoint');

        const backupDir = path.resolve('.self-healing-backups');
        assert.ok(existsSync(backupDir), 'backup directory should be created');
        const backupFiles = readdirSync(backupDir);
        assert.ok(
            backupFiles.some(file => file.startsWith('spec.json.')),
            'backup file should exist'
        );
    });

    test('runOnce performs full fetch-load-apply chain end-to-end', async t => {
        createTempDir(t);
        const localSpec = createBaseSpec();
        const remoteSpec = createBaseSpec({
            '/orders': {
                get: {
                    operationId: 'listOrders',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
        });

        writeLocalSpec('./spec.json', localSpec);
        mockFetchJson(remoteSpec);

        const events = await client.runOnce('https://api.example.com/openapi.json', './spec.json');

        assert.ok(events.some(event => event.type === 'spec-change-detected' && event.status === 'pending'));
        const applied = events.find(event => event.type === 'auto-applied' && event.status === 'success');
        assert.ok(applied, 'expected auto-applied success event from runOnce');
        assert.equal(applied?.specWritten, true);

        const updatedContent = JSON.parse(readFileSync('./spec.json', 'utf8'));
        assert.ok(updatedContent.paths['/orders'], 'runOnce should write remote spec to disk');
    });

    test('does not report false success when applicable changes exist but localSpecPath is empty', async t => {
        createTempDir(t);
        const localSpec = createBaseSpec();
        const remoteSpec = createBaseSpec({
            '/reviews': {
                get: {
                    operationId: 'listReviews',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
        });

        const events = await client.checkAndApplyChanges(localSpec, remoteSpec, {}, '');

        const failed = events.find(event => event.type === 'error' && event.status === 'failed');
        assert.ok(failed, 'expected failed error event when localSpecPath is missing');
        assert.match(failed?.details ?? '', /local spec path is missing/i);
        assert.equal(
            events.some(event => event.specWritten === true),
            false
        );
    });

    test('breaking changes require user review and do not overwrite local spec', async t => {
        createTempDir(t);
        const localSpec = createBaseSpec({
            '/legacy': {
                get: {
                    operationId: 'listLegacy',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
        });
        const remoteSpec = createBaseSpec();

        writeLocalSpec('./spec.json', localSpec);
        const originalContent = readFileSync('./spec.json', 'utf8');

        const events = await client.checkAndApplyChanges(localSpec, remoteSpec, {}, './spec.json');

        const review = events.find(event => event.type === 'user-review-required' && event.status === 'manual-review');
        assert.ok(review, 'expected user-review-required event for breaking changes');
        assert.equal(readFileSync('./spec.json', 'utf8'), originalContent, 'local spec should remain unchanged');
        assert.equal(
            events.some(event => event.specWritten === true),
            false
        );
    });

    test('type widening changes require user review even when semantically non-breaking', async t => {
        createTempDir(t);
        const localSpec = createBaseSpec();
        localSpec.components = {
            schemas: {
                Item: {
                    type: 'object',
                    properties: {
                        count: { type: 'integer', format: 'int32' },
                    },
                },
            },
        };
        const remoteSpec = {
            ...localSpec,
            components: {
                schemas: {
                    Item: {
                        type: 'object',
                        properties: {
                            count: { type: 'integer', format: 'int64' },
                        },
                    },
                },
            },
        };

        writeLocalSpec('./spec.json', localSpec);
        const originalContent = readFileSync('./spec.json', 'utf8');

        const events = await client.checkAndApplyChanges(localSpec, remoteSpec, {}, './spec.json');

        const review = events.find(event => event.type === 'user-review-required' && event.status === 'manual-review');
        assert.ok(review, 'expected user-review-required for type widening change');
        assert.equal(readFileSync('./spec.json', 'utf8'), originalContent, 'local spec should remain unchanged');
        assert.equal(
            events.some(event => event.specWritten === true),
            false
        );
    });

    test('writes YAML output for .yaml spec paths', async t => {
        createTempDir(t);
        const localSpec = createBaseSpec();
        const remoteSpec = createBaseSpec({
            '/widgets': {
                get: {
                    operationId: 'listWidgets',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
        });

        writeLocalSpec('./spec.yaml', localSpec);

        const events = await client.checkAndApplyChanges(localSpec, remoteSpec, {}, './spec.yaml');
        const applied = events.find(event => event.type === 'auto-applied' && event.status === 'success');
        assert.ok(applied);
        assert.equal(applied?.specWritten, true);

        const yamlContent = readFileSync('./spec.yaml', 'utf8');
        assert.ok(yamlContent.trimStart().startsWith('openapi:'), 'yaml output should start with openapi: key');
        assert.ok(!yamlContent.trimStart().startsWith('{'), 'yaml output should not be JSON');
    });

    test('runOnce appends healing events to configured log file', async t => {
        createTempDir(t);
        const localSpec = createBaseSpec();
        const remoteSpec = createBaseSpec({
            '/logs': {
                get: {
                    operationId: 'listLogs',
                    responses: {
                        '200': {
                            description: 'OK',
                        },
                    },
                },
            },
        });

        writeLocalSpec('./spec.json', localSpec);
        mockFetchJson(remoteSpec);

        const logFilePath = './logs/self-healing-events.log';
        await client.runOnce('https://api.example.com/openapi.json', './spec.json', {
            logFilePath,
        });

        assert.ok(existsSync(logFilePath), 'log file should be created');
        const logLines = readFileSync(logFilePath, 'utf8')
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line));

        assert.ok(logLines.length >= 2, 'log file should contain multiple events');
        assert.ok(logLines.some(event => event.type === 'spec-change-detected'));
        assert.ok(logLines.some(event => event.type === 'auto-applied' && event.specWritten === true));
    });
});
