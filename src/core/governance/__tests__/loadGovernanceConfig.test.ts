import assert from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test, type TestContext } from 'node:test';

import { loadGovernanceConfig } from '../loadGovernanceConfig';

function createTempDir(prefix: string): string {
    const generatedRoot = path.join(__dirname, 'generated');
    mkdirSync(generatedRoot, { recursive: true });
    return mkdtempSync(path.join(generatedRoot, prefix));
}

describe('@unit: loadGovernanceConfig', () => {
    test('returns undefined when path is not provided', async () => {
        const config = await loadGovernanceConfig();
        assert.strictEqual(config, undefined);
    });

    test('loads valid governance config', async t => {
        const tempDir = createTempDirWithCleanup(t, 'openapi-governance-config-valid-');
        const configPath = path.join(tempDir, 'governance.json');

        writeFileSync(
            configPath,
            JSON.stringify({
                rules: {
                    NO_BREAKING_WITHOUT_FLAG: {
                        enabled: true,
                        severity: 'error',
                    },
                    REQUIRE_OPERATION_ID: {
                        allowList: [{ operation: '/users GET' }],
                    },
                },
            })
        );

        const config = await loadGovernanceConfig(configPath);
        assert.ok(config);
        assert.strictEqual(config?.rules?.NO_BREAKING_WITHOUT_FLAG?.severity, 'error');
        assert.strictEqual(config?.rules?.REQUIRE_OPERATION_ID?.allowList?.[0]?.operation, '/users GET');
    });

    test('throws with path details for invalid severity', async t => {
        const tempDir = createTempDirWithCleanup(t, 'openapi-governance-config-invalid-severity-');
        const configPath = path.join(tempDir, 'governance.json');

        writeFileSync(
            configPath,
            JSON.stringify({
                rules: {
                    NO_DEFAULT_WITHOUT_2XX: {
                        severity: 'fatal',
                    },
                },
            })
        );

        await assert.rejects(
            async () => loadGovernanceConfig(configPath),
            (error: unknown) => error instanceof Error && error.message.includes('rules.NO_DEFAULT_WITHOUT_2XX.severity')
        );
    });

    test('throws with path details for invalid allowList item', async t => {
        const tempDir = createTempDirWithCleanup(t, 'openapi-governance-config-invalid-allowlist-');
        const configPath = path.join(tempDir, 'governance.json');

        writeFileSync(
            configPath,
            JSON.stringify({
                rules: {
                    REQUIRE_OPERATION_ID: {
                        allowList: [{}],
                    },
                },
            })
        );

        await assert.rejects(
            async () => loadGovernanceConfig(configPath),
            (error: unknown) => error instanceof Error && error.message.includes('rules.REQUIRE_OPERATION_ID.allowList.[0]')
        );
    });
});

function createTempDirWithCleanup(t: TestContext, prefix: string): string {
    const tempDir = createTempDir(prefix);
    t.after(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });
    return tempDir;
}
